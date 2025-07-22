import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from '../organization/organization.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { RoleModule } from '../role/role.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    OrganizationModule,
    UserInviteModule,
    RoleModule,
    EmployeeModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
