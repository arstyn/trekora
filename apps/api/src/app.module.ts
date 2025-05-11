import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { BranchModule } from './modules/branch/branch.module';
import { SeedModule } from './seed/seed.module';
import { UserRoleModule } from './modules/user_role/user_role.module';
import { RoleModule } from './modules/role/role.module';
import { FeatureModule } from './modules/feature/feature.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    OrganizationModule,
    BranchModule,
    SeedModule,
    RoleModule,
    UserRoleModule,
    FeatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
