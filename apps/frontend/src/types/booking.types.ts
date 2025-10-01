export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentMethod =
	| "bank_transfer"
	| "credit_card"
	| "debit_card"
	| "cash"
	| "upi"
	| "other";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// Checklist item interface for both individual and group checklists
export interface IChecklistItem {
	id: string;
	item: string;
	completed: boolean;
}

// Group checklist item with mandatory flag
export interface IGroupChecklistItem extends IChecklistItem {
	mandatory: boolean;
}

export interface IBookingPassenger {
	id?: string;
	fullName: string;
	age: number;
	email?: string;
	phone?: string;
	emergencyContact: string;
	specialRequirements?: string;
	additionalInfo?: object;
	bookingId?: string;
	booking?: IBooking;
	checklist?: IChecklistItem[]; // Individual passenger checklist
}

export interface IBookingPayment {
	id?: string;
	amount: number;
	paymentMethod: PaymentMethod;
	paymentReference?: string;
	transactionId?: string;
	paymentDate?: string;
	status?: PaymentStatus;
	notes?: string;
	filePath?: string;
}

export interface ICustomer {
	id: string;
	name: string;
	email: string;
	phone: string;
	address?: string;
}

export interface IPackage {
	id: string;
	name: string;
	price: number;
	destination?: string;
	duration?: string;
	description?: string;
}

export interface IBatch {
	id: string;
	startDate: string;
	endDate: string;
	totalSeats: number;
	bookedSeats: number;
	availableSeats?: number;
}

export interface IBooking {
	id: string;
	bookingNumber: string;
	customer: ICustomer;
	package: IPackage;
	batch: IBatch;
	numberOfPassengers: number;
	totalAmount: number;
	advancePaid: number;
	balanceAmount: number;
	status: BookingStatus;
	specialRequests?: string;
	passengers: IBookingPassenger[];
	payments: IBookingPayment[];
	groupChecklist?: IGroupChecklistItem[]; // Group-level checklist items
	createdAt: string;
	updatedAt: string;
}

// For listing bookings (simplified)
export interface IBookingListItem {
	id: string;
	bookingNumber: string;
	customerName: string;
	customerEmail: string;
	packageName: string;
	batchStartDate: string;
	numberOfPassengers: number;
	totalAmount: number;
	advancePaid: number;
	balanceAmount: number;
	status: BookingStatus;
	createdAt: string;
}

// For creating new bookings
export interface ICreateBookingRequest {
	customerId: string;
	packageId: string;
	batchId: string;
	numberOfPassengers: number;
	totalAmount: number;
	specialRequests?: string;
	passengers: IBookingPassenger[];
	initialPayment?: Omit<IBookingPayment, "id" | "status">;
	groupChecklist?: IGroupChecklistItem[]; // Group-level checklist items
}

// For updating bookings
export interface IUpdateBookingRequest {
	status?: BookingStatus;
	totalAmount?: number;
	specialRequests?: string;
	passengers?: IBookingPassenger[];
	groupChecklist?: IGroupChecklistItem[]; // Allow updating group checklist
}

// Dashboard statistics
export interface IBookingStatistics {
	totalBookings: number;
	pendingBookings: number;
	confirmedBookings: number;
	cancelledBookings: number;
	completedBookings: number;
	totalRevenue: number;
	pendingPayments: number;
	totalPassengers: number;
}

// API response types
export interface IBookingListResponse {
	data: IBookingListItem[];
	total: number;
	limit: number;
	offset: number;
}

export interface IBookingResponse {
	data: IBooking;
}

export interface IBookingStatisticsResponse {
	data: IBookingStatistics;
}