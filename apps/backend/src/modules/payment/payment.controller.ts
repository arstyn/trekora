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
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

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
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(id, req.user.organizationId);
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

  @Post(':id/upload-receipt')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/payment-receipts';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const paymentId = req.params.id;
          const timestamp = Date.now();
          const ext = extname(file.originalname);
          cb(null, `payment-${paymentId}-${timestamp}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (mimeType && extName) {
          return cb(null, true);
        } else {
          cb(new BadRequestException('Only images (JPEG, JPG, PNG) and PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadReceipt(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ApiRequestJWT,
  ): Promise<PaymentResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const updateDto: UpdatePaymentDto = {
      receiptFilePath: file.path,
    };

    return this.paymentService.update(id, updateDto, req.user.organizationId);
  }
} 