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
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { 
  CreatePaymentDto, 
  UpdatePaymentDto, 
  PaymentFilterDto,
  PaymentStatsDto,
  OverduePaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  BookingSearchDto,
  BookingForPaymentDto
} from 'src/dto/payment.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { FileManager } from 'src/database/entity/file-manager.entity';

@UseGuards(AuthGuard)
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(
      createPaymentDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
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
  getOverduePayments(@Request() req: ApiRequestJWT): Promise<OverduePaymentDto[]> {
    return this.paymentService.getOverduePayments(req.user.organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeReceipts') includeReceipts: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    const shouldIncludeReceipts = includeReceipts === 'true';
    return this.paymentService.findOne(id, req.user.organizationId, shouldIncludeReceipts);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(
      id,
      updatePaymentDto,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<void> {
    return this.paymentService.delete(id, req.user.organizationId);
  }

  @Patch(':id/complete')
  markAsCompleted(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsCompleted(id, req.user.organizationId);
  }

  @Patch(':id/fail')
  markAsFailed(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsFailed(id, req.user.organizationId);
  }

  @Patch(':id/archive')
  markAsArchived(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.markAsArchived(id, req.user.organizationId);
  }

  @Post(':id/upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ApiRequestJWT,
  ): Promise<FileManager> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.paymentService.uploadReceiptFile(
      id,
      file,
      req.user.organizationId,
    );
  }

  @Post(':id/upload-receipts')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadReceipts(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: ApiRequestJWT,
  ): Promise<FileManager[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    return this.paymentService.uploadReceiptFiles(
      id,
      files,
      req.user.organizationId,
    );
  }

  @Get(':id/receipts')
  async getPaymentReceipts(
    @Param('id') id: string,
    @Request() req: ApiRequestJWT,
  ): Promise<FileManager[]> {
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