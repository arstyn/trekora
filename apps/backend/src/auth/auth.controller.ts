import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Signup API
  @Post('signup')
  async signup(
    @Body() userData: { email: string; password: string; phone?: string },
  ) {
    return await this.authService.signup(userData);
  }

  // Login API
  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
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
}
