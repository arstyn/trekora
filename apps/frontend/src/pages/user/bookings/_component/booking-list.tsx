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
	MoreHorizontal,
	Search,
	Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

interface BookingListProps {
	status: "all" | "pending" | "confirmed" | "cancelled" | "completed";
}

// Mock data
const mockBookings = {
	all: [
		{
			id: "BK001",
			customerName: "John Smith",
			customerEmail: "john.smith@email.com",
			customerPhone: "+1-234-567-8900",
			packageName: "Himalayan Adventure",
			batchId: "1",
			batchStartDate: "2024-02-15",
			passengers: 2,
			totalAmount: 2400,
			advancePaid: 1200,
			balanceAmount: 1200,
			status: "confirmed",
			bookingDate: "2024-01-20",
			paymentMethod: "Bank Transfer",
		},
		{
			id: "BK002",
			customerName: "Sarah Johnson",
			customerEmail: "sarah.johnson@email.com",
			customerPhone: "+1-234-567-8901",
			packageName: "Beach Paradise",
			batchId: "2",
			batchStartDate: "2024-02-20",
			passengers: 4,
			totalAmount: 3200,
			advancePaid: 800,
			balanceAmount: 2400,
			status: "pending",
			bookingDate: "2024-01-21",
			paymentMethod: "Credit Card",
		},
		{
			id: "BK003",
			customerName: "Mike Wilson",
			customerEmail: "mike.wilson@email.com",
			customerPhone: "+1-234-567-8902",
			packageName: "Cultural Heritage Tour",
			batchId: "3",
			batchStartDate: "2024-02-25",
			passengers: 1,
			totalAmount: 950,
			advancePaid: 950,
			balanceAmount: 0,
			status: "confirmed",
			bookingDate: "2024-01-22",
			paymentMethod: "Bank Transfer",
		},
		{
			id: "BK004",
			customerName: "Emily Davis",
			customerEmail: "emily.davis@email.com",
			customerPhone: "+1-234-567-8903",
			packageName: "Mountain Trek",
			batchId: "4",
			batchStartDate: "2024-03-01",
			passengers: 2,
			totalAmount: 2200,
			advancePaid: 0,
			balanceAmount: 2200,
			status: "cancelled",
			bookingDate: "2024-01-23",
			paymentMethod: "Credit Card",
		},
	],
	pending: [],
	confirmed: [],
	cancelled: [],
	completed: [],
};

export function BookingList({ status }: BookingListProps) {
	const [searchTerm, setSearchTerm] = useState("");

	// Filter bookings based on status
	let bookings = mockBookings.all;
	if (status !== "all") {
		bookings = mockBookings.all.filter((booking) => booking.status === status);
	}

	const filteredBookings = bookings.filter(
		(booking) =>
			booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.packageName.toLowerCase().includes(searchTerm.toLowerCase())
	);

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

	const getPaymentStatus = (advancePaid: number, totalAmount: number) => {
		if (advancePaid === 0) {
			return <Badge variant="destructive">No Payment</Badge>;
		} else if (advancePaid < totalAmount) {
			return <Badge variant="secondary">Partial Payment</Badge>;
		} else {
			return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
		}
	};

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
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Booking ID</TableHead>
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
									{booking.id}
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
										{booking.passengers}
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<div className="flex items-center gap-1 text-sm">
											<DollarSign className="w-3 h-3" />$
											{booking.advancePaid}/${booking.totalAmount}
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
				{filteredBookings.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						No {status === "all" ? "" : status} bookings found.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
