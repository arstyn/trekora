import axiosInstance from '@/lib/axios';
import type {
  IApprovalCounts,
  IApprovalFilter,
  IApprovalListResponse,
  IApprovalRequest,
  IRejectApprovalDto,
  IReviewApprovalDto,
} from '@/types/approval.types';

export class ApprovalService {
  private static baseUrl = '/approvals';

  static async getRequests(
    filters?: IApprovalFilter,
  ): Promise<IApprovalListResponse> {
    const response = await axiosInstance.get(this.baseUrl, {
      params: filters,
    });
    return response.data;
  }

  static async getCounts(): Promise<IApprovalCounts> {
    const response = await axiosInstance.get(`${this.baseUrl}/counts`);
    return response.data;
  }

  static async getPendingForEntity(
    entityId: string,
  ): Promise<IApprovalRequest | null> {
    const response = await axiosInstance.get(
      `${this.baseUrl}/entity/${entityId}`,
    );
    return response.data;
  }

  static async getRequestById(id: string): Promise<IApprovalRequest> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async approve(
    id: string,
    data: IReviewApprovalDto,
  ): Promise<IApprovalRequest> {
    const response = await axiosInstance.post(
      `${this.baseUrl}/${id}/approve`,
      data,
    );
    return response.data;
  }

  static async reject(
    id: string,
    data: IRejectApprovalDto,
  ): Promise<IApprovalRequest> {
    const response = await axiosInstance.post(
      `${this.baseUrl}/${id}/reject`,
      data,
    );
    return response.data;
  }

  static async cancel(id: string): Promise<IApprovalRequest> {
    const response = await axiosInstance.post(`${this.baseUrl}/${id}/cancel`);
    return response.data;
  }
}
