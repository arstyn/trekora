import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ILoginDto } from 'src/dto/auth.types';
import { SignupFormDTO } from 'src/dto/signup.schema';
import { AuthService } from './auth.service';
import { AuthGuard as JwtAuthGuard } from './guard/auth.guard';
import { CompleteOnboardingDto } from 'src/dto/complete-onboarding.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return await this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return await this.authService.verifyOtp(body.email, body.otp);
  }

  // Signup API
  @Post('signup')
  async signup(@Body() userData: SignupFormDTO) {
    return await this.authService.signup(userData);
  }

  // Login API
  @Post('login')
  async login(@Body() credentials: ILoginDto) {
    const { email, otp } = credentials;
    return await this.authService.login(email, otp);
  }

  @Post('login/send-otp')
  async loginSendOtp(@Body('email') email: string) {
    return await this.authService.loginSendOtp(email);
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



  @UseGuards(JwtAuthGuard)
  @Get('user-organizations')
  async getUserOrganizations(@Req() req: any) {
    return this.authService.getUserOrganizations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-organization')
  async switchOrganization(
    @Req() req: any,
    @Body('organizationId') organizationId: string,
  ) {
    return this.authService.switchOrganization(req.user.userId, organizationId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);
    // Redirect to frontend with token
    // Assuming FRONTEND_URL is set in env, e.g., http://localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/google-callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&userId=${result.userId}&name=${encodeURIComponent(result.name)}&isOnboarded=${result.isOnboarded}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-onboarding')
  async completeOnboarding(
    @Req() req: any,
    @Body() onboardingData: CompleteOnboardingDto,
  ) {
    return await this.authService.completeOnboarding(req.user.userId, onboardingData);
  }
}
