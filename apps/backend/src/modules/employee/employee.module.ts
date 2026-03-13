import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDepartmentsModule } from '../user-departments/user-departments.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { UserModule } from '../user/user.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { MailerModule } from '../mailer/mailer.module';
import { Employee } from 'src/database/entity/employee.entity';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [
    TypeOrmModule.forFeature([Employee]),
    JwtModule.register({}),
    UserDepartmentsModule,
    UserModule,
    UserInviteModule,
    MailerModule,
    FileManagerModule,
    PermissionModule,
  ],
  exports: [EmployeeService],
})
export class EmployeeModule { }
