export type ILeadStatus = "new" | "contacted" | "qualified" | "lost" | "converted";

export interface ILead {
	id: string;
	name: string;
	company: string;
	email: string;
	phone: string;
	status: ILeadStatus;
	createdAt: string;
	updatedAt: string;
	notes?: string;
}
