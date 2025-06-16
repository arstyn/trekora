import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [UserModule, JwtModule.register({}), OrganizationModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
