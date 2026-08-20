import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('dispatch') private dispatchQueue: Queue,
    @InjectQueue('offer-mining') private offerMiningQueue: Queue,
    @InjectQueue('billing-sync') private billingSyncQueue: Queue,
    @InjectQueue('webhook-delivery') private webhookDeliveryQueue: Queue,
    @InjectQueue('payment-confirm') private paymentConfirmQueue: Queue,
  ) {}

  async enqueueDispatch(data: { dispatchJobId: string; tenantId: string; offerId: string; groupId: string }) {
    return this.dispatchQueue.add('dispatch', data, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  }

  async enqueueOfferMining(data: { tenantId: string; platform: string }) {
    return this.offerMiningQueue.add('mining', data, { attempts: 2, backoff: { type: 'exponential', delay: 10000 } });
  }

  async enqueueBillingSync(data: { tenantId: string; billingId: string }) {
    return this.billingSyncQueue.add('sync', data, { attempts: 3 });
  }

  async enqueueWebhookDelivery(data: { url: string; payload: any; tenantId: string }) {
    return this.webhookDeliveryQueue.add('deliver', data, { attempts: 5, backoff: { type: 'exponential', delay: 3000 } });
  }

  async enqueuePaymentConfirm(data: { tenantId: string; paymentId: string }) {
    return this.paymentConfirmQueue.add('confirm', data, { attempts: 3 });
  }

  async getStats() {
    const queues = [
      this.dispatchQueue,
      this.offerMiningQueue,
      this.billingSyncQueue,
      this.webhookDeliveryQueue,
      this.paymentConfirmQueue,
    ];
    const stats: Record<string, any> = {};
    for (const q of queues) {
      const [waiting, active, completed, failed] = await Promise.all([
        q.getWaitingCount(),
        q.getActiveCount(),
        q.getCompletedCount(),
        q.getFailedCount(),
      ]);
      stats[q.name] = { waiting, active, completed, failed };
    }
    return stats;
  }
}
