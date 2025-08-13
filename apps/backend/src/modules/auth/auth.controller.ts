import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILoginDto } from 'src/dto/auth.types';
import { SignupFormDTO } from 'src/dto/signup.schema';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Signup API
  @Post('signup')
  async signup(@Body() userData: SignupFormDTO) {
    return await this.authService.signup(userData);
  }

  // Login API
  @Post('login')
  async login(@Body() credentials: ILoginDto) {
    const { email, password } = credentials;
    return await this.authService.login(email, password);
  }

  // Logout API
  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  // Refresh Access Token API
  @Post('refresh-token')
  async refreshAccessToken(@Body() body: { refreshToken: string }) {
    return await this.authService.refreshAccessToken(body.refreshToken);
  }

  @Post('activate-account/:id')
  async activateAccount(@Param('id') id: string) {
    return this.authService.activateAccount(id);
  }

  @Post('activate-user/:id')
  async activateUser(@Param('id') id: string) {
    return this.authService.activateUser(id);
  }

  @Post('resend-activation')
  async resendActivation(@Body('email') email: string) {
    return this.authService.resendActivation(email);
  }

  @Patch('update-password')
  async updatePassword(
    @Body()
    body: {
      email: string;
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return await this.authService.updatePassword(
      body.email,
      body.currentPassword,
      body.newPassword,
    );
  }
}
