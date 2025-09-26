import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import configuration from '../../config/configuration';
import { Department } from '../entity/department.entity';
import { Employee, EmployeeStatus } from '../entity/employee.entity';
import { Organization } from '../entity/organization.entity';
import { Role } from '../entity/role.entity';
import { UserNotificationType } from '../entity/user-notification-type.entity';
import { UserNotification } from '../entity/user-notification.entity';
import { User } from '../entity/user.entity';
import { Branch } from '../entity/branch.entity';
import { Package } from '../entity/package-related/package.entity';
import { Inclusion } from '../entity/package-related/inclusions.entity';
import { Exclusion } from '../entity/package-related/exclusions.entity';
import { Batch } from '../entity/batch.entity';
import { FileManager } from '../entity/file-manager.entity';
import { Lead } from '../entity/lead.entity';
import { Customer } from '../entity/customer.entity';
import { departments } from './department.seed';
import { organizations } from './organization.seed';
import { roles } from './role.seed';
import { userNotificationType } from './user-notification-type.seed';
import { users } from './user.seed';
import { additionalEmployees } from './employee.seed';
import { branches } from './branch.seed';
import { packages } from './package.seed';
import { batches } from './batch.seed';
import { packageImages } from './file-manager.seed';
import { leads } from './lead.seed';
import { customers } from './customer.seed';

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
    // Clear database before seeding
    console.log('Clearing database...');

    // Get all entity metadata
    const entities = AppDataSource.entityMetadatas;

    // Disable foreign key checks temporarily
    await queryRunner.query('SET session_replication_role = replica;');

    // Clear all tables in reverse order to handle foreign key constraints
    for (const entity of entities.reverse()) {
      const tableName = entity.tableName;
      console.log(`Clearing table: ${tableName}`);
      await queryRunner.query(`DELETE FROM "${tableName}";`);
    }

    // Re-enable foreign key checks
    await queryRunner.query('SET session_replication_role = DEFAULT;');

    console.log('Database cleared successfully');
    const roleRepository = queryRunner.manager.getRepository(Role);
    const departmentRepository = queryRunner.manager.getRepository(Department);
    const userNotificationTypeRepository =
      AppDataSource.getRepository(UserNotificationType);

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
    for (const user_notification_type of userNotificationType) {
      const existingNotificationType =
        await userNotificationTypeRepository.findOne({
          where: { title: user_notification_type.title },
        });

      if (!existingNotificationType) {
        const notificationType = userNotificationTypeRepository.create(
          user_notification_type,
        );
        await userNotificationTypeRepository.save(notificationType);
        console.log(
          `Created notification type: ${user_notification_type.title}`,
        );
      } else {
        console.log(
          `Notification type ${user_notification_type.title} already exists`,
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

    // Create additional employees
    console.log('Seeding additional employees...');
    for (const employeeData of additionalEmployees) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: employeeData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${employeeData.organizationDomain}`,
        );
        continue;
      }

      const role = await queryRunner.manager.findOne(Role, {
        where: { name: employeeData.roleName },
      });

      if (!role) {
        console.log(`Role not found: ${employeeData.roleName}`);
        continue;
      }

      const employee = queryRunner.manager.create(Employee, {
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        address: employeeData.address,
        experience: employeeData.experience,
        specialization: employeeData.specialization,
        dateOfBirth: new Date(employeeData.dateOfBirth),
        gender: employeeData.gender,
        nationality: employeeData.nationality,
        maritalStatus: employeeData.maritalStatus,
        organizationId: org.id,
        roleId: role.id,
        status: employeeData.status,
        joinDate: new Date().toISOString(),
      });

      const savedEmployee = await queryRunner.manager.save(employee);
      console.log('Additional employee created:', savedEmployee.id);
    }

    // Create branches
    console.log('Seeding branches...');
    for (const branchData of branches) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: branchData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${branchData.organizationDomain}`,
        );
        continue;
      }

      const branch = queryRunner.manager.create(Branch, {
        name: branchData.name,
        location: branchData.location,
        organizationId: org.id,
        isActive: branchData.isActive,
      });

      const savedBranch = await queryRunner.manager.save(branch);
      console.log('Branch created:', savedBranch.id);
    }

    // Create packages with inclusions and exclusions
    console.log('Seeding packages...');
    for (const packageData of packages) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: packageData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${packageData.organizationDomain}`,
        );
        continue;
      }

      const pkg = queryRunner.manager.create(Package, {
        name: packageData.name,
        destination: packageData.destination,
        duration: packageData.duration,
        price: packageData.price,
        description: packageData.description,
        maxGuests: packageData.maxGuests,
        category: packageData.category,
        status: packageData.status,
        thumbnail: packageData.thumbnail,
        organizationId: org.id,
      });

      const savedPackage = await queryRunner.manager.save(pkg);
      console.log('Package created:', savedPackage.id);

      // Create inclusions
      for (const inclusionItem of packageData.inclusions) {
        const inclusion = queryRunner.manager.create(Inclusion, {
          item: inclusionItem,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(inclusion);
      }

      // Create exclusions
      for (const exclusionItem of packageData.exclusions) {
        const exclusion = queryRunner.manager.create(Exclusion, {
          item: exclusionItem,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(exclusion);
      }
    }

    // Create batches
    console.log('Seeding batches...');
    for (const batchData of batches) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: batchData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${batchData.organizationDomain}`,
        );
        continue;
      }

      const pkg = await queryRunner.manager.findOne(Package, {
        where: { name: batchData.packageName, organizationId: org.id },
      });

      if (!pkg) {
        console.log(`Package not found: ${batchData.packageName}`);
        continue;
      }

      const batch = queryRunner.manager.create(Batch, {
        startDate: new Date(batchData.startDate),
        endDate: new Date(batchData.endDate),
        totalSeats: batchData.totalSeats,
        bookedSeats: batchData.bookedSeats,
        status: batchData.status,
        organizationId: org.id,
        packageId: pkg.id,
      });

      const savedBatch = await queryRunner.manager.save(batch);
      console.log('Batch created:', savedBatch.id);
    }

    // Create FileManager records for package images
    console.log('Seeding package images...');
    for (const imageData of packageImages) {
      const pkg = await queryRunner.manager.findOne(Package, {
        where: { name: imageData.packageName },
      });

      if (!pkg) {
        console.log(`Package not found: ${imageData.packageName}`);
        continue;
      }

      const fileManager = queryRunner.manager.create(FileManager, {
        filename: imageData.filename,
        relatedId: pkg.id,
        relatedType: imageData.relatedType,
        url: `./uploads/package/${imageData.filePath}`,
      });

      const savedFileManager = await queryRunner.manager.save(fileManager);
      console.log('Package image created:', savedFileManager.id);

      // Update package thumbnail to use the FileManager ID
      await queryRunner.manager.update(Package, pkg.id, {
        thumbnail: savedFileManager.id,
      });
    }

    // Create leads
    console.log('Seeding leads...');
    for (const leadData of leads) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: leadData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${leadData.organizationDomain}`,
        );
        continue;
      }

      // Find a random user from the organization to be the creator
      const users = await queryRunner.manager.find(User, {
        where: { organizationId: org.id },
      });

      if (users.length === 0) {
        console.log(`No users found for organization: ${org.name}`);
        continue;
      }

      const randomUser = users[Math.floor(Math.random() * users.length)];

      const lead = queryRunner.manager.create(Lead, {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        notes: leadData.notes,
        status: leadData.status,
        organizationId: org.id,
        createdById: randomUser.id,
      });

      const savedLead = await queryRunner.manager.save(lead);
      console.log('Lead created:', savedLead.id);
    }

    // Create customers
    console.log('Seeding customers...');
    for (const customerData of customers) {
      const org = await queryRunner.manager.findOne(Organization, {
        where: { domain: customerData.organizationDomain },
      });

      if (!org) {
        console.log(
          `Organization not found for domain: ${customerData.organizationDomain}`,
        );
        continue;
      }

      // Find a random user from the organization to be the creator
      const users = await queryRunner.manager.find(User, {
        where: { organizationId: org.id },
      });

      if (users.length === 0) {
        console.log(`No users found for organization: ${org.name}`);
        continue;
      }

      const randomUser = users[Math.floor(Math.random() * users.length)];

      const customer = queryRunner.manager.create(Customer, {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        status: customerData.status,
        notes: customerData.notes,
        organizationId: org.id,
        createdById: randomUser.id,
      });

      const savedCustomer = await queryRunner.manager.save(customer);
      console.log('Customer created:', savedCustomer.id);
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
