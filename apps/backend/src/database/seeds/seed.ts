import * as path from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Role } from '../entity/role.entity';
import { Department } from '../entity/department.entity';
import { roles } from './role.seed';
import { departments } from './department.seed';
import configuration from '../../config/configuration';
import { notificationTypes } from './notification-type.seed';
import { NotificationType } from '../entity/notification-type.entity';

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
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    const roleRepository = AppDataSource.getRepository(Role);
    const departmentRepository = AppDataSource.getRepository(Department);
    const notificationTypeRepository = AppDataSource.getRepository(NotificationType)

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
      const existingNotificationType = await notificationTypeRepository.findOne({
        where: { title: notification_type.title },
      });

      if (!existingNotificationType) {
        const notificationType = notificationTypeRepository.create(notification_type);
        await notificationTypeRepository.save(notificationType);
        console.log(`Created notification type: ${notification_type.title}`);
      } else {
        console.log(`Notification type ${notification_type.title} already exists`);
      }
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
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