import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entity/lead.entity';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(leadData: Partial<Lead>): Promise<Lead> {
    const lead = this.leadRepository.create(leadData);
    return this.leadRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find();
  }

  async findOne(id: string): Promise<Lead | null> {
    return this.leadRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    await this.leadRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.leadRepository.delete(id);
  }
}
