import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { UserNotificationService } from './user-notification.service';
import { UpdateUserNotificationDto } from 'src/dto/update-user-notification.dto';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { UserNotification } from 'src/database/entity/user-notification.entity';

@UseGuards(AuthGuard)
@Controller('api/user-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotiificationService: UserNotificationService,
  ) {}

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<UserNotification[]> {
    return this.userNotiificationService.getByUserId(req.user.userId);
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserNotificationDto,
  ) {
    return this.userNotiificationService.updatePreferences(userId, dto.typeIds);
  }
}
