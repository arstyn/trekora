import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseConfig = configService.get('database');

    return {
      type: 'postgres',
      ...(databaseConfig.url
        ? { url: databaseConfig.url }
        : {
            host: databaseConfig.host as string,
            port: databaseConfig.port as number,
            username: databaseConfig.username as string,
            password: databaseConfig.password as string,
            database: databaseConfig.database as string,
          }),
      entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
      migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
      migrationsRun: true,
      logging: ['error', 'query', 'schema'],
      synchronize: databaseConfig.sync,
      ssl: databaseConfig.ssl_mode || !!databaseConfig.url,
      extra:
        databaseConfig.ssl_mode || !!databaseConfig.url
          ? {
              max: 10,
              idleTimeoutMillis: 30000,
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : {},
    };
  },
});
