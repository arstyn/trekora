import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Calendar,
	DollarSign,
	Edit,
	Eye,
	Loader2,
	MoreHorizontal,
	Search,
	Users,
	AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import BookingService from "@/services/booking.service";
import type { IBookingListItem, BookingStatus } from "@/types/booking.types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BookingListProps {
	status: "all" | "pending" | "confirmed" | "cancelled" | "completed";
}

export function BookingList({ status }: BookingListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [bookings, setBookings] = useState<IBookingListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch bookings on component mount and when status changes
	useEffect(() => {
		fetchBookings();
	}, [status]);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await BookingService.getAllBookings({
				status: status as BookingStatus | "all",
				limit: 100, // You can implement pagination later
				offset: 0,
			});

			setBookings(data);
		} catch (err) {
			console.error("Error fetching bookings:", err);
			setError("Failed to load bookings. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const filteredBookings = bookings.filter(
		(booking) =>
			booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.packageName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStatusBadge = (status: BookingStatus) => {
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

	const getPaymentStatus = (advancePaid: number, totalAmount: number) => {
		const paymentStatus = BookingService.getPaymentStatus(advancePaid, totalAmount);

		switch (paymentStatus) {
			case "none":
				return <Badge variant="destructive">No Payment</Badge>;
			case "partial":
				return <Badge variant="secondary">Partial Payment</Badge>;
			case "full":
				return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading bookings...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="py-8">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error}
							<Button
								variant="outline"
								size="sm"
								className="ml-4"
								onClick={fetchBookings}
							>
								Try Again
							</Button>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle className="capitalize">
						{status === "all" ? "All" : status} Bookings
					</CardTitle>
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search bookings..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 w-64"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchBookings}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Refresh"
							)}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Booking Number</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Package</TableHead>
							<TableHead>Batch Date</TableHead>
							<TableHead>Passengers</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredBookings.map((booking) => (
							<TableRow key={booking.id}>
								<TableCell className="font-medium">
									{BookingService.formatBookingNumber(
										booking.bookingNumber
									)}
								</TableCell>
								<TableCell>
									<div>
										<p className="font-medium">
											{booking.customerName}
										</p>
										<p className="text-sm text-muted-foreground">
											{booking.customerEmail}
										</p>
									</div>
								</TableCell>
								<TableCell>{booking.packageName}</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 text-sm">
										<Calendar className="w-4 h-4" />
										{new Date(
											booking.batchStartDate
										).toLocaleDateString()}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />
										{booking.numberOfCustomers}
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<div className="flex items-center gap-1 text-sm">
											<DollarSign className="w-3 h-3" />
											{BookingService.formatCurrency(
												booking.advancePaid
											)}
											/
											{BookingService.formatCurrency(
												booking.totalAmount
											)}
										</div>
										{getPaymentStatus(
											booking.advancePaid,
											booking.totalAmount
										)}
									</div>
								</TableCell>
								<TableCell>{getStatusBadge(booking.status)}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<NavLink
													to={`/bookings/${booking.id}`}
													className="flex items-center"
												>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</NavLink>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<NavLink
													to={`/bookings/${booking.id}/edit`}
													className="flex items-center"
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit Booking
												</NavLink>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{filteredBookings.length === 0 && !loading && (
					<div className="text-center py-8 text-muted-foreground">
						{searchTerm
							? `No bookings found matching "${searchTerm}".`
							: `No ${status === "all" ? "" : status} bookings found.`}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
