import axiosInstance from "@/lib/axios";

export interface DashboardStats {
	totalRevenue: number;
	newCustomers: number;
	totalBookings: number;
	growthRate: number;
	revenueChange: number;
	customerChange: number;
	bookingChange: number;
}

export interface ChartData {
	date: string;
	leads: number;
	bookings: number;
}

export interface SectionData {
	id: number;
	header: string;
	type: string;
	status: string;
	target: string;
	limit: string;
	reviewer: string;
}

export interface LatestBooking {
	id: string;
	bookingNumber: string;
	customerName: string;
	packageName: string;
	totalAmount: number;
	status: string;
	createdAt: Date;
	numberOfPassengers: number;
}

export interface LatestLead {
	id: string;
	name: string;
	email: string;
	phone: string;
	company: string;
	status: string;
	createdAt: Date;
	notes: string;
}

export interface FastFillingBatch {
	id: string;
	packageName: string;
	destination: string;
	startDate: Date;
	endDate: Date;
	totalSeats: number;
	bookedSeats: number;
	fillPercentage: number;
	status: string;
}

export interface BestPerformingPackage {
	id: string;
	name: string;
	destination: string;
	category: string;
	totalBookings: number;
	totalRevenue: number;
	averageRating: number;
	status: string;
}

export class DashboardService {
	static async getDashboardStats(): Promise<DashboardStats> {
		try {
			const response = await axiosInstance.get("/dashboard/stats");
			return response.data;
		} catch (error) {
			console.error("Error fetching dashboard stats:", error);
			throw error;
		}
	}

	static async getChartData(days: number = 90): Promise<ChartData[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/chart-data?days=${days}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching chart data:", error);
			throw error;
		}
	}

	static async getSectionData(): Promise<SectionData[]> {
		try {
			const response = await axiosInstance.get("/dashboard/sections");
			return response.data;
		} catch (error) {
			console.error("Error fetching section data:", error);
			throw error;
		}
	}

	static async getLatestBookings(limit: number = 10): Promise<LatestBooking[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/latest-bookings?limit=${limit}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching latest bookings:", error);
			throw error;
		}
	}

	static async getLatestLeads(limit: number = 10): Promise<LatestLead[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/latest-leads?limit=${limit}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching latest leads:", error);
			throw error;
		}
	}

	static async getFastFillingBatches(limit: number = 10): Promise<FastFillingBatch[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/fast-filling-batches?limit=${limit}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching fast filling batches:", error);
			throw error;
		}
	}

	static async getBestPerformingPackages(
		limit: number = 10
	): Promise<BestPerformingPackage[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/best-performing-packages?limit=${limit}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching best performing packages:", error);
			throw error;
		}
	}
}
