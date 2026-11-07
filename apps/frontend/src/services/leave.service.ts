import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type {
    IEmployeeLeave,
    ILeaveBalanceSummary,
    LeaveStatus,
    LeaveType,
} from "@/types/leave.types";

export class LeaveService {
    static async getMyLeaves(year?: number): Promise<{
        employee: IEmployee | null;
        leaves: IEmployeeLeave[];
        balance: ILeaveBalanceSummary | null;
    }> {
        const res = await axiosInstance.get("/leave/my", {
            params: year ? { year } : undefined,
        });
        return res.data;
    }

    static async getEmployeeLeaveBalance(
        employeeId: string,
        year?: number,
        month?: number
    ): Promise<ILeaveBalanceSummary> {
        const res = await axiosInstance.get(`/leave/balance/${employeeId}`, {
            params: { year, month },
        });
        return res.data;
    }

    static async getAllLeaves(params: {
        page?: number;
        limit?: number;
        status?: string;
        leaveType?: string;
        employeeId?: string;
        month?: number;
        year?: number;
        search?: string;
    }): Promise<{
        data: IEmployeeLeave[];
        summary: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
        };
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const res = await axiosInstance.get("/leave", { params });
        return res.data;
    }

    static async getLeaveById(id: string): Promise<IEmployeeLeave> {
        const res = await axiosInstance.get(`/leave/${id}`);
        return res.data;
    }

    static async createLeave(payload: {
        employeeId?: string;
        leaveType: LeaveType;
        startDate: string;
        endDate: string;
        isHalfDay?: boolean;
        reason: string;
        status?: LeaveStatus;
    }): Promise<IEmployeeLeave> {
        const res = await axiosInstance.post("/leave", payload);
        return res.data;
    }

    static async updateLeaveStatus(
        id: string,
        payload: { status: LeaveStatus; reviewNote?: string }
    ): Promise<IEmployeeLeave> {
        const res = await axiosInstance.patch(`/leave/${id}/status`, payload);
        return res.data;
    }

    static async updateLeave(
        id: string,
        payload: Partial<{
            leaveType: LeaveType;
            startDate: string;
            endDate: string;
            isHalfDay: boolean;
            reason: string;
        }>
    ): Promise<IEmployeeLeave> {
        const res = await axiosInstance.patch(`/leave/${id}`, payload);
        return res.data;
    }

    static async deleteLeave(id: string): Promise<void> {
        await axiosInstance.delete(`/leave/${id}`);
    }
}

