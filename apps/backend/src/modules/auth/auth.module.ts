import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/modules/user/user.module';
import { EmployeeModule } from '../employee/employee.module';
import { MailerModule } from '../mailer/mailer.module';
import { OrganizationModule } from '../organization/organization.module';
import { PermissionModule } from '../permission/permission.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
import { PermissionGuard } from './guard/permission.guard';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    OrganizationModule,
    UserInviteModule,
    EmployeeModule,
    MailerModule,
    forwardRef(() => PermissionModule),
  ],
  providers: [AuthService, GoogleStrategy, AuthGuard, PermissionGuard],
  controllers: [AuthController],
  exports: [AuthGuard, PermissionGuard],
})
export class AuthModule {}
