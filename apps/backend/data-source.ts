import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

const sslMode = process.env.DB_SSL_MODE === 'true';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'trekora',

  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/database/migrations/*.{ts,js}'],

  synchronize: false, // never true in prod
  logging: false,

  // SSL configuration
  ...(sslMode || process.env.DATABASE_URL
    ? {
        ssl:
          fs.existsSync('/etc/ssl/certs/global-bundle.pem') && !process.env.DATABASE_URL
            ? {
                rejectUnauthorized: true,
                ca: fs
                  .readFileSync('/etc/ssl/certs/global-bundle.pem')
                  .toString(),
              }
            : {
                rejectUnauthorized: false,
              },
      }
    : {}),
});
