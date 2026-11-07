import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { ILeaveBalanceSummary } from "@/types/leave.types";
import type { IOrganization } from "@/types/organization.types";
import type {
    IEmployeeSalary,
    IEmployeeSalaryStructure,
    ISalaryListSummary,
} from "@/types/salary.types";

export class SalaryService {
    static async getMySalaries(): Promise<{
        employee: IEmployee | null;
        structure: IEmployeeSalaryStructure | null;
        salaries: IEmployeeSalary[];
        organization: IOrganization | null;
    }> {
        const res = await axiosInstance.get("/salary/my");
        return res.data;
    }

    static async getStructure(
        employeeId: string
    ): Promise<IEmployeeSalaryStructure | null> {
        const res = await axiosInstance.get(`/salary/structure/${employeeId}`);
        return res.data;
    }

    static async upsertStructure(
        employeeId: string,
        payload: Partial<IEmployeeSalaryStructure>
    ): Promise<IEmployeeSalaryStructure> {
        const res = await axiosInstance.put(
            `/salary/structure/${employeeId}`,
            payload
        );
        return res.data;
    }

    static async calculatePreview(params: {
        employeeId: string;
        month: number;
        year: number;
        totalWorkingDays?: number;
    }): Promise<{
        employee: IEmployee;
        structure: IEmployeeSalaryStructure | null;
        leaveSummary: ILeaveBalanceSummary;
        preview: Partial<IEmployeeSalary>;
    }> {
        const res = await axiosInstance.get("/salary/calculate-preview", {
            params,
        });
        return res.data;
    }

    static async getAllSalaries(params: {
        page?: number;
        limit?: number;
        month?: number;
        year?: number;
        status?: string;
        employeeId?: string;
        search?: string;
    }): Promise<{
        data: IEmployeeSalary[];
        summary: ISalaryListSummary;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const res = await axiosInstance.get("/salary", { params });
        return res.data;
    }

    static async getSalaryById(id: string): Promise<IEmployeeSalary> {
        const res = await axiosInstance.get(`/salary/${id}`);
        return res.data;
    }

    static async createSalary(
        payload: Partial<IEmployeeSalary> & {
            saveToStructure?: boolean;
            panNumber?: string;
            uanNumber?: string;
            pfNumber?: string;
            esiNumber?: string;
            bankName?: string;
            accountNumber?: string;
            ifscCode?: string;
        }
    ): Promise<IEmployeeSalary> {
        const res = await axiosInstance.post("/salary", payload);
        return res.data;
    }

    static async updateSalary(
        id: string,
        payload: Partial<IEmployeeSalary>
    ): Promise<IEmployeeSalary> {
        const res = await axiosInstance.patch(`/salary/${id}`, payload);
        return res.data;
    }

    static async deleteSalary(id: string): Promise<void> {
        await axiosInstance.delete(`/salary/${id}`);
    }

    static async sendSalarySlipEmail(id: string): Promise<IEmployeeSalary> {
        const res = await axiosInstance.post(`/salary/${id}/send-email`);
        return res.data;
    }

    static async bulkSendSalarySlipEmails(payload: {
        salaryIds?: string[];
        month?: number;
        year?: number;
    }): Promise<{
        totalTargeted: number;
        sentCount: number;
        failedCount: number;
        errors: { employeeName: string; reason: string }[];
    }> {
        const res = await axiosInstance.post("/salary/bulk-send-email", payload);
        return res.data;
    }
}

