import axiosInstance from "@/lib/axios";
import type {
    IBooking,
    IBookingListItem,
    IBookingStatistics,
    ICreateBookingRequest,
    IUpdateBookingRequest,
    IBookingPayment,
    BookingStatus,
    IBookingLog,
} from "@/types/booking.types";
import type { IBatches } from "@/types/batches.types";

/* -------------------- Booking Service -------------------- */
export class BookingService {
    private static baseUrl = "/bookings";

    /* -------- Booking APIs -------- */
    static async getAllBookings(params?: {
        status?: BookingStatus | "all";
        limit?: number;
        offset?: number;
    }): Promise<IBookingListItem[]> {
        const queryParams = new URLSearchParams();

        if (params?.status && params.status !== "all") {
            queryParams.append("status", params.status);
        }
        if (params?.limit) {
            queryParams.append("limit", params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append("offset", params.offset.toString());
        }

        const response = await axiosInstance.get(
            `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
        );
        return response.data;
    }

    static async getBookingById(id: string): Promise<IBooking> {
        const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    static async getBookingLogs(id: string): Promise<IBookingLog[]> {
        const response = await axiosInstance.get(`${this.baseUrl}/${id}/logs`);
        return response.data;
    }

    static async createBooking(
        bookingData: ICreateBookingRequest,
    ): Promise<IBooking> {
        const response = await axiosInstance.post(this.baseUrl, bookingData);
        return response.data;
    }

    static async updateBooking(
        id: string,
        updateData: IUpdateBookingRequest,
    ): Promise<IBooking> {
        const response = await axiosInstance.patch(
            `${this.baseUrl}/${id}`,
            updateData,
        );
        return response.data;
    }

    static async deleteBooking(id: string): Promise<void> {
        await axiosInstance.delete(`${this.baseUrl}/${id}`);
    }

    static async cancelBooking(id: string): Promise<IBooking> {
        const response = await axiosInstance.post(`${this.baseUrl}/${id}/cancel`);
        return response.data;
    }

    static async cancelCustomerFromBooking(
        bookingId: string,
        customerId: string,
    ): Promise<IBooking> {
        const response = await axiosInstance.post(
            `${this.baseUrl}/${bookingId}/cancel-customer/${customerId}`,
        );
        return response.data;
    }

    static async moveBooking(
        bookingId: string,
        batchId: string,
    ): Promise<IBooking> {
        const response = await axiosInstance.post(
            `${this.baseUrl}/${bookingId}/move/${batchId}`,
        );
        return response.data;
    }

    static async addPayment(
        bookingId: string,
        paymentData: Omit<IBookingPayment, "id" | "status">,
    ): Promise<IBooking> {
        const response = await axiosInstance.post(
            `${this.baseUrl}/${bookingId}/payments`,
            paymentData,
        );
        return response.data;
    }

    static async getBookingStatistics(): Promise<IBookingStatistics> {
        const response = await axiosInstance.get(`${this.baseUrl}/stats`);
        return response.data;
    }

    static async getRecentBookings(
        limit: number = 5,
    ): Promise<IBookingListItem[]> {
        const response = await axiosInstance.get(
            `${this.baseUrl}/recent?limit=${limit}`,
        );
        return response.data;
    }

    static async getBatchesByPackage(packageId: string): Promise<IBatches[]> {
        const response = await axiosInstance.get(
            `/batches/by-package/${packageId}`,
        );
        return response.data;
    }

    static async getAvailableBatches(packageId: string): Promise<IBatches[]> {
        const response = await axiosInstance.get(
            `/batches/available/${packageId}`,
        );
        return response.data;
    }

    static async getPackages(): Promise<
        Array<{ id: string; name: string; price: number }>
    > {
        const response = await axiosInstance.get("/packages?status=published");
        return response.data;
    }

    static async getCustomers(params?: {
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        customers: Array<{
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            dateOfBirth: string;
            gender: string;
            address: string;
        }>;
        total: number;
        hasMore: boolean;
    }> {
        const queryParams = new URLSearchParams();

        if (params?.limit) {
            queryParams.append("limit", params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append("offset", params.offset.toString());
        }
        if (params?.search) {
            queryParams.append("search", params.search);
        }

        const response = await axiosInstance.get(
            `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
        );
        return response.data;
    }

    static async searchCustomers(
        query: string,
        params?: {
            limit?: number;
            offset?: number;
        },
    ): Promise<{
        data: Array<{
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            dateOfBirth: string;
            gender: string;
            address: string;
        }>;
        total: number;
        hasMore: boolean;
    }> {
        const queryParams = new URLSearchParams();
        queryParams.append("search", query);

        if (params?.limit) {
            queryParams.append("limit", params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append("offset", params.offset.toString());
        }

        const response = await axiosInstance.get(
            `/customers?${queryParams.toString()}`,
        );
        return response.data;
    }

    static async uploadFile(file: File): Promise<{ filePath: string }> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(
            "/file-manager/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    }

    /* -------- Helpers -------- */
    static formatBookingNumber(bookingNumber: string): string {
        return bookingNumber || "N/A";
    }

    static calculateBalance(totalAmount: number, advancePaid: number): number {
        return Math.max(0, totalAmount - advancePaid);
    }

    static getPaymentStatus(
        advancePaid: number,
        totalAmount: number,
    ): "none" | "partial" | "full" {
        if (advancePaid === 0) return "none";
        if (advancePaid < totalAmount) return "partial";
        return "full";
    }

    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    }

    static validateBookingData(data: ICreateBookingRequest): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!data.customerId) errors.push("Primary customer is required");
        if (!data.packageId) errors.push("Package is required");
        if (!data.batchId) errors.push("Batch is required");
        if (!data.customerIds || data.customerIds.length === 0)
            errors.push("At least one customer is required");
        if (data.totalAmount <= 0)
            errors.push("Total amount must be greater than zero");

        if (data.initialPayment) {
            if (data.initialPayment.amount > data.totalAmount) {
                errors.push("Initial payment cannot exceed total amount");
            }
            if (!data.initialPayment.paymentMethod) {
                errors.push("Payment method is required for initial payment");
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

export default BookingService;
