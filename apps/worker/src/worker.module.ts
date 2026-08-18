import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { PrismaService } from './prisma.service';
import { LlmModule } from './llm/llm.module';
import { DispatchProcessor } from './processors/dispatch.processor';
import { OfferMiningProcessor } from './processors/offer-mining.processor';
import { BillingSyncProcessor } from './processors/billing-sync.processor';
import { WebhookDeliveryProcessor } from './processors/webhook-delivery.processor';
import { ShopeeService } from './processors/shopee.service';
import { AliexpressService } from './processors/aliexpress.service';
import { AmazonService } from './processors/amazon.service';
import { AwinService } from './processors/awin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(__dirname, '../../../.env'), '.env'],
    }),
    LlmModule,
  ],
  providers: [
    PrismaService,
    DispatchProcessor,
    OfferMiningProcessor,
    BillingSyncProcessor,
    WebhookDeliveryProcessor,
    ShopeeService,
    AliexpressService,
    AmazonService,
    AwinService,
  ],
})
export class WorkerModule {}
