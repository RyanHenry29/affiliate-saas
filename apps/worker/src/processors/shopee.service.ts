import { Injectable, Logger } from '@nestjs/common';
import type { OfferNormalized } from '@affiliate-saas/shared-types';

@Injectable()
export class ShopeeService {
  private readonly logger = new Logger(ShopeeService.name);

  async scrapeOffers(): Promise<OfferNormalized[]> {
    this.logger.log('Shopee scrape triggered (no live API - use import-link)');
    return [];
  }
}
