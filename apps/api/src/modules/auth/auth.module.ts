import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from '../organization/organization.module';
import { UserInviteModule } from '../user-invite/user-invite.module';
import { RoleModule } from '../role/role.module';
import { EmployeeModule } from '../employee/employee.module';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { Role } from 'src/database/entity/role.entity';
import { User } from 'src/database/entity/user.entity';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    OrganizationModule,
    UserInviteModule,
    RoleModule,
    EmployeeModule,
    TypeOrmModule.forFeature([UserInvite, Employee, Organization, Role, User]), 
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
