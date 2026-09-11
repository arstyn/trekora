import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/database/entity/agent.entity';
import { Booking } from 'src/database/entity/booking.entity';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { PermissionModule } from '../permission/permission.module';
import { ApprovalModule } from '../approval/approval.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, Booking]),
    JwtModule.register({}),
    PermissionModule,
    forwardRef(() => ApprovalModule),
    ActivityLogModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
