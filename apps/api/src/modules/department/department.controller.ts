import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Department } from './entity/department.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // Create a new department
  @Post()
  async create(
    @Body() departmentData: Partial<Department>,
  ): Promise<Department> {
    return this.departmentService.create(departmentData);
  }

  // Get all departments
  @Get()
  async findAll(): Promise<Department[]> {
    return this.departmentService.findAll();
  }

  // Get a single department by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Department | null> {
    return this.departmentService.findOne(id);
  }

  // Update a department by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Department>,
  ): Promise<Department> {
    return this.departmentService.update(id, updateData);
  }

  // Delete a department by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentService.remove(id);
  }
}
