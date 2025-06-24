import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { SeedModule } from './seed/seed.module';
import { RoleModule } from './modules/role/role.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { DepartmentModule } from './modules/department/department.module';
import { UserDepartmentsModule } from './modules/user-departments/user-departments.module';
import { LeadModule } from './modules/lead/lead.module';
import { BranchModule } from './modules/branch/branch.module';
import { LeadUpdatesModule } from './modules/lead-updates/lead-updates.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    OrganizationModule,
    SeedModule,
    RoleModule,
    EmployeeModule,
    DepartmentModule,
    UserDepartmentsModule,
    LeadModule,
    BranchModule,
    LeadUpdatesModule,
    CustomerModule,
    ReminderModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
