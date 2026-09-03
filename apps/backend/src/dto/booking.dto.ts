import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from 'src/database/entity/booking-payment.entity';
import { AgentPayoutStatus, BookingStatus } from 'src/database/entity/booking.entity';
import { CommissionType } from 'src/database/entity/agent.entity';

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
  allocations?: any[];
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
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustmentAmount?: number;

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

  @IsOptional()
  @IsUUID()
  batchOfferId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialOfferDiscount?: number;

  @IsOptional()
  @IsUUID()
  batchBlockId?: string;

  @IsOptional()
  @IsBoolean()
  overrideCapacityLimit?: boolean;

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsOptional()
  @IsEnum(CommissionType)
  agentCommissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agentCommissionValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agentCommissionAmount?: number;

  @IsOptional()
  @IsEnum(AgentPayoutStatus)
  agentPayoutStatus?: AgentPayoutStatus;
}

export class AddTravelersDto {
  @IsArray()
  @IsUUID(4, { each: true })
  customerIds: string[];
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
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialOfferDiscount?: number;

  @IsOptional()
  @IsUUID()
  batchOfferId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustmentAmount?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  additionalDetails?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsOptional()
  @IsEnum(CommissionType)
  agentCommissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agentCommissionValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agentCommissionAmount?: number;

  @IsOptional()
  @IsEnum(AgentPayoutStatus)
  agentPayoutStatus?: AgentPayoutStatus;
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
  batchId?: string;
  batchStartDate: Date;
  batchOfferId?: string | null;
  numberOfCustomers: number;
  totalAmount: number;
  discountAmount?: number;
  specialOfferDiscount?: number;
  adjustmentAmount?: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  createdAt: Date;
  createdBy?: CreatedByDto | null;
  agentId?: string;
  agentName?: string;
  agentCommissionAmount?: number;
  agentPayoutStatus?: AgentPayoutStatus;
}

export class BookingCustomerResponseDto {
  id: string; // customerId
  bookingCustomerId?: string;
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
  packageTierId?: string;
  packageTierName?: string;
  ageCategory?: 'adult' | 'child' | 'infant';
  calculatedShare?: number;
  paidAmount?: number;
  balanceAmount?: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
}

export class BookingPaymentAllocationResponseDto {
  id: string;
  bookingCustomerId: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  notes?: string;
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
  batchOffer?: {
    id: string;
    name: string;
    discountType: string;
    discountMode?: string;
    discountValue: number;
    minDiscountValue?: number | null;
    maxDiscountValue?: number | null;
    discountScope: string;
  } | null;
  numberOfCustomers: number;
  totalAmount: number;
  discountAmount?: number;
  specialOfferDiscount?: number;
  adjustmentAmount?: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  specialRequests?: string;
  agentId?: string;
  agent?: {
    id: string;
    name: string;
    agencyName?: string;
    email?: string;
    phone?: string;
  } | null;
  agentCommissionType?: CommissionType;
  agentCommissionValue?: number;
  agentCommissionAmount?: number;
  agentPayoutStatus?: AgentPayoutStatus;

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
    isPassengerSplit?: boolean;
    payerName?: string;
    payerCustomerId?: string;
    allocations?: BookingPaymentAllocationResponseDto[];
  }[];
  currentWorkflowId?: string;
  currentWorkflow?: any;
  createdAt: Date;
  updatedAt: Date;
}

