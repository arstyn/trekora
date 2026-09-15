import axiosInstance from "@/lib/axios";
import type { IBatches, IBatchLog } from "@/types/batches.types";

export class BatchService {
    static async getBatchById(id: string): Promise<IBatches> {
        const response = await axiosInstance.get<IBatches>(`/batches/${id}`);
        return response.data;
    }

    static async updateBatchStatus(
        id: string,
        status: string,
        reason?: string
    ): Promise<IBatches> {
        const response = await axiosInstance.patch<IBatches>(`/batches/${id}/status`, {
            status,
            reason,
        });
        return response.data;
    }

    static async getBatchLogs(
        id: string,
        page: number = 1,
        limit: number = 5,
        offset?: number,
    ): Promise<{ data: IBatchLog[]; total: number; hasMore: boolean }> {
        const response = await axiosInstance.get<{
            data: IBatchLog[];
            total: number;
            hasMore: boolean;
        }>(`/batches/${id}/logs`, {
            params: { page, limit, ...(offset !== undefined ? { offset } : {}) },
        });
        if (Array.isArray(response.data)) {
            return {
                data: response.data,
                total: (response.data as IBatchLog[]).length,
                hasMore: false,
            };
        }
        return response.data;
    }

    static async markActive(id: string): Promise<IBatches> {
        const response = await axiosInstance.patch<IBatches>(`/batches/${id}/active`);
        return response.data;
    }

    static async markCompleted(id: string): Promise<IBatches> {
        const response = await axiosInstance.patch<IBatches>(`/batches/${id}/complete`);
        return response.data;
    }
}

export default BatchService;
