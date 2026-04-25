const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { join } = require('path');

let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const { AppModule } = require('../dist/src/app.module');
    const app = await NestFactory.create(AppModule);

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
        const formattedErrors = errors.reduce((acc, error) => {
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

module.exports = async (req, res) => {
  const server = await bootstrap();
  return server(req, res);
};
