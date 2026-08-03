import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { UserOrganization } from 'src/database/entity/user-organization.entity';

@Injectable()
export class UserInviteService {
  constructor(
    @InjectRepository(UserInvite)
    private readonly inviteRepository: Repository<UserInvite>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createInvite(employee: Employee): Promise<UserInvite> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 24 hours
    const invite = this.inviteRepository.create({
      email: employee.email,
      token,
      expiresAt,
      employee,
      employeeId: employee.id,
      used: false,
    });
    return this.inviteRepository.save(invite);
  }

  async verifyToken(token: string): Promise<UserInvite | null> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee', 'employee.organization'],
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return null;
    }
    return invite;
  }

  async getInviteDetails(token: string): Promise<any> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee', 'employee.organization', 'employee.branch'],
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new HttpException('Invalid or expired invite token', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOneWithEmail(invite.email);

    return {
      valid: true,
      email: invite.email,
      employeeName: invite.employee.name,
      employeeDesignation: invite.employee.designation,
      organizationName: invite.employee.organization?.name,
      organizationId: invite.employee.organizationId,
      branchName: invite.employee.branch?.name,
      isExistingUser: !!user,
    };
  }

  async acceptOrgInvite(token: string, requestingUserId: string): Promise<any> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee', 'employee.organization'],
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new HttpException('Invalid or expired invite token', HttpStatus.BAD_REQUEST);
    }

    const requestingUser = await this.userService.findOne(requestingUserId);
    if (!requestingUser || requestingUser.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new HttpException(
        'Logged in user email does not match the invitation email',
        HttpStatus.FORBIDDEN,
      );
    }

    // Link user to organization
    const userOrgRepo = this.employeeRepository.manager.getRepository(UserOrganization);
    const existingUserOrg = await userOrgRepo.findOne({
      where: { userId: requestingUser.id, organizationId: invite.employee.organizationId },
    });

    if (!existingUserOrg) {
      await userOrgRepo.save(
        userOrgRepo.create({
          userId: requestingUser.id,
          organizationId: invite.employee.organizationId,
          relation: 'member',
        }),
      );
    }

    // Associate employee record with requestingUser
    invite.employee.userId = requestingUser.id;
    invite.employee.status = EmployeeStatus.ACTIVE;
    invite.employee.isActive = true;
    await this.employeeRepository.save(invite.employee);

    // Update last accessed organization if not set
    if (!requestingUser.lastAccessedOrganizationId) {
      await this.userService.update(requestingUser.id, {
        lastAccessedOrganizationId: invite.employee.organizationId,
      });
    }

    invite.used = true;
    await this.inviteRepository.save(invite);

    return {
      success: true,
      message: `You have successfully joined ${invite.employee.organization?.name || 'the organization'}.`,
      organizationId: invite.employee.organizationId,
    };
  }

  async declineOrgInvite(token: string, requestingUserId: string): Promise<any> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee'],
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new HttpException('Invalid or expired invite token', HttpStatus.BAD_REQUEST);
    }

    const requestingUser = await this.userService.findOne(requestingUserId);
    if (!requestingUser || requestingUser.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new HttpException(
        'Logged in user email does not match the invitation email',
        HttpStatus.FORBIDDEN,
      );
    }

    invite.used = true;
    await this.inviteRepository.save(invite);

    // Terminate or keep employee as inactive
    invite.employee.status = EmployeeStatus.INACTIVE;
    await this.employeeRepository.save(invite.employee);

    return { success: true, message: 'Invitation declined.' };
  }

  async acceptInvite(token: string): Promise<any> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee'],
    });
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new HttpException(
        'Invalid or expired invite token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if user already exists
    let user = await this.userService.findOneWithEmail(invite.email);
    if (!user) {
      // Create user account
      user = await this.userService.create({
        email: invite.email,
        name: invite.employee.name,
        phone: invite.employee.phone,
        lastAccessedOrganizationId: invite.employee.organizationId,
        isActive: true,
      });

      const userOrgRepo = this.employeeRepository.manager.getRepository(UserOrganization);
      await userOrgRepo.save(userOrgRepo.create({
        userId: user.id,
        organizationId: invite.employee.organizationId,
        relation: 'member'
      }));
    } else {
      const userOrgRepo = this.employeeRepository.manager.getRepository(UserOrganization);
      const existingUserOrg = await userOrgRepo.findOne({
        where: { userId: user.id, organizationId: invite.employee.organizationId }
      });
      if (!existingUserOrg) {
        await userOrgRepo.save(userOrgRepo.create({
          userId: user.id,
          organizationId: invite.employee.organizationId,
          relation: 'member'
        }));
      }
    }

    // Associate the employee record with the user ID!
    invite.employee.userId = user.id;
    invite.employee.status = EmployeeStatus.ACTIVE;
    invite.employee.isActive = true;
    await this.employeeRepository.save(invite.employee);

    invite.used = true;
    await this.inviteRepository.save(invite);
    return { message: 'Account activated', success: true };
  }

  async acceptAccountInvite(token: string): Promise<any> {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['employee'],
    });
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new HttpException(
        'Invalid or expired invite token',
        HttpStatus.BAD_REQUEST,
      );
    }

    invite.used = true;
    await this.inviteRepository.save(invite);
    return { message: 'Account activated', success: true };
  }
}
