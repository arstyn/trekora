import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from 'src/database/entity/booking-payment.entity';

export class PassengerPaymentAllocationDto {
  @IsUUID()
  bookingCustomerId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
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
  @IsBoolean()
  isPassengerSplit?: boolean;

  @IsOptional()
  @IsString()
  payerName?: string;

  @IsOptional()
  @IsUUID()
  payerCustomerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerPaymentAllocationDto)
  allocations?: PassengerPaymentAllocationDto[];

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

export class BookingCustomerPaymentSummaryDto {
  id: string; // bookingCustomerId
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  ageCategory: string;
  tierName?: string;
  calculatedShare: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
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
  discountAmount?: number;
  specialOfferDiscount?: number;
  adjustmentAmount?: number;
  customers?: BookingCustomerPaymentSummaryDto[];
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
  @IsBoolean()
  isPassengerSplit?: boolean;

  @IsOptional()
  @IsString()
  payerName?: string;

  @IsOptional()
  @IsUUID()
  payerCustomerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerPaymentAllocationDto)
  allocations?: PassengerPaymentAllocationDto[];

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
  archivedPayments: number;
  archivedAmount: number;
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

export class PaymentAllocationResponseDto {
  id: string;
  bookingCustomerId: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  notes?: string;
}

export class PaymentResponseDto {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentReference?: string;
  transactionId?: string;
  paymentDate?: Date;
  notes?: string;
  receiptFilePath?: string;
  isPassengerSplit: boolean;
  payerName?: string;
  payerCustomerId?: string;
  allocations?: PaymentAllocationResponseDto[];
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
      days: number;
      nights: number;
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

  verifiedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  verifiedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export class PaymentLogResponseDto {
  id: string;
  paymentId: string;
  action: string;
  previousData?: any;
  newData?: any;
  changedBy?: {
    id: string;
    name?: string;
    email?: string;
    profilePhoto?: string;
  } | null;
  createdAt: Date;
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

