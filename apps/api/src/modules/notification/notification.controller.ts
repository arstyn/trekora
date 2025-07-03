import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard)
@Controller('api/notification')
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
