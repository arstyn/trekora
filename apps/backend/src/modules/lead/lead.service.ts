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
    const leadNumber = await this.generateLeadNumber(user.organizationId);
    const lead = this.leadRepository.create({
      ...leadData,
      leadNumber,
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
      relations: ['createdBy', 'preferredPackage', 'preferredPackage.packageTiers'],
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
      relations: ['createdBy', 'preferredPackage', 'preferredPackage.packageTiers'],
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
      relations: ['preferredPackage', 'preferredPackage.packageTiers', 'createdBy'],
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

  private async generateLeadNumber(organizationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `LEAD${year}${month}`;

    const latest = await this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.leadNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('lead.leadNumber', 'DESC')
      .getOne();

    let seq = 1;
    if (latest && latest.leadNumber) {
      const lastSeqStr = latest.leadNumber.replace(prefix, '');
      const parsed = parseInt(lastSeqStr, 10);
      if (!isNaN(parsed)) {
        seq = parsed + 1;
      }
    } else {
      const count = await this.leadRepository.count();
      seq = count + 1;
    }

    const sequence = seq.toString().padStart(4, '0');
    return `${prefix}${sequence}`;
  }
}
