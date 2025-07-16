import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { LeadUpdatesModule } from './modules/lead-updates/lead-updates.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RoleModule } from './modules/role/role.module';
import { UserDepartmentsModule } from './modules/user-departments/user-departments.module';
import { UserModule } from './modules/user/user.module';
import { LeadModule } from './modules/lead/lead.module';
import { UserInviteModule } from './modules/user-invite/user-invite.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { GroupModule } from './modules/group/group.module';
import { ImportModule } from './modules/import/import.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(
        process.cwd(),
        '.env'
      ),
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    // TypeOrmModule.forRootAsync({
    //   useFactory: async () => ({
    //     ...dataSource.options,
    //     autoLoadEntities: true,
    //   }),
    // }),
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
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
