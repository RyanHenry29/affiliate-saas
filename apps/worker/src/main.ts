import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  Logger.log('Worker started and listening for jobs', 'WorkerBootstrap');
  process.on('SIGTERM', async () => {
    Logger.log('Worker shutting down...', 'WorkerBootstrap');
    await app.close();
    process.exit(0);
  });
}
void bootstrap();
