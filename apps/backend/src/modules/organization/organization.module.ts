import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationTierTemplate } from 'src/database/entity/cancellation-tier-template.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { PaymentStructureTemplate } from 'src/database/entity/payment-structure-template.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, PaymentStructureTemplate, CancellationTierTemplate]),
    JwtModule.register({}),
    forwardRef(() => ActivityLogModule),
  ],
  exports: [OrganizationService],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule { }
