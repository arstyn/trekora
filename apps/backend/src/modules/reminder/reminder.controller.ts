import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Reminder } from 'src/database/entity/reminder.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ReminderService } from './reminder.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Body() data: Partial<Reminder>, @Req() req: ApiRequestJWT) {
    return this.reminderService.create(data, req.user);
  }

  @Get()
  findAll() {
    return this.reminderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reminderService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Reminder>) {
    return this.reminderService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reminderService.remove(id);
  }
}
