import { Injectable, Logger } from '@nestjs/common';
import type { OfferNormalized } from '@affiliate-saas/shared-types';

@Injectable()
export class AmazonService {
  private readonly logger = new Logger(AmazonService.name);

  async scrapeOffers(): Promise<OfferNormalized[]> {
    this.logger.log('Amazon scrape triggered (no live API - use import-link)');
    return [];
  }
}
