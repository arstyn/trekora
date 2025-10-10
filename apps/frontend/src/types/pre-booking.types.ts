export const PreBookingStatus = {
	PENDING: "pending",
	CUSTOMER_DETAILS_PENDING: "customer_details_pending",
	CUSTOMER_CREATED: "customer_created",
	CONVERTED_TO_BOOKING: "converted_to_booking",
	CANCELLED: "cancelled",
} as const;

export type PreBookingStatus = (typeof PreBookingStatus)[keyof typeof PreBookingStatus];

export interface ConvertLeadToPreBookingDto {
	leadId: string;
	notes?: string;
}

export interface UpdatePreBookingPackageDto {
	packageId: string;
	preferredStartDate: Date | string;
	preferredEndDate?: Date | string;
	numberOfTravelers: number;
	specialRequests?: string;
	estimatedAmount?: number;
}

export interface TemporaryCustomerDetailsDto {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address?: string;
	dateOfBirth?: string;
	notes?: string;
}

export interface UpdateTemporaryCustomerDetailsDto {
	temporaryCustomerDetails: TemporaryCustomerDetailsDto;
	notes?: string;
}

export interface CreateCustomerFromPreBookingDto {
	// Personal Details
	firstName: string;
	lastName: string;
	middleName?: string;
	dateOfBirth: Date | string;
	gender: "male" | "female" | "other" | "prefer_not_to_say";
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
	passportExpiryDate?: Date | string;
	passportIssueDate?: Date | string;
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

export interface ConvertPreBookingToBookingDto {
	batchId: string;
	totalAmount: number;
	initialPayment?: {
		amount: number;
		paymentMethod:
			| "bank_transfer"
			| "credit_card"
			| "debit_card"
			| "cash"
			| "upi"
			| "other";
		paymentDate: Date | string;
		paymentReference?: string;
	};
	customerIds: string[];
	specialRequests?: string;
	additionalDetails?: Record<string, unknown>;
}

export interface UpdatePreBookingDto {
	packageId?: string;
	preferredStartDate?: Date | string;
	preferredEndDate?: Date | string;
	numberOfTravelers?: number;
	specialRequests?: string;
	notes?: string;
	estimatedAmount?: number;
	status?: PreBookingStatus;
	additionalDetails?: Record<string, unknown>;
}

export interface PreBookingResponseDto {
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
	preferredStartDate?: Date | string;
	preferredEndDate?: Date | string;
	numberOfTravelers: number;
	temporaryCustomerDetails?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		address?: string;
		dateOfBirth?: string;
		notes?: string;
	};
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
	additionalDetails?: Record<string, unknown>;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface PreBookingSummaryDto {
	id: string;
	preBookingNumber: string;
	leadName: string;
	packageName?: string;
	numberOfTravelers: number;
	preferredStartDate?: Date | string;
	estimatedAmount?: number;
	status: PreBookingStatus;
	createdAt: Date | string;
}

export interface PreBookingStatsDto {
	totalPreBookings: number;
	pendingPreBookings: number;
	customerDetailsPending: number;
	customerCreated: number;
	convertedToBookings: number;
	cancelledPreBookings: number;
	totalEstimatedRevenue: number;
}
