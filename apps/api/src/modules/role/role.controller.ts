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
import { RoleService } from './role.service';
import { Role } from './entity/role.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Create a new role
  @Post()
  async create(@Body() roleData: Partial<Role>): Promise<Role> {
    return await this.roleService.create(roleData);
  }

  // Get all roles
  @Get()
  async findAll(): Promise<Role[]> {
    return await this.roleService.findAll();
  }

  // Get a role by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role | null> {
    return await this.roleService.findOne(id);
  }

  // Get a role by Name
  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<Role | null> {
    return await this.roleService.findByName(name);
  }

  // Update a role by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Role>,
  ): Promise<Role | null> {
    return await this.roleService.update(id, updateData);
  }

  // Delete a role by ID
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.roleService.delete(id);
  }
}
