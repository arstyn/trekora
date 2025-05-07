import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organization/organization.module';
import { BranchModule } from './branch/branch.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    OrganizationsModule,
    OrganizationsModule,
    BranchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
