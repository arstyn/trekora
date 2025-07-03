import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDepartments } from 'src/database/entity/user-departments.entity';
import { UserDepartmentsController } from './user-departments.controller';
import { UserDepartmentsService } from './user-departments.service';

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
