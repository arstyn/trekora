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
import { ChecklistType } from 'src/database/entity/booking-checklist.entity';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import {
  CreateBookingDto,
  CreatePaymentDto,
  UpdateBookingDto,
} from 'src/dto/booking.dto';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from 'src/dto/checklist.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { EmployeeService } from '../employee/employee.service';
import { BookingService } from './booking.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('api/bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly employeeService: EmployeeService,
  ) { }

  @Post()
  @RequirePermission('booking', 'create')
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.create(
      createBookingDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermission('booking', 'read')
  findAll(
    @Request() req: ApiRequestJWT,
    @Query('status') status?: BookingStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.bookingService.findAll(
      req.user.organizationId,
      status,
      limit,
      offset,
    );
  }

  @Get('team')
  @RequirePermission('employee', 'read')
  async findTeamBookings(
    @Request() req: ApiRequestJWT,
    @Query('status') status?: BookingStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const employee = await this.employeeService.findProfile(req.user.userId);
    if (!employee || !employee.id) {
      return [];
    }

    const directReports = await this.employeeService.getDirectReports(employee.id);
    const teamUserIds = directReports
      .map((emp) => emp.userId)
      .filter((id): id is string => !!id);

    if (teamUserIds.length === 0) {
      return [];
    }

    return this.bookingService.findByManagerTeam(
      req.user.organizationId,
      teamUserIds,
      status,
      limit,
      offset,
    );
  }

  @Get('stats')
  getStats(@Request() req: ApiRequestJWT) {
    return this.bookingService.getStats(req.user.organizationId);
  }

  @Get('recent')
  getRecentBookings(
    @Request() req: ApiRequestJWT,
    @Query('limit') limit?: number,
  ) {
    return this.bookingService.getRecentBookings(
      req.user.organizationId,
      limit,
    );
  }

  // Checklist endpoints (must come before :id routes)
  @Post(':id/checklist')
  addChecklistItem(
    @Param('id') bookingId: string,
    @Body() createChecklistDto: CreateChecklistItemDto,
  ) {
    return this.bookingService.addChecklistItem(bookingId, createChecklistDto);
  }

  @Get(':id/checklist/stats')
  getChecklistStats(
    @Param('id') bookingId: string,
    @Query('type') type?: ChecklistType,
  ) {
    return this.bookingService.getChecklistStats(bookingId, type);
  }

  @Patch('checklist/:checklistId')
  updateChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body() updateChecklistDto: UpdateChecklistItemDto,
  ) {
    return this.bookingService.updateChecklistItem(
      checklistId,
      updateChecklistDto,
    );
  }

  @Delete('checklist/:checklistId')
  deleteChecklistItem(@Param('checklistId') checklistId: string) {
    return this.bookingService.deleteChecklistItem(checklistId);
  }

  @Patch('checklist/:checklistId/toggle')
  toggleChecklistItem(@Param('checklistId') checklistId: string) {
    return this.bookingService.toggleChecklistItem(checklistId);
  }

  @Post(':id/payments')
  addPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.addPayment(
      id,
      createPaymentDto,
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('booking', 'update')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @RequirePermission('booking', 'delete')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
