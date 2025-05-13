import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entity/employee.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [TypeOrmModule.forFeature([Employee]), JwtModule.register({})],
})
export class EmployeeModule {}
