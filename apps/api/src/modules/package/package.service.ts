import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageFormData } from '@repo/validation';
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
  ) {}

  async create(
    user: { userId: string; organizationId: string },
    createPackageDto: PackageFormData,
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
    } = createPackageDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pkg = queryRunner.manager.create(Package, {
        ...rest,
        organizationId: user.organizationId,
        createdById: user.userId,
      });
      const savedPackage = await queryRunner.manager.save(pkg);

      if (cancellationPolicy) {
        for (const policy of cancellationPolicy) {
          const entity = this.cancellationPolicyRepository.create({
            policy,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (cancellationStructure) {
        for (const tier of cancellationStructure) {
          const entity = this.cancellationTierRepository.create({
            ...tier,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (documentRequirements) {
        for (const doc of documentRequirements) {
          const entity = this.documentRequirementRepository.create({
            ...doc,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (inclusions) {
        for (const item of inclusions) {
          const entity = this.inclusionRepository.create({
            item,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (exclusions) {
        for (const item of exclusions) {
          const entity = this.exclusionRepository.create({
            item,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (itinerary) {
        for (const day of itinerary) {
          const entity = this.itineraryDayRepository.create({
            ...day,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (preTripChecklist) {
        for (const item of preTripChecklist) {
          const entity = this.checklistItemRepository.create({
            ...item,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (paymentStructure) {
        for (const milestone of paymentStructure) {
          const entity = this.paymentMilestoneRepository.create({
            ...milestone,
            packageId: savedPackage.id,
            package: savedPackage,
          });
          await queryRunner.manager.save(entity);
        }
      }

      if (mealsBreakdown) {
        const entity = this.mealsBreakdownRepository.create({
          ...mealsBreakdown,
          packageId: savedPackage.id,
          package: savedPackage,
        });
        await queryRunner.manager.save(entity);
      }

      if (packageLocation) {
        const entity = this.packageLocationRepository.create({
          ...packageLocation,
          packageId: savedPackage.id,
          package: savedPackage,
        });
        await queryRunner.manager.save(entity);
      }

      if (transportation) {
        const entity = this.transportationRepository.create({
          toDestination: transportation.toDestination ?? null,
          fromDestination: transportation.fromDestination ?? null,
          duringTrip: transportation.duringTrip ?? null,
          packageId: savedPackage.id,
          package: savedPackage,
        });
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

  async findAll(organizationId: string): Promise<Package[]> {
    return this.packageRepository.find({
      where: {
        organizationId,
      },
    });
  }

  async findOne(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Package not found');
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

    await this.packageRepository.update(id, rest);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.packageRepository.delete(id);
  }
}
