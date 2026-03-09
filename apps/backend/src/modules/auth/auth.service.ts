import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { User } from 'src/database/entity/user.entity';
import { ILoginResponse } from 'src/dto/auth.types';
import { SignupFormDTO } from 'src/dto/signup.schema';
import { DataSource } from 'typeorm';
import { EmployeeService } from '../employee/employee.service';
import { MailerService } from '../mailer/mailer.service';
import { PermissionSetService } from '../permission/permission-set.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userInviteService: UserInviteService,
    private readonly employeeService: EmployeeService,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    private readonly permissionSetService: PermissionSetService,
  ) {}

  private async generateAccessToken(
    userId: string,
    organizationId: string,
  ): Promise<string> {
    const payload: any = { userId, organizationId };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRATION ?? '15m', // Access token expires in 15 minutes
    });
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
      if (!user || !user.organizationId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.generateAccessToken(
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
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Starting signup process for:', userData.email);

      // Check if user already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: userData?.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }

      // Create organization
      const organization = queryRunner.manager.create(Organization, {
        name: userData.orgName,
        size: userData.orgSize,
        industry: userData.industry,
        domain: userData.website,
        description: userData.description,
      });

      const savedOrganization = await queryRunner.manager.save(organization);
      console.log('Organization created:', savedOrganization.id);

      // Roles are removed, we'll assign permission sets later

      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = queryRunner.manager.create(User, {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        organizationId: savedOrganization.id,
        notificationsEnabled: userData.notifications,
        newsletterSubscribed: userData.newsletter,
        isActive: false,
      });

      const savedUser = await queryRunner.manager.save(newUser);
      console.log('User created:', savedUser.id);

      // Create employee
      const employee = queryRunner.manager.create(Employee, {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        organizationId: savedOrganization.id,
        userId: savedUser.id,
        status: EmployeeStatus.INACTIVE,
        joinDate: new Date().toISOString(),
        isActive: false,
      });

      const savedEmployee = await queryRunner.manager.save(employee);
      console.log('Employee created:', savedEmployee.id);

      // Process team members if any
      if (userData.teamMembers && userData.teamMembers.length > 0) {
        console.log('Processing team members:', userData.teamMembers.length);

        for (const member of userData.teamMembers) {
          try {
            // In new system, we assign permission sets via UI or defaults

            const teamEmployee = queryRunner.manager.create(Employee, {
              name: member.email.split('@')[0],
              email: member.email,
              organizationId: savedOrganization.id,
              status: EmployeeStatus.INACTIVE,
              joinDate: new Date().toISOString(),
            });

            const savedTeamEmployee =
              await queryRunner.manager.save(teamEmployee);

            const invite = queryRunner.manager.create(UserInvite, {
              ...savedTeamEmployee,
            });

            const savedInvite = await queryRunner.manager.save(invite);

            // Send invite email
            if (teamEmployee.email)
              await this.employeeService.sendInviteEmail(
                teamEmployee.email,
                savedInvite.token,
              );

            console.log('Team member processed:', member.email);
          } catch (memberError) {
            console.error(
              'Error processing team member:',
              member.email,
              memberError,
            );
            // Continue processing other members instead of failing completely
          }
        }
      }

      // CRITICAL: Commit the transaction
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      // Create default permissions and permission sets for the organization
      try {
        const permissionSets =
          await this.permissionSetService.createDefaultPermissionSetsForOrganization(
            savedOrganization.id,
          );

        // Find the admin permission set and assign to the new user and employee
        const adminSet = permissionSets.find((ps) => ps.name.includes('Admin'));
        if (adminSet) {
          await this.permissionSetService.assignPermissionSet(
            adminSet.id,
            savedUser.id,
            savedEmployee.id,
          );
        }

        console.log(
          'Default permissions and permission sets created and assigned for organization',
        );
      } catch (error) {
        console.error(
          'Error creating default permissions and permission sets (non-critical):',
          error,
        );
        // Don't fail the signup if permission sets creation fails
      }

      const invite = await this.userInviteService.createInvite(employee);

      await this.sendActivationEmail(userData.email, invite.token);

      return {
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Signup error:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Login functionality
  async login(email: string, password: string): Promise<ILoginResponse> {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account has been deactivated! Please contact customer care',
      );
    }

    if (!user.organizationId) {
      throw new UnauthorizedException(
        'User does not belong to any organization',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException('User does not have password set');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.generateAccessToken(
      user.id,
      user.organizationId,
    );
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.organizationId,
    );

    return {
      message: 'Login successful',
      userId: user.id,
      name: user.name,
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

    if (!user.password) {
      throw new UnauthorizedException('User does not have password set');
    }

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
  async activateAccount(id: string) {
    try {
      const invite = await this.userInviteService.verifyToken(id);

      if (!invite) {
        throw new HttpException(
          'This activation link has expired. Please request a new one.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.userInviteService.acceptAccountInvite(id);

      if (invite.employee && invite.employee.userId) {
        const user = await this.userService.findOne(invite.employee.userId);
        if (user) {
          await this.userService.update(user.id, {
            isActive: true,
          });
          await this.employeeService.update(invite.employeeId, {
            isActive: true,
            status: EmployeeStatus.ACTIVE,
          });
          return {
            success: true,
            message: 'Your account has been successfully activated!',
            status: 'success',
          };
        } else {
          throw Error('User not found');
        }
      } else {
        throw Error('Token is not valid please check.');
      }
    } catch (error: any) {
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendActivation(email: string) {
    const employee = await this.employeeService.findOneWithEmail(email);

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
    if (employee.email) {
      await this.employeeService.sendInviteEmail(employee.email, invite.token);
    }
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
      throw new HttpException('User not found', HttpStatus.OK);
    }

    if (!user.password) {
      throw new UnauthorizedException('User does not have password set');
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

  async sendActivationEmail(email: string, token: string) {
    const activateUrl = `${process.env.FRONTEND_URL}/activate-account/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f4f4f7; padding: 40px 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 16px;">Welcome to Trekora!</h2>
              <p style="color: #555; font-size: 16px; margin-bottom: 32px;">
                Thank you for signing up. To start using your account, please confirm your email address by clicking the button below.
              </p>
              <a href="${activateUrl}" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #fff; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold; margin-bottom: 24px;">
                Activate My Account
              </a>
              <p style="color: #888; font-size: 13px; margin-top: 32px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4f46e5; font-size: 14px;">${activateUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 40px 40px; text-align: center; color: #aaa; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Trekora. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Activate Your Trekora Account',
      text: `Welcome to Trekora! Activate your account: ${activateUrl}`,
      html,
    });
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { email, firstName, lastName } = req.user;

    let user = await this.userService.findOneWithEmail(email);

    if (!user) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create organization
        const organization = queryRunner.manager.create(Organization, {
          name: `${firstName}'s Organization`,
          size: '1-10', // Default
          industry: 'Other', // Default
          domain: '',
          description: 'Created via Google Login',
        });

        const savedOrganization = await queryRunner.manager.save(organization);

        // Roles are removed, we'll assign permission sets later

        // Create user
        const newUser = queryRunner.manager.create(User, {
          name: `${firstName} ${lastName}`,
          email: email,
          organizationId: savedOrganization.id,
          isActive: true, // Auto-activate Google users
          notificationsEnabled: true,
          newsletterSubscribed: false,
        });

        user = await queryRunner.manager.save(newUser);

        // Create employee
        const employee = queryRunner.manager.create(Employee, {
          name: `${firstName} ${lastName}`,
          email: email,
          organizationId: savedOrganization.id,
          userId: user.id,
          status: EmployeeStatus.ACTIVE,
          joinDate: new Date().toISOString(),
          isActive: true,
        });

        await queryRunner.manager.save(employee);

        await queryRunner.commitTransaction();
        console.log('Google signup transaction committed successfully');

        // Create default permissions and permission sets
        try {
          const permissionSets =
            await this.permissionSetService.createDefaultPermissionSetsForOrganization(
              savedOrganization.id,
            );

          const adminSet = permissionSets.find((ps) =>
            ps.name.includes('Admin'),
          );
          if (adminSet) {
            await this.permissionSetService.assignPermissionSet(
              adminSet.id,
              user.id,
            );
          }

          console.log(
            'Default permissions and permission sets created and assigned',
          );
        } catch (error) {
          console.error(
            'Error creating default permissions and permission sets (non-critical):',
            error,
          );
        }
      } catch (error) {
        console.error('Google signup error:', error);
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    // If user exists but is not active
    if (!user.isActive) {
      // Optional: Reactivate or throw error. For now, throw error.
      throw new UnauthorizedException('User account is deactivated.');
    }

    const accessToken = await this.generateAccessToken(
      user.id,
      user.organizationId || '',
    );
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.organizationId || '',
    );

    return {
      message: 'Login successful',
      userId: user.id,
      name: user.name,
      accessToken,
      refreshToken,
    };
  }
}
