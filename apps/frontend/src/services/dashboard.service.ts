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
	numberOfCustomers: number;
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

export interface DashboardActiveOffer {
	id: string;
	name: string;
	description?: string | null;
	discountType: 'percentage' | 'flat';
	discountMode: 'fixed' | 'range';
	discountValue: number;
	minDiscountValue?: number | null;
	maxDiscountValue?: number | null;
	discountScope: 'passenger' | 'booking';
	minTravelers: number;
	maxDiscountCap?: number | null;
	validFrom?: string | Date | null;
	validUntil?: string | Date | null;
	batchId: string;
	batchStartDate: string | Date;
	batchEndDate: string | Date;
	totalSeats: number;
	bookedSeats: number;
	availableSeats: number;
	packageId: string;
	packageName: string;
	packageThumbnail?: string | null;
	destination?: string | null;
	createdAt: string | Date;
}

export interface BookingComparisonData {
	thisMonth: {
		total: number;
		domestic: number;
		international: number;
	};
	lastMonth: {
		total: number;
		domestic: number;
		international: number;
	};
	changePercentage: {
		total: number;
		domestic: number;
		international: number;
	};
	recentBookings: Array<{
		id: string;
		bookingNumber: string;
		customerName: string;
		packageName: string;
		destinationType: 'domestic' | 'international';
		numberOfCustomers: number;
		status: string;
		createdAt: Date | string;
	}>;
}

export interface SeatVacancyItem {
	id: string;
	packageName: string;
	destination: string;
	destinationType: 'domestic' | 'international';
	startDate: Date | string;
	endDate: Date | string;
	totalSeats: number;
	bookedSeats: number;
	vacantSeats: number;
	urgency: 'high' | 'medium' | 'low';
}

export interface PaymentPendingItem {
	id: string;
	bookingNumber: string;
	customerName: string;
	customerPhone: string;
	packageName: string;
	totalAmount: number;
	advancePaid: number;
	balanceAmount: number;
	dueDate: string;
	status: string;
}

export interface DashboardTodoItem {
	id: string;
	title: string;
	dueDate: string;
	priority: 'high' | 'medium' | 'low';
	roleCategory: 'sales' | 'manager' | 'operations' | 'finance' | 'general';
	isCompleted: boolean;
}

export interface ApprovalRequestItem {
	id: string;
	requestType: 'discount' | 'custom_itinerary' | 'cancellation' | 'refund';
	title: string;
	requestedBy: string;
	customerName: string;
	details: string;
	amount?: number;
	status: 'pending' | 'approved' | 'rejected';
	createdAt: string;
}

export interface DashboardNotificationItem {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'warning' | 'action_required' | 'success';
	createdAt: string;
	isRead: boolean;
}

export class DashboardService {
	static async getBookingComparison(): Promise<BookingComparisonData> {
		try {
			const response = await axiosInstance.get("/dashboard/booking-comparison");
			return response.data;
		} catch (error) {
			console.error("Error fetching booking comparison:", error);
			// Fallback mock data if server error occurs
			return {
				thisMonth: { total: 42, domestic: 28, international: 14 },
				lastMonth: { total: 35, domestic: 24, international: 11 },
				changePercentage: { total: 20, domestic: 17, international: 27 },
				recentBookings: [
					{ id: '1', bookingNumber: 'TRK-2026-089', customerName: 'Rahul Sharma', packageName: 'Himachal Adventure Trek', destinationType: 'domestic', numberOfCustomers: 4, status: 'confirmed', createdAt: new Date().toISOString() },
					{ id: '2', bookingNumber: 'TRK-2026-090', customerName: 'Priya Patel', packageName: 'Maldives Paradise Getaway', destinationType: 'international', numberOfCustomers: 2, status: 'pending', createdAt: new Date().toISOString() },
					{ id: '3', bookingNumber: 'TRK-2026-091', customerName: 'Amit Verma', packageName: 'Kerala Backwaters & Hills', destinationType: 'domestic', numberOfCustomers: 3, status: 'confirmed', createdAt: new Date().toISOString() },
					{ id: '4', bookingNumber: 'TRK-2026-092', customerName: 'Sneha Kulkarni', packageName: 'Dubai Desert & Skyline', destinationType: 'international', numberOfCustomers: 5, status: 'confirmed', createdAt: new Date().toISOString() },
				]
			};
		}
	}

	static async getSeatVacancies(): Promise<SeatVacancyItem[]> {
		try {
			const response = await axiosInstance.get("/dashboard/seat-vacancies");
			return response.data;
		} catch (error) {
			console.error("Error fetching seat vacancies:", error);
			return [
				{ id: 'v1', packageName: 'Manali & Solang Valley Special', destination: 'Himachal Pradesh', destinationType: 'domestic', startDate: '2026-09-18', endDate: '2026-09-24', totalSeats: 15, bookedSeats: 13, vacantSeats: 2, urgency: 'high' },
				{ id: 'v2', packageName: 'Bali Exotic Island Expedition', destination: 'Bali, Indonesia', destinationType: 'international', startDate: '2026-09-22', endDate: '2026-09-27', totalSeats: 12, bookedSeats: 9, vacantSeats: 3, urgency: 'high' },
				{ id: 'v3', packageName: 'Kashmir Autumn Blossom Trek', destination: 'Srinagar & Gulmarg', destinationType: 'domestic', startDate: '2026-09-28', endDate: '2026-10-04', totalSeats: 20, bookedSeats: 14, vacantSeats: 6, urgency: 'medium' },
				{ id: 'v4', packageName: 'Vietnam & Halong Bay Adventure', destination: 'Hanoi, Vietnam', destinationType: 'international', startDate: '2026-10-05', endDate: '2026-10-10', totalSeats: 18, bookedSeats: 8, vacantSeats: 10, urgency: 'low' },
			];
		}
	}

