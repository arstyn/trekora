export interface IOrganization {
	id: string;
	name?: string;
	domain?: string;
	invoiceColor?: string;
	invoiceSeal?: string | null;
	invoiceFields?: {
		showLogo: boolean;
		showSeal: boolean;
		showBillingTo: boolean;
		showTripDetails: boolean;
		showPaymentHistory: boolean;
		showBalanceDue: boolean;
		showFooter: boolean;
		customTerms?: string;
		layoutOrder?: string[];
		sealAlign?: "left" | "center" | "right";
		sealOffset?: number;
	} | null;
	salarySlipColor?: string;
	salarySlipLogo?: string | null;
	salarySlipSeal?: string | null;
	salarySlipFields?: {
		companyHeaderText?: string;
		companyAddressText?: string;
		customFooterText?: string;
		showLogo?: boolean;
		showSeal?: boolean;
		showBankDetails?: boolean;
		showStatutoryDetails?: boolean;
		showAttendanceSummary?: boolean;
		showNetInWords?: boolean;
		showFooter?: boolean;
		sealAlign?: "left" | "center" | "right";
		layoutOrder?: string[];
		casualLeaveQuota?: number;
		sickLeaveQuota?: number;
		paidLeaveQuota?: number;
	} | null;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}
