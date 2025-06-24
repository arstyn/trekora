import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), JwtModule.register({})],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
