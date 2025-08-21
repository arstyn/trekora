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
}
