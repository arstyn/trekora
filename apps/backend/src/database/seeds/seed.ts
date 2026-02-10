import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import configuration from '../../config/configuration';
import { Batch } from '../entity/batch.entity';
import { Branch } from '../entity/branch.entity';
import { Customer } from '../entity/customer.entity';
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
import { UserNotificationType } from '../entity/user-notification-type.entity';
import { User } from '../entity/user.entity';
import { Permission } from '../entity/permission.entity';
import { batches } from './batch.seed';
import { branches } from './branch.seed';
import { customers } from './customer.seed';
import { additionalEmployees } from './employee.seed';
import { leads } from './lead.seed';
import { organizations } from './organization.seed';
import { packages } from './package.seed';
import { userNotificationType } from './user-notification-type.seed';
import { users } from './user.seed';
import { permissions } from './permission.seed';
import { PermissionSet } from '../entity/permission-set.entity';
import { PermissionSetPermission } from '../entity/permission-set-permission.entity';
import { UserPermissionSet } from '../entity/user-permission-set.entity';

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

async function tableExists(
  queryRunner: any,
  tableName: string,
): Promise<boolean> {
  const result = await queryRunner.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );`,
    [tableName],
  );
  return result[0].exists;
}

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

      // Check if table exists before attempting to delete
      if (await tableExists(queryRunner, tableName)) {
        console.log(`Clearing table: ${tableName}`);
        await queryRunner.query(`DELETE FROM "${tableName}";`);
      } else {
        console.log(`Table ${tableName} does not exist, skipping...`);
      }
    }

    // Re-enable foreign key checks
    await queryRunner.query('SET session_replication_role = DEFAULT;');

    console.log('Database cleared successfully');
    const userNotificationTypeRepository =
      AppDataSource.getRepository(UserNotificationType);

    console.log('Seeding permissions...');
    const permissionTableExists = await tableExists(queryRunner, 'permission');
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    if (!permissionTableExists) {
      console.log(
        'Permission table does not exist, skipping permission seeding...',
      );
    } else {
      for (const permissionData of permissions) {
        let existingPermission: Permission | null = null;
        existingPermission = await permissionRepository.findOne({
          where: { name: permissionData.name },
        });

        if (!existingPermission) {
          const permission = permissionRepository.create(permissionData);
          await permissionRepository.save(permission);
          console.log(`Created permission: ${permissionData.name}`);
        } else {
          console.log(`Permission ${permissionData.name} already exists`);
        }
      }
    }

    console.log('Seeding notification types...');
    const notificationTypeTableExists = await tableExists(
      queryRunner,
      'user_notification_type',
    );
    if (!notificationTypeTableExists) {
      console.log(
        'User notification type table does not exist, skipping notification type seeding...',
      );
    } else {
      for (const user_notification_type of userNotificationType) {
        let existingNotificationType: UserNotificationType | null = null;
        existingNotificationType = await userNotificationTypeRepository.findOne(
          {
            where: { title: user_notification_type.title },
          },
        );

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
    }

    // Seed organizations
    const organizationTableExists = await tableExists(
      queryRunner,
      'organization',
    );
    if (!organizationTableExists) {
      console.log(
        'Organization table does not exist, skipping organization seeding...',
      );
    } else {
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
    }

    // Create users and employees (no role requirement - using permission sets)
    const userTableExists = await tableExists(queryRunner, 'user');
    const employeeTableExists = await tableExists(queryRunner, 'employee');

    if (userTableExists && employeeTableExists) {
      for (const user of users) {
        const org = await queryRunner.manager.findOne(Organization, {
          where: { domain: user.organizationDomain },
        });

        if (!org) {
          throw new Error('Organization not found in database');
        }

        // Create user (roleId is optional now)
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = queryRunner.manager.create(User, {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          phone: user.phone,
          organizationId: org.id,
          notificationsEnabled: user.notificationsEnabled,
          newsletterSubscribed: user.newsletterSubscribed,
        });

        const savedUser = await queryRunner.manager.save(newUser);
        console.log('User created:', savedUser.id);

        // Create employee (roleId is optional now)
        const employee = queryRunner.manager.create(Employee, {
          name: user.name,
          email: user.email,
          phone: user.phone,
          organizationId: org.id,
          userId: savedUser.id,
          status: EmployeeStatus.ACTIVE,
          joinDate: new Date().toISOString(),
        });
        const savedEmployee = await queryRunner.manager.save(employee);
        console.log('Employee created:', savedEmployee.id);

        // Assign admin permission set to the user (will be done after permission sets are created)
        // This will be handled after permission sets are seeded
      }
    } else {
      console.log(
        'User or employee table does not exist, skipping user/employee seeding...',
      );
    }

    // Create additional employees (no role requirement - using permission sets)
    const additionalEmployeeTableExists = await tableExists(
      queryRunner,
      'employee',
    );
    if (!additionalEmployeeTableExists) {
      console.log(
        'Employee table does not exist, skipping additional employee seeding...',
      );
    } else {
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

        // Create employee without role (roleId is optional)
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
          status: employeeData.status,
          joinDate: new Date().toISOString(),
        });

        const savedEmployee = await queryRunner.manager.save(employee);
        console.log('Additional employee created:', savedEmployee.id);

        // Permission set assignment will be done after permission sets are created
      }
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

      // Add coordinators if specified
      if (batchData.coordinators && batchData.coordinators.length > 0) {
        const coordinators: Employee[] = [];

        for (const coordinatorEmail of batchData.coordinators) {
          const coordinator = await queryRunner.manager.findOne(Employee, {
            where: { email: coordinatorEmail, organizationId: org.id },
          });

          if (coordinator) {
            coordinators.push(coordinator);
            console.log(
              `Added coordinator ${coordinatorEmail} to batch ${savedBatch.id}`,
            );
          } else {
            console.log(`Coordinator not found: ${coordinatorEmail}`);
          }
        }

        if (coordinators.length > 0) {
          savedBatch.coordinators = coordinators;
          await queryRunner.manager.save(savedBatch);
          console.log(
            `Assigned ${coordinators.length} coordinators to batch ${savedBatch.id}`,
          );
        }
      }
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

    // Create default permission sets for all organizations
    console.log('Creating default permission sets for organizations...');
    const permissionSetTableExists = await tableExists(
      queryRunner,
      'permission_set',
    );
    const permissionSetRepository =
      queryRunner.manager.getRepository(PermissionSet);
    const permissionSetPermissionRepository = queryRunner.manager.getRepository(
      PermissionSetPermission,
    );

    if (!permissionSetTableExists) {
      console.log(
        'Permission set table does not exist, skipping permission set creation...',
      );
    } else {
      const organizations = await queryRunner.manager.find(Organization);
      const { defaultPermissionSets } = await import(
        '../../modules/permission/default-permission-sets'
      );

      // Get all permissions as a map for quick lookup
      const allPermissions = await permissionRepository.find();
      const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

      for (const org of organizations) {
        // Create permission sets for each role (admin, manager, employee)
        for (const [roleName, config] of Object.entries(
          defaultPermissionSets,
        )) {
          // Check if permission set already exists
          const existingSet = await permissionSetRepository.findOne({
            where: {
              name: config.name,
              organizationId: org.id,
            },
          });

          if (existingSet) {
            console.log(
              `Permission set "${config.name}" already exists for organization ${org.id}, skipping...`,
            );
            continue;
          }

          // Create permission set
          const permissionSet = permissionSetRepository.create({
            name: config.name,
            description: config.description,
            organizationId: org.id,
          });
          const savedPermissionSet =
            await permissionSetRepository.save(permissionSet);

          // Find permission IDs for this permission set
          const permissionIds: string[] = [];
          for (const permissionName of config.permissionNames) {
            const permissionId = permissionMap.get(permissionName);
            if (permissionId) {
              permissionIds.push(permissionId);
            } else {
              console.warn(
                `Permission ${permissionName} not found, skipping for ${roleName} permission set`,
              );
            }
          }

          // Create permission_set_permission entries
          if (permissionIds.length > 0) {
            const permissionSetPermissions = permissionIds.map((permissionId) =>
              permissionSetPermissionRepository.create({
                permissionSetId: savedPermissionSet.id,
                permissionId,
              }),
            );
            await permissionSetPermissionRepository.save(
              permissionSetPermissions,
            );
          }

          console.log(
            `Created permission set "${config.name}" for organization ${org.id} with ${permissionIds.length} permissions`,
          );
        }
      }
    }

    // Assign permission sets to users and employees
    console.log('Assigning permission sets to users and employees...');
    const userPermissionSetTableExists = await tableExists(
      queryRunner,
      'user_permission_set',
    );
    if (userPermissionSetTableExists) {
      const userPermissionSetRepository =
        queryRunner.manager.getRepository(UserPermissionSet);

      // Get all users, employees, and organizations
      const allUsers = await queryRunner.manager.find(User);
      const allEmployees = await queryRunner.manager.find(Employee);
      const organizations = await queryRunner.manager.find(Organization);

      // Define admin users and manager employees for each organization
      // Structure: { organizationDomain: { adminEmail, managerEmail } }
      const organizationHierarchy = {
        'acme.com': {
          adminEmail: 'alice@acme.com',
          managerEmail: 'sarah.wilson@acme.com',
        },
        'globex.co': {
          adminEmail: 'bob@globex.co',
          managerEmail: 'james.thompson@globex.co',
        },
        'initech.org': {
          adminEmail: 'carol@initech.org',
          managerEmail: 'jennifer.lee@initech.org',
        },
        'umbrella.com': {
          adminEmail: 'david@umbrella.com',
          managerEmail: 'amanda.foster@umbrella.com',
        },
      };

      // Step 1: Assign admin permission sets to admin users
      for (const user of allUsers) {
        if (!user.organizationId) continue;

        const org = organizations.find(o => o.id === user.organizationId);
        if (!org || !org.domain) continue;

        const hierarchy = organizationHierarchy[org.domain];
        if (!hierarchy) continue;

        const isAdminUser = hierarchy.adminEmail.toLowerCase() === user.email.toLowerCase();

        if (isAdminUser) {
          // Find admin permission set for this organization
          const adminPermissionSet = await permissionSetRepository.findOne({
            where: {
              name: 'Admin - Full Access',
              organizationId: user.organizationId,
            },
          });

          if (adminPermissionSet) {
            // Check if already assigned to user
            let existing = await userPermissionSetRepository.findOne({
              where: {
                userId: user.id,
                permissionSetId: adminPermissionSet.id,
              },
            });

            if (!existing) {
              existing = userPermissionSetRepository.create({
                userId: user.id,
                permissionSetId: adminPermissionSet.id,
              });
              await userPermissionSetRepository.save(existing);
            }

            // Also assign to linked employee if exists
            const linkedEmployee = allEmployees.find(e => e.userId === user.id);
            if (linkedEmployee) {
              let existingEmployee = await userPermissionSetRepository.findOne({
                where: {
                  employeeId: linkedEmployee.id,
                  permissionSetId: adminPermissionSet.id,
                },
              });

              if (!existingEmployee) {
                existingEmployee = userPermissionSetRepository.create({
                  employeeId: linkedEmployee.id,
                  permissionSetId: adminPermissionSet.id,
                });
                await userPermissionSetRepository.save(existingEmployee);
              }
              console.log(
                `Assigned Admin - Full Access permission set to admin: ${user.email}`,
              );
            }
          }
        }
      }

      // Step 2: Set up manager hierarchy and assign manager permission sets
      for (const org of organizations) {
        if (!org.domain) continue;
        const hierarchy = organizationHierarchy[org.domain];
        if (!hierarchy) continue;

        // Find admin employee
        const adminUser = allUsers.find(
          u => u.email.toLowerCase() === hierarchy.adminEmail.toLowerCase() && u.organizationId === org.id
        );
        const adminEmployee = adminUser
          ? allEmployees.find(e => e.userId === adminUser.id)
          : null;

        // Find manager employee
        const managerEmployee = allEmployees.find(
          e => e.email?.toLowerCase() === hierarchy.managerEmail.toLowerCase() && e.organizationId === org.id
        );

        if (!managerEmployee) {
          console.log(`Manager employee not found for ${org.domain}: ${hierarchy.managerEmail}`);
          continue;
        }

        // Assign manager permission set to manager employee
        const managerPermissionSet = await permissionSetRepository.findOne({
          where: {
            name: 'Manager - Team Management',
            organizationId: org.id,
          },
        });

        if (managerPermissionSet) {
          // Assign to manager employee
          let existing = await userPermissionSetRepository.findOne({
            where: {
              employeeId: managerEmployee.id,
              permissionSetId: managerPermissionSet.id,
            },
          });

          if (!existing) {
            existing = userPermissionSetRepository.create({
              employeeId: managerEmployee.id,
              permissionSetId: managerPermissionSet.id,
            });
            await userPermissionSetRepository.save(existing);
          }

          // Also assign to linked user if exists
          if (managerEmployee.userId) {
            let existingUser = await userPermissionSetRepository.findOne({
              where: {
                userId: managerEmployee.userId,
                permissionSetId: managerPermissionSet.id,
              },
            });

            if (!existingUser) {
              existingUser = userPermissionSetRepository.create({
                userId: managerEmployee.userId,
                permissionSetId: managerPermissionSet.id,
              });
              await userPermissionSetRepository.save(existingUser);
            }
          }

          console.log(
            `Assigned Manager - Team Management permission set to manager: ${managerEmployee.email}`,
          );
        }

        // Set manager hierarchy: manager reports to admin
        if (adminEmployee) {
          await queryRunner.manager.update(Employee, managerEmployee.id, {
            managerId: adminEmployee.id,
          });
          console.log(
            `Set ${managerEmployee.email} as direct report of admin ${adminEmployee.email}`,
          );
        }
      }

      // Step 3: Assign "Employee - Basic Access" to all other employees and set their manager
      const adminUserEmails = Object.values(organizationHierarchy).map(h => h.adminEmail.toLowerCase());
      const managerEmails = Object.values(organizationHierarchy).map(h => h.managerEmail.toLowerCase());

      for (const employee of allEmployees) {
        if (!employee.organizationId) continue;

        const org = organizations.find(o => o.id === employee.organizationId);
        if (!org || !org.domain) continue;

        const hierarchy = organizationHierarchy[org.domain];
        if (!hierarchy) continue;

        const employeeEmail = employee.email?.toLowerCase();
        if (!employeeEmail) continue;

        // Skip admin and manager employees (already assigned)
        if (adminUserEmails.includes(employeeEmail) || managerEmails.includes(employeeEmail)) {
          continue;
        }

        // Find manager employee for this organization
        const managerEmployee = allEmployees.find(
          e => e.email?.toLowerCase() === hierarchy.managerEmail.toLowerCase() && e.organizationId === org.id
        );

        // Set manager for this employee
        if (managerEmployee) {
          await queryRunner.manager.update(Employee, employee.id, {
            managerId: managerEmployee.id,
          });
          console.log(
            `Set ${employee.email} as direct report of manager ${managerEmployee.email}`,
          );
        }

        // Assign "Employee - Basic Access" permission set
        const employeePermissionSet = await permissionSetRepository.findOne({
          where: {
            name: 'Employee - Basic Access',
            organizationId: employee.organizationId,
          },
        });

        if (employeePermissionSet) {
          // Check if already assigned
          let existing = await userPermissionSetRepository.findOne({
            where: {
              employeeId: employee.id,
              permissionSetId: employeePermissionSet.id,
            },
          });

          if (!existing) {
            // Assign to employee
            existing = userPermissionSetRepository.create({
              employeeId: employee.id,
              permissionSetId: employeePermissionSet.id,
            });
            await userPermissionSetRepository.save(existing);

            // Also assign to linked user if exists
            if (employee.userId) {
              let existingUser = await userPermissionSetRepository.findOne({
                where: {
                  userId: employee.userId,
                  permissionSetId: employeePermissionSet.id,
                },
              });

              if (!existingUser) {
                existingUser = userPermissionSetRepository.create({
                  userId: employee.userId,
                  permissionSetId: employeePermissionSet.id,
                });
                await userPermissionSetRepository.save(existingUser);
              }
            }

            console.log(
              `Assigned Employee - Basic Access permission set to employee: ${employee.email}`,
            );
          }
        }
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
