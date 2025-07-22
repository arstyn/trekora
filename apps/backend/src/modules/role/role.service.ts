import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entity/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Create a new role
  async create(roleData: Partial<Role>): Promise<Role> {
    const newRole = this.roleRepository.create(roleData);
    return await this.roleRepository.save(newRole);
  }

  // Find all roles
  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  // Find a role by ID
  async findOne(id: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { id } });
  }

  // Find a role by Name
  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { name } });
  }

  // Update a role by ID
  async update(id: string, updateData: Partial<Role>): Promise<Role | null> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      return null;
    }
    Object.assign(role, updateData);
    return await this.roleRepository.save(role);
  }

  // Delete a role by ID
  async delete(id: string) {
    return await this.roleRepository.delete(id);
  }
}
