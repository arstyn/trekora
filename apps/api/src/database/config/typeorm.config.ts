import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CustomTypeORMLogger } from './typeorm.logger';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'trekora',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: false,
  logger: new CustomTypeORMLogger(),
};
