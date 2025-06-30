import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserInvite } from './entity/user-invite.entity';
import { UserInviteController } from './user-invite.controller';
import { UserInviteService } from './user-invite.service';

@Module({
  providers: [UserInviteService],
  controllers: [UserInviteController],
  imports: [TypeOrmModule.forFeature([UserInvite]), UserModule],
  exports: [UserInviteService],
})
export class UserInviteModule {}
