import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { NotificationService } from './notification.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@Req() req: ApiRequestJWT) {
    const userId = req.user.userId;

    return await this.notificationService.findByUserId(userId);
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
