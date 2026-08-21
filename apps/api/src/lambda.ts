import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

let cachedServer: unknown = null;

async function bootstrap(): Promise<unknown> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    { bodyParser: true },
  );
  app.setGlobalPrefix('api');

  const corsOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors(
    corsOrigins?.length
      ? { origin: corsOrigins, credentials: true }
      : {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://affiliate-saas.vercel.app',
          ],
          credentials: true,
        },
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any): Promise<void> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  (cachedServer as (r: any, s: any) => void)(req, res);
}
