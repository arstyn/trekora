import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSalaryStructure } from 'src/database/entity/employee-salary-structure.entity';
import { EmployeeSalary } from 'src/database/entity/employee-salary.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AuthModule } from '../auth/auth.module';
import { LeaveModule } from '../leave/leave.module';
import { MailerModule } from '../mailer/mailer.module';
import { PermissionModule } from '../permission/permission.module';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeSalary,
      EmployeeSalaryStructure,
      Employee,
      Organization,
    ]),
    JwtModule.register({}),
    AuthModule,
    PermissionModule,
    LeaveModule,
    MailerModule,
    ActivityLogModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}

