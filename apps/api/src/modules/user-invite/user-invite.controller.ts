import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserInviteService } from './user-invite.service';

@Controller('api/user-invite')
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) {}

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

  @Post('accept')
  async accept(@Body() body: { token: string; password: string }) {
    return this.userInviteService.acceptInvite(body.token, body.password);
  }
}
