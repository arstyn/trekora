import type { ICustomer } from "./booking.types";
import type { IEmployee } from "./employee.types";
import type { IPackages } from "./package.schema";

export interface IBatchCustomer extends ICustomer {
	checklistStats?: {
		total: number;
		completed: number;
	};
}

export interface IBatches {
	id: string;
	startDate: Date;
	endDate: Date;
	totalSeats: number;
	bookedSeats: number;
	status: string;
	packageId: string;
	package?: IPackages;
	coordinators?: IEmployee[];
	customers?: IBatchCustomer[];
	fillRate?: number;
}

export interface IBatchStats {
	activeBatches: number;
	upcomingBatches: number;
	availableSeats: number;
	fastFilling: number;
}
