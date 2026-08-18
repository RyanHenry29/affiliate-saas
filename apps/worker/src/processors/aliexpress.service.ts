import { Injectable, Logger } from '@nestjs/common';
import type { OfferNormalized } from '@affiliate-saas/shared-types';

@Injectable()
export class AliexpressService {
  private readonly logger = new Logger(AliexpressService.name);

  async scrapeOffers(): Promise<OfferNormalized[]> {
    this.logger.log('AliExpress scrape triggered (no live API - use import-link)');
    return [];
  }
}
