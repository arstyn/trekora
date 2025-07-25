import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@UseGuards(AuthGuard)
@Controller('api/batches')
export class BatchesController {
  constructor(private readonly batchService: BatchesService) {}

  @Post()
  create(@Body() dto: CreateBatchDto, @Request() req: ApiRequestJWT) {
    return this.batchService.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req: ApiRequestJWT, @Query('status') status?: string) {
    return this.batchService.findAll(req.user.organizationId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.batchService.remove(id);
  }

  @Post(':id/coordinators/:employeeId')
  addCoordinator(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.batchService.addCoordinator(id, employeeId);
  }

  @Delete(':id/coordinators/:employeeId')
  removeCoordinator(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.batchService.removeCoordinator(id, employeeId);
  }

  @Post(':id/passengers/:customerId')
  addPassenger(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.batchService.addPassenger(id, customerId);
  }

  @Delete(':id/passengers/:customerId')
  removePassenger(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.batchService.removePassenger(id, customerId);
  }
}
