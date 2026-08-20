import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker as BmqWorker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { createHmac } from 'crypto';

interface WebhookDeliveryJobInput {
  webhookId: string;
  tenantId: string;
  event: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class WebhookDeliveryProcessor {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);
  private queue: Queue;
  private worker: BmqWorker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Queue('webhook-delivery', { connection: { url: redisUrl } });
    this.worker = new BmqWorker('webhook-delivery', this.processJob.bind(this), {
      connection: { url: redisUrl },
      concurrency: 5,
    });
  }

  async addJob(input: WebhookDeliveryJobInput): Promise<void> {
    await this.queue.add('webhook-delivery', input, {
      delay: 1000,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  private async processJob(job: Job<WebhookDeliveryJobInput>): Promise<void> {
    const { webhookId, tenantId, event, payload } = job.data;
    this.logger.log(`Delivering webhook: event=${event} webhook=${webhookId}`);

    const webhook = await this.prisma.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      this.logger.warn(`Webhook ${webhookId} not found or inactive`);
      return;
    }

    const body = JSON.stringify({
      event,
      tenantId,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    const signature = webhook.secret
      ? createHmac('sha256', webhook.secret).update(body).digest('hex')
      : '';

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': signature,
        },
        body,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook delivery failed: HTTP ${response.status}: ${text}`);
      }

      this.logger.log(`Webhook ${webhookId} delivered successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook delivery error: ${message}`);
      throw error;
    }
  }
}
