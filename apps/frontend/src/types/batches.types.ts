import type { IBooking, ICustomer } from "./booking.types";
import type { IEmployee } from "./employee.types";
import type { IPackages } from "./package.schema";

export interface IBatchCustomer extends ICustomer {}

export interface IBatches {
    id: string;
    startDate: Date;
    endDate: Date;
    totalSeats: number;
    bookedSeats: number;
    blockedSeats: number;
    status: string;
    seatChangeReason?: string;
    packageId: string;
    package?: IPackages;
    coordinators?: IEmployee[];
    customers?: IBatchCustomer[];
    bookings?: IBooking[];
    fillRate?: number;
    batchTiers?: any[];
}

export interface IBatchStats {
    activeBatches: number;
    upcomingBatches: number;
    completedBatches: number;
    archivedBatches: number;
    availableSeats: number;
    fastFilling: number;
}
export interface IBatchLog {
    id: string;
    batchId: string;
    changedById: string;
    changedBy: {
        id: string;
        name: string;
        email: string;
    };
    action: string;
    previousData: any;
    newData: any;
    createdAt: Date;
}
