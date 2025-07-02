import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/database/entity/department.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  // Create a new department
  async create(departmentData: Partial<Department>): Promise<Department> {
    const department = this.departmentRepository.create(departmentData);
    return this.departmentRepository.save(department);
  }

  // Get all departments
  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  // Get a single department by ID
  async findOne(id: string): Promise<Department | null> {
    return this.departmentRepository.findOne({ where: { id } });
  }

  // Update a department by ID
  async update(
    id: string,
    updateData: Partial<Department>,
  ): Promise<Department> {
    await this.departmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  // Delete a department by ID
  async remove(id: string): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}
