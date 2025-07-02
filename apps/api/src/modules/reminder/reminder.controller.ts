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
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';
import { Reminder } from 'src/database/entity/reminder.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ReminderService } from './reminder.service';

@UseGuards(AuthGuard)
@Controller('api/reminder')
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
