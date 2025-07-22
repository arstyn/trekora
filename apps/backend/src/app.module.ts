import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { CustomerModule } from './modules/customer/customer.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { FileManagerModule } from './modules/file-manager/file-manager.module';
import { GroupModule } from './modules/group/group.module';
import { LeadUpdatesModule } from './modules/lead-updates/lead-updates.module';
import { LeadModule } from './modules/lead/lead.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PackageModule } from './modules/package/package.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { RoleModule } from './modules/role/role.module';
import { UserDepartmentsModule } from './modules/user-departments/user-departments.module';
import { UserInviteModule } from './modules/user-invite/user-invite.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(process.cwd(), '.env'),
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    OrganizationModule,
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
    UserInviteModule,
    MailerModule,
    GroupModule,
    PackageModule,
    FileManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
