import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { Role } from 'src/database/entity/role.entity';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { User } from 'src/database/entity/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { EmployeeModule } from '../employee/employee.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '../mailer/mailer.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { PermissionModule } from '../permission/permission.module';
import { RolesGuard } from './guard/roles.guard';
import { PermissionGuard } from './guard/permission.guard';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    OrganizationModule,
    UserInviteModule,
    EmployeeModule,
    MailerModule,
    forwardRef(() => PermissionModule),
    TypeOrmModule.forFeature([UserInvite, Employee, Organization, Role, User]),
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    AuthGuard,
    RolesGuard,
    PermissionGuard,
  ],
  controllers: [AuthController],
  exports: [AuthGuard, RolesGuard, PermissionGuard],
})
export class AuthModule { }
