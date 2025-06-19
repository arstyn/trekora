import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './entity/reminder.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder]), JwtModule.register({})],
  controllers: [ReminderController],
  providers: [ReminderService],
})
export class ReminderModule {}
