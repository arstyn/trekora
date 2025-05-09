import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './entity/organization.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // Create a new organization
  @Post()
  async create(
    @Body() organizationData: Partial<Organization>,
  ): Promise<Organization> {
    return await this.organizationService.create(organizationData);
  }

  // Get all organizations
  @Get()
  async findAll(): Promise<Organization[]> {
    return await this.organizationService.findAll();
  }

  // Get a organization by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization | null> {
    return await this.organizationService.findOne(id);
  }

  // Update a organization by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Organization>,
  ): Promise<Organization | null> {
    return await this.organizationService.update(id, updateData);
  }

  // Delete a organization by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.organizationService.remove(id);
  }
}
