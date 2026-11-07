import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { SalaryService } from './salary.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get('my')
  async findMySalaries(@Request() req: ApiRequestJWT) {
    return this.salaryService.findMySalaries(
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get('structure/:employeeId')
  async getStructure(
    @Request() req: ApiRequestJWT,
    @Param('employeeId') employeeId: string,
  ) {
    return this.salaryService.getStructure(
      employeeId,
      req.user.organizationId,
    );
  }

  @Put('structure/:employeeId')
  @RequirePermission('salary', 'update')
  async upsertStructure(
    @Request() req: ApiRequestJWT,
    @Param('employeeId') employeeId: string,
    @Body() body: any,
  ) {
    return this.salaryService.upsertStructure(
      employeeId,
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Get('calculate-preview')
  @RequirePermission('salary', 'read')
  async calculatePreview(
    @Request() req: ApiRequestJWT,
    @Query('employeeId') employeeId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('totalWorkingDays') totalWorkingDays?: string,
  ) {
    return this.salaryService.calculatePreview(
      req.user.organizationId,
      employeeId,
      parseInt(month, 10),
      parseInt(year, 10),
      totalWorkingDays ? parseFloat(totalWorkingDays) : 30,
    );
  }

  @Get()
  @RequirePermission('salary', 'read')
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
  ) {
    return this.salaryService.findAll(req.user.organizationId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      status,
      employeeId,
      search,
    });
  }

  @Get(':id')
  async findOne(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.salaryService.findOne(id, req.user.organizationId);
  }

  @Post()
  @RequirePermission('salary', 'create')
  async create(@Request() req: ApiRequestJWT, @Body() body: any) {
    return this.salaryService.create(
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Post('bulk-send-email')
  @RequirePermission('salary', 'manage')
  async bulkSendEmail(
    @Request() req: ApiRequestJWT,
    @Body()
    body: {
      salaryIds?: string[];
      month?: number;
      year?: number;
    },
  ) {
    return this.salaryService.bulkSendSalarySlipEmails(
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Post(':id/send-email')
  @RequirePermission('salary', 'manage')
  async sendEmail(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.salaryService.sendSalarySlipEmail(
      id,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Patch(':id')
  @RequirePermission('salary', 'update')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.salaryService.update(
      id,
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Delete(':id')
  @RequirePermission('salary', 'delete')
  async remove(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.salaryService.remove(
      id,
      req.user.organizationId,
      req.user.userId,
    );
  }
}

