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
import { BatchStatus } from 'src/database/entity/batch.entity';
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
    return this.batchService.create(
      dto,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Get()
  findAll(
    @Request() req: ApiRequestJWT,
    @Query('status') status?: BatchStatus,
  ) {
    return this.batchService.findAll(req.user.organizationId, status);
  }

  @Get('fast-filling')
  getFastFillingBatches(@Request() req: ApiRequestJWT) {
    return this.batchService.getFastFillingBatches(req.user.organizationId);
  }

  @Get('stats')
  getStatBatches(@Request() req: ApiRequestJWT) {
    return this.batchService.getBatchDashboardStats(req.user.organizationId);
  }

  @Get('by-package/:packageId')
  findByPackage(@Param('packageId') packageId: string) {
    return this.batchService.findByPackage(packageId);
  }

  @Get('available/:packageId')
  getAvailableBatches(@Param('packageId') packageId: string) {
    return this.batchService.getAvailableBatches(packageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBatchDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.batchService.update(id, dto, req.user.userId);
  }

  @Patch(':id/active')
  markActive(@Param('id') id: string, @Request() req: ApiRequestJWT) {
    return this.batchService.markActive(id, req.user.userId);
  }

  @Patch(':id/complete')
  markCompleted(@Param('id') id: string, @Request() req: ApiRequestJWT) {
    return this.batchService.markCompleted(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: ApiRequestJWT) {
    return this.batchService.remove(id, req.user.userId);
  }

  @Post(':id/coordinators/:employeeId')
  addCoordinator(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.batchService.addCoordinator(id, employeeId, req.user.userId);
  }

  @Delete(':id/coordinators/:employeeId')
  removeCoordinator(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.batchService.removeCoordinator(id, employeeId, req.user.userId);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.batchService.getLogs(id);
  }
}
