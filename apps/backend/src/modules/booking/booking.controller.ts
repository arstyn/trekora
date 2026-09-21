import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import {
  AddTravelersDto,
  CancelBookingDto,
  CreateBookingDto,
  CreatePaymentDto,
  UpdateBookingDto,
} from 'src/dto/booking.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { EmployeeService } from '../employee/employee.service';
import { BookingService } from './booking.service';
import { PermissionCheckService } from '../permission/permission-check.service';
import { ApprovalService } from '../approval/approval.service';
import { ApprovalAction } from 'src/database/entity/approval-request.entity';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly employeeService: EmployeeService,
    private readonly permissionCheckService: PermissionCheckService,
    @Inject(forwardRef(() => ApprovalService))
    private readonly approvalService: ApprovalService,
  ) {}

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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ) {
    return this.bookingService.findAll(
      req.user.organizationId,
      status,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
      search,
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
    const employee = await this.employeeService.findProfile(req.user.userId, req.user.organizationId);
    if (!employee || !employee.id) {
      return [];
    }

    const directReports = await this.employeeService.getDirectReports(
      employee.id,
    );
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

  @Get('customer/:customerId')
  @RequirePermission('booking', 'read')
  findByCustomerId(
    @Param('customerId') customerId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.findByCustomerId(customerId, req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('booking', 'update')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.update(id, updateBookingDto, req.user?.userId);
  }

  @Delete(':id')
  @RequirePermission('booking', 'delete')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @Request() req: ApiRequestJWT,
  ) {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const canDirectCancel = await this.permissionCheckService.hasPermission(
      userId,
      organizationId,
      'booking',
      'cancel',
    );

    if (canDirectCancel) {
      return this.bookingService.cancelBooking(id, userId, cancelDto);
    }

    const canRequestCancel =
      (await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'booking',
        'cancel_request',
      )) ||
      (await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'booking',
        'update',
      ));

    if (!canRequestCancel) {
      throw new ForbiddenException(
        'You do not have permission to cancel or request cancellation for this booking.',
      );
    }

    const booking = await this.bookingService.findOne(id);

    const approvalRequest = await this.approvalService.createRequest(
      {
        action: ApprovalAction.BOOKING_CANCEL,
        resource: 'booking',
        entityId: id,
        entityReference: booking.bookingNumber,
        title: `Cancellation Request for Booking #${booking.bookingNumber}`,
        reason:
          cancelDto.reason || cancelDto.notes || 'Booking cancellation requested',
        payload: cancelDto,
        snapshot: {
          bookingNumber: booking.bookingNumber,
          totalAmount: booking.totalAmount,
          advancePaid: booking.advancePaid,
          customersCount: booking.customers?.length || 0,
        },
      },
      userId,
      organizationId,
    );

    return {
      requiresApproval: true,
      message: 'Cancellation request submitted to manager for approval.',
      approvalRequest,
    };
  }

  @Post(':id/add-customer/:customerId')
  @RequirePermission('booking', 'update')
  addCustomer(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.addCustomerToBooking(
      id,
      customerId,
      req.user.userId,
    );
  }

  @Post(':id/add-customers')
  @RequirePermission('booking', 'update')
  addCustomers(
    @Param('id') id: string,
    @Body() dto: AddTravelersDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.addCustomersToBooking(
      id,
      dto.customerIds,
      req.user.userId,
    );
  }

  @Post(':id/cancel-customer/:customerId')
  async cancelCustomer(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
    @Body() cancelDto: CancelBookingDto,
    @Request() req: ApiRequestJWT,
  ) {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const canDirectCancel = await this.permissionCheckService.hasPermission(
      userId,
      organizationId,
      'booking',
      'cancel',
    );

    if (canDirectCancel) {
      return this.bookingService.cancelCustomerFromBooking(
        id,
        customerId,
        userId,
        cancelDto,
      );
    }

    const canRequestCancel =
      (await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'booking',
        'cancel_request',
      )) ||
      (await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'booking',
        'update',
      ));

    if (!canRequestCancel) {
      throw new ForbiddenException(
        'You do not have permission to cancel travelers on this booking.',
      );
    }

    const booking = await this.bookingService.findOne(id);
    const targetCustomer = (booking.customers || []).find(
      (c) => c.id === customerId || (c as any).customerId === customerId,
    );
    const travelerName = targetCustomer
      ? `${targetCustomer.firstName || ''} ${targetCustomer.lastName || ''}`.trim()
      : 'Traveler';

    const mergedPayload = {
      ...cancelDto,
      customerIds: [customerId],
    };

    const approvalRequest = await this.approvalService.createRequest(
      {
        action: ApprovalAction.BOOKING_CANCEL,
        resource: 'booking',
        entityId: id,
        entityReference: booking.bookingNumber,
        title: `Traveler Cancellation Request (${travelerName}) - Booking #${booking.bookingNumber}`,
        reason:
          cancelDto.reason || cancelDto.notes || 'Traveler cancellation requested',
        payload: mergedPayload,
        snapshot: {
          bookingNumber: booking.bookingNumber,
          customerId,
          travelerName,
        },
      },
      userId,
      organizationId,
    );

    return {
      requiresApproval: true,
      message: 'Traveler cancellation request submitted to manager for approval.',
      approvalRequest,
    };
  }

  @Post(':id/move/:batchId')
  @RequirePermission('booking', 'update')
  move(
    @Param('id') id: string,
    @Param('batchId') batchId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.moveBooking(id, batchId, req.user.userId);
  }
  @Get(':id/logs')
  @RequirePermission('booking', 'read')
  getLogs(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '5', 10);
    const offsetNum = offset !== undefined ? parseInt(offset, 10) : undefined;
    return this.bookingService.getLogs(id, pageNum, limitNum, offsetNum);
  }
}
