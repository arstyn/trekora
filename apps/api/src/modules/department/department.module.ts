import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entity/department.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  imports: [TypeOrmModule.forFeature([Department]), JwtModule.register({})],
  exports: [DepartmentService],
})
export class DepartmentModule {}
