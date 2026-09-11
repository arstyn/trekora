import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from './app.module';

const server: Express = express();
let isReady = false;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl
      ? frontendUrl.includes(',')
        ? frontendUrl.split(',').map((u) => u.trim())
        : frontendUrl
      : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((acc: any, error) => {
          acc[error.property] = Object.values(error.constraints || {}).join(
            ', ',
          );
          return acc;
        }, {});

        return {
          message: 'Validation failed',
          errors: formattedErrors,
        };
      },
    }),
  );

  if (!process.env.VERCEL) {
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
  } else {
    await app.init();
  }

  isReady = true;
  return server;
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default async function handler(req: Request, res: Response) {
  if (!isReady) {
    await bootstrap();
  }

  // Ensure rewritten Vercel paths map to the correct controller route
  const matchedPath = req.headers['x-matched-path'];
  if (typeof matchedPath === 'string' && matchedPath.length > 0) {
    req.url = matchedPath;
  } else if (req.url === '/api' || req.url === '/api/') {
    req.url = '/';
  } else if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4);
  }

  server(req, res);
}

