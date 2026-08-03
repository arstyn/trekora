import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { BatchBlocksModule } from './modules/batch-blocks/batch-blocks.module';
import { BatchesModule } from './modules/batches/batches.module';
import { BookingModule } from './modules/booking/booking.module';
import { BranchModule } from './modules/branch/branch.module';
import { CancellationTiersModule } from './modules/cancellation-tiers/cancellation-tiers.module';
import { CustomerModule } from './modules/customer/customer.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { GroupModule } from './modules/group/group.module';
import { ImportModule } from './modules/import/import.module';
import { LeadUpdatesModule } from './modules/lead-updates/lead-updates.module';
import { LeadModule } from './modules/lead/lead.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { MealsModule } from './modules/meals/meals.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PackageModule } from './modules/package/package.module';
import { PaymentStructuresModule } from './modules/payment-structures/payment-structures.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserDepartmentsModule } from './modules/user-departments/user-departments.module';
import { UserInviteModule } from './modules/user-invite/user-invite.module';
import { UserNotificationModule } from './modules/user-notification/user-notification.module';
import { UserModule } from './modules/user/user.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { SettingsModule } from './modules/settings/settings.module';

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
    SettingsModule,
    DashboardModule,
    WorkflowModule,
    ActivityLogModule,
    MealsModule,
    PaymentStructuresModule,
    CancellationTiersModule,
    BatchBlocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
