import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard as JwtAuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { SettingsService } from './settings.service';
import { ClearDataDto } from './dto/data-clear.dto';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('send-clear-otp')
  @RequirePermission('settings', 'clear-data')
  async sendClearOtp(@Request() req: ApiRequestJWT) {
    const currentUserId = req.user.userId;
    return await this.settingsService.sendClearDataOtp(currentUserId);
  }

  @Post('clear-data')
  @RequirePermission('settings', 'clear-data')
  async clearData(
    @Request() req: ApiRequestJWT,
    @Body() dto: ClearDataDto,
  ) {
    const organizationId = req.user.organizationId;
    const currentUserId = req.user.userId;
    return await this.settingsService.clearOrganizationData(
      organizationId,
      currentUserId,
      dto,
    );
  }
}
