import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Branch } from 'src/database/entity/branch.entity';
import { IBranchCreateDTO } from 'src/dto/create-branch.dto';
import { IBranchUpdateDTO } from 'src/dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: IBranchCreateDTO): Promise<Branch> {
    const { name, location, organizationId, isActive = true } = data;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const branch = this.branchRepository.create({
        name,
        location,
        organizationId,
        isActive,
      });

      await queryRunner.manager.save(branch);

      const createdBranch = await queryRunner.manager.findOne(Branch, {
        where: { id: branch.id },
        relations: ['organization'],
      });

      await queryRunner.commitTransaction();
      return createdBranch!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(organizationId: string): Promise<Branch[]> {
    return this.branchRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      where: { organizationId },
    });
  }

  async findOne(id: string): Promise<Branch | null> {
    return this.branchRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: IBranchUpdateDTO): Promise<Branch> {
    const { name, location, organizationId, isActive } = updateData;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingBranch = await queryRunner.manager.findOne(Branch, {
        where: { id },
      });

      if (!existingBranch) {
        ``;
        throw new Error('Branch not found');
      }

      const updatedFields: Partial<Branch> = {
        name: name ?? existingBranch.name,
        location: location ?? existingBranch.location,
        organizationId: organizationId ?? existingBranch.organizationId,
        isActive: isActive ?? existingBranch.isActive,
      };

      await queryRunner.manager.update(Branch, id, updatedFields);

      const updatedBranch = await queryRunner.manager.findOne(Branch, {
        where: { id },
        relations: ['organization'],
      });

      await queryRunner.commitTransaction();
      return updatedBranch!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.branchRepository.delete(id);
    return branch;
  }
}
