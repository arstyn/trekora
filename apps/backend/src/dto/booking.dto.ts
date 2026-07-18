import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from 'src/database/entity/booking-payment.entity';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { IsBoolean } from 'class-validator';

export class CustomerSelectionDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  tierId: string;

  @IsEnum(['adult', 'child', 'infant'])
  ageCategory: 'adult' | 'child' | 'infant';
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptFilePath?: string;
}

export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  packageId: string;

  @IsUUID()
  batchId: string;

  @IsOptional()
  @IsUUID()
  packageTierId?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  customerIds: string[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  additionalDetails?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  initialPayment?: CreatePaymentDto;

  @IsOptional()
  @IsBoolean()
  isCommonTier?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerSelectionDto)
  customerSelections?: CustomerSelectionDto[];

  @IsOptional()
  @IsUUID()
  paymentStructureId?: string;

  @IsOptional()
  @IsBoolean()
  isPaymentOverridden?: boolean;

  @IsOptional()
  @IsString()
  paymentOverrideReason?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  customerIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  additionalDetails?: Record<string, any>;
}

export class BookingStatsDto {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  totalCustomers: number;
}

export class CreatedByDto {
  id: string;
  name: string;
  email: string;
}

export class BookingSummaryDto {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  batchStartDate: Date;
  numberOfCustomers: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  createdAt: Date;
  createdBy?: CreatedByDto | null;
}

export class BookingCustomerResponseDto {
  id: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  specialRequests?: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
}

export class BookingResponseDto {
  id: string;
  bookingNumber: string;
  customers: BookingCustomerResponseDto[];
  primaryCustomer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
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
    totalSeats: number;
    bookedSeats: number;
  };
  numberOfCustomers: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  specialRequests?: string;

  payments: {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: string;
    paymentDate?: Date;
    paymentReference?: string;
    transactionId?: string;
    notes?: string;
    receiptFilePath?: string;
  }[];
  currentWorkflowId?: string;
  currentWorkflow?: any;
  createdAt: Date;
  updatedAt: Date;
}
