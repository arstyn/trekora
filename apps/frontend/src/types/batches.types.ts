import type { IPackages } from "./package.schema";

export interface IBatches {
	id: string;
	startDate: Date;
	endDate: Date;
	totalSeats: number;
	bookedSeats: number;
	status: string;
	packageId: string;
	package?: IPackages;
}
