import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/guard/auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@Req() req: Request) {
    // @ts-ignore
    const userId = req.user.id;
    return this.notificationService.findByUserId(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.notificationService.remove(id);
    return { success: true };
  }
}
