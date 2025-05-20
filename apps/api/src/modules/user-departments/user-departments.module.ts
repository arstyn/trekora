import { Module } from '@nestjs/common';
import { UserDepartmentsController } from './user-departments.controller';
import { UserDepartmentsService } from './user-departments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDepartments } from './entity/user-departments.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDepartments]),
    JwtModule.register({}),
  ],
  controllers: [UserDepartmentsController],
  providers: [UserDepartmentsService],
  exports: [UserDepartmentsService],
})
export class UserDepartmentsModule {}
