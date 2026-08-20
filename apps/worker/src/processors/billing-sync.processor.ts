import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker as BmqWorker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

interface BillingSyncJobInput {
  tenantId: string;
}

@Injectable()
export class BillingSyncProcessor {
  private readonly logger = new Logger(BillingSyncProcessor.name);
  private queue: Queue;
  private worker: BmqWorker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Queue('billing-sync', { connection: { url: redisUrl } });
    this.worker = new BmqWorker('billing-sync', this.processJob.bind(this), {
      connection: { url: redisUrl },
      concurrency: 2,
    });
  }

  async addJob(input: BillingSyncJobInput): Promise<void> {
    await this.queue.add('billing-sync', input, {
      delay: 5000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 15000 },
    });
  }

  private async processJob(job: Job<BillingSyncJobInput>): Promise<void> {
    const { tenantId } = job.data;
    this.logger.log(`Syncing billing for tenant=${tenantId}`);

    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId },
    });

    if (!subscription) {
      this.logger.warn(`No subscription found for tenant ${tenantId}`);
      return;
    }

    const dispatchCount = await this.prisma.dispatchJob.count({
      where: {
        tenantId,
        createdAt: { gte: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000) : new Date(0) },
      },
    });

    const planConfig = await this.prisma.planConfig.findUnique({
      where: { tier: subscription.plan },
    });

    if (planConfig && planConfig.dispatchesLimit > 0 && dispatchCount >= planConfig.dispatchesLimit) {
      this.logger.warn(`Tenant ${tenantId} reached dispatch limit: ${dispatchCount}/${planConfig.dispatchesLimit}`);
    }
  }
}
