import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from 'src/database/entity/approval-request.entity';
import { UserOrganization } from 'src/database/entity/user-organization.entity';
import { User } from 'src/database/entity/user.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AgentsModule } from '../agents/agents.module';
import { AuthModule } from '../auth/auth.module';
import { BatchesModule } from '../batches/batches.module';
import { BookingModule } from '../booking/booking.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { PermissionModule } from '../permission/permission.module';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovalRequest, UserOrganization, User]),
    JwtModule.register({}),
    ActivityLogModule,
    NotificationModule,
    PermissionModule,
    AuthModule,
    forwardRef(() => BookingModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => AgentsModule),
    forwardRef(() => BatchesModule),
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
