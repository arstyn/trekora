import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    app.enableCors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((acc: any, error) => {
          acc[error.property] = Object.values(error.constraints || {}).join(', ');
          return acc;
        }, {});

        return {
          message: 'Validation failed',
          errors: formattedErrors,
        };
      },
    }));

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};
