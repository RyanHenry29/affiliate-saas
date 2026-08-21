import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './src/app.module';

let cachedServer: unknown = null;

async function bootstrap(): Promise<unknown> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    { bodyParser: true },
  );
  app.setGlobalPrefix('api');
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: unknown, res: unknown): Promise<void> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  (cachedServer as (r: unknown, s: unknown) => void)(req, res);
}
