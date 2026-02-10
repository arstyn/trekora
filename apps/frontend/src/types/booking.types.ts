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

// Remove IBookingPassenger as we're using customers directly

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
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phone: string;
	alternativePhone?: string;
	dateOfBirth: string;
	gender: string;
	address: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	emergencyContactRelation?: string;
	specialRequests?: string;
	medicalConditions?: string;
	dietaryRestrictions?: string;
	passportNumber?: string;
	passportExpiryDate?: string;
	passportIssueDate?: string;
	passportCountry?: string;
	voterId?: string;
	aadhaarId?: string;
	profilePhoto?: string;
	checklist?: Record<string, boolean>;
	createdAt?: string;
	updatedAt?: string;
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
	customers: ICustomer[];
	primaryCustomer: ICustomer;
	package: IPackage;
	batch: IBatch;
	numberOfCustomers: number;
	totalAmount: number;
	advancePaid: number;
	balanceAmount: number;
	status: BookingStatus;
	specialRequests?: string;
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
	numberOfCustomers: number;
	totalAmount: number;
	advancePaid: number;
	balanceAmount: number;
	status: BookingStatus;
	createdAt: string;
	createdBy?: {
		id: string;
		name: string;
		email: string;
	} | null;
}

// For creating new bookings
export interface ICreateBookingRequest {
	customerId: string;
	packageId: string;
	batchId: string;
	customerIds: string[];
	totalAmount: number;
	specialRequests?: string;
	initialPayment?: Omit<IBookingPayment, "id" | "status">;
	checklistItems?: {
		item: string;
		completed?: boolean;
		mandatory?: boolean;
		type?: "individual" | "package" | "user";
		customerId?: string;
		notes?: string;
		sortOrder?: number;
	}[];
}

// For updating bookings
export interface IUpdateBookingRequest {
	status?: BookingStatus;
	totalAmount?: number;
	specialRequests?: string;
	customerIds?: string[];
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
	totalCustomers: number;
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