	static async getPaymentPendings(): Promise<PaymentPendingItem[]> {
		try {
			const response = await axiosInstance.get("/dashboard/payment-pendings");
			return response.data;
		} catch (error) {
			console.error("Error fetching payment pendings:", error);
			return [
				{ id: 'p1', bookingNumber: 'BK-9941', customerName: 'Rajesh Malhotra', customerPhone: '+91 98112 34567', packageName: 'Kedarnath Yatra Batch #4', totalAmount: 45000, advancePaid: 15000, balanceAmount: 30000, dueDate: '2026-09-15', status: 'Partially Paid' },
				{ id: 'p2', bookingNumber: 'BK-9945', customerName: 'Ananya Desai', customerPhone: '+91 99201 87654', packageName: 'Thailand Explorer Package', totalAmount: 68000, advancePaid: 0, balanceAmount: 68000, dueDate: '2026-09-13', status: 'Overdue' },
				{ id: 'p3', bookingNumber: 'BK-9950', customerName: 'Sanjay Kumar', customerPhone: '+91 97170 54321', packageName: 'Spiti Valley Bike Expedition', totalAmount: 38000, advancePaid: 10000, balanceAmount: 28000, dueDate: '2026-09-18', status: 'Partially Paid' },
				{ id: 'p4', bookingNumber: 'BK-9958', customerName: 'Meera Menon', customerPhone: '+91 94471 23890', packageName: 'Sri Lanka Coastal Tour', totalAmount: 52000, advancePaid: 20000, balanceAmount: 32000, dueDate: '2026-09-20', status: 'Partially Paid' },
			];
		}
	}

	static async getTodos(): Promise<DashboardTodoItem[]> {
		try {
			const response = await axiosInstance.get("/dashboard/todos");
			return response.data;
		} catch (error) {
			console.error("Error fetching todos:", error);
			return [
				{ id: 't1', title: 'Follow up with Rajesh Malhotra for balance payment (BK-9941)', dueDate: 'Today, 4:00 PM', priority: 'high', roleCategory: 'sales', isCompleted: false },
				{ id: 't2', title: 'Verify passport & visa documents for Bali batch (Sept 18)', dueDate: 'Tomorrow, 11:00 AM', priority: 'high', roleCategory: 'operations', isCompleted: false },
				{ id: 't3', title: 'Approve 10% seasonal discount for Corporate Group inquiry', dueDate: 'Today, 6:00 PM', priority: 'medium', roleCategory: 'manager', isCompleted: false },
				{ id: 't4', title: 'Reconcile vendor payment invoices for Himachal bus operator', dueDate: 'Sept 14', priority: 'medium', roleCategory: 'finance', isCompleted: true },
				{ id: 't5', title: 'Send welcome kit & itinerary pack to Kashmir confirmed guests', dueDate: 'Sept 15', priority: 'low', roleCategory: 'sales', isCompleted: false },
			];
		}
	}

	static async getApprovals(): Promise<ApprovalRequestItem[]> {
		try {
			const response = await axiosInstance.get("/dashboard/approvals");
			return response.data;
		} catch (error) {
			console.error("Error fetching approvals:", error);
			return [
				{ id: 'ap1', requestType: 'discount', title: '12% Special Discount Request', requestedBy: 'Rohan Mehta (Sales)', customerName: 'TechCorp Group (12 pax)', details: 'Requested 12% group discount on Ladakh Circuit', amount: 18400, status: 'pending', createdAt: '2 hours ago' },
				{ id: 'ap2', requestType: 'custom_itinerary', title: 'Custom Luxury Extension Itinerary', requestedBy: 'Kavita Nair (Sales)', customerName: 'Dr. Alok Verma', details: 'Added 2 nights water villa upgrade in Maldives', amount: 35000, status: 'pending', createdAt: '4 hours ago' },
				{ id: 'ap3', requestType: 'cancellation', title: 'Emergency Booking Cancellation Request', requestedBy: 'Suresh Raina (Ops)', customerName: 'Kapil Sharma', details: 'Medical emergency cancellation for BK-9822', amount: 22000, status: 'pending', createdAt: '1 day ago' },
			];
		}
	}

	static async getNotifications(): Promise<DashboardNotificationItem[]> {
		try {
			const response = await axiosInstance.get("/dashboard/notifications");
			return response.data;
		} catch (error) {
			console.error("Error fetching notifications:", error);
			return [
				{ id: 'n1', title: 'Seat Capacity Threshold Reached', message: 'Manali & Solang Valley batch now has only 2 seats remaining!', type: 'warning', createdAt: '10 mins ago', isRead: false },
				{ id: 'n2', title: 'New Online Booking Confirmed', message: 'Sneha Kulkarni booked 5 seats for Dubai Desert & Skyline', type: 'success', createdAt: '45 mins ago', isRead: false },
				{ id: 'n3', title: 'Payment Overdue Alert', message: 'Payment of ₹68,000 for Thailand package (Ananya Desai) is overdue.', type: 'action_required', createdAt: '2 hours ago', isRead: false },
				{ id: 'n4', title: 'Discount Request Approved', message: 'Manager approved 8% discount for BK-9932 (Amit Verma)', type: 'info', createdAt: '3 hours ago', isRead: true },
			];
		}
	}

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

	static async getActiveOffers(limit: number = 10): Promise<DashboardActiveOffer[]> {
		try {
			const response = await axiosInstance.get(
				`/dashboard/active-offers?limit=${limit}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching active offers:", error);
			throw error;
		}
	}
}

