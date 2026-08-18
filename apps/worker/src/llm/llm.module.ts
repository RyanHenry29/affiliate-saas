import { Module, Global } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmConfigService } from './llm-config';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  providers: [LlmService, LlmConfigService, PrismaService],
  exports: [LlmService],
})
export class LlmModule {}
