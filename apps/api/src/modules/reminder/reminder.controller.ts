import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { Reminder } from './entity/reminder.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

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
