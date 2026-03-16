import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import configuration from '../../config/configuration';
import { defaultPermissionSets } from '../../modules/permission/default-permission-sets';
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
import { PermissionSetPermission } from '../entity/permission-set-permission.entity';
import { PermissionSet } from '../entity/permission-set.entity';
import { Permission } from '../entity/permission.entity';
import { UserNotificationType } from '../entity/user-notification-type.entity';
import { UserPermissionSet } from '../entity/user-permission-set.entity';
import { User } from '../entity/user.entity';
import { batches } from './batch.seed';
import { branches } from './branch.seed';
import { customers } from './customer.seed';
import { additionalEmployees } from './employee.seed';
import { leads } from './lead.seed';
import { organizations } from './organization.seed';
import { packages } from './package.seed';
import { userNotificationType } from './user-notification-type.seed';
import { users } from './user.seed';

config();

const appConfig = configuration();
const databaseConfig = appConfig.database;

const dbUrl = databaseConfig.url || (databaseConfig.host?.includes('://') ? databaseConfig.host : undefined);

const AppDataSource = new DataSource({
  type: 'postgres',
  ...(dbUrl
    ? { url: dbUrl }
    : {
        host: databaseConfig.host,
        port: Number(databaseConfig.port),
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
      }),
  entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
  synchronize: true,
  ssl:
    databaseConfig.ssl_mode || !!dbUrl
      ? { rejectUnauthorized: false }
      : false,
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

    // Clear all tables in reverse order to handle foreign key constraints
    // Using TRUNCATE CASCADE because session_replication_role requires superuser permissions (not available on Neon)
    for (const entity of entities.reverse()) {
      const tableName = entity.tableName;

      // Check if table exists before attempting to delete
      if (await tableExists(queryRunner, tableName)) {
        console.log(`Clearing table: ${tableName}`);
        await queryRunner.query(
          `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
        );
      } else {
        console.log(`Table ${tableName} does not exist, skipping...`);
      }
    }

    console.log('Database cleared successfully');
    const userNotificationTypeRepository =
      queryRunner.manager.getRepository(UserNotificationType);

    console.log(
      'Skipping premature permission seeding (will be seeded per organization later)...',
    );

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

        // Check if there are additional details for this employee
        const detailedEmployee = additionalEmployees.find(
          (e) => e.email === user.email,
        );

        // Create employee
        const employee = queryRunner.manager.create(Employee, {
          name: user.name,
          email: user.email,
          phone: user.phone,
          organizationId: org.id,
          userId: savedUser.id,
          status: detailedEmployee?.status || EmployeeStatus.ACTIVE,
          joinDate: new Date().toISOString(),
          address: detailedEmployee?.address,
          experience: detailedEmployee?.experience,
          specialization: detailedEmployee?.specialization,
          dateOfBirth: detailedEmployee?.dateOfBirth
            ? new Date(detailedEmployee.dateOfBirth)
            : undefined,
          gender: detailedEmployee?.gender,
          nationality: detailedEmployee?.nationality,
          maritalStatus: detailedEmployee?.maritalStatus,
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

    console.log('All employees seeded via user creation loop');

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
      if ((packageData as any).preTripChecklist) {
        for (const item of (packageData as any).preTripChecklist) {
          const checklistItem = queryRunner.manager.create(ChecklistItem, {
            ...item,
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
    const permissionRepository = queryRunner.manager.getRepository(Permission);

    if (!permissionSetTableExists) {
      console.log(
        'Permission set table does not exist, skipping permission set creation...',
      );
    } else {
      const organizations = await queryRunner.manager.find(Organization);
      const { defaultPermissionSets } = await import(
        '../../modules/permission/default-permission-sets'
      );
      const { permissions: defaultPermissions } = await import(
        './permission.seed'
      );

      for (const org of organizations) {
        // First, create default permissions for this organization
        console.log(
          `Creating default permissions for organization ${org.id}...`,
        );
        const existingPermissions = await permissionRepository.find({
          where: { organizationId: org.id },
        });
        const existingPermissionNames = new Set(
          existingPermissions.map((p) => p.name),
        );

        // Create permissions that don't exist yet
        const permissionsToCreate = defaultPermissions.filter(
          (p) => !existingPermissionNames.has(p.name),
        );

        if (permissionsToCreate.length > 0) {
          const newPermissions = permissionsToCreate.map((p) =>
            permissionRepository.create({
              ...p,
              organizationId: org.id,
            }),
          );
          await permissionRepository.save(newPermissions);
          console.log(
            `Created ${newPermissions.length} permissions for organization ${org.id}`,
          );
        }

        // Get all permissions for this organization as a map for quick lookup
        const orgPermissions = await permissionRepository.find({
          where: { organizationId: org.id },
        });
        const permissionMap = new Map<string, string>(
          orgPermissions.map((p) => [p.name, p.id]),
        );

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
                `Permission ${permissionName} not found for organization ${org.id}, skipping for ${roleName} permission set`,
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

      // Map each employee to their role-based permission set
      for (const employee of allEmployees) {
        if (!employee.organizationId || !employee.email) continue;

        const org = organizations.find((o) => o.id === employee.organizationId);
        if (!org || !org.domain) continue;

        const hierarchy = organizationHierarchy[org.domain];
        if (!hierarchy) continue;

        // Determine the role for this employee
        let roleKey: string = 'employee'; // Default

        // 1. Check if they are the organization admin
        if (
          employee.email.toLowerCase() === hierarchy.adminEmail.toLowerCase()
        ) {
          roleKey = 'admin';
        } else {
          // 2. Check if they have a specialized role in additionalEmployees
          const detailedInfo = additionalEmployees.find(
            (e) => e.email.toLowerCase() === employee.email?.toLowerCase(),
          );
          if (detailedInfo?.roleName) {
            roleKey = detailedInfo.roleName;
          }
        }

        const config =
          defaultPermissionSets[roleKey as keyof typeof defaultPermissionSets];
        if (!config) {
          console.warn(`No permission set config found for role: ${roleKey}`);
          continue;
        }

        // Find the permission set for this organization
        const permissionSet = await permissionSetRepository.findOne({
          where: {
            name: config.name,
            organizationId: employee.organizationId,
          },
        });

        if (permissionSet) {
          // Assign to employee
          let existing = await userPermissionSetRepository.findOne({
            where: {
              employeeId: employee.id,
              permissionSetId: permissionSet.id,
            },
          });

          if (!existing) {
            existing = userPermissionSetRepository.create({
              employeeId: employee.id,
              permissionSetId: permissionSet.id,
            });
            await userPermissionSetRepository.save(existing);
          }

          // Also assign to linked user if exists
          if (employee.userId) {
            let existingUser = await userPermissionSetRepository.findOne({
              where: {
                userId: employee.userId,
                permissionSetId: permissionSet.id,
              },
            });

            if (!existingUser) {
              existingUser = userPermissionSetRepository.create({
                userId: employee.userId,
                permissionSetId: permissionSet.id,
              });
              await userPermissionSetRepository.save(existingUser);
            }
          }

          console.log(`Assigned "${config.name}" to ${employee.email}`);
        }

        // --- Set up reporting lines (Department-Aware Hierarchy) ---
        const employeeEmail = employee.email?.toLowerCase();
        const isAdmin = employeeEmail === hierarchy.adminEmail.toLowerCase();
        const isGM = employeeEmail === hierarchy.managerEmail.toLowerCase();

        // 1. Get role info for this employee
        const detailedEmployee = additionalEmployees.find(
          (e) => e.email.toLowerCase() === employeeEmail,
        );
        const roleName = detailedEmployee?.roleName || 'employee';

        // 2. Find key managers in this organization
        const adminUser = allUsers.find(
          (u) =>
            u.email.toLowerCase() === hierarchy.adminEmail.toLowerCase() &&
            u.organizationId === org.id,
        );
        const adminEmp = adminUser
          ? allEmployees.find((e) => e.userId === adminUser.id)
          : null;

        const gmEmp = allEmployees.find(
          (e) =>
            e.email?.toLowerCase() === hierarchy.managerEmail.toLowerCase() &&
            e.organizationId === org.id,
        );

        if (isAdmin) {
          // Admin has no manager
        } else if (isGM) {
          // GM reports to Admin
          if (adminEmp) {
            await queryRunner.manager.update(Employee, employee.id, {
              managerId: adminEmp.id,
            });
          }
        } else if (roleName.endsWith('_manager')) {
          // Department managers report to GM
          if (gmEmp) {
            await queryRunner.manager.update(Employee, employee.id, {
              managerId: gmEmp.id,
            });
          }
        } else if (roleName.endsWith('_employee')) {
          // Find the manager for this specific department (e.g., finance_manager for finance_employee)
          const deptPrefix = roleName.split('_')[0];
          const deptManagerRole = `${deptPrefix}_manager`;

          const deptManager = allEmployees.find((e) => {
            const eDetail = additionalEmployees.find(
              (ae) => ae.email.toLowerCase() === e.email?.toLowerCase(),
            );
            return (
              eDetail?.roleName === deptManagerRole &&
              e.organizationId === org.id
            );
          });

          if (deptManager) {
            // Reports to Department Manager
            await queryRunner.manager.update(Employee, employee.id, {
              managerId: deptManager.id,
            });
            console.log(
              `Set ${employee.email} to report to ${deptManager.email} (${deptManagerRole})`,
            );
          } else if (gmEmp) {
            // Fallback to GM
            await queryRunner.manager.update(Employee, employee.id, {
              managerId: gmEmp.id,
            });
          }
        } else {
          // General employees report to GM
          if (gmEmp) {
            await queryRunner.manager.update(Employee, employee.id, {
              managerId: gmEmp.id,
            });
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
