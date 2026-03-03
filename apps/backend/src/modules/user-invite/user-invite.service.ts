import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Employee } from 'src/database/entity/employee.entity';
import { UserInvite } from 'src/database/entity/user-invite.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserInviteService {
  constructor(
    @InjectRepository(UserInvite)
    private readonly inviteRepository: Repository<UserInvite>,
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
    console.log(
      '🚀 ~ user-invite.service.ts:41 ~ UserInviteService ~ verifyToken ~ invite:',
      invite,
    );
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return null;
    }
    return invite;
  }

  async acceptInvite(token: string, password?: string): Promise<any> {
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

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Create user account
    await this.userService.create({
      email: invite.email,
      name: invite.employee.name,
      phone: invite.employee.phone,
      organizationId: invite.employee.organizationId,
      password: hashedPassword,
    });
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
