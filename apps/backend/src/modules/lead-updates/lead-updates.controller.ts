import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeadUpdatesService } from './lead-updates.service';
import { CreateLeadUpdateDto } from './dto/create-lead-update.dto';
import { UpdateLeadUpdateDto } from './dto/update-lead-update.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('lead-updates')
export class LeadUpdatesController {
  constructor(private readonly leadUpdatesService: LeadUpdatesService) {}

  @Post()
  create(
    @Body() createLeadUpdateDto: CreateLeadUpdateDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.leadUpdatesService.create(createLeadUpdateDto, req.user.userId);
  }

  @Get('lead/:leadId')
  findAll(@Param('leadId') leadId: string) {
    return this.leadUpdatesService.findAll(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadUpdatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadUpdateDto: UpdateLeadUpdateDto,
  ) {
    return this.leadUpdatesService.update(id, updateLeadUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadUpdatesService.remove(id);
  }
}
