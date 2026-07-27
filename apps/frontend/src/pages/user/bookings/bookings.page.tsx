import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingService from "@/services/booking.service";
import type { IBookingStatistics } from "@/types/booking.types";
import {
	AlertCircle,
	AlertTriangle,
	Calendar,
	DollarSign,
	Plus,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BookingList } from "./_components/booking-list";
import { CreateBookingDialog } from "./_components/create-booking-dialog";

export default function BookingsPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [dashboardStats, setDashboardStats] = useState<IBookingStatistics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			const statsData = await BookingService.getBookingStatistics();

			setDashboardStats(statsData);
		} catch (err) {
			console.error("Error fetching dashboard data:", err);
			setError("Failed to load dashboard data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleBookingCreated = () => {
		// Refresh dashboard data when a new booking is created
		fetchDashboardData();
	};

	if (error) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Booking Management</h1>
						<p className="text-muted-foreground">
							Manage tour package bookings and track payments
						</p>
					</div>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{error}
						<Button
							variant="outline"
							size="sm"
							className="ml-4"
							onClick={fetchDashboardData}
						>
							Try Again
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Booking Management</h1>
					<p className="text-muted-foreground">
						Manage tour package bookings and track payments
					</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Create Booking
				</Button>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{loading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-4 w-4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-1/2 mb-1" />
								<Skeleton className="h-3 w-1/3" />
							</CardContent>
						</Card>
					))
				) : dashboardStats ? (
					<>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Bookings
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{dashboardStats.totalBookings}
								</div>
								<p className="text-xs text-muted-foreground">
									All time bookings
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Pending</CardTitle>
								<AlertTriangle className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{dashboardStats.pendingBookings}
								</div>
								<p className="text-xs text-muted-foreground">
									Awaiting confirmation
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Confirmed
								</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{dashboardStats.confirmedBookings}
								</div>
								<p className="text-xs text-muted-foreground">
									Ready to travel
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Revenue
								</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{BookingService.formatCurrency(
										dashboardStats.totalRevenue
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									All confirmed bookings
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Pending Payments
								</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{BookingService.formatCurrency(
										dashboardStats.pendingPayments
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									Outstanding balance
								</p>
							</CardContent>
						</Card>
					</>
				) : null}
			</div>



			{/* Booking Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Bookings</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="confirmed">Confirmed</TabsTrigger>
					<TabsTrigger value="cancelled">Cancelled</TabsTrigger>
					<TabsTrigger value="completed">Completed</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<BookingList status="all" />
				</TabsContent>

				<TabsContent value="pending">
					<BookingList status="pending" />
				</TabsContent>

				<TabsContent value="confirmed">
					<BookingList status="confirmed" />
				</TabsContent>

				<TabsContent value="cancelled">
					<BookingList status="cancelled" />
				</TabsContent>

				<TabsContent value="completed">
					<BookingList status="completed" />
				</TabsContent>
			</Tabs>

			<CreateBookingDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onBookingCreated={handleBookingCreated}
			/>
		</div>
	);
}
