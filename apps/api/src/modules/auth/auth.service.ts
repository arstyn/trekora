import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ILoginResponse } from '@repo/api/auth/dto/auth.types';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private generateAccessToken(userId: string, organizationId: string): string {
    return jwt.sign(
      { userId, organizationId },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: '15m', // Access token expires in 15 minutes
      },
    );
  }

  private generateRefreshToken(userId: string, organizationId: string): string {
    return jwt.sign(
      { userId, organizationId },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: '7d', // Refresh token expires in 7 days
      },
    );
  }

  // Refresh Access Token functionality
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret',
      }) as { userId: string };

      const user = await this.userService.findOne(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(
        user.id,
        user.organizationId,
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      console.log('🚀 ~ auth.service.ts:43 ~ AuthService ~ error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Signup functionality
  async signup(userData: {
    email: string;
    password: string;
    phone?: string;
  }): Promise<{
    message: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.userService.findOneWithEmail(
      userData.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userService.create({
      ...userData,
      password: hashedPassword,
    });

    const accessToken = this.generateAccessToken(
      newUser.id,
      newUser.organizationId,
    );
    const refreshToken = this.generateRefreshToken(
      newUser.id,
      newUser.organizationId,
    );

    return {
      message: 'User registered successfully',
      userId: newUser.id,
      accessToken,
      refreshToken,
    };
  }

  // Login functionality
  async login(email: string, password: string): Promise<ILoginResponse> {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user.id, user.organizationId);
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.organizationId,
    );

    return {
      message: 'Login successful',
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }

  // Logout functionality
  logout(): { message: string } {
    // Clear session or token (not implemented here)
    return { message: 'Logout successful' };
  }

  // Validate user functionality
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user; // Return user details if valid
  }
}
