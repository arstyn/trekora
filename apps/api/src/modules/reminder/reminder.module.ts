import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { Reminder } from './entity/reminder.entity';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
    JwtModule.register({}),
    NotificationModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
