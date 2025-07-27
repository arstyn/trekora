import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from 'src/database/entity/booking-payment.entity';

export enum PaymentType {
  ADVANCE = 'advance',
  BALANCE = 'balance',
  PARTIAL = 'partial',
  REFUND = 'refund',
}

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptFilePath?: string;

  @IsOptional()
  paymentDetails?: Record<string, any>;
}

export class BookingSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}

export class BookingForPaymentDto {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  package: {
    id: string;
    name: string;
    destination: string;
  };
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptFilePath?: string;

  @IsOptional()
  paymentDetails?: Record<string, any>;
}

export class PaymentFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @IsOptional()
  @IsDateString()
  toDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'paymentDate';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PaymentStatsDto {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  completedPayments: number;
  completedAmount: number;
  failedPayments: number;
  failedAmount: number;
  refundedPayments: number;
  refundedAmount: number;
}

export class OverduePaymentDto {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  dueAmount: number;
  dueDate: Date;
  daysOverdue: number;
}

export class PaymentResponseDto {
  id: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentReference?: string;
  transactionId?: string;
  paymentDate?: Date;
  notes?: string;
  receiptFilePath?: string;
  paymentDetails?: Record<string, any>;
  
  booking: {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
    
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    
    package: {
      id: string;
      name: string;
      destination: string;
      duration: string;
    };
    
    batch: {
      id: string;
      startDate: Date;
      endDate: Date;
    };
  };
  
  recordedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentListResponseDto {
  data: PaymentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 