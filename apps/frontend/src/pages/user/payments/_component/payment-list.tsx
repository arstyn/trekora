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
	Archive,
	Download,
	Edit,
	Eye,
	MoreHorizontal,
	RefreshCw,
	Search,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

interface PaymentListProps {
	status: "all" | "pending" | "completed" | "failed" | "refunded" | "archived";
}

// Mock data
const mockPayments = {
	all: [
		{
			id: "PAY001",
			bookingId: "BK001",
			customerName: "John Smith",
			customerEmail: "john.smith@email.com",
			packageName: "Himalayan Adventure",
			amount: 1200,
			paymentType: "advance",
			paymentMethod: "Bank Transfer",
			status: "completed",
			paymentDate: "2024-01-20",
			reference: "TXN123456789",
			notes: "Initial advance payment",
		},
		{
			id: "PAY002",
			bookingId: "BK002",
			customerName: "Sarah Johnson",
			customerEmail: "sarah.johnson@email.com",
			packageName: "Beach Paradise",
			amount: 800,
			paymentType: "advance",
			paymentMethod: "Credit Card",
			status: "pending",
			paymentDate: "2024-01-21",
			reference: "CC987654321",
			notes: "Awaiting bank confirmation",
		},
		{
			id: "PAY003",
			bookingId: "BK001",
			customerName: "John Smith",
			customerEmail: "john.smith@email.com",
			packageName: "Himalayan Adventure",
			amount: 1200,
			paymentType: "balance",
			paymentMethod: "Cash",
			status: "completed",
			paymentDate: "2024-01-22",
			reference: "CASH001",
			notes: "Final balance payment",
		},
		{
			id: "PAY004",
			bookingId: "BK003",
			customerName: "Mike Wilson",
			customerEmail: "mike.wilson@email.com",
			packageName: "Cultural Heritage Tour",
			amount: 475,
			paymentType: "partial",
			paymentMethod: "UPI",
			status: "failed",
			paymentDate: "2024-01-23",
			reference: "UPI789123456",
			notes: "Payment failed due to insufficient funds",
		},
		{
			id: "PAY005",
			bookingId: "BK004",
			customerName: "Emily Davis",
			customerEmail: "emily.davis@email.com",
			packageName: "Mountain Trek",
			amount: 550,
			paymentType: "refund",
			paymentMethod: "Bank Transfer",
			status: "refunded",
			paymentDate: "2024-01-24",
			reference: "REF001",
			notes: "Booking cancellation refund",
		},
	],
	pending: [],
	completed: [],
	failed: [],
	refunded: [],
	archived: [],
};

export function PaymentList({ status }: PaymentListProps) {
	const [searchTerm, setSearchTerm] = useState("");

	// Filter payments based on status
	let payments = mockPayments.all;
	if (status !== "all") {
		payments = mockPayments.all.filter((payment) => payment.status === status);
	}

	const filteredPayments = payments.filter(
		(payment) =>
			payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case "failed":
				return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
			case "refunded":
				return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
			case "archived":
				return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getPaymentTypeBadge = (type: string) => {
		switch (type) {
			case "advance":
				return (
					<Badge variant="outline" className="bg-blue-50 text-blue-700">
						Advance
					</Badge>
				);
			case "balance":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700">
						Balance
					</Badge>
				);
			case "partial":
				return (
					<Badge variant="outline" className="bg-orange-50 text-orange-700">
						Partial
					</Badge>
				);
			case "refund":
				return (
					<Badge variant="outline" className="bg-red-50 text-red-700">
						Refund
					</Badge>
				);
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	const handleArchive = (paymentId: string) => {
		// Handle archive logic
		console.log("Archiving payment:", paymentId);
	};

	const handleRetry = (paymentId: string) => {
		// Handle retry logic for failed payments
		console.log("Retrying payment:", paymentId);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle className="capitalize">
						{status === "all" ? "All" : status} Payments
					</CardTitle>
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search payments..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 w-64"
							/>
						</div>
						<Button variant="outline" size="sm">
							<Download className="w-4 h-4 mr-2" />
							Export
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Payment ID</TableHead>
							<TableHead>Booking ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Package</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredPayments.map((payment) => (
							<TableRow key={payment.id}>
								<TableCell className="font-medium">
									{payment.id}
								</TableCell>
								<TableCell>
									<NavLink
										to={`/bookings/${payment.bookingId}`}
										className="text-blue-600 hover:underline"
									>
										{payment.bookingId}
									</NavLink>
								</TableCell>
								<TableCell>
									<div>
										<p className="font-medium">
											{payment.customerName}
										</p>
										<p className="text-sm text-muted-foreground">
											{payment.customerEmail}
										</p>
									</div>
								</TableCell>
								<TableCell className="text-sm">
									{payment.packageName}
								</TableCell>
								<TableCell className="font-medium">
									${payment.amount}
								</TableCell>
								<TableCell>
									{getPaymentTypeBadge(payment.paymentType)}
								</TableCell>
								<TableCell className="text-sm">
									{payment.paymentMethod}
								</TableCell>
								<TableCell>{getStatusBadge(payment.status)}</TableCell>
								<TableCell className="text-sm">
									{new Date(payment.paymentDate).toLocaleDateString()}
								</TableCell>
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
													to={`/payments/${payment.id}`}
													className="flex items-center"
												>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</NavLink>
											</DropdownMenuItem>
											{payment.status !== "archived" && (
												<DropdownMenuItem asChild>
													<NavLink
														to={`/payments/${payment.id}/edit`}
														className="flex items-center"
													>
														<Edit className="mr-2 h-4 w-4" />
														Edit Payment
													</NavLink>
												</DropdownMenuItem>
											)}
											{payment.status === "failed" && (
												<DropdownMenuItem
													onClick={() =>
														handleRetry(payment.id)
													}
												>
													<RefreshCw className="mr-2 h-4 w-4" />
													Retry Payment
												</DropdownMenuItem>
											)}
											{payment.status !== "archived" && (
												<DropdownMenuItem
													onClick={() =>
														handleArchive(payment.id)
													}
												>
													<Archive className="mr-2 h-4 w-4" />
													Archive
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{filteredPayments.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						No {status === "all" ? "" : status} payments found.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
