import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotificationController } from './user-notification.controller';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationType } from 'src/database/entity/user-notification-type.entity';
import { User } from 'src/database/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification, UserNotificationType, User]),
    JwtModule.register({}),
  ],
  providers: [UserNotificationService],
  controllers: [UserNotificationController],
  exports: [UserNotificationService],
})
export class UserNotificationModule {}

