import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/database/entity/organization.entity';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), JwtModule.register({})],
  exports: [OrganizationService],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
