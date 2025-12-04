import { Module } from '@nestjs/common';
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
import { RoleModule } from '../role/role.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '../mailer/mailer.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    OrganizationModule,
    UserInviteModule,
    RoleModule,
    EmployeeModule,
    MailerModule,
    TypeOrmModule.forFeature([UserInvite, Employee, Organization, Role, User]),
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
