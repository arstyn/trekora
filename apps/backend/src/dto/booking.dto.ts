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
import { Type } from 'class-transformer';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { PaymentMethod } from 'src/database/entity/booking-payment.entity';
import {
  CreateBookingChecklistDto,
  ChecklistItemResponseDto,
} from './checklist.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingChecklistDto)
  checklistItems?: CreateBookingChecklistDto[];
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
}

export class BookingCustomerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
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
  groupChecklist?: ChecklistItemResponseDto[];
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
    price: number;
    destination: string;
    duration: string;
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
  }[];
  createdAt: Date;
  updatedAt: Date;
}
