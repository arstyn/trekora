import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import configuration from '../../config/configuration';
import { Department } from '../entity/department.entity';
import { Employee, EmployeeStatus } from '../entity/employee.entity';
import { NotificationType } from '../entity/notification-type.entity';
import { Organization } from '../entity/organization.entity';
import { Role } from '../entity/role.entity';
import { User } from '../entity/user.entity';
import { departments } from './department.seed';
import { notificationTypes } from './notification-type.seed';
import { roles } from './role.seed';
import { organizations } from './organization.seed';
import { users } from './user.seed';

config();

const appConfig = configuration();
const databaseConfig = appConfig.database;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: databaseConfig.host,
  port: Number(databaseConfig.port),
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
  synchronize: false,
  ssl: databaseConfig.ssl_mode ? { rejectUnauthorized: false } : false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connection initialized');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.startTransaction();

  try {
    const roleRepository = queryRunner.manager.getRepository(Role);
    const departmentRepository = queryRunner.manager.getRepository(Department);
    const notificationTypeRepository =
      queryRunner.manager.getRepository(NotificationType);

    console.log('Seeding roles...');
    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role ${roleData.name} already exists`);
      }
    }

    console.log('Seeding departments...');
    for (const departmentData of departments) {
      const existingDepartment = await departmentRepository.findOne({
        where: { name: departmentData.name },
      });

      if (!existingDepartment) {
        const department = departmentRepository.create(departmentData);
        await departmentRepository.save(department);
        console.log(`Created department: ${departmentData.name}`);
      } else {
        console.log(`Department ${departmentData.name} already exists`);
      }
    }

    console.log('Seeding notification types...');
    for (const notification_type of notificationTypes) {
      const existingNotificationType = await notificationTypeRepository.findOne(
        {
          where: { title: notification_type.title },
        },
      );

      if (!existingNotificationType) {
        const notificationType =
          notificationTypeRepository.create(notification_type);
        await notificationTypeRepository.save(notificationType);
        console.log(`Created notification type: ${notification_type.title}`);
      } else {
        console.log(
          `Notification type ${notification_type.title} already exists`,
        );
      }
    }

    for (const organization of organizations) {
      // Create organization
      const organizationData = queryRunner.manager.create(Organization, {
        name: organization.name,
        size: organization.size,
        industry: organization.industry,
        domain: organization.domain,
        description: organization.description,
      });
      const savedOrganization =
        await queryRunner.manager.save(organizationData);
      console.log('Organization created:', savedOrganization.id);
    }

    // Find admin role
    const adminRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'admin' },
    });
    if (!adminRole) {
      throw new Error('Admin role not found in database');
    }

    for (const user of users) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: user.organizationDomain },
      });

      if (!org) {
        throw new Error('Organization not found in database');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = queryRunner.manager.create(User, {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        phone: user.phone,
        organizationId: org.id,
        roleId: adminRole.id,
        notificationsEnabled: user.notificationsEnabled,
        newsletterSubscribed: user.newsletterSubscribed,
      });

      const savedUser = await queryRunner.manager.save(newUser);
      console.log('User created:', savedUser.id);

      // Create employee
      const employee = queryRunner.manager.create(Employee, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        organizationId: org.id,
        userId: savedUser.id,
        roleId: adminRole.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date().toISOString(),
      });
      const savedEmployee = await queryRunner.manager.save(employee);
      console.log('Employee created:', savedEmployee.id);
    }

    await queryRunner.commitTransaction();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding, rolling back transaction:', error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

seed()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
