import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker as BmqWorker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { LlmService } from '../llm/llm.service';
import { EvolutionProvider } from '../evolution.provider';
import type { DispatchJobInput } from '@affiliate-saas/shared-types';

@Injectable()
export class DispatchProcessor {
  private readonly logger = new Logger(DispatchProcessor.name);
  private queue: Queue;
  private worker: BmqWorker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly evolution: EvolutionProvider,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Queue('dispatch', { connection: { url: redisUrl } });
    this.worker = new BmqWorker('dispatch', this.processJob.bind(this), {
      connection: { url: redisUrl },
      concurrency: 5,
    });
  }

  async addJob(input: DispatchJobInput): Promise<void> {
    await this.queue.add('dispatch', input, {
      delay: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  private lastSentAt = new Map<string, number>();

  private async throttle(externalId: string): Promise<void> {
    const minIntervalMs = Number(this.config.get('DISPATCH_MIN_INTERVAL_MS', '800'));
    const now = Date.now();
    const last = this.lastSentAt.get(externalId) ?? 0;
    const wait = minIntervalMs - (now - last);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    this.lastSentAt.set(externalId, Date.now());
  }

  private async updateJobStatus(dispatchJobId: string | undefined, status: 'SENT' | 'FAILED') {
    if (!dispatchJobId) return;
    await this.prisma.dispatchJob
      .update({ where: { id: dispatchJobId }, data: { status, sentAt: status === 'SENT' ? new Date() : undefined } })
      .catch((err) => this.logger.error(`Falha ao atualizar dispatchJob ${dispatchJobId}: ${err?.message ?? err}`));
  }

  private async processJob(job: Job<DispatchJobInput>): Promise<void> {
    const { tenantId, offerId, groupId, dispatchJobId } = job.data;
    this.logger.log(`Processing dispatch: offer=${offerId} group=${groupId} job=${dispatchJobId}`);

    const [offer, group, instance] = await Promise.all([
      this.prisma.offer.findUnique({ where: { id: offerId } }),
      this.prisma.group.findUnique({ where: { id: groupId } }),
      this.prisma.messagingInstance.findFirst({
        where: { tenantId, status: 'CONNECTED' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!offer || !group || !instance || !instance.externalId) {
      const detail = `offer=${!!offer} group=${!!group} instance=${!!instance} instanceExternalId=${!!instance?.externalId}`;
      this.logger.warn(`Dados ausentes para dispatch (${detail}) — job=${dispatchJobId}`);
      if (job.attemptsMade >= (job.opts.attempts as number)) {
        await this.updateJobStatus(dispatchJobId, 'FAILED');
      }
      throw new Error(`Dados ausentes para dispatch: ${detail}`);
    }

    try {
      await this.throttle(instance.externalId);
      const prompt = `Oferta: ${offer.title}\nPreço: R$ ${(offer.priceCents / 100).toFixed(2)}\nDesconto: ${offer.discountPercent}%\nLink: ${offer.affiliateUrl}`;
      const text = await this.llm.generate(prompt, undefined, tenantId);

      const result = await this.evolution.sendMessage(instance.externalId, group.externalId, text);

      if (!result.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      await this.prisma.dispatchJob.update({
        where: { id: dispatchJobId },
        data: { status: 'SENT', sentAt: new Date() },
      });
      this.logger.log(`Dispatch enviado: job=${dispatchJobId} offer=${offerId}`);
    } catch (err: any) {
      const message = err?.message ?? String(err);
      this.logger.error(`Falha no dispatch job=${dispatchJobId}: ${message}`);
      const maxAttempts = (job.opts.attempts as number) ?? 3;
      if (job.attemptsMade >= maxAttempts) {
        await this.updateJobStatus(dispatchJobId, 'FAILED');
      }
      throw err;
    }
  }
}
