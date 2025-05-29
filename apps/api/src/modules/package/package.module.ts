import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([Package]),JwtModule.register({}),],
  providers: [PackageService],
  controllers: [PackageController],
  exports : [PackageService]
})
export class PackageModule {}
