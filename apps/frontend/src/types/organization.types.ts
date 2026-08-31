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
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}
