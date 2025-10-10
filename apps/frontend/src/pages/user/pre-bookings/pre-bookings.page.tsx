import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { preBookingService } from "@/services/pre-booking.service";
import type { PreBookingStatsDto, PreBookingSummaryDto } from "@/types/pre-booking.types";
import { PreBookingStatus } from "@/types/pre-booking.types";
import {
	AlertCircle,
	Calendar,
	ClipboardList,
	DollarSign,
	Loader2,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PreBookingList } from "./_components/pre-booking-list";

export default function PreBookingsPage() {
	const [dashboardStats, setDashboardStats] = useState<PreBookingStatsDto | null>(null);
	const [recentPreBookings, setRecentPreBookings] = useState<PreBookingSummaryDto[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [statsData, recentData] = await Promise.all([
				preBookingService.getStats(),
				preBookingService.getAll(undefined, 5, 0),
			]);

			setDashboardStats(statsData);
			setRecentPreBookings(recentData);
		} catch (err) {
			console.error("Error fetching dashboard data:", err);
			setError("Failed to load dashboard data. Please try again.");
			toast.error("Failed to load pre-bookings data");
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case PreBookingStatus.PENDING:
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case PreBookingStatus.CUSTOMER_DETAILS_PENDING:
				return (
					<Badge className="bg-blue-100 text-blue-800">Details Pending</Badge>
				);
			case PreBookingStatus.CUSTOMER_CREATED:
				return (
					<Badge className="bg-green-100 text-green-800">
						Customer Created
					</Badge>
				);
			case PreBookingStatus.CONVERTED_TO_BOOKING:
				return <Badge className="bg-purple-100 text-purple-800">Converted</Badge>;
			case PreBookingStatus.CANCELLED:
				return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Pre-Bookings</h1>
					<p className="text-muted-foreground">
						Manage leads converted to pre-bookings
					</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Pre-Bookings
						</CardTitle>
						<ClipboardList className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats?.totalPreBookings || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Details
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats?.customerDetailsPending || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Converted</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats?.convertedToBookings || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Estimated Revenue
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboardStats?.totalEstimatedRevenue || 0)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Pre-Bookings */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Pre-Bookings</CardTitle>
				</CardHeader>
				<CardContent>
					{recentPreBookings.length > 0 ? (
						<div className="space-y-4">
							{recentPreBookings.map((preBooking) => (
								<div
									key={preBooking.id}
									className="flex items-center justify-between border-b pb-4 last:border-0"
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<p className="font-medium">
												{preBooking.preBookingNumber}
											</p>
											{getStatusBadge(preBooking.status)}
										</div>
										<p className="text-sm text-muted-foreground">
											{preBooking.leadName}
										</p>
										{preBooking.packageName && (
											<p className="text-sm">
												Package: {preBooking.packageName}
											</p>
										)}
										<div className="flex gap-4 text-sm text-muted-foreground">
											<span className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{preBooking.numberOfTravelers} travelers
											</span>
											{preBooking.preferredStartDate && (
												<span className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{new Date(
														preBooking.preferredStartDate
													).toLocaleDateString()}
												</span>
											)}
											{preBooking.estimatedAmount && (
												<span className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													{formatCurrency(
														preBooking.estimatedAmount
													)}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							No recent pre-bookings found.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pre-Booking Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Pre-Bookings</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="customer_details_pending">
						Details Pending
					</TabsTrigger>
					<TabsTrigger value="customer_created">Customer Created</TabsTrigger>
					<TabsTrigger value="converted_to_booking">Converted</TabsTrigger>
					<TabsTrigger value="cancelled">Cancelled</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<PreBookingList onRefresh={fetchDashboardData} />
				</TabsContent>

				<TabsContent value="pending">
					<PreBookingList
						status={PreBookingStatus.PENDING}
						onRefresh={fetchDashboardData}
					/>
				</TabsContent>

				<TabsContent value="customer_details_pending">
					<PreBookingList
						status={PreBookingStatus.CUSTOMER_DETAILS_PENDING}
						onRefresh={fetchDashboardData}
					/>
				</TabsContent>

				<TabsContent value="customer_created">
					<PreBookingList
						status={PreBookingStatus.CUSTOMER_CREATED}
						onRefresh={fetchDashboardData}
					/>
				</TabsContent>

				<TabsContent value="converted_to_booking">
					<PreBookingList
						status={PreBookingStatus.CONVERTED_TO_BOOKING}
						onRefresh={fetchDashboardData}
					/>
				</TabsContent>

				<TabsContent value="cancelled">
					<PreBookingList
						status={PreBookingStatus.CANCELLED}
						onRefresh={fetchDashboardData}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
