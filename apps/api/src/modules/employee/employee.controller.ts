import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { EmployeeService } from './employee.service';
import { Employee } from './entity/employee.entity';

@UseGuards(AuthGuard)
@Controller('api/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() employeeData: IEmployeeCreateDTO,
  ): Promise<Employee> {
    return this.employeeService.create({
      ...employeeData,
      organizationId: req.user.organizationId,
    });
  }

  // Get all employees
  @Get()
  async findAll(@Request() req: ApiRequestJWT): Promise<Employee[]> {
    return this.employeeService.findAll(req.user.organizationId);
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
    @Body() updateData: IEmployeeCreateDTO,
  ): Promise<Employee> {
    return this.employeeService.update(id, updateData);
  }

  // Terminate an employee by ID
  @Patch(':id/terminate')
  async terminate(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.terminate(id);
  }

  // Delete an employee by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }

  // Terminate an employee by ID
  @Post(':id/activateUser')
  async activateUser(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.activateUser(id);
  }
}
