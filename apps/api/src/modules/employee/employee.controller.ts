import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entity/employee.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('api/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() employeeData: Partial<Employee>,
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
