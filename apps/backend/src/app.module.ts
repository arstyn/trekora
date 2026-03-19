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
import { EmployeeModule } from './modules/employee/employee.module';
import { UploadModule } from './modules/upload/upload.module';
import { GroupModule } from './modules/group/group.module';
import { LeadUpdatesModule } from './modules/lead-updates/lead-updates.module';
import { LeadModule } from './modules/lead/lead.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PackageModule } from './modules/package/package.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { UserDepartmentsModule } from './modules/user-departments/user-departments.module';
import { UserInviteModule } from './modules/user-invite/user-invite.module';
import { UserModule } from './modules/user/user.module';
import { UserNotificationModule } from './modules/user-notification/user-notification.module';
import { BatchesModule } from './modules/batches/batches.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ImportModule } from './modules/import/import.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PermissionModule } from './modules/permission/permission.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

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
    PermissionModule,
    AuthModule,
    OrganizationModule,
    EmployeeModule,
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
    UploadModule,
    UserNotificationModule,
    BatchesModule,
    BookingModule,
    PaymentModule,
    ImportModule,
    DashboardModule,
    WorkflowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
