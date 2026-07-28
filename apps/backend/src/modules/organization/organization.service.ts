import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/database/entity/organization.entity';
import { User } from 'src/database/entity/user.entity';
import { Repository } from 'typeorm';
import { seedDefaultTemplates } from './seed-templates.helper';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // Create a new organization
  async create(organizationData: Partial<Organization>): Promise<Organization> {
    const newUser = this.organizationRepository.create(organizationData);
    const org = await this.organizationRepository.save(newUser);

    try {
      // Find the first user in the database to associate as the creator
      const anyUser = await this.organizationRepository.manager.findOne(User, { where: {} });
      if (anyUser) {
        await seedDefaultTemplates(this.organizationRepository.manager, org.id, anyUser.id);
      }
    } catch (err) {
      console.error('Failed to seed default templates for new organization in OrganizationService:', err);
    }

    return org;
  }

  // Find all organizations
  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }

  // Find a organization by ID
  async findOne(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { id } });
  }
  // Find a organization by ID
  async findOneByName(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { name } });
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
