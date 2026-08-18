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

  private async processJob(job: Job<DispatchJobInput>): Promise<void> {
    const { tenantId, offerId, groupId } = job.data;
    this.logger.log(`Processing dispatch: offer=${offerId} group=${groupId}`);

    const [offer, group, instance] = await Promise.all([
      this.prisma.offer.findUnique({ where: { id: offerId } }),
      this.prisma.group.findUnique({ where: { id: groupId } }),
      this.prisma.messagingInstance.findFirst({
        where: { tenantId, status: 'CONNECTED' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!offer || !group || !instance) {
      this.logger.warn(`Missing data for dispatch: offer=${!!offer} group=${!!group} instance=${!!instance}`);
      return;
    }

    const prompt = `Oferta: ${offer.title}\nPreço: R$ ${(offer.priceCents / 100).toFixed(2)}\nDesconto: ${offer.discountPercent}%\nLink: ${offer.affiliateUrl}`;
    const text = await this.llm.generate(prompt, undefined, tenantId);

    const result = await this.evolution.sendMessage(instance.externalId, group.externalId, text);

    if (!result.ok) {
      throw new Error(result.error || 'Failed to send message');
    }

    await this.prisma.dispatchJob.update({
      where: { id: job.data.dispatchJobId },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }
}
