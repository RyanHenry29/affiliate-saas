import { Injectable, Logger } from '@nestjs/common';
import type { OfferNormalized } from '@affiliate-saas/shared-types';

@Injectable()
export class AwinService {
  private readonly logger = new Logger(AwinService.name);

  async scrapeOffers(): Promise<OfferNormalized[]> {
    this.logger.log('AWIN scrape triggered (no live API - use import-link)');
    return [];
  }
}
