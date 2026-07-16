import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CancellationTier } from 'src/database/entity/package-related/cancellation-tiers.entity';
import { DocumentRequirement } from 'src/database/entity/package-related/document-requirements.entity';
import { Exclusion } from 'src/database/entity/package-related/exclusions.entity';
import { Inclusion } from 'src/database/entity/package-related/inclusions.entity';
import { MealsBreakdown } from 'src/database/entity/package-related/meals-breakdowns.entity';
import { PackageLocation } from 'src/database/entity/package-related/package-locations.entity';
import { PaymentMilestone } from 'src/database/entity/package-related/payment-milestones.entity';
import { TransportationOption } from 'src/database/entity/package-related/transportation-options.entity';
import { PackageTier } from 'src/database/entity/package-related/package-tiers.entity';
import { AdditionalCost } from 'src/database/entity/package-related/additional-costs.entity';
import { ChecklistItem } from 'src/database/entity/package-related/checklist-items.entity';
import { DataSource, Repository } from 'typeorm';
import { CancellationPolicy } from '../../database/entity/package-related/cancellation-policies.entity';
import { Package } from '../../database/entity/package-related/package.entity';
import { ItineraryDay } from 'src/database/entity/package-related/itinerary-days.entity';
import { ITransportation, PackageFormData } from 'src/dto/package.schema';
import { UploadService } from '../upload/upload.service';
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
    @InjectRepository(TransportationOption)
    private readonly transportationOptionRepository: Repository<TransportationOption>,
    @InjectRepository(PackageTier)
    private readonly packageTierRepository: Repository<PackageTier>,
    @InjectRepository(AdditionalCost)
    private readonly additionalCostRepository: Repository<AdditionalCost>,
    @InjectRepository(ItineraryDay)
    private readonly itineraryDayRepository: Repository<ItineraryDay>,
    @InjectRepository(PackageActivity)
    private readonly packageActivityRepository: Repository<PackageActivity>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
    private readonly uploadService: UploadService,
  ) { }

  async create(
    user: { userId: string; organizationId: string },
    createPackageDto: PackageFormData,
    files: Express.Multer.File[],
  ) {
    const {
      cancellationPolicy,
      cancellationStructure,
      documentRequirements,
      preTripChecklist,
      inclusions,
      exclusions,
      itinerary,
      paymentStructure,
      packageLocation,
      transportation,
      mealsBreakdown,
      additionalCosts,
      packageTiers,
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
        days: rest.days,
        nights: rest.nights,
        basePrice: rest.basePrice,
        description: rest.description === '' ? undefined : rest.description,
        thumbnail: undefined,
        organizationId: user.organizationId,
        createdById: user.userId,
      };

      const pkg = queryRunner.manager.create(Package, cleanedData);

      const pkgFile = files.find((val) => val.fieldname === 'thumbnail');

      if (pkgFile) {
        pkg.thumbnail = await this.uploadService.uploadSingle(
          pkgFile,
          'package',
        );
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
        const documentRequirementsData = JSON.parse(
          documentRequirements,
        ) as DocumentRequirement[];
        for (const doc of documentRequirementsData) {
          const entity = this.documentRequirementRepository.create({
            ...doc,
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
            day.images = await this.uploadService.uploadMultiple(
              dayImageFiles,
              'package',
            );
          }

          const entity = this.itineraryDayRepository.create({
            ...day,
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
        const transportationParseData = JSON.parse(transportation) as any[];
        for (const option of transportationParseData) {
          const entity = this.transportationOptionRepository.create({
            ...option,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (additionalCosts) {
        const additionalCostsData = JSON.parse(additionalCosts) as any[];
        for (const cost of additionalCostsData) {
          const entity = this.additionalCostRepository.create({
            ...cost,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (packageTiers) {
        const packageTiersData = JSON.parse(packageTiers) as any[];
        for (const tier of packageTiersData) {
          const entity = this.packageTierRepository.create({
            ...tier,
            packageId: savedPackage.id,
          });
          await queryRunner.manager.save(entity);
        }
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
        'days',
        'nights',
        'basePrice',
        'description',
        'maxGuests',
        'thumbnail',
        'status',
      ],
      relations: ['packageTiers', 'transportationOptions', 'paymentStructure', 'packageLocation'],
      order: {
        paymentStructure: {
          order: 'ASC',
        },
      },
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
        'transportationOptions',
        'packageLocation',
        'packageTiers',
        'additionalCosts',
        'itinerary',
        'documentRequirements',
        'preTripChecklist',
      ],
      order: {
        paymentStructure: {
          order: 'ASC',
        },
      },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      // Merge draft content into the package data for the UI
      Object.assign(pkg, pkg.draftContent);
    }
    return pkg;
  }


  async findBasicInfo(id: string) {
    const pkg = await this.packageRepository.findOne({
      where: { id },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      const draft = pkg.draftContent as any;
      Object.assign(pkg, draft);

      const parseIfString = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

      return {
        ...pkg,
        packageLocation: draft.packageLocation ? parseIfString(draft.packageLocation) : null,
      };
    }

    const packageLocation = await this.packageLocationRepository.findOne({ where: { packageId: id } });

    return {
      ...pkg,
      packageLocation,
    };
  }

  async findDetails(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      const draft = pkg.draftContent as any;
      const parseIfString = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

      return {
        inclusions: draft.inclusions ? parseIfString(draft.inclusions) : [],
        exclusions: draft.exclusions ? parseIfString(draft.exclusions) : [],
      };
    }

    const [inclusions, exclusions] = await Promise.all([
      this.inclusionRepository.find({ where: { packageId: id } }),
      this.exclusionRepository.find({ where: { packageId: id } }),
    ]);

    return {
      inclusions,
      exclusions,
    };
  }

  async findItinerary(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent && (pkg.draftContent as any).itinerary) {
      const itinerary = (pkg.draftContent as any).itinerary;
      return typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    }

    const itinerary = await this.itineraryDayRepository.find({
      where: { packageId: id },
      order: { day: 'ASC' },
    });
    return itinerary;
  }

  async findPaymentsAndCancellation(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      const draft = pkg.draftContent as any;
      const parseIfString = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

      return {
        paymentStructure: draft.paymentStructure ? parseIfString(draft.paymentStructure) : [],
        cancellationStructure: draft.cancellationStructure ? parseIfString(draft.cancellationStructure) : [],
        cancellationPolicy: draft.cancellationPolicy ? parseIfString(draft.cancellationPolicy) : [],
        packageTiers: draft.packageTiers ? parseIfString(draft.packageTiers) : [],
        additionalCosts: draft.additionalCosts ? parseIfString(draft.additionalCosts) : [],
      };
    }

    const [paymentStructure, cancellationStructure, cancellationPolicy, packageTiers, additionalCosts] =
      await Promise.all([
        this.paymentMilestoneRepository.find({ where: { packageId: id } }),
        this.cancellationTierRepository.find({ where: { packageId: id } }),
        this.cancellationPolicyRepository.find({ where: { packageId: id } }),
        this.packageTierRepository.find({ where: { packageId: id } }),
        this.additionalCostRepository.find({ where: { packageId: id } }),
      ]);

    return {
      paymentStructure,
      cancellationStructure,
      cancellationPolicy,
      packageTiers,
      additionalCosts,
    };
  }

  async findRequirements(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      const draft = pkg.draftContent as any;
      const parseIfString = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

      return {
        documentRequirements: draft.documentRequirements ? parseIfString(draft.documentRequirements) : [],
        preTripChecklist: draft.preTripChecklist ? parseIfString(draft.preTripChecklist) : [],
      };
    }

    const [documentRequirements, preTripChecklist] = await Promise.all([
      this.documentRequirementRepository.find({
        where: { packageId: id },
      }),
      this.checklistItemRepository.find({
        where: { packageId: id },
      }),
    ]);

    return {
      documentRequirements,
      preTripChecklist,
    };
  }

  async findLogistics(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    if (pkg.status === 'edited' && pkg.draftContent) {
      const draft = pkg.draftContent as any;
      const parseIfString = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

      let transportation = draft.transportationOptions ? parseIfString(draft.transportationOptions) : null;

      return {
        transportation: transportation,
        mealsBreakdown: draft.mealsBreakdown ? parseIfString(draft.mealsBreakdown) : null,
        packageLocation: draft.packageLocation ? parseIfString(draft.packageLocation) : null,
      };
    }

    const [transportationOptions, mealsBreakdown, packageLocation, packageTiers, additionalCosts] = await Promise.all(
      [
        this.transportationOptionRepository.find({ where: { packageId: id } }),
        this.mealsBreakdownRepository.findOne({ where: { packageId: id } }),
        this.packageLocationRepository.findOne({ where: { packageId: id } }),
        this.packageTierRepository.find({ where: { packageId: id } }),
        this.additionalCostRepository.find({ where: { packageId: id } }),
      ],
    );

    return {
      transportation: transportationOptions,
      mealsBreakdown,
      packageLocation,
      packageTiers,
      additionalCosts,
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
        draftData.thumbnail = await this.uploadService.uploadSingle(
          pkgFile,
          'package',
        );
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
      preTripChecklist,
      inclusions,
      exclusions,
      itinerary,
      paymentStructure,
      packageLocation,
      transportation,
      mealsBreakdown,
      additionalCosts,
      packageTiers,
      ...rest
    } = updatePackageDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pkg = await queryRunner.manager.findOne(Package, { where: { id } });

      const pkgFile = files.find((val) => val.fieldname === 'thumbnail');

      if (pkgFile) {
        rest.thumbnail = await this.uploadService.uploadSingle(
          pkgFile,
          'package',
        );
      }

      const cleanedData = {
        ...rest,
        // Convert empty strings to undefined for optional fields
        destination: rest.destination === '' ? undefined : rest.destination,
        days: rest.days,
        nights: rest.nights,
        basePrice: rest.basePrice,
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

      // Recreate all related entities (same logic as create)

      if (cancellationPolicy !== undefined) {
        await queryRunner.manager.delete(CancellationPolicy, { packageId: id });
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

      if (cancellationStructure !== undefined) {
        await queryRunner.manager.delete(CancellationTier, { packageId: id });
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

      if (documentRequirements !== undefined) {
        await queryRunner.manager.delete(DocumentRequirement, { packageId: id });
        const documentRequirementsData = JSON.parse(
          documentRequirements,
        ) as DocumentRequirement[];
        for (const doc of documentRequirementsData) {
          const entity = this.documentRequirementRepository.create({
            ...doc,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (preTripChecklist !== undefined) {
        await queryRunner.manager.delete(ChecklistItem, { packageId: id });
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

      if (inclusions !== undefined) {
        await queryRunner.manager.delete(Inclusion, { packageId: id });
        const inclusionsData = JSON.parse(inclusions) as string[];
        for (const item of inclusionsData) {
          const entity = this.inclusionRepository.create({
            item,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (exclusions !== undefined) {
        await queryRunner.manager.delete(Exclusion, { packageId: id });
        const exclusionsData = JSON.parse(exclusions) as string[];
        for (const item of exclusionsData) {
          const entity = this.exclusionRepository.create({
            item,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (itinerary !== undefined) {
        await queryRunner.manager.delete(ItineraryDay, { packageId: id });
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
            const newImageUrls = await this.uploadService.uploadMultiple(
              dayImageFiles,
              'package',
            );

            images = [...images, ...newImageUrls];
          }

          const entity = this.itineraryDayRepository.create({
            ...day,
            images: images.length > 0 ? images : undefined,
            packageId: id,
          });

          await queryRunner.manager.save(entity);
        }
      }

      if (paymentStructure !== undefined) {
        const paymentStructureData = JSON.parse(
          paymentStructure,
        ) as PaymentMilestone[];

        const existingMilestones = await queryRunner.manager.find(PaymentMilestone, { where: { packageId: id } });
        const existingMilestonesMap = new Map(existingMilestones.map(m => [m.id, m]));
        const incomingIds = new Set<string>();

        for (const milestoneData of paymentStructureData) {
          if (milestoneData.id && existingMilestonesMap.has(milestoneData.id)) {
            const existing = existingMilestonesMap.get(milestoneData.id)!;
            const updated = queryRunner.manager.merge(PaymentMilestone, existing, milestoneData);
            await queryRunner.manager.save(PaymentMilestone, updated);
            incomingIds.add(milestoneData.id);
          } else {
            const { id: _, ...cleanedMilestone } = milestoneData;
            const entity = this.paymentMilestoneRepository.create({
              ...cleanedMilestone,
              packageId: id,
            });
            const saved = await queryRunner.manager.save(PaymentMilestone, entity);
            incomingIds.add(saved.id);
          }
        }

        for (const existing of existingMilestones) {
          if (!incomingIds.has(existing.id)) {
            const count = await queryRunner.manager.count('Booking', { where: { paymentStructureId: existing.id } });
            if (count > 0) {
              throw new BadRequestException(`Cannot delete payment milestone '${existing.name}' because it is already referenced by active bookings.`);
            }
            await queryRunner.manager.delete(PaymentMilestone, { id: existing.id });
          }
        }
      }

      if (mealsBreakdown !== undefined) {
        await queryRunner.manager.delete(MealsBreakdown, { packageId: id });
        const mealsBreakdownData = JSON.parse(mealsBreakdown) as MealsBreakdown;
        const entity = this.mealsBreakdownRepository.create({
          ...mealsBreakdownData,
          packageId: id,
        });
        await queryRunner.manager.save(entity);
      }

      if (packageLocation !== undefined) {
        await queryRunner.manager.delete(PackageLocation, { packageId: id });
        const packageLocationData = JSON.parse(
          packageLocation,
        ) as PackageLocation;
        const entity = this.packageLocationRepository.create({
          ...packageLocationData,
          packageId: id,
        });
        await queryRunner.manager.save(entity);
      }

      if (transportation !== undefined) {
        await queryRunner.manager.delete(TransportationOption, { packageId: id });
        const transportationParseData = JSON.parse(transportation) as any[];
        for (const option of transportationParseData) {
          const entity = this.transportationOptionRepository.create({
            ...option,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (additionalCosts !== undefined) {
        await queryRunner.manager.delete(AdditionalCost, { packageId: id });
        const additionalCostsData = JSON.parse(additionalCosts) as any[];
        for (const cost of additionalCostsData) {
          const entity = this.additionalCostRepository.create({
            ...cost,
            packageId: id,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (packageTiers !== undefined) {
        const packageTiersData = JSON.parse(packageTiers) as any[];

        const existingTiers = await queryRunner.manager.find(PackageTier, { where: { packageId: id } });
        const existingTiersMap = new Map(existingTiers.map(t => [t.id, t]));
        const incomingIds = new Set<string>();

        for (const tierData of packageTiersData) {
          if (tierData.id && existingTiersMap.has(tierData.id)) {
            const existing = existingTiersMap.get(tierData.id)!;
            const updated = queryRunner.manager.merge(PackageTier, existing, tierData);
            await queryRunner.manager.save(PackageTier, updated);
            incomingIds.add(tierData.id);
          } else {
            const { id: _, ...cleanedTier } = tierData;
            const entity = this.packageTierRepository.create({
              ...cleanedTier,
              packageId: id,
            });
            const saved = await queryRunner.manager.save(PackageTier, entity) as unknown as PackageTier;
            incomingIds.add(saved.id);
          }
        }

        for (const existing of existingTiers) {
          if (!incomingIds.has(existing.id)) {
            const count = await queryRunner.manager.count('Booking', { where: { packageTierId: existing.id } });
            if (count > 0) {
              throw new BadRequestException(`Cannot delete package tier '${existing.name}' because it is already referenced by active bookings.`);
            }
            await queryRunner.manager.delete(PackageTier, { id: existing.id });
          }
        }
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
    if (!packageData.days || packageData.days <= 0) {
      errors.push('Days count is required');
    }
    if (!packageData.nights || packageData.nights < 0) {
      errors.push('Nights count is required');
    }
    if (!packageData.description || packageData.description.trim() === '') {
      errors.push('Description is required');
    }
    // Price could be calculated now, so we don't strictly validate packageData.price here
    // Wait, it is basePrice now. Let's validate basePrice if needed or rely on packageTiers.
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
      order: { order: 'ASC' },
    });

    if (paymentStructure.length === 0) {
      errors.push('Payment structure is required');
    } else {
      const totalAmount = paymentStructure.reduce(
        (sum, milestone) => sum + Number(milestone.amount || 0),
        0,
      );

      const firstTierAdultCost = packageData.packageTiers?.[0]?.adultCost;
      
      if (firstTierAdultCost !== undefined && totalAmount !== firstTierAdultCost) {
        errors.push(
          `Payment structure must total exactly the first tier adult cost. Current total: ${totalAmount}, Target: ${firstTierAdultCost}`,
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

    const transportation = await this.transportationOptionRepository.find({
      where: { packageId: id },
    });
    if (transportation.length === 0) {
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
