import {
  Get,
  Body,
  Patch,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { UserNotificationService } from './user-notification.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('api/user-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<Record<string, boolean>> {
    return this.userNotificationService.getByUserId(req.user.userId);
  }

  @Patch()
  update(
    @Request() req: ApiRequestJWT,
    @Body() preferences: Record<string, boolean>,
  ) {
    return this.userNotificationService.updatePreferences(
      req.user.userId,
      preferences,
    );
  }
}
