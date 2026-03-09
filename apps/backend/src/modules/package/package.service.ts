import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CancellationTier } from 'src/database/entity/package-related/cancellation-tiers.entity';
import { ChecklistItem } from 'src/database/entity/package-related/checklist-items.entity';
import { DocumentRequirement } from 'src/database/entity/package-related/document-requirements.entity';
import { Exclusion } from 'src/database/entity/package-related/exclusions.entity';
import { Inclusion } from 'src/database/entity/package-related/inclusions.entity';
import { MealsBreakdown } from 'src/database/entity/package-related/meals-breakdowns.entity';
import { PackageLocation } from 'src/database/entity/package-related/package-locations.entity';
import { PaymentMilestone } from 'src/database/entity/package-related/payment-milestones.entity';
import { Transportation } from 'src/database/entity/package-related/transportations.entity';
import { DataSource, Repository } from 'typeorm';
import { CancellationPolicy } from '../../database/entity/package-related/cancellation-policies.entity';
import { Package } from '../../database/entity/package-related/package.entity';
import { ItineraryDay } from 'src/database/entity/package-related/itinerary-days.entity';
import { ITransportation, PackageFormData } from 'src/dto/package.schema';
import {
  FileManager,
  RelatedType,
} from 'src/database/entity/file-manager.entity';
import { FileManagerService } from '../file-manager/file-manager.service';
import { PackageActivity } from 'src/database/entity/package-related/package-activities.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PackageService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(CancellationPolicy)
    private readonly cancellationPolicyRepository: Repository<CancellationPolicy>,
    @InjectRepository(CancellationTier)
    private readonly cancellationTierRepository: Repository<CancellationTier>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(DocumentRequirement)
    private readonly documentRequirementRepository: Repository<DocumentRequirement>,
    @InjectRepository(Exclusion)
    private readonly exclusionRepository: Repository<Exclusion>,
    @InjectRepository(Inclusion)
    private readonly inclusionRepository: Repository<Inclusion>,
    @InjectRepository(MealsBreakdown)
    private readonly mealsBreakdownRepository: Repository<MealsBreakdown>,
    @InjectRepository(PackageLocation)
    private readonly packageLocationRepository: Repository<PackageLocation>,
    @InjectRepository(PaymentMilestone)
    private readonly paymentMilestoneRepository: Repository<PaymentMilestone>,
    @InjectRepository(Transportation)
    private readonly transportationRepository: Repository<Transportation>,
    @InjectRepository(ItineraryDay)
    private readonly itineraryDayRepository: Repository<ItineraryDay>,
    @InjectRepository(PackageActivity)
    private readonly packageActivityRepository: Repository<PackageActivity>,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async create(
    user: { userId: string; organizationId: string },
    createPackageDto: PackageFormData,
    files: Express.Multer.File[],
  ) {
    const {
      cancellationPolicy,
      cancellationStructure,
      documentRequirements,
      inclusions,
      exclusions,
      itinerary,
      preTripChecklist,
      paymentStructure,
      packageLocation,
      transportation,
      mealsBreakdown,
      ...rest
    } = createPackageDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cleanedData = {
        ...rest,
        id: randomUUID(),
        destination: rest.destination === '' ? undefined : rest.destination,
        duration: rest.duration === '' ? undefined : rest.duration,
        description: rest.description === '' ? undefined : rest.description,
        thumbnail: undefined,
        organizationId: user.organizationId,
        createdById: user.userId,
      };

      const pkg = queryRunner.manager.create(Package, cleanedData);

      const pkgFile = files.find((val) => val.fieldname === 'thumbnail');

      if (pkgFile) {
        const fileData = await this.fileManagerService.uploadOneFile(
          { relatedId: pkg.id, relatedType: RelatedType.PACKAGE },
          pkgFile,
        );

        pkg.thumbnail = fileData.id;
      }

      const savedPackage = await queryRunner.manager.save(pkg);

      // Log creation
      const log = this.packageActivityRepository.create({
        packageId: savedPackage.id,
        userId: user.userId,
        action: 'create',
        details: { name: pkg.name },
      });
      await queryRunner.manager.save(log);

      if (cancellationPolicy) {
        const cancellationPolicyData = JSON.parse(
          cancellationPolicy,
        ) as string[];
        for (const policy of cancellationPolicyData) {
          const entity = this.cancellationPolicyRepository.create({
            text: policy,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (cancellationStructure) {
        const cancellationStructureData = JSON.parse(
          cancellationStructure,
        ) as CancellationTier[];
        for (const tier of cancellationStructureData) {
          const entity = this.cancellationTierRepository.create({
            ...tier,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (documentRequirements) {
        const cancellationStructureData = JSON.parse(
          documentRequirements,
        ) as DocumentRequirement[];
        for (const doc of cancellationStructureData) {
          const entity = this.documentRequirementRepository.create({
            ...doc,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (inclusions) {
        const inclusionsData = JSON.parse(inclusions) as string[];
        for (const item of inclusionsData) {
          const entity = this.inclusionRepository.create({
            item,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (exclusions) {
        const exclusionsData = JSON.parse(exclusions) as string[];
        for (const item of exclusionsData) {
          const entity = this.exclusionRepository.create({
            item,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (itinerary) {
        const itineraryData = JSON.parse(itinerary) as ItineraryDay[];
        for (let dayIndex = 0; dayIndex < itineraryData.length; dayIndex++) {
          const day = itineraryData[dayIndex];

          // Filter only files that belong to this day
          const dayImageFiles = files.filter((val) =>
            val.fieldname.startsWith(`itinerary[${dayIndex}].images`),
          );

          if (dayImageFiles.length > 0) {
            const filesData = await this.fileManagerService.upload(
              { relatedId: pkg.id, relatedType: RelatedType.PACKAGE },
              dayImageFiles,
            );

            const images = filesData.map((val) => val.id);
            day.images = images;
          }

          const entity = this.itineraryDayRepository.create({
            ...day,
            packageId: savedPackage.id,
          });

          await queryRunner.manager.save(entity);
        }
      }

      if (preTripChecklist) {
        const preTripChecklistData = JSON.parse(
          preTripChecklist,
        ) as ChecklistItem[];
        for (const item of preTripChecklistData) {
          const entity = this.checklistItemRepository.create({
            ...item,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (paymentStructure) {
        const paymentStructureData = JSON.parse(
          paymentStructure,
        ) as PaymentMilestone[];
        for (const milestone of paymentStructureData) {
          const entity = this.paymentMilestoneRepository.create({
            ...milestone,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (mealsBreakdown) {
        const mealsBreakdownData = JSON.parse(mealsBreakdown) as MealsBreakdown;
        const entity = this.mealsBreakdownRepository.create({
          ...mealsBreakdownData,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(entity);
      }

      if (packageLocation) {
        const packageLocationData = JSON.parse(
          packageLocation,
        ) as PackageLocation;

        const entity = this.packageLocationRepository.create({
          ...packageLocationData,
          packageId: savedPackage.id,
        });
        await queryRunner.manager.save(entity);
      }

      if (transportation) {
        // Transform nested structure to flat structure for database
        const transportationParseData = JSON.parse(
          transportation,
        ) as ITransportation;
        const transportationData = {
          toMode: transportationParseData.toDestination?.mode || undefined,
          toDetails:
            transportationParseData.toDestination?.details || undefined,
          toIncluded: transportationParseData.toDestination?.included || false,
          fromMode: transportationParseData.fromDestination?.mode || undefined,
          fromDetails:
            transportationParseData.fromDestination?.details || undefined,
          fromIncluded:
            transportationParseData.fromDestination?.included || false,
          duringMode: transportationParseData.duringTrip?.mode || undefined,
          duringDetails:
            transportationParseData.duringTrip?.details || undefined,
          duringIncluded: transportationParseData.duringTrip?.included || false,
          packageId: savedPackage.id,
        };
        const entity = this.transportationRepository.create(transportationData);
        await queryRunner.manager.save(entity);
      }

      await queryRunner.commitTransaction();
      return savedPackage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(organizationId: string, status?: string): Promise<Package[]> {
    let query: { organizationId: string; status?: string } = {
      organizationId,
    };
    if (status) {
      query.status = status;
    }
    const res = await this.packageRepository.find({
      where: query,
      select: [
        'id',
        'name',
        'destination',
        'duration',
        'price',
        'description',
        'maxGuests',
        'thumbnail',
        'status',
      ],
    });

    return res;
  }

  async findOne(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id },
      relations: [
        'inclusions',
        'exclusions',
        'paymentStructure',
        'cancellationStructure',
        'cancellationPolicy',
        'mealsBreakdown',
        'transportation',
        'packageLocation',
        'itinerary',
        'documentRequirements',
        'preTripChecklist',
      ],
    });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      // Merge draft content into the package data for the UI
      Object.assign(pkg, pkg.draftContent);
    }

    if (pkg.transportation) {
      this.transformTransportation(pkg);
    }

    return pkg;
  }

  private transformTransportation(pkg: Package) {
    if (pkg.transportation) {
      const transformedTransportation = {
        toDestination: {
          mode: pkg.transportation.toMode,
          details: pkg.transportation.toDetails,
          included: pkg.transportation.toIncluded,
        },
        fromDestination: {
          mode: pkg.transportation.fromMode,
          details: pkg.transportation.fromDetails,
          included: pkg.transportation.fromIncluded,
        },
        duringTrip: {
          mode: pkg.transportation.duringMode,
          details: pkg.transportation.duringDetails,
          included: pkg.transportation.duringIncluded,
        },
      };
      (pkg as any).transportation = transformedTransportation;
    }
  }

  async findBasicInfo(id: string) {
    const pkg = await this.packageRepository.findOne({
      where: { id },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const [inclusions, exclusions, packageLocation] = await Promise.all([
      this.inclusionRepository.find({ where: { packageId: id } }),
      this.exclusionRepository.find({ where: { packageId: id } }),
      this.packageLocationRepository.findOne({ where: { packageId: id } }),
    ]);

    return {
      ...pkg,
      inclusions,
      exclusions,
      packageLocation,
    };
  }

  async findItinerary(id: string) {
    const itinerary = await this.itineraryDayRepository.find({
      where: { packageId: id },
      order: { day: 'ASC' },
    });
    return itinerary;
  }

  async findPaymentsAndCancellation(id: string) {
    const [paymentStructure, cancellationStructure, cancellationPolicy] =
      await Promise.all([
        this.paymentMilestoneRepository.find({ where: { packageId: id } }),
        this.cancellationTierRepository.find({ where: { packageId: id } }),
        this.cancellationPolicyRepository.find({ where: { packageId: id } }),
      ]);

    return {
      paymentStructure,
      cancellationStructure,
      cancellationPolicy,
    };
  }

  async findRequirements(id: string) {
    const [documentRequirements, preTripChecklist] = await Promise.all([
      this.documentRequirementRepository.find({ where: { packageId: id } }),
      this.checklistItemRepository.find({ where: { packageId: id } }),
    ]);

    return {
      documentRequirements,
      preTripChecklist,
    };
  }

  async findLogistics(id: string) {
    const [transportation, mealsBreakdown, packageLocation] = await Promise.all(
      [
        this.transportationRepository.findOne({ where: { packageId: id } }),
        this.mealsBreakdownRepository.findOne({ where: { packageId: id } }),
        this.packageLocationRepository.findOne({ where: { packageId: id } }),
      ],
    );

    let transformedTransportation = transportation;
    if (transportation) {
      const pkg = { transportation } as any;
      this.transformTransportation(pkg);
      transformedTransportation = pkg.transportation;
    }

    return {
      transportation: transformedTransportation,
      mealsBreakdown,
      packageLocation,
    };
  }

  async update(
    id: string,
    updatePackageDto: PackageFormData,
    files: Express.Multer.File[],
    user?: { userId: string; organizationId: string },
  ): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    const isPublishedOrEdited =
      pkg.status === 'published' || pkg.status === 'edited';

    // If it's a published/edited package and we are NOT explicitly publishing,
    // store changes in draftContent
    if (isPublishedOrEdited && updatePackageDto.status !== 'published') {
      const draftData = { ...updatePackageDto };

      // Handle file uploads for draftContent
      const pkgFile = files.find((val) => val.fieldname === 'thumbnail');
      if (pkgFile) {
        const fileData = await this.fileManagerService.uploadOneFile(
          { relatedId: id, relatedType: RelatedType.PACKAGE },
          pkgFile,
        );
        draftData.thumbnail = fileData.id;
      }

      await this.packageRepository.update(id, {
        status: 'edited',
        draftContent: draftData as any,
      } as any);

      if (user) {
        await this.packageActivityRepository.save({
          packageId: id,
          userId: user.userId,
          action: 'edit_draft',
          details: { name: pkg.name },
        });
      }

      return this.findOne(id);
    }

    const {
      cancellationPolicy,
      cancellationStructure,
      documentRequirements,
      inclusions,
      exclusions,
      itinerary,
      preTripChecklist,
      paymentStructure,
      packageLocation,
      transportation,
      mealsBreakdown,
      ...rest
    } = updatePackageDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pkg = await queryRunner.manager.findOne(Package, { where: { id } });

      const pkgFile = files.find((val) => val.fieldname === 'thumbnail');

      if (pkgFile) {
        if (pkg?.thumbnail) {
          await this.fileManagerService.remove(pkg?.thumbnail);
        }

        const fileData = await this.fileManagerService.uploadOneFile(
          { relatedId: id, relatedType: RelatedType.PACKAGE },
          pkgFile,
        );

        rest.thumbnail = fileData.id;
      }

      const cleanedData = {
        ...rest,
        // Convert empty strings to undefined for optional fields
        destination: rest.destination === '' ? undefined : rest.destination,
        duration: rest.duration === '' ? undefined : rest.duration,
        description: rest.description === '' ? undefined : rest.description,
        thumbnail: rest.thumbnail === '' ? undefined : rest.thumbnail,
      };

      // Update main package
      await queryRunner.manager.update(Package, id, {
        ...(cleanedData as any),
        draftContent: undefined, // Clear draft content on full update/publish
      });

      if (user && pkg) {
        let action = 'update';
        const newStatus = (cleanedData as any).status;

        if (newStatus === 'published') {
          action =
            pkg.status === 'published' || pkg.status === 'edited'
              ? 'publish_update'
              : 'publish';
        } else if (newStatus === 'archived') {
          action = 'archive';
        } else if (newStatus === 'draft' && pkg.status === 'published') {
          action = 'unpublish';
        } else if (newStatus === 'published' && pkg.status === 'edited') {
          action = 'discard_changes';
        }

        await queryRunner.manager.save(PackageActivity, {
          packageId: id,
          userId: user.userId,
          action,
          details: {
            name: pkg.name,
            fromStatus: pkg.status,
            toStatus: newStatus,
          },
        });
      }

      // Delete existing related entities to recreate them
      await queryRunner.manager.delete(CancellationPolicy, { packageId: id });
      await queryRunner.manager.delete(CancellationTier, { packageId: id });
      await queryRunner.manager.delete(DocumentRequirement, { packageId: id });
      await queryRunner.manager.delete(Inclusion, { packageId: id });
      await queryRunner.manager.delete(Exclusion, { packageId: id });
      await queryRunner.manager.delete(ItineraryDay, { packageId: id });
      await queryRunner.manager.delete(ChecklistItem, { packageId: id });
      await queryRunner.manager.delete(PaymentMilestone, { packageId: id });
      await queryRunner.manager.delete(MealsBreakdown, { packageId: id });
      await queryRunner.manager.delete(Transportation, { packageId: id });
      await queryRunner.manager.delete(PackageLocation, { packageId: id });

      // Recreate all related entities (same logic as create)
      if (cancellationPolicy) {
        const cancellationPolicyData = JSON.parse(
          cancellationPolicy,
        ) as string[];

        for (const policy of cancellationPolicyData) {
          const entity = this.cancellationPolicyRepository.create({
            text: policy,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (cancellationStructure) {
        const cancellationStructureData = JSON.parse(
          cancellationStructure,
        ) as CancellationTier[];
        for (const tier of cancellationStructureData) {
          const entity = this.cancellationTierRepository.create({
            ...tier,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (documentRequirements) {
        const cancellationStructureData = JSON.parse(
          documentRequirements,
        ) as DocumentRequirement[];
        for (const doc of cancellationStructureData) {
          const entity = this.documentRequirementRepository.create({
            ...doc,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (inclusions) {
        const inclusionsData = JSON.parse(inclusions) as string[];
        for (const item of inclusionsData) {
          const entity = this.inclusionRepository.create({
            item,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (exclusions) {
        const exclusionsData = JSON.parse(exclusions) as string[];
        for (const item of exclusionsData) {
          const entity = this.exclusionRepository.create({
            item,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (itinerary) {
        const itineraryData = JSON.parse(itinerary) as ItineraryDay[];

        for (let dayIndex = 0; dayIndex < itineraryData.length; dayIndex++) {
          const day = itineraryData[dayIndex];

          // Filter only files that belong to this day
          const dayImageFiles = files.filter((val) =>
            val.fieldname.startsWith(`itinerary[${dayIndex}].images`),
          );

          let images: string[] = [];

          // Handle existing images (if any are preserved)
          if (day.images && Array.isArray(day.images)) {
            // Filter out any non-string values and keep only valid image IDs
            images = day.images.filter(
              (img) => typeof img === 'string' && img.trim() !== '',
            );
          }

          // Upload new images if any
          if (dayImageFiles.length > 0) {
            const filesData = await this.fileManagerService.upload(
              { relatedId: id, relatedType: RelatedType.PACKAGE },
              dayImageFiles,
            );

            const newImageIds = filesData.map((val) => val.id);
            images = [...images, ...newImageIds];
          }

          const entity = this.itineraryDayRepository.create({
            ...day,
            images: images.length > 0 ? images : undefined,
            packageId: id,
          });

          await queryRunner.manager.save(entity);
        }
      }

      if (preTripChecklist) {
        const preTripChecklistData = JSON.parse(
          preTripChecklist,
        ) as ChecklistItem[];
        for (const item of preTripChecklistData) {
          const entity = this.checklistItemRepository.create({
            ...item,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (paymentStructure) {
        const paymentStructureData = JSON.parse(
          paymentStructure,
        ) as PaymentMilestone[];

        for (const milestone of paymentStructureData) {
          const entity = this.paymentMilestoneRepository.create({
            ...milestone,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (mealsBreakdown) {
        const mealsBreakdownData = JSON.parse(mealsBreakdown) as MealsBreakdown;
        const entity = this.mealsBreakdownRepository.create({
          ...mealsBreakdownData,
          packageId: id,
        });
        await queryRunner.manager.save(entity);
      }

      if (packageLocation) {
        const packageLocationData = JSON.parse(
          packageLocation,
        ) as PackageLocation;
        const entity = this.packageLocationRepository.create({
          ...packageLocationData,
          packageId: id,
        });
        await queryRunner.manager.save(entity);
      }

      if (transportation) {
        // Transform nested structure to flat structure for database
        const transportationParseData = JSON.parse(
          transportation,
        ) as ITransportation;

        const transportationData = {
          toMode: transportationParseData.toDestination?.mode || undefined,
          toDetails:
            transportationParseData.toDestination?.details || undefined,
          toIncluded: transportationParseData.toDestination?.included || false,
          fromMode: transportationParseData.fromDestination?.mode || undefined,
          fromDetails:
            transportationParseData.fromDestination?.details || undefined,
          fromIncluded:
            transportationParseData.fromDestination?.included || false,
          duringMode: transportationParseData.duringTrip?.mode || undefined,
          duringDetails:
            transportationParseData.duringTrip?.details || undefined,
          duringIncluded: transportationParseData.duringTrip?.included || false,
          packageId: id,
        };

        const entity = this.transportationRepository.create(transportationData);
        await queryRunner.manager.save(entity);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(
    id: string,
    user?: { userId: string; organizationId: string },
  ): Promise<void> {
    const pkg = await this.packageRepository.findOneBy({ id });

    if (pkg?.status !== 'draft') {
      throw new HttpException(
        'Only draft packages can be deleted. Use Archive for published packages.',
        HttpStatus.CONFLICT,
      );
    }

    if (user && pkg) {
      await this.packageActivityRepository.save({
        packageId: id,
        userId: user.userId,
        action: 'delete',
        details: { name: pkg.name },
      });
    }

    await this.packageRepository.delete(id);
  }

  async getPackageChecklist(id: string) {
    return await this.checklistItemRepository.find({
      where: {
        packageId: id,
      },
    });
  }

  async validatePackageForPublishing(id: string) {
    const packageData = await this.findOne(id);
    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    const errors: string[] = [];

    // Check basic required fields
    if (!packageData.name || packageData.name.trim() === '') {
      errors.push('Package name is required');
    }
    if (!packageData.destination || packageData.destination.trim() === '') {
      errors.push('Destination is required');
    }
    if (!packageData.duration || packageData.duration.trim() === '') {
      errors.push('Duration is required');
    }
    if (!packageData.description || packageData.description.trim() === '') {
      errors.push('Description is required');
    }
    if (!packageData.price || packageData.price <= 0) {
      errors.push('Valid price is required');
    }
    if (!packageData.maxGuests || packageData.maxGuests <= 0) {
      errors.push('Valid maximum guests count is required');
    }
    if (!packageData.category) {
      errors.push('Category is required');
    }

    // Check related entities
    const inclusions = await this.inclusionRepository.find({
      where: { packageId: id },
    });
    if (inclusions.length === 0) {
      errors.push('At least one inclusion is required');
    }

    const exclusions = await this.exclusionRepository.find({
      where: { packageId: id },
    });
    if (exclusions.length === 0) {
      errors.push('At least one exclusion is required');
    }

    const itinerary = await this.itineraryDayRepository.find({
      where: { packageId: id },
    });
    if (itinerary.length === 0) {
      errors.push('At least one itinerary day is required');
    }

    const paymentStructure = await this.paymentMilestoneRepository.find({
      where: { packageId: id },
    });

    if (paymentStructure.length === 0) {
      errors.push('Payment structure is required');
    } else {
      const totalAmount = paymentStructure.reduce(
        (sum, milestone) => sum + Number(milestone.amount || 0),
        0,
      );

      const packagePrice = Number(packageData.price);

      if (totalAmount !== packagePrice) {
        errors.push(
          `Payment structure must total exactly the package price. Current total: ${totalAmount}, Package price: ${packagePrice}`,
        );
      }
    }

    const cancellationStructure = await this.cancellationTierRepository.find({
      where: { packageId: id },
    });
    if (cancellationStructure.length === 0) {
      errors.push('Cancellation structure is required');
    }

    const cancellationPolicy = await this.cancellationPolicyRepository.find({
      where: { packageId: id },
    });
    if (cancellationPolicy.length === 0) {
      errors.push('Cancellation policy is required');
    }

    const documentRequirements = await this.documentRequirementRepository.find({
      where: { packageId: id },
    });
    if (documentRequirements.length === 0) {
      errors.push('Document requirements are required');
    }

    const transportation = await this.transportationRepository.findOne({
      where: { packageId: id },
    });
    if (!transportation) {
      errors.push('Transportation details are required');
    }

    const mealsBreakdown = await this.mealsBreakdownRepository.findOne({
      where: { packageId: id },
    });
    if (!mealsBreakdown) {
      errors.push('Meals breakdown is required');
    }

    const packageLocation = await this.packageLocationRepository.findOne({
      where: { packageId: id },
    });
    if (!packageLocation) {
      errors.push('Package location details are required');
    }

    const preTripChecklist = await this.checklistItemRepository.find({
      where: { packageId: id },
    });
    if (preTripChecklist.length === 0) {
      errors.push('Pre-trip checklist is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      packageData,
    };
  }

  async publishPackage(
    id: string,
    user?: { userId: string; organizationId: string },
  ) {
    const validation = await this.validatePackageForPublishing(id);

    if (!validation.isValid) {
      throw new HttpException(
        {
          message: 'Package validation failed',
          errors: validation.errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update package status to published
    const pkg = await this.packageRepository.findOneBy({ id });
    await this.packageRepository.update(id, { status: 'published' });

    if (user && pkg) {
      await this.packageActivityRepository.save({
        packageId: id,
        userId: user.userId,
        action: 'publish',
        details: { name: pkg.name },
      });
    }

    return this.findOne(id);
  }

  async getActivityLogs(id: string): Promise<PackageActivity[]> {
    return this.packageActivityRepository.find({
      where: { packageId: id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
