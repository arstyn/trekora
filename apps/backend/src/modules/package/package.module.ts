import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageActivity } from 'src/database/entity/package-related/package-activities.entity';
import { CancellationPolicy } from '../../database/entity/package-related/cancellation-policies.entity';
import { CancellationTier } from '../../database/entity/package-related/cancellation-tiers.entity';
import { ChecklistItem } from '../../database/entity/package-related/checklist-items.entity';
import { DocumentRequirement } from '../../database/entity/package-related/document-requirements.entity';
import { Exclusion } from '../../database/entity/package-related/exclusions.entity';
import { Inclusion } from '../../database/entity/package-related/inclusions.entity';
import { ItineraryDay } from '../../database/entity/package-related/itinerary-days.entity';
import { MealsBreakdown } from '../../database/entity/package-related/meals-breakdowns.entity';
import { PackageLocation } from '../../database/entity/package-related/package-locations.entity';
import { Package } from '../../database/entity/package-related/package.entity';
import { PaymentMilestone } from '../../database/entity/package-related/payment-milestones.entity';
import { Transportation } from '../../database/entity/package-related/transportations.entity';
import { PermissionModule } from '../permission/permission.module';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      CancellationPolicy,
      CancellationTier,
      DocumentRequirement,
      Exclusion,
      Inclusion,
      MealsBreakdown,
      PackageLocation,
      PaymentMilestone,
      Transportation,
      ItineraryDay,

      PackageActivity,
      ChecklistItem,
    ]),

    JwtModule.register({}),
    PermissionModule,
  ],
  providers: [PackageService],
  controllers: [PackageController],
})
export class PackageModule {}
