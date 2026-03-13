import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Workflow } from '../../database/entity/workflow/workflow.entity';
import { WorkflowStep } from '../../database/entity/workflow/workflow-step.entity';
import { WorkflowLog } from '../../database/entity/workflow/workflow-log.entity';
import { Booking } from '../../database/entity/booking.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PermissionModule } from '../permission/permission.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowStep, WorkflowLog, Booking]),
    JwtModule.register({}),
    PermissionModule,
    EmployeeModule,
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
