import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entity/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // Create a new employee
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  // Get all employees
  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
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
