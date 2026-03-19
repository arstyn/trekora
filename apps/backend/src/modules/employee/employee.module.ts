import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/database/entity/employee.entity';
import { MailerModule } from '../mailer/mailer.module';
import { PermissionModule } from '../permission/permission.module';
import { UserDepartmentsModule } from '../user-departments/user-departments.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { UserModule } from '../user/user.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

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

    PermissionModule,
  ],
  exports: [EmployeeService],
})
export class EmployeeModule {}
