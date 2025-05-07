import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // Signup functionality
  async signup(userData: {
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ message: string; userId: string }> {
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

    return { message: 'User registered successfully', userId: newUser.id };
  }

  // Login functionality
  async login(
    email: string,
    password: string,
  ): Promise<{ message: string; userId: string }> {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // Generate a token or session (not implemented here)
    return { message: 'Login successful', userId: user.id };
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
