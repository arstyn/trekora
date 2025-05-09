import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedingService = app.get(SeedService);

  try {
    logger.log('Starting database seeding...');
    await seedingService.seed();
    logger.log('Database seeding finished.');
  } catch (error) {
    logger.error('Seeding failed.', error);
  } finally {
    await app.close();
  }
}

bootstrap();
