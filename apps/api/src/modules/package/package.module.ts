import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from '../../database/entity/package.entity';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  providers: [PackageService],
  controllers: [PackageController],
})
export class PackageModule {}
