import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from 'src/database/entity/lead.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) { }

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
      select: {
        createdBy: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    });
  }

  async findByManagerTeam(organizationId: string, teamUserIds: string[]): Promise<Lead[]> {
    if (teamUserIds.length === 0) {
      return [];
    }

    return this.leadRepository.find({
      order: { createdAt: 'DESC' },
      where: {
        organizationId,
        createdById: In(teamUserIds),
      },
      relations: ['createdBy', 'preferredPackage'],
      select: {
        createdBy: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Lead | null> {
    return this.leadRepository.findOne({
      where: { id },
      relations: ['preferredPackage', 'createdBy'],
      select: {
        createdBy: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
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
