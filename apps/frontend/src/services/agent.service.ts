import axiosInstance from "@/lib/axios";
import type {
  AgentPayoutStatus,
  AgentStatus,
  IAgent,
  IAgentDetailResponse,
  ICreateAgentRequest,
  IUpdateAgentRequest,
} from "@/types/agent.types";

export class AgentService {
  private static baseUrl = "/agents";

  static async getAllAgents(params?: {
    search?: string;
    status?: AgentStatus | "all";
  }): Promise<IAgent[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    const response = await axiosInstance.get(
      `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  }

  static async getAgentById(id: string): Promise<IAgentDetailResponse> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async createAgent(data: ICreateAgentRequest): Promise<IAgent> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data;
  }

  static async updateAgent(
    id: string,
    data: IUpdateAgentRequest
  ): Promise<IAgent> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  static async deleteAgent(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  static async updatePayoutStatus(
    bookingId: string,
    payoutStatus: AgentPayoutStatus
  ): Promise<any> {
    const response = await axiosInstance.patch(
      `${this.baseUrl}/payout/${bookingId}`,
      { payoutStatus }
    );
    return response.data;
  }
}

export default AgentService;
