import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from 'src/config/typeorm.config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { OrganizationModule } from 'src/modules/organization/organization.module';
import { BranchModule } from 'src/modules/branch/branch.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserRoleModule } from 'src/modules/user_role/user_role.module';

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
    UserRoleModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
