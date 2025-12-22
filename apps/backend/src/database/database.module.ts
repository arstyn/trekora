import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseConfig = configService.get('database');
    return {
      type: 'postgres',
      host: databaseConfig.host as string,
      port: databaseConfig.port as number,
      username: databaseConfig.username as string,
      password: databaseConfig.password as string,
      database: databaseConfig.database as string,
      entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
      migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
      migrationsRun: true,
      logging: ['error', 'query', 'schema'],
      synchronize: databaseConfig.sync,
      ...(databaseConfig.ssl_mode === true
        ? {
            ssl: {
              rejectUnauthorized: true,
              ca: fs
                .readFileSync('/etc/ssl/certs/global-bundle.pem')
                .toString(),
            },
            extra: {
              max: 10,
              idleTimeoutMillis: 30000,
              ssl: {
                rejectUnauthorized: true,
                ca: fs
                  .readFileSync('/etc/ssl/certs/global-bundle.pem')
                  .toString(),
              },
            },
          }
        : {
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              max: 10,
              idleTimeoutMillis: 30000,
              ssl: {
                rejectUnauthorized: false,
              },
            },
          }),
    };
  },
});
