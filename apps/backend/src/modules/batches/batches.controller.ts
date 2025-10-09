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
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from 'src/dto/checklist-dto';

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

  @Post(':id/customers/:customerId')
  addCustomer(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.batchService.addCustomer(id, customerId);
  }

  @Delete(':id/customers/:customerId')
  removeCustomer(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.batchService.removeCustomer(id, customerId);
  }

  // Checklist endpoints
  @Get(':id/checklists')
  getChecklistItems(@Param('id') id: string) {
    return this.batchService.getChecklistItems(id);
  }

  // Checklist endpoints
  @Get(':id/checklists/customer/:customerId')
  getChecklistItemsByCustomer(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.batchService.getChecklistItemsByCustomer(id, customerId);
  }

  @Get(':id/checklists/individual')
  getIndividualChecklistItems(
    @Param('id') id: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.batchService.getIndividualChecklistItems(id, customerId);
  }

  @Post(':id/checklists')
  addChecklistItem(
    @Param('id') id: string,
    @Body() dto: CreateChecklistItemDto,
  ) {
    return this.batchService.addChecklistItem(id, dto);
  }

  @Patch('checklists/:checklistId')
  updateChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.batchService.updateChecklistItem(checklistId, dto);
  }

  @Patch('checklists/:checklistId/toggle')
  toggleChecklistItem(@Param('checklistId') checklistId: string) {
    return this.batchService.toggleChecklistItem(checklistId);
  }

  @Delete('checklists/:checklistId')
  deleteChecklistItem(@Param('checklistId') checklistId: string) {
    return this.batchService.deleteChecklistItem(checklistId);
  }
}
