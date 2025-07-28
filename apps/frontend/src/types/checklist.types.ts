import type { IPackages } from "./package.schema";

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
