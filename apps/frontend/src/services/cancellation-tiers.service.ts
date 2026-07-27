import axiosInstance from "@/lib/axios";

export interface ICancellationTierTemplateItem {
    timeframe: string;
    amount: number;
    description?: string;
}

export interface ICancellationTierTemplate {
    id: string;
    name: string;
    organizationId: string;
    createdById: string;
    tiers: ICancellationTierTemplateItem[];
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        name: string;
    };
}

export interface ICancellationTierTemplateCreateInput {
    name: string;
    tiers: ICancellationTierTemplateItem[];
}

export interface ICancellationTierTemplateUpdateInput {
    name?: string;
    tiers?: ICancellationTierTemplateItem[];
}

class CancellationTiersService {
    async getTemplates(): Promise<ICancellationTierTemplate[]> {
        const response = await axiosInstance.get("/cancellation-tiers");
        return response.data;
    }

    async getTemplate(id: string): Promise<ICancellationTierTemplate> {
        const response = await axiosInstance.get(`/cancellation-tiers/${id}`);
        return response.data;
    }

    async createTemplate(data: ICancellationTierTemplateCreateInput): Promise<ICancellationTierTemplate> {
        const response = await axiosInstance.post("/cancellation-tiers", data);
        return response.data;
    }

    async updateTemplate(id: string, data: ICancellationTierTemplateUpdateInput): Promise<ICancellationTierTemplate> {
        const response = await axiosInstance.put(`/cancellation-tiers/${id}`, data);
        return response.data;
    }

    async deleteTemplate(id: string): Promise<ICancellationTierTemplate> {
        const response = await axiosInstance.delete(`/cancellation-tiers/${id}`);
        return response.data;
    }
}

export default new CancellationTiersService();
