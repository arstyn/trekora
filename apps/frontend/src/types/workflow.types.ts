export interface IWorkflowStep {
    id: string;
    workflowId: string;
    label: string;
    description?: string;
    isMandatory: boolean;
    status: "pending" | "completed" | "skipped";
    type: "individual" | "common";
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
    workflow?: IWorkflow;
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
