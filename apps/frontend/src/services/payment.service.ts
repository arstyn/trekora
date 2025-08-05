import axiosInstance from "@/lib/axios";
import type {
  PaymentStats,
  OverduePayment,
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentListResponse,
  BookingSearchResponse,
  PaginationParams,
  PaymentFilters,
  FileManager
} from "@/types/payment.types";

export class PaymentService {
  private static baseUrl = "/payments";

  // Get payment statistics for dashboard
  static async getPaymentStats(): Promise<PaymentStats> {
    const response = await axiosInstance.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Get overdue payments
  static async getOverduePayments(): Promise<OverduePayment[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/overdue`);
    return response.data;
  }

  // Search bookings for payment creation
  static async searchBookings(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingSearchResponse> {
    const response = await axiosInstance.get(`${this.baseUrl}/bookings/search`, {
      params,
    });
    return response.data;
  }

  // Get all payments with filtering and pagination
  static async getPayments(
    filters: PaymentFilters & PaginationParams
  ): Promise<PaymentListResponse> {
    const response = await axiosInstance.get(this.baseUrl, {
      params: filters,
    });
    return response.data;
  }

  // Get single payment by ID
  static async getPaymentById(id: string, includeReceipts: boolean = false): Promise<Payment> {
    const params = includeReceipts ? { includeReceipts: 'true' } : {};
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`, { params });
    return response.data;
  }

  // Create new payment
  static async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data;
  }

  // Update payment
  static async updatePayment(id: string, data: UpdatePaymentDto): Promise<Payment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete payment
  static async deletePayment(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  // Mark payment as completed
  static async markPaymentCompleted(id: string): Promise<Payment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/complete`);
    return response.data;
  }

  // Mark payment as failed
  static async markPaymentFailed(id: string): Promise<Payment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/fail`);
    return response.data;
  }

  // Upload single payment receipt (returns FileManager object)
  static async uploadReceipt(id: string, file: File): Promise<FileManager> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `${this.baseUrl}/${id}/upload-receipt`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Upload multiple payment receipts
  static async uploadReceipts(id: string, files: File[]): Promise<FileManager[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post(
      `${this.baseUrl}/${id}/upload-receipts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Get all receipt files for a payment
  static async getPaymentReceipts(id: string): Promise<FileManager[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}/receipts`);
    return response.data;
  }

  // Delete a specific receipt file
  static async deleteReceiptFile(paymentId: string, fileId: string): Promise<{ deleted: boolean }> {
    const response = await axiosInstance.delete(`${this.baseUrl}/${paymentId}/receipts/${fileId}`);
    return response.data;
  }

  // Retry failed payment
  static async retryPayment(id: string): Promise<Payment> {
    // This might be a custom endpoint or just marking as pending again
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, {
      status: "pending",
    });
    return response.data;
  }

  // Archive payment
  static async archivePayment(id: string): Promise<Payment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/archive`);
    return response.data;
  }
}

export default PaymentService; 