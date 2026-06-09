import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { UserModule } from '../user/user.module';
import { UserInviteController } from './user-invite.controller';
import { UserInviteService } from './user-invite.service';

@Module({
  providers: [UserInviteService],
  controllers: [UserInviteController],
  imports: [TypeOrmModule.forFeature([UserInvite, Employee]), UserModule],
  exports: [UserInviteService],
})
export class UserInviteModule {}
