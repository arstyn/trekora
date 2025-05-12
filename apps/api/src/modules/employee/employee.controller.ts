import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entity/employee.entity';

@Controller('api/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  async create(@Body() employeeData: Partial<Employee>): Promise<Employee> {
    return this.employeeService.create(employeeData);
  }

  // Get all employees
  @Get()
  async findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  // Get a single employee by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Employee | null> {
    return this.employeeService.findOne(id);
  }

  // Update an employee by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Employee>,
  ): Promise<Employee> {
    return this.employeeService.update(id, updateData);
  }

  // Delete an employee by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }
}
