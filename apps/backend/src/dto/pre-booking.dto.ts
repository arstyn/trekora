import { PreBookingStatus } from 'src/database/entity/pre-booking.entity';
import { Gender } from 'src/database/entity/customer.entity';
import { PaymentMethod } from 'src/database/entity/booking-payment.entity';

// DTO for converting a lead to pre-booking
export class ConvertLeadToPreBookingDto {
  leadId: string;
  notes?: string;
}

// DTO for updating pre-booking with package and date selection
export class UpdatePreBookingPackageDto {
  packageId: string;
  preferredStartDate: Date;
  preferredEndDate?: Date;
  numberOfTravelers: number;
  specialRequests?: string;
  estimatedAmount?: number;
}

// DTO for temporary customer details
export class TemporaryCustomerDetailsDto {
  firstName?: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
}

// DTO for updating temporary customer details
export class UpdateTemporaryCustomerDetailsDto {
  temporaryCustomerDetails: TemporaryCustomerDetailsDto;
  notes?: string;
}

// DTO for creating a full customer from pre-booking
export class CreateCustomerFromPreBookingDto {
  // Personal Details
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: Gender;
  profilePhoto?: string;

  // Contact Information
  email: string;
  phone: string;
  alternativePhone?: string;
  address: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Passport Details
  passportNumber?: string;
  passportExpiryDate?: Date;
  passportIssueDate?: Date;
  passportCountry?: string;
  passportPhotos?: string[];

  // ID Documents
  voterId?: string;
  voterIdPhotos?: string[];
  aadhaarId?: string;
  aadhaarIdPhotos?: string[];

  // Travel Preferences
  dietaryRestrictions?: string;
  medicalConditions?: string;
  specialRequests?: string;

  // Additional Information
  notes?: string;
}

// DTO for converting pre-booking to booking
export class ConvertPreBookingToBookingDto {
  batchId: string;
  totalAmount: number;
  initialPayment?: {
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    paymentReference?: string;
  };
  customerIds: string[]; // Array of customer IDs (primary + additional travelers)
  specialRequests?: string;
  additionalDetails?: Record<string, any>;
}

// DTO for general pre-booking update
export class UpdatePreBookingDto {
  packageId?: string;
  preferredStartDate?: Date;
  preferredEndDate?: Date;
  numberOfTravelers?: number;
  specialRequests?: string;
  notes?: string;
  estimatedAmount?: number;
  status?: PreBookingStatus;
  additionalDetails?: Record<string, any>;
}

// Response DTOs
export class PreBookingResponseDto {
  id: string;
  preBookingNumber: string;
  lead?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  package?: {
    id: string;
    name: string;
    destination: string;
    duration: string;
    price: number;
  };
  preferredStartDate?: Date;
  preferredEndDate?: Date;
  numberOfTravelers: number;
  temporaryCustomerDetails?: TemporaryCustomerDetailsDto;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  booking?: {
    id: string;
    bookingNumber: string;
  };
  status: PreBookingStatus;
  specialRequests?: string;
  notes?: string;
  estimatedAmount?: number;
  additionalDetails?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class PreBookingSummaryDto {
  id: string;
  preBookingNumber: string;
  leadName: string;
  packageName?: string;
  numberOfTravelers: number;
  preferredStartDate?: Date;
  estimatedAmount?: number;
  status: PreBookingStatus;
  createdAt: Date;
}

export class PreBookingStatsDto {
  totalPreBookings: number;
  pendingPreBookings: number;
  customerDetailsPending: number;
  customerCreated: number;
  convertedToBookings: number;
  cancelledPreBookings: number;
  totalEstimatedRevenue: number;
}
