import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/database/entity/permission.entity';
import { PermissionSet } from 'src/database/entity/permission-set.entity';
import { PermissionSetPermission } from 'src/database/entity/permission-set-permission.entity';
import { UserPermissionSet } from 'src/database/entity/user-permission-set.entity';
import { User } from 'src/database/entity/user.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { PermissionService } from './permission.service';
import { PermissionSetService } from './permission-set.service';
import { PermissionCheckService } from './permission-check.service';
import { PermissionController } from './permission.controller';
import { PermissionSetController } from './permission-set.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      PermissionSet,
      PermissionSetPermission,
      UserPermissionSet,
      User,
      Employee,
    ]),
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  providers: [PermissionService, PermissionSetService, PermissionCheckService],
  controllers: [PermissionController, PermissionSetController],
  exports: [PermissionService, PermissionSetService, PermissionCheckService],
})
export class PermissionModule {}
