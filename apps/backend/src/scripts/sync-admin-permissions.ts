import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

import { Permission } from '../database/entity/permission.entity';
import { PermissionSet } from '../database/entity/permission-set.entity';
import { PermissionSetPermission } from '../database/entity/permission-set-permission.entity';
import { Organization } from '../database/entity/organization.entity';
import { permissions as defaultPermissions } from '../database/seeds/permission.seed';
import configuration from 'src/config/configuration';

async function syncAdminPermissions() {
  const appConfig = configuration();
  const databaseConfig = appConfig.database;
  const dbUrl =
    databaseConfig.url ||
    (databaseConfig.host?.includes('://') ? databaseConfig.host : undefined);

  const AppDataSource = new DataSource({
    type: 'postgres',
    ...(dbUrl
      ? { url: dbUrl }
      : {
          host: databaseConfig.host || 'localhost',
          port: Number(databaseConfig.port || 5432),
          username: databaseConfig.username || 'postgres',
          password: databaseConfig.password || 'postgres',
          database: databaseConfig.database || 'trekora',
        }),
    entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
    synchronize: false,
    ssl:
      databaseConfig.ssl_mode || !!dbUrl
        ? { rejectUnauthorized: false }
        : false,
  });

  await AppDataSource.initialize();
  console.log('Database connected.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const orgs = await queryRunner.manager.find(Organization);
    console.log(`Found ${orgs.length} organizations.`);

    for (const org of orgs) {
      console.log(`Syncing permissions for org: ${org.name}`);

      // 1. Make sure all base permissions exist for this org
      for (const p of defaultPermissions) {
        let perm = await queryRunner.manager.findOne(Permission, {
          where: { name: p.name, organizationId: org.id },
        });

        if (!perm) {
          perm = queryRunner.manager.create(Permission, {
            ...p,
            organizationId: org.id,
          });
          await queryRunner.manager.save(perm);
          console.log(`Created missing permission: ${p.name}`);
        }
      }

      // 2. Add all permissions to Admin role
      const adminRole = await queryRunner.manager.findOne(PermissionSet, {
        where: { name: 'Admin - Full Access', organizationId: org.id },
      });

      if (adminRole) {
        // Fetch all permissions for org
        const allOrgPerms = await queryRunner.manager.find(Permission, {
          where: { organizationId: org.id },
        });

        for (const p of allOrgPerms) {
          const exists = await queryRunner.manager.findOne(
            PermissionSetPermission,
            {
              where: { permissionSetId: adminRole.id, permissionId: p.id },
            },
          );

          if (!exists) {
            const psp = queryRunner.manager.create(PermissionSetPermission, {
              permissionSetId: adminRole.id,
              permissionId: p.id,
            });
            await queryRunner.manager.save(psp);
            console.log(`Assigned ${p.name} to Admin role`);
          }
        }
      } else {
        console.log(`No 'Admin - Full Access' role found for org ${org.name}`);
      }
    }
  } catch (error) {
    console.error('Error syncing permissions:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

syncAdminPermissions().catch(console.error);

