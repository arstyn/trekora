import axiosInstance from "@/lib/axios";

export interface IWorkflowStep {
    id: string;
    workflowId: string;
    label: string;
    description?: string;
    isMandatory: boolean;
    status: "pending" | "completed" | "skipped";
    sortOrder: number;
    assignedToId?: string;
    assignedTo?: {
        id: string;
        name: string;
        email: string;
    };
    completedById?: string;
    completedBy?: {
        id: string;
        name: string;
        email: string;
    };
    completedAt?: string;
    config?: any;
    createdAt: string;
    updatedAt: string;
}

export interface IWorkflow {
    id: string;
    name: string;
    type: "package" | "booking" | "customer";
    referenceId?: string;
    organizationId: string;
    createdById: string;
    isActive: boolean;
    steps: IWorkflowStep[];
    createdAt: string;
    updatedAt: string;
}

export interface IWorkflowLog {
    id: string;
    workflowId: string;
    stepId?: string;
    step?: IWorkflowStep;
    changedById: string;
    changedBy: {
        id: string;
        name: string;
        email: string;
    };
    action: string;
    previousData?: any;
    newData?: any;
    createdAt: string;
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

    async getHistory(workflowId: string): Promise<IWorkflowLog[]> {
        const response = await axiosInstance.get(
            `/workflow/${workflowId}/history`,
        );
        return response.data;
    }
}

export default new WorkflowService();
