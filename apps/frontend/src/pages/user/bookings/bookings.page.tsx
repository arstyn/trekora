import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertTriangle,
	Calendar,
	DollarSign,
	Plus,
	TrendingUp,
	Users,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BookingList } from "./_component/booking-list";
import { CreateBookingDialog } from "./_component/create-booking-dialog";
import BookingService from "@/services/booking.service";
import type { IBookingStatistics, IBookingListItem } from "@/types/booking.types";

export default function BookingsPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [dashboardStats, setDashboardStats] = useState<IBookingStatistics | null>(null);
	const [recentBookings, setRecentBookings] = useState<IBookingListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);
			
			// Fetch both dashboard stats and recent bookings in parallel
			const [statsData, recentData] = await Promise.all([
				BookingService.getBookingStatistics(),
				BookingService.getRecentBookings(5)
			]);
			
			setDashboardStats(statsData);
			setRecentBookings(recentData);
		} catch (err) {
			console.error('Error fetching dashboard data:', err);
			setError('Failed to load dashboard data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "confirmed":
				return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case "cancelled":
				return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
			case "completed":
				return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const handleBookingCreated = () => {
		// Refresh dashboard data when a new booking is created
		fetchDashboardData();
	};

	if (loading) {
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
				<div className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span>Loading dashboard...</span>
					</div>
				</div>
			</div>
		);
	}

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
			{dashboardStats && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
							<p className="text-xs text-muted-foreground">All time bookings</p>
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
							<CardTitle className="text-sm font-medium">Confirmed</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.confirmedBookings}
							</div>
							<p className="text-xs text-muted-foreground">Ready to travel</p>
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
								{BookingService.formatCurrency(dashboardStats.totalRevenue)}
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
								{BookingService.formatCurrency(dashboardStats.pendingPayments)}
							</div>
							<p className="text-xs text-muted-foreground">
								Outstanding balance
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Recent Bookings */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>Recent Bookings</CardTitle>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchDashboardData}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Refresh"
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{recentBookings.length > 0 ? (
						<div className="space-y-4">
							{recentBookings.map((booking) => (
								<div
									key={booking.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-semibold">
												{BookingService.formatBookingNumber(booking.bookingNumber)} - {booking.customerName}
											</h3>
											{getStatusBadge(booking.status)}
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{booking.packageName} • {booking.numberOfPassengers}{" "}
											passenger(s)
										</p>
										<div className="flex items-center gap-4">
											<span className="text-sm">
												Total: {BookingService.formatCurrency(booking.totalAmount)}
											</span>
											<span className="text-sm">
												Paid: {BookingService.formatCurrency(booking.advancePaid)}
											</span>
											<span className="text-sm text-muted-foreground">
												Balance: {BookingService.formatCurrency(booking.balanceAmount)}
											</span>
										</div>
									</div>
									<NavLink to={`/bookings/${booking.id}`}>
										<Button variant="outline" size="sm">
											View Details
										</Button>
									</NavLink>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							No recent bookings found.
						</div>
					)}
				</CardContent>
			</Card>

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
