import { Module } from '@nestjs/common';
import { UserRoleService } from './user_role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entity/user_role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  exports: [UserRoleService],
  providers: [UserRoleService],
})
export class UserRoleModule {}
