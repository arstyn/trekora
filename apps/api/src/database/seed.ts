import * as bcrypt from 'bcrypt';

import dataSource from '../../data-source';

import { Department } from './entity/department.entity';
import { Employee } from './entity/employee.entity';
import { Organization } from './entity/organization.entity';
import { Role } from './entity/role.entity';
import { User } from './entity/user.entity';

import { departments } from './seeds/department.seed';
import { organizations } from './seeds/organization.seed';
import { roles } from './seeds/role.seed';
import { users as rawUsers } from './seeds/user.seed';

// ────────────────────────────────────────────────────────────────────────────────
// Adjustable knobs
// ────────────────────────────────────────────────────────────────────────────────
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS ?? '10', 10);
const LOG_PREFIX = '⛏  SEED';

// ────────────────────────────────────────────────────────────────────────────────
(async () => {
  const ds = await dataSource.initialize();
  console.log(`${LOG_PREFIX} → starting …`);

  try {
    await ds.transaction(async (trx) => {
      // 1️⃣  Roles, Organisations, Departments  (simple bulk upserts)
      await Promise.all([
        trx.getRepository(Role).upsert(roles, ['id']),
        trx.getRepository(Organization).upsert(organizations, ['id']),
        trx.getRepository(Department).upsert(departments, ['id']),
      ]);

      // 2️⃣  Gather helper maps we’ll use below
      const [roleEntities, orgEntities] = await Promise.all([
        trx.getRepository(Role).find(),
        trx.getRepository(Organization).find(),
      ]);

      const roleByName = new Map(roleEntities.map((r) => [r.name, r]));
      const orgByName = new Map(orgEntities.map((o) => [o.name, o]));

      const adminRole = roleByName.get('admin');
      if (!adminRole) throw new Error('Admin role not found after upsert.');

      // 3️⃣  Prepare users & employees in memory
      //     – hash every distinct password once (usually only “admin” in seeds)
      const pwCache = new Map<string, string>();
      const hashPw = async (pw: string) => {
        if (!pwCache.has(pw))
          pwCache.set(pw, await bcrypt.hash(pw, SALT_ROUNDS));
        return pwCache.get(pw)!;
      };

      const userEntities = await Promise.all(
        rawUsers.map(async ({ organization, branch, ...rest }) => {
          const org = orgByName.get(organization);
          if (!org) {
            console.warn(
              `${LOG_PREFIX} → organisation “${organization}” not found, skipping user "${rest.email}"`,
            );
            return null;
          }

          const password = await hashPw(rest.password);
          return trx.getRepository(User).create({
            ...rest,
            password,
            organizationId: org.id,
            roleId: adminRole.id,
          });
        }),
      ).then((arr) => arr.filter(Boolean) as User[]);

      const employeeEntities = userEntities.map((u) =>
        trx.getRepository(Employee).create({
          name: u.name,
          email: u.email,
          organizationId: u.organizationId,
          roleId: u.roleId,
          userId: u.id, // filled after users are inserted
        }),
      );

      // 4️⃣  Persist users & employees (two batches)
      await trx.getRepository(User).save(userEntities, { chunk: 100 });
      await trx.getRepository(Employee).save(employeeEntities, { chunk: 100 });
    });

    console.log(`${LOG_PREFIX} → ✅ finished!`);
    process.exit(0);
  } catch (err: unknown) {
    console.error(`${LOG_PREFIX} → ❌ failed:`, err);
    process.exit(1);
  } finally {
    await ds.destroy();
  }
})();
