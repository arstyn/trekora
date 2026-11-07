import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeLeave } from 'src/database/entity/employee-leave.entity';
import { EmployeeSalaryStructure } from 'src/database/entity/employee-salary-structure.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AuthModule } from '../auth/auth.module';
import { PermissionModule } from '../permission/permission.module';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeLeave,
      Employee,
      Organization,
      EmployeeSalaryStructure,
    ]),
    JwtModule.register({}),
    AuthModule,
    PermissionModule,
    ActivityLogModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}

