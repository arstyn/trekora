import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entity/user_role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserRoleDto: Partial<UserRole>): Promise<UserRole> {
    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return await this.userRoleRepository.save(userRole);
  }

  async findAll(): Promise<UserRole[]> {
    return this.userRoleRepository.find();
  }

  async findOne(id: string): Promise<UserRole> {
    return this.userRoleRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateUserRoleDto: Partial<UserRole>,
  ): Promise<UserRole> {
    await this.userRoleRepository.update(id, updateUserRoleDto);
    return this.userRoleRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.userRoleRepository.delete(id);
  }

  async getUserRoleNames(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    return userRoles.map((ur) => ur.role.name);
  }
}
