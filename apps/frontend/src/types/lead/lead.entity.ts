import type { IPackages } from "../package.schema";

export type ILeadStatus = "new" | "contacted" | "qualified" | "lost" | "converted";

export interface ILead {
	id: string;
	name: string;
	leadType: "individual" | "company";
	company?: string;
	companyWebsite?: string;
	companyIndustry?: string;
	contactDesignation?: string;
	companySize?: string;
	email?: string;
	phone?: string;
	status: ILeadStatus;
	createdAt: string;
	updatedAt: string;
	notes?: string;
	preferredPackageId?: string;
	consideredPackageIds?: string[];
	isCustomPackage?: boolean;
	customPackageName?: string;
	customPackageDestination?: string;
	customPackageDays?: number;
	customPackageNights?: number;
	customPackagePrice?: number;
	customPackageDescription?: string;
	budget?: number;
	numberOfPassengers: number;
	preferredPackage?: IPackages;
	createdBy?: {
		id: string;
		name?: string;
		email?: string;
		phone?: string;
	};
}
