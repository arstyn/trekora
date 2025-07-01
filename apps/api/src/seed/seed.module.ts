import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { RoleModule } from 'src/modules/role/role.module';
import { DepartmentModule } from 'src/modules/department/department.module';
import { BranchModule } from 'src/modules/branch/branch.module';
import { EmployeeModule } from 'src/modules/employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AuthModule,
    UserModule,
    OrganizationModule,
    BranchModule,
    RoleModule,
    DepartmentModule,
    EmployeeModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
