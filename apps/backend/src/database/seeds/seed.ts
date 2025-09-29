import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import configuration from '../../config/configuration';
import { Batch } from '../entity/batch.entity';
import { Branch } from '../entity/branch.entity';
import { Customer } from '../entity/customer.entity';
import { Department } from '../entity/department.entity';
import { Employee, EmployeeStatus } from '../entity/employee.entity';
import { FileManager, RelatedType } from '../entity/file-manager.entity';
import { Lead } from '../entity/lead.entity';
import { Organization } from '../entity/organization.entity';
import { CancellationPolicy } from '../entity/package-related/cancellation-policies.entity';
import { CancellationTier } from '../entity/package-related/cancellation-tiers.entity';
import { ChecklistItem } from '../entity/package-related/checklist-items.entity';
import { DocumentRequirement } from '../entity/package-related/document-requirements.entity';
import { Exclusion } from '../entity/package-related/exclusions.entity';
import { Inclusion } from '../entity/package-related/inclusions.entity';
import { ItineraryDay } from '../entity/package-related/itinerary-days.entity';
import { MealsBreakdown } from '../entity/package-related/meals-breakdowns.entity';
import { PackageLocation } from '../entity/package-related/package-locations.entity';
import { Package } from '../entity/package-related/package.entity';
import { PaymentMilestone } from '../entity/package-related/payment-milestones.entity';
import { Transportation } from '../entity/package-related/transportations.entity';
import { Role } from '../entity/role.entity';
import { UserNotificationType } from '../entity/user-notification-type.entity';
import { User } from '../entity/user.entity';
import { batches } from './batch.seed';
import { branches } from './branch.seed';
import { customers } from './customer.seed';
import { departments } from './department.seed';
import { additionalEmployees } from './employee.seed';
import { leads } from './lead.seed';
import { organizations } from './organization.seed';
import { packages } from './package.seed';
import { roles } from './role.seed';
import { userNotificationType } from './user-notification-type.seed';
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

    // Create packages with all related entities
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
        organizationId: org.id,
      });

      const savedPackage = await queryRunner.manager.save(pkg);
      console.log('Package created:', savedPackage.id);

      const fileManager = queryRunner.manager.create(FileManager, {
        filename: packageData.thumbnail,
        relatedId: savedPackage.id,
        relatedType: RelatedType.PACKAGE,
        url: `./uploads/package/${packageData.thumbnail}`,
      });

      const savedFileManager = await queryRunner.manager.save(fileManager);

      await queryRunner.manager.update(Package, savedPackage.id, {
        thumbnail: savedFileManager.id,
      });

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

      // Create payment structure
      if (packageData.paymentStructure) {
        for (const payment of packageData.paymentStructure) {
          const paymentMilestone = queryRunner.manager.create(
            PaymentMilestone,
            {
              name: payment.name,
              amount: payment.amount,
              description: payment.description,
              dueDate: payment.dueDate,
              packageId: savedPackage.id,
            },
          );
          await queryRunner.manager.save(paymentMilestone);
        }
      }

      // Create cancellation structure
      if (packageData.cancellationStructure) {
        for (const tier of packageData.cancellationStructure) {
          const cancellationTier = queryRunner.manager.create(
            CancellationTier,
            {
              timeframe: tier.timeframe,
              amount: tier.amount,
              description: tier.description,
              packageId: savedPackage.id,
            },
          );
          await queryRunner.manager.save(cancellationTier);
        }
      }

      // Create cancellation policy
      if (packageData.cancellationPolicy) {
        for (const policy of packageData.cancellationPolicy) {
          const cancellationPolicy = queryRunner.manager.create(
            CancellationPolicy,
            {
              text: policy,
              packageId: savedPackage.id,
            },
          );
          await queryRunner.manager.save(cancellationPolicy);
        }
      }

      // Create document requirements
      if (packageData.documentRequirements) {
        for (const doc of packageData.documentRequirements) {
          const documentRequirement = queryRunner.manager.create(
            DocumentRequirement,
            {
              name: doc.name,
              description: doc.description,
              mandatory: doc.mandatory,
              applicableFor: doc.applicableFor,
              packageId: savedPackage.id,
            },
          );
          await queryRunner.manager.save(documentRequirement);
        }
      }

      // Create pre-trip checklist
      if (packageData.preTripChecklist) {
        for (const item of packageData.preTripChecklist) {
          const checklistItem = queryRunner.manager.create(ChecklistItem, {
            task: item.task,
            description: item.description,
            category: item.category,
            dueDate: item.dueDate,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(checklistItem);
        }
      }

      // Create meals breakdown
      if (packageData.mealsBreakdown) {
        const mealsBreakdown = queryRunner.manager.create(MealsBreakdown, {
          breakfast: packageData.mealsBreakdown.breakfast,
          lunch: packageData.mealsBreakdown.lunch,
          dinner: packageData.mealsBreakdown.dinner,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(mealsBreakdown);
      }

      // Create package location
      if (packageData.packageLocation) {
        const packageLocation = queryRunner.manager.create(PackageLocation, {
          type: packageData.packageLocation.type as 'international' | 'local',
          country: packageData.packageLocation.country,
          state: packageData.packageLocation.state || undefined,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(packageLocation);
      }

      // Create transportation
      if (packageData.transportation) {
        const transportation = queryRunner.manager.create(Transportation, {
          toMode: packageData.transportation.toDestination?.mode || undefined,
          toDetails:
            packageData.transportation.toDestination?.details || undefined,
          toIncluded:
            packageData.transportation.toDestination?.included || false,
          fromMode:
            packageData.transportation.fromDestination?.mode || undefined,
          fromDetails:
            packageData.transportation.fromDestination?.details || undefined,
          fromIncluded:
            packageData.transportation.fromDestination?.included || false,
          duringMode: packageData.transportation.duringTrip?.mode || undefined,
          duringDetails:
            packageData.transportation.duringTrip?.details || undefined,
          duringIncluded:
            packageData.transportation.duringTrip?.included || false,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(transportation);
      }

      // Create itinerary
      if (packageData.itinerary) {
        for (const day of packageData.itinerary) {
          const itineraryDay = queryRunner.manager.create(ItineraryDay, {
            day: day.day,
            title: day.title,
            description: day.description,
            activities: day.activities,
            meals: day.meals,
            accommodation: day.accommodation,
            packageId: savedPackage.id,
          });

          let images: string[] = [];
          const savedItinerary = await queryRunner.manager.save(itineraryDay);

          for (const itineraryImage of day.images) {
            const fileManager = queryRunner.manager.create(FileManager, {
              filename: itineraryImage,
              relatedId: savedItinerary.id,
              relatedType: RelatedType.ITINERARY,
              url: `./uploads/itinerary/${itineraryImage}`,
            });

            const savedFileManager =
              await queryRunner.manager.save(fileManager);

            console.log('Package image created:', savedFileManager.id);

            if (savedFileManager) {
              images.push(savedFileManager.id);
            }
          }

          await queryRunner.manager.update(ItineraryDay, savedItinerary.id, {
            images: images,
          });
        }
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
        // Personal Details
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        middleName: customerData.middleName,
        dateOfBirth: new Date(customerData.dateOfBirth),
        gender: customerData.gender,

        // Contact Information
        email: customerData.email,
        phone: customerData.phone,
        alternativePhone: customerData.alternativePhone,
        address: customerData.address,

        // Emergency Contact
        emergencyContactName: customerData.emergencyContactName,
        emergencyContactPhone: customerData.emergencyContactPhone,
        emergencyContactRelation: customerData.emergencyContactRelation,

        // Passport Details
        passportNumber: customerData.passportNumber,
        passportExpiryDate: customerData.passportExpiryDate
          ? new Date(customerData.passportExpiryDate)
          : undefined,
        passportIssueDate: customerData.passportIssueDate
          ? new Date(customerData.passportIssueDate)
          : undefined,
        passportCountry: customerData.passportCountry,

        // ID Documents
        voterId: customerData.voterId,
        aadhaarId: customerData.aadhaarId,

        // Relatives Information
        relatives: customerData.relatives,

        // Travel Preferences
        dietaryRestrictions: customerData.dietaryRestrictions,
        medicalConditions: customerData.medicalConditions,
        specialRequests: customerData.specialRequests,

        // Additional Information
        notes: customerData.notes,

        // System Fields
        organizationId: org.id,
        createdById: randomUser.id,
      });

      const savedCustomer = await queryRunner.manager.save(customer);
      console.log('Customer created:', savedCustomer.id);

      // Handle profile photo file
      if (customerData.profilePhoto) {
        const profilePhotoFile = queryRunner.manager.create(FileManager, {
          filename: customerData.profilePhoto,
          relatedId: savedCustomer.id,
          relatedType: RelatedType.CUSTOMER,
          url: `./uploads/customer/profile/${customerData.profilePhoto}`,
        });
        const savedProfilePhoto =
          await queryRunner.manager.save(profilePhotoFile);

        await queryRunner.manager.update(Customer, savedCustomer.id, {
          profilePhoto: savedProfilePhoto.id,
        });
        console.log('Customer profile photo created:', savedProfilePhoto.id);
      }

      // Handle passport photos
      if (
        customerData.passportPhotos &&
        customerData.passportPhotos.length > 0
      ) {
        const passportPhotoIds: string[] = [];
        for (const passportPhoto of customerData.passportPhotos) {
          const passportPhotoFile = queryRunner.manager.create(FileManager, {
            filename: passportPhoto,
            relatedId: savedCustomer.id,
            relatedType: RelatedType.CUSTOMER,
            url: `./uploads/customer/passport/${passportPhoto}`,
          });
          const savedPassportPhoto =
            await queryRunner.manager.save(passportPhotoFile);
          passportPhotoIds.push(savedPassportPhoto.id);
          console.log(
            'Customer passport photo created:',
            savedPassportPhoto.id,
          );
        }

        await queryRunner.manager.update(Customer, savedCustomer.id, {
          passportPhotos: passportPhotoIds,
        });
      }

      // Handle voter ID photos
      if (customerData.voterIdPhotos && customerData.voterIdPhotos.length > 0) {
        const voterIdPhotoIds: string[] = [];
        for (const voterIdPhoto of customerData.voterIdPhotos) {
          const voterIdPhotoFile = queryRunner.manager.create(FileManager, {
            filename: voterIdPhoto,
            relatedId: savedCustomer.id,
            relatedType: RelatedType.CUSTOMER,
            url: `./uploads/customer/voter-id/${voterIdPhoto}`,
          });
          const savedVoterIdPhoto =
            await queryRunner.manager.save(voterIdPhotoFile);
          voterIdPhotoIds.push(savedVoterIdPhoto.id);
          console.log('Customer voter ID photo created:', savedVoterIdPhoto.id);
        }

        await queryRunner.manager.update(Customer, savedCustomer.id, {
          voterIdPhotos: voterIdPhotoIds,
        });
      }

      // Handle Aadhaar ID photos
      if (
        customerData.aadhaarIdPhotos &&
        customerData.aadhaarIdPhotos.length > 0
      ) {
        const aadhaarIdPhotoIds: string[] = [];
        for (const aadhaarIdPhoto of customerData.aadhaarIdPhotos) {
          const aadhaarIdPhotoFile = queryRunner.manager.create(FileManager, {
            filename: aadhaarIdPhoto,
            relatedId: savedCustomer.id,
            relatedType: RelatedType.CUSTOMER,
            url: `./uploads/customer/aadhaar-id/${aadhaarIdPhoto}`,
          });
          const savedAadhaarIdPhoto =
            await queryRunner.manager.save(aadhaarIdPhotoFile);
          aadhaarIdPhotoIds.push(savedAadhaarIdPhoto.id);
          console.log(
            'Customer Aadhaar ID photo created:',
            savedAadhaarIdPhoto.id,
          );
        }

        await queryRunner.manager.update(Customer, savedCustomer.id, {
          aadhaarIdPhotos: aadhaarIdPhotoIds,
        });
      }
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
