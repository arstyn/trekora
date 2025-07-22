import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { Reminder } from 'src/database/entity/reminder.entity';

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
