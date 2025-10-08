import type { IPackages } from "./package.schema";
import type { ICustomer } from "./booking.types";

export interface ICheckList {
	id: string;
	task: string;
	description: string;
	category: "documents" | "booking" | "preparation" | "communication";
	dueDate: string;
	completed: boolean;
	packageId?: string;
	package?: IPackages;
}

export interface IBatchChecklist {
	id: string;
	item: string;
	completed: boolean;
	mandatory: boolean;
	type: "group" | "individual" | "package";
	bookingId?: string;
	batchId?: string;
	customerId?: string;
	customer?: ICustomer;
	sortOrder: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}
