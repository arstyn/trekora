import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { PaymentMethod } from 'src/database/entity/booking-payment.entity';

export class CreatePassengerDto {
  @IsString()
  fullName: string;

  @IsNumber()
  @Min(1)
  age: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  emergencyContact: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  additionalInfo?: Record<string, any>;
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

  @IsNumber()
  @Min(1)
  numberOfPassengers: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  additionalDetails?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePassengerDto)
  passengers: CreatePassengerDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  initialPayment?: CreatePaymentDto;
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
  @IsNumber()
  @Min(1)
  numberOfPassengers?: number;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePassengerDto)
  passengers?: CreatePassengerDto[];
}

export class BookingStatsDto {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  totalPassengers: number;
}

export class BookingSummaryDto {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  batchStartDate: Date;
  numberOfPassengers: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  createdAt: Date;
}

export class BookingResponseDto {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    name: string;
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
  numberOfPassengers: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  specialRequests?: string;
  passengers: {
    id: string;
    fullName: string;
    age: number;
    email?: string;
    phone?: string;
    emergencyContact: string;
    specialRequirements?: string;
  }[];
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