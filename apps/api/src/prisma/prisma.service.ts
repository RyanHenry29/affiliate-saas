import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Non-blocking: don't let a slow/blocked DB connection stall app startup
    // (Render requires the port to bind within the boot timeout). Prisma connects
    // lazily on the first query; failures surface there with connect_timeout.
    this.$connect().catch((e) => {
      this.logger.error(
        'Falha ao conectar ao banco na inicialização; reconectando sob demanda',
        e as Error,
      );
    });
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
