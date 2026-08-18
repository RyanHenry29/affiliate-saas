import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker as BmqWorker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { ShopeeService } from './shopee.service';
import { AliexpressService } from './aliexpress.service';
import { AmazonService } from './amazon.service';
import { AwinService } from './awin.service';
import type { OfferNormalized, MarketplaceName } from '@affiliate-saas/shared-types';

interface OfferMiningJobInput {
  tenantId: string;
  connectionId: string;
  marketplace: MarketplaceName;
}

@Injectable()
export class OfferMiningProcessor {
  private readonly logger = new Logger(OfferMiningProcessor.name);
  private queue: Queue;
  private worker: BmqWorker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly shopee: ShopeeService,
    private readonly aliexpress: AliexpressService,
    private readonly amazon: AmazonService,
    private readonly awin: AwinService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.queue = new Queue('offer-mining', { connection: { url: redisUrl } });
    this.worker = new BmqWorker('offer-mining', this.processJob.bind(this), {
      connection: { url: redisUrl },
      concurrency: 3,
    });
  }

  async addJob(input: OfferMiningJobInput): Promise<void> {
    await this.queue.add('offer-mining', input, {
      delay: 2000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    });
  }

  private async processJob(job: Job<OfferMiningJobInput>): Promise<void> {
    const { tenantId, connectionId, marketplace } = job.data;
    this.logger.log(`Mining offers: marketplace=${marketplace} connection=${connectionId}`);

    let offers: OfferNormalized[] = [];

    switch (marketplace) {
      case 'shopee':
        offers = await this.shopee.scrapeOffers();
        break;
      case 'aliexpress':
        offers = await this.aliexpress.scrapeOffers();
        break;
      case 'amazon':
        offers = await this.amazon.scrapeOffers();
        break;
      case 'awin':
        offers = await this.awin.scrapeOffers();
        break;
      default:
        this.logger.warn(`Unsupported marketplace: ${marketplace}`);
        return;
    }

    this.logger.log(`Found ${offers.length} offers from ${marketplace}`);

    for (const offer of offers) {
      await this.prisma.offer.upsert({
        where: { dedupeHash: offer.dedupeHash },
        update: {
          title: offer.title,
          priceCents: offer.priceCents,
          originalPriceCents: offer.originalPriceCents,
          discountPercent: offer.discountPercent,
          imageUrl: offer.imageUrl,
          affiliateUrl: offer.affiliateUrl,
        },
        create: {
          tenantId,
          marketplace,
          externalSku: offer.externalSku,
          title: offer.title,
          priceCents: offer.priceCents,
          originalPriceCents: offer.originalPriceCents,
          discountPercent: offer.discountPercent,
          rating: offer.rating,
          imageUrl: offer.imageUrl,
          affiliateUrl: offer.affiliateUrl,
          nicheTag: offer.nicheTag,
          dedupeHash: offer.dedupeHash,
        },
      });
    }

    await this.prisma.marketplaceConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date(), status: 'CONNECTED' },
    });
  }
}
