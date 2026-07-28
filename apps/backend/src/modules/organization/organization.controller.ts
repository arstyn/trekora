import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Organization } from 'src/database/entity/organization.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { OrganizationService } from './organization.service';

@UseGuards(AuthGuard)
@Controller('organization')
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

  // Get block slots change logs for an organization
  @Get(':id/block-slots-logs')
  async getBlockSlotLogs(@Param('id') id: string) {
    return await this.organizationService.getBlockSlotLogs(id);
  }

  // Get a organization by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization | null> {
    return await this.organizationService.findOne(id);
  }

  // Update a organization by ID
  @Put(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateData: Partial<Organization>,
  ): Promise<Organization | null> {
    return await this.organizationService.update(id, updateData, req.user?.userId);
  }

  // Delete a organization by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.organizationService.remove(id);
  }
}
