import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertTriangle,
	Calendar,
	DollarSign,
	Plus,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BookingList } from "./_component/booking-list";
import { CreateBookingDialog } from "./_component/create-booking-dialog";

// Mock data
const dashboardStats = {
	totalBookings: 45,
	pendingBookings: 8,
	confirmedBookings: 32,
	totalRevenue: 125000,
	pendingPayments: 15000,
};

const recentBookings = [
	{
		id: "BK001",
		customerName: "John Smith",
		packageName: "Himalayan Adventure",
		batchId: "1",
		passengers: 2,
		totalAmount: 2400,
		advancePaid: 1200,
		status: "confirmed",
		bookingDate: "2024-01-20",
	},
	{
		id: "BK002",
		customerName: "Sarah Johnson",
		packageName: "Beach Paradise",
		batchId: "2",
		passengers: 4,
		totalAmount: 3200,
		advancePaid: 800,
		status: "pending",
		bookingDate: "2024-01-21",
	},
	{
		id: "BK003",
		customerName: "Mike Wilson",
		packageName: "Cultural Heritage Tour",
		batchId: "3",
		passengers: 1,
		totalAmount: 950,
		advancePaid: 950,
		status: "confirmed",
		bookingDate: "2024-01-22",
	},
];

export default function BookingsPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
							${dashboardStats.totalRevenue.toLocaleString()}
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
							${dashboardStats.pendingPayments.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							Outstanding balance
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Bookings */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Bookings</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentBookings.map((booking) => (
							<div
								key={booking.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="font-semibold">
											{booking.id} - {booking.customerName}
										</h3>
										<Badge
											variant={
												booking.status === "confirmed"
													? "default"
													: "secondary"
											}
										>
											{booking.status}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{booking.packageName} • {booking.passengers}{" "}
										passenger(s)
									</p>
									<div className="flex items-center gap-4">
										<span className="text-sm">
											Total: ${booking.totalAmount}
										</span>
										<span className="text-sm">
											Paid: ${booking.advancePaid}
										</span>
										<span className="text-sm text-muted-foreground">
											Balance: $
											{booking.totalAmount - booking.advancePaid}
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
			/>
		</div>
	);
}
