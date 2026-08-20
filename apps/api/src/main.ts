import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
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
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`API rodando na porta ${port}`, 'Bootstrap');
}
void bootstrap();
