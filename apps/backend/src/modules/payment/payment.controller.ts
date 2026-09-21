import {
  BadRequestException,
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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import {
  BookingForPaymentDto,
  BookingSearchDto,
  CreatePaymentDto,
  OverduePaymentDto,
  PaymentFilterDto,
  PaymentListResponseDto,
  PaymentResponseDto,
  PaymentStatsDto,
  UpdatePaymentDto,
} from 'src/dto/payment.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { PaymentService } from './payment.service';
import { PermissionCheckService } from '../permission/permission-check.service';
import { ApprovalService } from '../approval/approval.service';
import { PaymentType } from 'src/database/entity/booking-payment.entity';
import { ApprovalAction } from 'src/database/entity/approval-request.entity';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly permissionCheckService: PermissionCheckService,
    @Inject(forwardRef(() => ApprovalService))
    private readonly approvalService: ApprovalService,
  ) {}

  @Get('bookings/search')
  searchBookings(
    @Query() searchDto: BookingSearchDto,
    @Request() req: ApiRequestJWT,
  ): Promise<{ data: BookingForPaymentDto[]; total: number }> {
    return this.paymentService.searchBookingsForPayment(
      searchDto,
      req.user.organizationId,
    );
  }

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: ApiRequestJWT,
  ): Promise<any> {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    // Check if this is a refund
    if (createPaymentDto.paymentType === PaymentType.REFUND) {
      const canDirectRefund = await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'payment',
        'refund',
      );

      if (canDirectRefund) {
        return this.paymentService.create(
          createPaymentDto,
          userId,
          organizationId,
        );
      }

      const canRequestRefund =
        (await this.permissionCheckService.hasPermission(
          userId,
          organizationId,
          'payment',
          'refund_request',
        )) ||
        (await this.permissionCheckService.hasPermission(
          userId,
          organizationId,
          'payment',
          'create',
        ));

      if (!canRequestRefund) {
        throw new ForbiddenException(
          'You do not have permission to issue or request customer refunds.',
        );
      }

      // Submit approval request for refund
      const approvalRequest = await this.approvalService.createRequest(
        {
          action: ApprovalAction.PAYMENT_REFUND,
          resource: 'payment',
          entityId: createPaymentDto.bookingId || userId,
          entityReference: `Refund of ${createPaymentDto.amount}`,
          title: `Customer Refund Request (${createPaymentDto.amount} via ${createPaymentDto.paymentMethod})`,
          reason: createPaymentDto.notes || 'Customer refund requested',
          payload: createPaymentDto,
          snapshot: {
            amount: createPaymentDto.amount,
            bookingId: createPaymentDto.bookingId,
            paymentMethod: createPaymentDto.paymentMethod,
          },
        },
        userId,
        organizationId,
      );

      return {
        requiresApproval: true,
        message: 'Refund request submitted to manager for approval.',
        approvalRequest,
      };
    }

    // Normal payment creation - requires payment.create
    const canCreate = await this.permissionCheckService.hasPermission(
      userId,
      organizationId,
      'payment',
      'create',
    );

    if (!canCreate) {
      throw new ForbiddenException('Permission denied: create on payment');
    }

    return this.paymentService.create(
      createPaymentDto,
      userId,
      organizationId,
    );
  }

  @Get()
  @RequirePermission('payment', 'read')
  findAll(
    @Query() filterDto: PaymentFilterDto,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentListResponseDto> {
    return this.paymentService.findAll(filterDto, req.user.organizationId);
  }

  @Get('stats')
  getStats(@Request() req: ApiRequestJWT): Promise<PaymentStatsDto> {
    return this.paymentService.getStats(req.user.organizationId);
  }

  @Get('overdue')
  getOverduePayments(
    @Request() req: ApiRequestJWT,
  ): Promise<OverduePaymentDto[]> {
    return this.paymentService.getOverduePayments(req.user.organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeReceipts') includeReceipts: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    const shouldIncludeReceipts = includeReceipts === 'true';
    return this.paymentService.findOne(
      id,
      req.user.organizationId,
      shouldIncludeReceipts,
    );
  }

  @Patch(':id')
  @RequirePermission('payment', 'update')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(
      id,
      updatePaymentDto,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<any> {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const canDirectDelete = await this.permissionCheckService.hasPermission(
      userId,
      organizationId,
      'payment',
      'delete',
    );

    if (canDirectDelete) {
      return this.paymentService.delete(id, organizationId);
    }

    const canRequestDelete = await this.permissionCheckService.hasPermission(
      userId,
      organizationId,
      'payment',
      'delete_request',
    );

    if (!canRequestDelete) {
      throw new ForbiddenException(
        'You do not have permission to delete or request deletion for this payment.',
      );
    }

    const payment = await this.paymentService.findOne(id, organizationId);

    const approvalRequest = await this.approvalService.createRequest(
      {
        action: ApprovalAction.PAYMENT_DELETE,
        resource: 'payment',
        entityId: id,
        entityReference: `Payment #${payment.id?.slice(0, 8)}`,
        title: `Payment Deletion Request (${payment.amount} ${payment.paymentMethod || ''})`,
        reason: 'Payment record void/deletion requested',
        payload: { paymentId: id },
        snapshot: {
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          bookingId: (payment as any).booking?.id || (payment as any).bookingId,
          status: payment.status,
        },
      },
      userId,
      organizationId,
    );

    return {
      requiresApproval: true,
      message: 'Payment deletion request submitted to manager for approval.',
      approvalRequest,
    };
  }

  @Patch(':id/complete')
  markAsCompleted(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsCompleted(
      id,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Patch(':id/fail')
  markAsFailed(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsFailed(
      id,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Patch(':id/archive')
  markAsArchived(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsArchived(
      id,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Get(':id/logs')
  @RequirePermission('payment', 'read')
  getLogs(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '5', 10);
    const offsetNum = offset !== undefined ? parseInt(offset, 10) : undefined;
    return this.paymentService.getLogs(id, req.user.organizationId, pageNum, limitNum, offsetNum);
  }

  @Post(':id/upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ApiRequestJWT,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.paymentService.uploadReceiptFile(
      id,
      file,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Post(':id/upload-receipts')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadReceipts(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: ApiRequestJWT,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    return this.paymentService.uploadReceiptFiles(
      id,
      files,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Get(':id/receipts')
  async getPaymentReceipts(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.paymentService.getPaymentReceiptFiles(
      id,
      req.user.organizationId,
    );
  }

  @Delete(':id/receipts/:fileId')
  async deletePaymentReceipt(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Request() req: ApiRequestJWT,
  ): Promise<{ deleted: boolean }> {
    return this.paymentService.deleteReceiptFile(
      id,
      fileId,
      req.user.organizationId,
    );
  }
}
