import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entity/employee.entity';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // Create a new employee
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    await this.employeeRepository.save(employee);
    return this.employeeRepository.findOne({
      where: { id: employee.id },
      relations: ['role'],
    });
  }

  // Get all employees
  async findAll(organizationId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        organizationId,
      },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get a single employee by ID
  async findOne(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  // Update an employee by ID
  async update(id: string, updateData: Partial<Employee>): Promise<Employee> {
    await this.employeeRepository.update(id, updateData);
    return this.findOne(id);
  }

  // Delete an employee by ID
  async remove(id: string): Promise<void> {
    await this.employeeRepository.delete(id);
  }
}
