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
  PaymentFilters
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
  static async getPaymentById(id: string): Promise<Payment> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
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

  // Upload payment receipt
  static async uploadReceipt(id: string, file: File): Promise<Payment> {
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
    // This might be a custom status update
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, {
      status: "archived",
    });
    return response.data;
  }
}

export default PaymentService; 