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
      relations: ['employee'],
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return null;
    }
    return invite;
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
        organizationId: invite.employee.organizationId,
        isActive: true,
      });
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
