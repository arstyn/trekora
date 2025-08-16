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
    @InjectRepository(FileManager)
    private readonly fileManagerRepository: Repository<FileManager>,
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
        startDate:
          rest.startDate === '' || rest.startDate === undefined
            ? undefined
            : rest.startDate,
        endDate:
          rest.endDate === '' || rest.endDate === undefined
            ? undefined
            : rest.endDate,
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
        'startDate',
        'thumbnail',
        'status',
      ],
    });

    for (const pkg of res) {
      if (pkg.thumbnail) {
        const file = await this.fileManagerRepository.findOne({
          where: { id: pkg.thumbnail },
        });
        (pkg as any).thumbnail = file;
      }
    }

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
      if (pkg.thumbnail) {
        const file = await this.fileManagerRepository.findOne({
          where: {
            id: pkg.thumbnail,
          },
        });
        (pkg as any).thumbnail = file;
      }
      if (pkg.itinerary.length) {
        for (const day of pkg.itinerary) {
          if (day.images.length) {
            for (let i = 0; i < day.images.length; i++) {
              const imageId = day.images[i];
              const file = await this.fileManagerRepository.findOne({
                where: {
                  id: imageId,
                },
              });
              (day as any).images[i] = file;
            }
          }
        }
      }
      (pkg as any).transportation = transformedTransportation;
    }

    return pkg;
  }

  async update(
    id: string,
    updatePackageDto: PackageFormData,
  ): Promise<Package> {
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
      const cleanedData = {
        ...rest,
        // Convert empty strings to undefined for date fields
        startDate:
          rest.startDate === '' || rest.startDate === undefined
            ? undefined
            : rest.startDate,
        endDate:
          rest.endDate === '' || rest.endDate === undefined
            ? undefined
            : rest.endDate,
        // Convert empty strings to undefined for optional fields
        destination: rest.destination === '' ? undefined : rest.destination,
        duration: rest.duration === '' ? undefined : rest.duration,
        description: rest.description === '' ? undefined : rest.description,
        thumbnail:
          rest.thumbnail === ''
            ? undefined
            : rest.thumbnail?.replace('/file-manager/serve/', ''),
      };

      // Update main package
      await queryRunner.manager.update(Package, id, cleanedData);

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

        for (const day of itineraryData) {
          const entity = this.itineraryDayRepository.create({
            ...day,
            images: day.images?.map((image) =>
              image?.replace('/file-manager/serve/', ''),
            ),
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

  async remove(id: string): Promise<void> {
    const pkg = await this.packageRepository.findOneBy({ id });

    if (pkg?.status !== 'draft') {
      throw new HttpException(
        'Packages in draft can only be deleted',
        HttpStatus.CONFLICT,
      );
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
}
