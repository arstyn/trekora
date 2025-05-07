import { Injectable } from '@nestjs/common';
import { Branch } from './entity/branch.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  // Create a new branch
  async create(branchData: Partial<Branch>): Promise<Branch> {
    const newUser = this.branchRepository.create(branchData);
    return await this.branchRepository.save(newUser);
  }

  // Find all branches
  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find();
  }

  // Find a branch by ID
  async findOne(id: string): Promise<Branch | null> {
    return await this.branchRepository.findOne({ where: { id } });
  }

  // Update a branch by ID
  async update(
    id: string,
    updateData: Partial<Branch>,
  ): Promise<Branch | null> {
    await this.branchRepository.update(id, updateData);
    return await this.findOne(id);
  }

  // Delete a branch by ID
  async remove(id: string): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
