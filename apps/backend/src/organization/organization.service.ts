import { Injectable } from '@nestjs/common';
import { Organization } from './entity/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // Create a new organization
  async create(organizationData: Partial<Organization>): Promise<Organization> {
    const newUser = this.organizationRepository.create(organizationData);
    return await this.organizationRepository.save(newUser);
  }

  // Find all organizations
  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }

  // Find a organization by ID
  async findOne(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { id } });
  }

  // Update a organization by ID
  async update(
    id: string,
    updateData: Partial<Organization>,
  ): Promise<Organization | null> {
    await this.organizationRepository.update(id, updateData);
    return await this.findOne(id);
  }

  // Delete a organization by ID
  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}
