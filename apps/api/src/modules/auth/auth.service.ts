import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ILoginResponse } from '@repo/api/auth/dto/auth.types';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { SignupFormDTO } from '@repo/validation';
import { OrganizationService } from '../organization/organization.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { RoleService } from '../role/role.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly organizationService: OrganizationService,
    private readonly userInviteService: UserInviteService,
    private readonly roleService: RoleService,
    private readonly employeeService: EmployeeService,
  ) {}

  private generateAccessToken(userId: string, organizationId: string): string {
    return jwt.sign(
      { userId, organizationId },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRATION ?? '15m', // Access token expires in 15 minutes
      },
    );
  }

  private generateRefreshToken(userId: string, organizationId: string): string {
    return jwt.sign(
      { userId, organizationId },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRATION ?? '7d', // Refresh token expires in 7 days
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
  async signup(userData: SignupFormDTO): Promise<{
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

    const organization = await this.organizationService.create({
      name: userData.orgName,
      size: userData.orgSize,
      industry: userData.industry,
      domain: userData.website || null,
      description: userData.description || null,
    });

    const adminRole = await this.roleService.findByName('admin');
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userService.create({
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone || null,
      organizationId: organization.id,
      roleId: adminRole.id,
      notificationsEnabled: userData.notifications,
      newsletterSubscribed: userData.newsletter,
    });

    await this.employeeService.create({
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone || null,
      organizationId: organization.id,
      userId: newUser.id,
      roleId: adminRole.id,
      status: 'active',
      joinDate: new Date().toISOString(),
    });

    if (userData.teamMembers && userData.teamMembers.length > 0) {
      await Promise.all(
        userData.teamMembers.map(async (member) => {
          const role = await this.roleService.findByName(member.role);
          if (!role) {
            throw new Error(`Role ${member.role} not found`);
          }
          const employee = await this.employeeService.create({
            name: member.email.split('@')[0],
            email: member.email,
            organizationId: organization.id,
            roleId: role.id,
            status: 'inactive',
            joinDate: new Date().toISOString(),
          });
          const invite = await this.userInviteService.createInvite(employee);
          await this.employeeService.sendInviteEmail(
            employee.email,
            invite.token,
          );
        }),
      );
    }

    const accessToken = this.generateAccessToken(newUser.id, organization.id);
    const refreshToken = this.generateRefreshToken(newUser.id, organization.id);

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
  logout(): { success: boolean; message: string } {
    // Clear session or token (not implemented here)
    return { success: true, message: 'Logout successful' };
  }

  // Validate user functionality
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user; // Return user details if valid
  }

  async activateUser(id: string) {
    try {
      const invite = await this.userInviteService.verifyToken(id);

      if (!invite) {
        throw new HttpException(
          'This activation link has expired. Please request a new one.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.userInviteService.acceptInvite(id);

      return {
        success: true,
        message: 'Your account has been successfully activated!',
        status: 'success',
      };
    } catch (error: any) {
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendActivation(email: string) {
    const employee = await this.employeeService.findOneWithEmail(email);
    console.log(
      '🚀 ~ auth.service.ts:225 ~ AuthService ~ resendActivation ~ employee:',
      employee,
    );
    if (!employee) {
      throw new HttpException(
        'If your email is registered and not yet activated, a new activation link has been sent.',
        HttpStatus.OK,
      );
    }
    if (employee.status === 'active') {
      throw new HttpException(
        'Account is already activated.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Generate a new invite token
    const invite = await this.userInviteService.createInvite(employee);
    await this.employeeService.sendInviteEmail(employee.email, invite.token);
    return {
      success: true,
      message:
        'If your email is registered and not yet activated, a new activation link has been sent.',
    };
  }

  async updatePassword(
    email: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userService.findOneWithEmail(email);

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.OK,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;

    await this.userService.update(user.id, user);

    return { message: 'Password updated successfully' };
  }
}
