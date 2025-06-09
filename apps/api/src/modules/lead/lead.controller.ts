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
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Lead } from './entity/lead.entity';
import { LeadService } from './lead.service';

@UseGuards(AuthGuard)
@Controller('api/lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() leadData: Partial<Lead>,
  ): Promise<Lead> {
    return this.leadService.create(req.user, leadData);
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
