import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserInviteService } from './user-invite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiRequestJWT } from 'src/interface/api-request-jwt.interface';

@Controller('user-invite')
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) { }

  @Get('verify/:token')
  async verify(@Param('token') token: string) {
    const invite = await this.userInviteService.verifyToken(token);
    if (!invite) {
      throw new HttpException(
        'Invalid or expired invite token',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { valid: true, email: invite.email };
  }

  @Get('details/:token')
  async getDetails(@Param('token') token: string) {
    return this.userInviteService.getInviteDetails(token);
  }

  @Post('accept')
  async accept(@Body() body: { token: string }) {
    return this.userInviteService.acceptInvite(body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept-org')
  async acceptOrg(
    @Body() body: { token: string },
    @Request() req: ApiRequestJWT,
  ) {
    return this.userInviteService.acceptOrgInvite(body.token, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('decline-org')
  async declineOrg(
    @Body() body: { token: string },
    @Request() req: ApiRequestJWT,
  ) {
    return this.userInviteService.declineOrgInvite(body.token, req.user.userId);
  }
}
