import axiosInstance from "@/lib/axios";
import type {
	IBooking,
	IBookingListItem,
	IBookingStatistics,
	ICreateBookingRequest,
	IUpdateBookingRequest,
	IBookingPayment,
	BookingStatus,
} from "@/types/booking.types";
import type { IBatches } from "@/types/batches.types";

export class BookingService {
	private static baseUrl = "/bookings";

	// Get all bookings with optional filtering
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
			`${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
		);
		return response.data;
	}

	// Get booking by ID
	static async getBookingById(id: string): Promise<IBooking> {
		const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
		return response.data;
	}

	// Create new booking
	static async createBooking(bookingData: ICreateBookingRequest): Promise<IBooking> {
		const response = await axiosInstance.post(this.baseUrl, bookingData);
		return response.data;
	}

	// Update booking
	static async updateBooking(
		id: string,
		updateData: IUpdateBookingRequest
	): Promise<IBooking> {
		const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, updateData);
		return response.data;
	}

	// Delete booking
	static async deleteBooking(id: string): Promise<void> {
		await axiosInstance.delete(`${this.baseUrl}/${id}`);
	}

	// Add payment to booking
	static async addPayment(
		bookingId: string,
		paymentData: Omit<IBookingPayment, "id" | "status">
	): Promise<IBooking> {
		const response = await axiosInstance.post(
			`${this.baseUrl}/${bookingId}/payments`,
			paymentData
		);
		return response.data;
	}

	// Get booking statistics
	static async getBookingStatistics(): Promise<IBookingStatistics> {
		const response = await axiosInstance.get(`${this.baseUrl}/stats`);
		return response.data;
	}

	// Get recent bookings
	static async getRecentBookings(limit: number = 5): Promise<IBookingListItem[]> {
		const response = await axiosInstance.get(`${this.baseUrl}/recent?limit=${limit}`);
		return response.data;
	}

	// Get batches by package ID
	static async getBatchesByPackage(packageId: string): Promise<IBatches[]> {
		const response = await axiosInstance.get(`/batches/by-package/${packageId}`);
		return response.data;
	}

	// Get available batches for a package
	static async getAvailableBatches(packageId: string): Promise<IBatches[]> {
		const response = await axiosInstance.get(`/batches/available/${packageId}`);
		return response.data;
	}

	// Get packages (for dropdown/selection)
	static async getPackages(): Promise<
		Array<{ id: string; name: string; price: number }>
	> {
		const response = await axiosInstance.get("/packages?status=published");
		return response.data;
	}

	// Get customers (for dropdown/selection)
	static async getCustomers(): Promise<
		Array<{ id: string; name: string; email: string; phone: string }>
	> {
		const response = await axiosInstance.get("/customers");
		return response.data;
	}

	// Search customers by name or email
	static async searchCustomers(
		query: string
	): Promise<Array<{ id: string; name: string; email: string; phone: string }>> {
		const response = await axiosInstance.get(
			`/customers/search?q=${encodeURIComponent(query)}`
		);
		return response.data;
	}

	// Upload file (for payment receipts)
	static async uploadFile(file: File): Promise<{ filePath: string }> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await axiosInstance.post("/file-manager/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	}

	// Helper function to format booking number
	static formatBookingNumber(bookingNumber: string): string {
		return bookingNumber || "N/A";
	}

	// Helper function to calculate balance
	static calculateBalance(totalAmount: number, advancePaid: number): number {
		return Math.max(0, totalAmount - advancePaid);
	}

	// Helper function to get payment status
	static getPaymentStatus(
		advancePaid: number,
		totalAmount: number
	): "none" | "partial" | "full" {
		if (advancePaid === 0) return "none";
		if (advancePaid < totalAmount) return "partial";
		return "full";
	}

	// Helper function to format currency
	static formatCurrency(amount: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	}

	// Validate booking data before submission
	static validateBookingData(data: ICreateBookingRequest): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!data.customerId) errors.push("Customer is required");
		if (!data.packageId) errors.push("Package is required");
		if (!data.batchId) errors.push("Batch is required");
		if (data.numberOfPassengers < 1)
			errors.push("At least one passenger is required");
		if (data.totalAmount <= 0) errors.push("Total amount must be greater than zero");

		// Validate passengers
		if (!data.passengers || data.passengers.length === 0) {
			errors.push("Passenger details are required");
		} else {
			data.passengers.forEach((passenger, index) => {
				if (!passenger.fullName)
					errors.push(`Passenger ${index + 1}: Name is required`);
				if (!passenger.age || passenger.age < 0)
					errors.push(`Passenger ${index + 1}: Valid age is required`);
				if (!passenger.emergencyContact)
					errors.push(`Passenger ${index + 1}: Emergency contact is required`);
			});
		}

		// Validate initial payment if provided
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
