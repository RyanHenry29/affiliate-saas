import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker as BmqWorker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

interface PaymentConfirmJobInput {
  tenantId: string;
  paymentId: string;
}

@Injectable()
export class PaymentConfirmProcessor {
  private readonly logger = new Logger(PaymentConfirmProcessor.name);
  private queue: Queue;
  private worker: BmqWorker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Queue('payment-confirm', { connection: { url: redisUrl } });
    this.worker = new BmqWorker('payment-confirm', this.processJob.bind(this), {
      connection: { url: redisUrl },
      concurrency: 2,
    });
  }

  async addJob(input: PaymentConfirmJobInput): Promise<void> {
    await this.queue.add('payment-confirm', input, {
      delay: 2000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  private async processJob(job: Job<PaymentConfirmJobInput>): Promise<void> {
    const { tenantId, paymentId } = job.data;
    this.logger.log(`Confirming payment=${paymentId} for tenant=${tenantId}`);

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });

    if (!payment) {
      this.logger.warn(`Payment ${paymentId} not found for tenant ${tenantId}`);
      return;
    }

    if (payment.status === 'CONFIRMED') {
      this.logger.log(`Payment ${paymentId} already confirmed`);
      return;
    }

    const metadata = payment.metadata as { plan?: string } | null;
    const plan = (metadata?.plan ?? 'STARTER') as any;

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const existingSub = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan,
          status: 'ACTIVE',
          currentPeriodEnd,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          tenantId,
          plan,
          status: 'ACTIVE',
          externalCustomerId: tenantId,
          currentPeriodEnd,
        },
      });
    }

    this.logger.log(`Payment ${paymentId} confirmed and subscription activated for tenant ${tenantId}`);
  }
}
