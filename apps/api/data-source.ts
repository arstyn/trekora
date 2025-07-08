import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '6432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'trekora',

  // **Paths use repo‑root as the base**
  entities: ['apps/api/src/**/*.entity.{ts,js}'],
  migrations: ['apps/api/src/database/migrations/*.{ts,js}'],

  synchronize: false, // never true in prod
  logging: false,
});
