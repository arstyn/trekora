import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { Role } from 'src/database/entity/role.entity';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { User } from 'src/database/entity/user.entity';
import { ILoginResponse } from 'src/dto/auth.types';
import { SignupFormDTO } from 'src/dto/signup.schema';
import { DataSource, Repository } from 'typeorm';
import { EmployeeService } from '../employee/employee.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(UserInvite)
    private readonly userInviteRepository: Repository<UserInvite>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userInviteService: UserInviteService,
    private readonly employeeService: EmployeeService,
    private readonly dataSource: DataSource,
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
      if (!user || !user.organizationId) {
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

      // Find admin role
      const adminRole = await queryRunner.manager.findOne(Role, {
        where: { name: 'admin' },
      });
      if (!adminRole) {
        throw new Error('Admin role not found in database');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = queryRunner.manager.create(User, {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        organizationId: savedOrganization.id,
        roleId: adminRole.id,
        notificationsEnabled: userData.notifications,
        newsletterSubscribed: userData.newsletter,
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
        roleId: adminRole.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date().toISOString(),
      });

      const savedEmployee = await queryRunner.manager.save(employee);
      console.log('Employee created:', savedEmployee.id);

      // Process team members if any
      if (userData.teamMembers && userData.teamMembers.length > 0) {
        console.log('Processing team members:', userData.teamMembers.length);

        for (const member of userData.teamMembers) {
          try {
            const role = await queryRunner.manager.findOne(Role, {
              where: { name: member.role },
            });
            if (!role) {
              console.warn(`Role ${member.role} not found, skipping member`);
              continue;
            }

            const teamEmployee = queryRunner.manager.create(Employee, {
              name: member.email.split('@')[0],
              email: member.email,
              organizationId: savedOrganization.id,
              roleId: role.id,
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

      // Generate tokens
      const accessToken = this.generateAccessToken(
        savedUser.id,
        savedOrganization.id,
      );
      const refreshToken = this.generateRefreshToken(
        savedUser.id,
        savedOrganization.id,
      );

      // CRITICAL: Commit the transaction
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      return {
        message: 'User registered successfully',
        userId: savedUser.id,
        accessToken,
        refreshToken,
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

    const accessToken = this.generateAccessToken(user.id, user.organizationId);
    const refreshToken = this.generateRefreshToken(
      user.id,
      user.organizationId,
    );

    return {
      message: 'Login successful',
      userId: user.id,
      name: user.name,
      role: user.role?.name,
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
}
