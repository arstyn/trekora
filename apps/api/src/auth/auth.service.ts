/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ILoginResponse } from '@repo/api/auth/dto/auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: '15m', // Access token expires in 15 minutes
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: '7d', // Refresh token expires in 7 days
    });
  }

  // Refresh Access Token functionality
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as { userId: string };

      const user = await this.userService.findOne(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(user.id);
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

    const accessToken = this.generateAccessToken(newUser.id);
    const refreshToken = this.generateRefreshToken(newUser.id);

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

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

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
