import axiosInstance from "@/lib/axios";

export interface IPaymentMilestoneTemplateItem {
    name: string;
    amount: number;
    description?: string;
    dueDate: string;
    order: number;
}

export interface IPaymentStructureTemplate {
    id: string;
    name: string;
    organizationId: string;
    createdById: string;
    milestones: IPaymentMilestoneTemplateItem[];
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        name: string;
    };
}

export interface IPaymentStructureTemplateCreateInput {
    name: string;
    milestones: IPaymentMilestoneTemplateItem[];
}

export interface IPaymentStructureTemplateUpdateInput {
    name?: string;
    milestones?: IPaymentMilestoneTemplateItem[];
}

class PaymentStructuresService {
    async getTemplates(): Promise<IPaymentStructureTemplate[]> {
        const response = await axiosInstance.get("/payment-structures");
        return response.data;
    }

    async getTemplate(id: string): Promise<IPaymentStructureTemplate> {
        const response = await axiosInstance.get(`/payment-structures/${id}`);
        return response.data;
    }

    async createTemplate(data: IPaymentStructureTemplateCreateInput): Promise<IPaymentStructureTemplate> {
        const response = await axiosInstance.post("/payment-structures", data);
        return response.data;
    }

    async updateTemplate(id: string, data: IPaymentStructureTemplateUpdateInput): Promise<IPaymentStructureTemplate> {
        const response = await axiosInstance.put(`/payment-structures/${id}`, data);
        return response.data;
    }

    async deleteTemplate(id: string): Promise<IPaymentStructureTemplate> {
        const response = await axiosInstance.delete(`/payment-structures/${id}`);
        return response.data;
    }
}

export default new PaymentStructuresService();
