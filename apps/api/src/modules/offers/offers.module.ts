import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [AiProviderModule, QueuesModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
