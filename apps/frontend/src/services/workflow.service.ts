import axiosInstance from "@/lib/axios";

import type {
    IWorkflow,
    IWorkflowLog,
    IWorkflowStep,
} from "@/types/workflow.types";

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

    async getAssignedSteps(): Promise<IWorkflowStep[]> {
        const response = await axiosInstance.get(`/workflow/steps/assigned`);
        return response.data;
    }

    async getAllSteps(): Promise<IWorkflowStep[]> {
        const response = await axiosInstance.get(`/workflow/steps/all`);
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
