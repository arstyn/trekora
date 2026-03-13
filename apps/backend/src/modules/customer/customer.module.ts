import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { JwtModule } from '@nestjs/jwt';
import { Customer } from 'src/database/entity/customer.entity';
import { FileManager } from 'src/database/entity/file-manager.entity';
import { FileManagerService } from '../file-manager/file-manager.service';
import { PermissionModule } from '../permission/permission.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, FileManager]),
    JwtModule.register({}),
    PermissionModule,
    EmployeeModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, FileManagerService],
})
export class CustomerModule { }
