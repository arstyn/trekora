import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from 'src/database/entity/lead.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(
    user: { organizationId: string; userId: string },
    leadData: Partial<Lead>,
  ): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...leadData,
      createdById: user.userId,
      organizationId: user.organizationId,
    });
    return this.leadRepository.save(lead);
  }

  async findAll(organizationId: string): Promise<Lead[]> {
    return this.leadRepository.find({
      order: { createdAt: 'DESC' },
      where: {
        organizationId,
      },
      relations: ['createdBy', 'preferredPackage'],
    });
  }

  async findOne(id: string): Promise<Lead | null> {
    return this.leadRepository.findOne({
      where: { id },
      relations: ['preferredPackage'],
    });
  }

  async update(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    await this.leadRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.leadRepository.delete(id);
  }
}
