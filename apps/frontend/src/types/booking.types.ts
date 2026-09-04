import type { IWorkflow } from "./workflow.types";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "on_hold";

export type PaymentMethod =
    | "bank_transfer"
    | "credit_card"
    | "debit_card"
    | "cash"
    | "upi"
    | "other";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface IBookingPaymentAllocation {
    id?: string;
    bookingCustomerId?: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    amount: number;
    notes?: string;
}

export type PaymentType = "advance" | "balance" | "partial" | "refund";

export interface IBookingPayment {
    id?: string;
    paymentNumber?: string;
    amount: number;
    paymentType?: PaymentType;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    transactionId?: string;
    paymentDate?: string;
    status?: PaymentStatus;
    notes?: string;
    filePath?: string;
    receiptFilePath?: string;
    isPassengerSplit?: boolean;
    payerName?: string;
    payerCustomerId?: string;
    allocations?: IBookingPaymentAllocation[];
}

export interface ICustomer {
    id?: string;
    bookingCustomerId?: string;
    firstName: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    alternativePhone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
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
    isBlacklisted?: boolean;
    blacklistedReason?: string;
    blacklistedAt?: string;
    blacklistedById?: string;
    blacklistedBy?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    packageTierId?: string;
    packageTierName?: string;
    ageCategory?: 'adult' | 'child' | 'infant';
    calculatedShare?: number;
    paidAmount?: number;
    balanceAmount?: number;
    paymentStatus?: 'paid' | 'partial' | 'unpaid';
    status?: 'active' | 'cancelled';
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICancelBookingRequest {
    customerIds?: string[];
    issueRefund?: boolean;
    refundAmount?: number;
    refundMethod?: PaymentMethod;
    reason?: string;
    notes?: string;
}


import type { PackageTier, IPaymentStructure, PackageLocation } from "./package.schema";

export interface IPackage {
    id: string;
    name: string;
    destination?: string;
    duration?: string;
    description?: string;
    thumbnail?: string;
    packageSetup?: "normal" | "advanced";
    maxDiscountType?: "amount" | "percentage";
    maxDiscountScope?: "group" | "passenger";
    maxDiscountValue?: number;
    maxDiscountPercentage?: number;
    packageTiers?: PackageTier[];
    transportation?: any[];
    paymentStructure?: IPaymentStructure[];
    packageLocation?: PackageLocation;
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
    batchOfferId?: string | null;
    batchOffer?: {
        id: string;
        name: string;
        discountType: 'percentage' | 'flat';
        discountMode?: 'fixed' | 'range';
        discountValue: number;
        minDiscountValue?: number | null;
        maxDiscountValue?: number | null;
        discountScope: 'passenger' | 'booking';
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
    agentCommissionType?: "percentage" | "fixed";
    agentCommissionValue?: number;
    agentCommissionAmount?: number;
    agentPayoutStatus?: "pending" | "paid" | "cancelled";
    payments: IBookingPayment[];
    documents?: any[]; // Added to support document management
    currentWorkflowId?: string;
    currentWorkflow?: IWorkflow; // Added to support workflow steps display in frontend
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
    batchOfferId?: string | null;
    numberOfCustomers: number;
    totalAmount: number;
    discountAmount?: number;
    specialOfferDiscount?: number;
    adjustmentAmount?: number;
    advancePaid: number;
    balanceAmount: number;
    status: BookingStatus;
    createdAt: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    } | null;
    agentId?: string;
    agentName?: string;
    agentCommissionAmount?: number;
    agentPayoutStatus?: "pending" | "paid" | "cancelled";
}

// For creating new bookings
export interface ICreateBookingRequest {
    customerId: string;
    packageId: string;
    packageTierId?: string;
    batchId: string;
    batchOfferId?: string;
    customerIds: string[];
    totalAmount: number;
    discountAmount?: number;
    specialOfferDiscount?: number;
    adjustmentAmount?: number;
    specialRequests?: string;
    initialPayment?: Omit<IBookingPayment, "id" | "status">;
    isCommonTier?: boolean;
    customerSelections?: {
        customerId: string;
        tierId: string;
        ageCategory: 'adult' | 'child' | 'infant';
    }[];
    paymentStructureId?: string;
    isPaymentOverridden?: boolean;
    paymentOverrideReason?: string;
    batchBlockId?: string;
    overrideCapacityLimit?: boolean;
    agentId?: string;
    agentCommissionType?: "percentage" | "fixed";
    agentCommissionValue?: number;
    agentCommissionAmount?: number;
    agentPayoutStatus?: "pending" | "paid" | "cancelled";
}

// For updating bookings
export interface IUpdateBookingRequest {
    status?: BookingStatus;
    totalAmount?: number;
    specialRequests?: string;
    customerIds?: string[];
    agentId?: string;
    agentCommissionType?: "percentage" | "fixed";
    agentCommissionValue?: number;
    agentCommissionAmount?: number;
    agentPayoutStatus?: "pending" | "paid" | "cancelled";
    additionalDetails?: Record<string, any>;
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

export interface IBookingLog {
    id: string;
    bookingId: string;
    action: string;
    previousData: any;
    newData: any;
    createdAt: string;
    changedBy: {
        id: string;
        name: string;
        email: string;
    };
}
