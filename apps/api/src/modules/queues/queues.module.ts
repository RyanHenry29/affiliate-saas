import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueuesService } from './queues.service';

const redisUrl = process.env.REDIS_URL;

@Module({
  imports: redisUrl
    ? [
        BullModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            connection: { url: config.get<string>('REDIS_URL', 'redis://localhost:6379') },
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue(
          { name: 'dispatch' },
          { name: 'offer-mining' },
          { name: 'billing-sync' },
          { name: 'webhook-delivery' },
          { name: 'payment-confirm' },
        ),
      ]
    : [],
  providers: [QueuesService],
  exports: [QueuesService, ...(redisUrl ? [BullModule] : [])],
})
export class QueuesModule {}
