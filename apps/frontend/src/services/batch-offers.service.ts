import axiosInstance from '@/lib/axios';
import type {
  IBatchOffer,
  ICreateBatchOffer,
  IUpdateBatchOffer,
} from '@/types/batch-offers.types';

export class BatchOffersService {
  static async getBatchOffers(batchId: string): Promise<IBatchOffer[]> {
    const response = await axiosInstance.get<IBatchOffer[]>(
      `/batches/${batchId}/offers`
    );
    return response.data;
  }

  static async getActiveBatchOffers(batchId: string): Promise<IBatchOffer[]> {
    const response = await axiosInstance.get<IBatchOffer[]>(
      `/batches/${batchId}/offers/active`
    );
    return response.data;
  }

  static async createBatchOffer(
    batchId: string,
    data: ICreateBatchOffer
  ): Promise<IBatchOffer> {
    const response = await axiosInstance.post<IBatchOffer>(
      `/batches/${batchId}/offers`,
      data
    );
    return response.data;
  }

  static async updateBatchOffer(
    batchId: string,
    offerId: string,
    data: IUpdateBatchOffer
  ): Promise<IBatchOffer> {
    const response = await axiosInstance.patch<IBatchOffer>(
      `/batches/${batchId}/offers/${offerId}`,
      data
    );
    return response.data;
  }

  static async toggleBatchOfferStatus(
    batchId: string,
    offerId: string
  ): Promise<IBatchOffer> {
    const response = await axiosInstance.patch<IBatchOffer>(
      `/batches/${batchId}/offers/${offerId}/toggle`
    );
    return response.data;
  }

  static async deleteBatchOffer(
    batchId: string,
    offerId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/batches/${batchId}/offers/${offerId}`);
    return response.data;
  }
}

export default BatchOffersService;
