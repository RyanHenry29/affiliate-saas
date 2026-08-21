import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

let cachedServer: unknown = null;

async function bootstrap(): Promise<unknown> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    { bodyParser: true },
  );

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());

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

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.get('/', (_req: any, res: any) => {
    res.json({
      status: 'ok',
      service: 'affiliate-saas-api',
      time: new Date().toISOString(),
    });
  });

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(
  req: unknown,
  res: unknown,
): Promise<void> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  (cachedServer as (r: unknown, s: unknown) => void)(req, res);
}
