import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { UserRoleModule } from '../user_role/user_role.module';

@Module({
  imports: [UserModule, UserRoleModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
