import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const sslMode = process.env.DB_SSL_MODE === 'true';

const dbUrl = process.env.DATABASE_URL || (process.env.DB_HOST?.includes('://') ? process.env.DB_HOST : undefined);

export default new DataSource({
  type: 'postgres',
  ...(dbUrl
    ? { url: dbUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'trekora',
      }),

  entities: [path.join(__dirname, 'src/**/*.entity.{ts,js}').replace(/\\/g, '/')],
  migrations: [path.join(__dirname, 'src/database/migrations/*.{ts,js}').replace(/\\/g, '/')],

  synchronize: false, // never true in prod
  logging: false,

  // SSL configuration
  ...(sslMode || dbUrl
    ? {
        ssl:
          fs.existsSync('/etc/ssl/certs/global-bundle.pem') && !dbUrl
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
