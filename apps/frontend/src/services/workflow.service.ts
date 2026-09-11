import axiosInstance from "@/lib/axios";

import type {
    IWorkflow,
    IWorkflowLog,
    IWorkflowStep,
} from "@/types/workflow.types";

export interface IWorkflowStepFilter {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    workflowId?: string;
    assignedToId?: string;
    isMandatory?: string;
    tab?: string;
}

export interface IPaginatedWorkflowSteps {
    data: IWorkflowStep[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class WorkflowService {
    async getWorkflow(id: string): Promise<IWorkflow> {
        const response = await axiosInstance.get(`/workflow/${id}`);
        return response.data;
    }

    async addStep(
        workflowId: string,
        data: Partial<IWorkflowStep>,
    ): Promise<IWorkflowStep> {
        const response = await axiosInstance.post(
            `/workflow/${workflowId}/steps`,
            data,
        );
        return response.data;
    }

    async updateStep(
        stepId: string,
        data: Partial<IWorkflowStep>,
    ): Promise<IWorkflowStep> {
        const response = await axiosInstance.patch(
            `/workflow/steps/${stepId}`,
            data,
        );
        return response.data;
    }

    async deleteStep(stepId: string): Promise<void> {
        await axiosInstance.delete(`/workflow/steps/${stepId}`);
    }

    async getAssignedSteps(
        params?: IWorkflowStepFilter,
    ): Promise<IPaginatedWorkflowSteps | IWorkflowStep[]> {
        const response = await axiosInstance.get(`/workflow/steps/assigned`, {
            params,
        });
        return response.data;
    }

    async getAllSteps(
        params?: IWorkflowStepFilter,
    ): Promise<IPaginatedWorkflowSteps | IWorkflowStep[]> {
        const response = await axiosInstance.get(`/workflow/steps/all`, {
            params,
        });
        return response.data;
    }

    async getStepCounts(): Promise<{
        myTasks: number;
        unassigned: number;
        allTasks: number;
    }> {
        const response = await axiosInstance.get(`/workflow/steps/counts`);
        return response.data;
    }

    async getWorkflowsList(): Promise<{ id: string; name: string }[]> {
        const response = await axiosInstance.get(`/workflow/workflows/list`);
        return response.data;
    }

    async getSummary(): Promise<{
        total: number;
        pending: number;
        completed: number;
        skipped: number;
        byAssignee: { name: string; total: number; completed: number }[];
        byType: { booking: number; package: number; customer: number };
    }> {
        const response = await axiosInstance.get("/workflow/summary");
        return response.data;
    }

    async getHistory(workflowId: string): Promise<IWorkflowLog[]> {
        const response = await axiosInstance.get(
            `/workflow/${workflowId}/history`,
        );
        return response.data;
    }

    async getStepHistory(stepId: string): Promise<IWorkflowLog[]> {
        const response = await axiosInstance.get(
            `/workflow/steps/${stepId}/history`,
        );
        return response.data;
    }
}

export default new WorkflowService();
