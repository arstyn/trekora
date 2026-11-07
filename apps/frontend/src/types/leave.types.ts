import type { IEmployee } from "./employee.types";

export type LeaveType = "casual" | "sick" | "paid" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface IEmployeeLeave {
    id: string;
    leaveNumber: string;
    employeeId: string;
    employee?: IEmployee;
    organizationId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    totalDays: number;
    reason: string;
    status: LeaveStatus;
    reviewedById?: string | null;
    reviewedBy?: {
        id: string;
        name: string;
        email: string;
    } | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
    createdById?: string | null;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface ILeaveQuotaItem {
    quota: number;
    used: number;
    pending: number;
    remaining: number;
}

export interface ILeaveBalanceSummary {
    year: number;
    month: number | null;
    balances: {
        casual: ILeaveQuotaItem;
        sick: ILeaveQuotaItem;
        paid: ILeaveQuotaItem;
        unpaid: ILeaveQuotaItem;
    };
    monthlySummary: {
        paidLeaves: number;
        unpaidLeaves: number;
        totalLeaves: number;
    };
}

