export type ILeadStatus = "new" | "contacted" | "qualified" | "lost" | "converted";

export interface ILead {
	id: string;
	name: string;
	company?: string;
	email?: string;
	phone?: string;
	status: ILeadStatus;
	createdAt: string;
	updatedAt: string;
	notes?: string;
	preferredPackageId?: string;
	consideredPackageIds?: string[];
	numberOfPassengers: number;
	preferredPackage?: {
		id: string;
		name: string;
		destination: string;
		price: number;
	};
	createdBy?: {
		id: string;
		name?: string;
		email?: string;
		phone?: string;
	};
}
