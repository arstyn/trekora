import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entity/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  exports: [OrganizationService],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationsModule {}
