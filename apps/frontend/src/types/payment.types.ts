// Const assertions (compatible with erasableSyntaxOnly)
export const PaymentType = {
    ADVANCE: "advance",
    BALANCE: "balance",
    PARTIAL: "partial",
    REFUND: "refund",
} as const;

export const PaymentMethod = {
    BANK_TRANSFER: "bank_transfer",
    CREDIT_CARD: "credit_card",
    DEBIT_CARD: "debit_card",
    CASH: "cash",
    UPI: "upi",
    OTHER: "other",
} as const;

export const PaymentStatus = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
    ARCHIVED: "archived",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Base interfaces
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Package {
    id: string;
    name: string;
    destination?: string;
    duration?: string;
}

export interface Batch {
    id: string;
    startDate: string;
    endDate: string;
}

export interface Booking {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
    customer: Customer;
    package: Package;
    batch?: Batch;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

// File Manager types
export interface FileManager {
    id: string;
    filename: string;
    relatedId: string;
    relatedType: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

// Payment interface
export interface Payment {
    id: string;
    paymentNumber: string;
    amount: number;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    paymentReference?: string;
    transactionId?: string;
    paymentDate: string;
    notes?: string;
    receiptFilePath?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentDetails?: Record<string, any>;
    booking: Booking;
    recordedBy: User;
    receiptFiles?: FileManager[]; // New field for file manager integration
    createdAt: string;
    updatedAt: string;
}

// Payment statistics
export interface PaymentStats {
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

// Overdue payment
export interface OverduePayment {
    bookingId: string;
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    packageName: string;
    dueAmount: number;
    dueDate: string;
    daysOverdue: number;
}

// Booking for search
export interface BookingForPayment {
    id: string;
    bookingNumber: string;
    customer: Customer;
    package: Package;
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
}

// API response types
export interface BookingSearchResponse {
    data: BookingForPayment[];
    total: number;
}

export interface PaymentListResponse {
    data: Payment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// DTOs
export interface CreatePaymentDto {
    bookingId: string;
    amount: number;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    transactionId?: string;
    paymentDate: string;
    notes?: string;
    receiptFilePath?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentDetails?: Record<string, any>;
}

export interface UpdatePaymentDto {
    amount?: number;
    paymentType?: PaymentType;
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
    paymentReference?: string;
    transactionId?: string;
    paymentDate?: string;
    notes?: string;
    receiptFilePath?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentDetails?: Record<string, any>;
}

// Filter and pagination types
export interface PaymentFilters {
    search?: string;
    status?: PaymentStatus;
    paymentType?: PaymentType;
    paymentMethod?: PaymentMethod;
    fromDate?: string;
    toDate?: string;
    sortBy?: "paymentDate" | "amount" | "status" | "createdAt";
    sortOrder?: "ASC" | "DESC";
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

// Form data interfaces
export interface AddPaymentFormData {
    bookingId: string;
    amount: string;
    paymentType: string;
    paymentMethod: string;
    paymentReference: string;
    paymentDate: string;
    paymentScreenshot: File | null;
    notes: string;
}

export interface EditPaymentFormData extends Omit<
    AddPaymentFormData,
    "bookingId"
> {
    status: string;
    transactionId: string;
}
