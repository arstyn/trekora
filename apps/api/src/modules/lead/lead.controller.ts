import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { Lead } from './entity/lead.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  async create(@Body() leadData: Partial<Lead>): Promise<Lead> {
    return this.leadService.create(leadData);
  }

  @Get()
  async findAll(): Promise<Lead[]> {
    return this.leadService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Lead | null> {
    return this.leadService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Lead>,
  ): Promise<Lead | null> {
    return this.leadService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadService.remove(id);
  }
}
