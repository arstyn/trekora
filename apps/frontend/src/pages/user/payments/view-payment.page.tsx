import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	Archive,
	ArrowLeft,
	Download,
	Edit,
	Eye,
	FileText,
	RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

// Mock payment data
const paymentData = {
	id: "PAY001",
	bookingId: "BK001",
	paymentDate: "2024-01-20",
	status: "completed",

	// Customer Information
	customer: {
		name: "John Smith",
		email: "john.smith@email.com",
		phone: "+1-234-567-8900",
	},

	// Booking Information
	booking: {
		packageName: "Himalayan Adventure",
		totalAmount: 2400,
		paidAmount: 2400,
		balanceAmount: 0,
	},

	// Payment Details
	payment: {
		amount: 1200,
		paymentType: "advance",
		paymentMethod: "Bank Transfer",
		paymentReference: "TXN123456789",
		paymentScreenshot: "payment_receipt.jpg",
		notes: "Initial advance payment for Himalayan Adventure package",
	},

	// Transaction History
	transactionHistory: [
		{
			id: "TXN001",
			date: "2024-01-20",
			action: "Payment Created",
			amount: 1200,
			status: "completed",
			notes: "Initial advance payment",
		},
		{
			id: "TXN002",
			date: "2024-01-20",
			action: "Payment Verified",
			amount: 1200,
			status: "completed",
			notes: "Bank transfer verified",
		},
	],

	// Documents
	documents: [
		{ id: "1", name: "Payment Receipt", type: "Image", uploadDate: "2024-01-20" },
		{ id: "2", name: "Bank Statement", type: "PDF", uploadDate: "2024-01-20" },
	],
};

export default function PaymentDetailsPage() {
	const { id } = useParams<{ id: string }>();

	const [selectedDocument, setSelectedDocument] = useState<any>(null);

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

	const handleArchive = () => {
		if (confirm("Are you sure you want to archive this payment?")) {
			// Handle archive logic
			console.log("Archiving payment:", id);
		}
	};

	const handleRetry = () => {
		if (confirm("Are you sure you want to retry this payment?")) {
			// Handle retry logic
			console.log("Retrying payment:", id);
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to="/payments">
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Payments
						</Button>
					</NavLink>
					<div>
						<h1 className="text-3xl font-bold">Payment {paymentData.id}</h1>
						<p className="text-muted-foreground">
							Made on{" "}
							{new Date(paymentData.paymentDate).toLocaleDateString()}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(paymentData.status)}
					{getPaymentTypeBadge(paymentData.payment.paymentType)}
					<div className="flex gap-2">
						{paymentData.status === "failed" && (
							<Button variant="outline" onClick={handleRetry}>
								<RefreshCw className="w-4 h-4 mr-2" />
								Retry
							</Button>
						)}
						{paymentData.status !== "archived" && (
							<Button variant="outline" onClick={handleArchive}>
								<Archive className="w-4 h-4 mr-2" />
								Archive
							</Button>
						)}
						<NavLink to={`/payments/edit/${id}`}>
							<Button>
								<Edit className="w-4 h-4 mr-2" />
								Edit Payment
							</Button>
						</NavLink>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Payment Overview */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Payment Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">
									Payment Amount
								</p>
								<p className="text-2xl font-bold">
									${paymentData.payment.amount}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Payment Method
								</p>
								<p className="font-medium">
									{paymentData.payment.paymentMethod}
								</p>
							</div>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">
									Reference Number
								</p>
								<p className="font-medium">
									{paymentData.payment.paymentReference}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Payment Date
								</p>
								<p className="font-medium">
									{new Date(
										paymentData.paymentDate
									).toLocaleDateString()}
								</p>
							</div>
						</div>
						{paymentData.payment.notes && (
							<>
								<Separator />
								<div>
									<p className="text-sm text-muted-foreground">Notes</p>
									<p className="text-sm">{paymentData.payment.notes}</p>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Customer & Booking Info */}
				<Card>
					<CardHeader>
						<CardTitle>Customer & Booking</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">Customer</p>
							<p className="font-medium">{paymentData.customer.name}</p>
							<p className="text-sm text-muted-foreground">
								{paymentData.customer.email}
							</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground">Booking ID</p>
							<NavLink
								to={`/bookings/${paymentData.bookingId}`}
								className="font-medium text-blue-600 hover:underline"
							>
								{paymentData.bookingId}
							</NavLink>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Package</p>
							<p className="font-medium">
								{paymentData.booking.packageName}
							</p>
						</div>
						<Separator />
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Total Amount:</span>
								<span>${paymentData.booking.totalAmount}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Paid Amount:</span>
								<span>${paymentData.booking.paidAmount}</span>
							</div>
							<div className="flex justify-between font-medium border-t pt-2">
								<span>Balance:</span>
								<span>${paymentData.booking.balanceAmount}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Transaction History */}
			<Card>
				<CardHeader>
					<CardTitle>Transaction History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{paymentData.transactionHistory.map((transaction) => (
							<div
								key={transaction.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div>
									<p className="font-medium">{transaction.action}</p>
									<p className="text-sm text-muted-foreground">
										{new Date(transaction.date).toLocaleDateString()}{" "}
										• {transaction.notes}
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">${transaction.amount}</p>
									{getStatusBadge(transaction.status)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Documents */}
			<Card>
				<CardHeader>
					<CardTitle>Documents & Attachments</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{paymentData.documents.map((doc) => (
							<div
								key={doc.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex items-center gap-3">
									<FileText className="w-8 h-8 text-muted-foreground" />
									<div>
										<p className="font-medium">{doc.name}</p>
										<p className="text-sm text-muted-foreground">
											{doc.type} •{" "}
											{new Date(
												doc.uploadDate
											).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedDocument(doc)}
									>
										<Eye className="w-4 h-4" />
									</Button>
									<Button variant="outline" size="sm">
										<Download className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Document Viewer Modal */}
			<Dialog
				open={!!selectedDocument}
				onOpenChange={() => setSelectedDocument(null)}
			>
				<DialogContent className="max-w-4xl max-h-[90vh]">
					<DialogHeader>
						<DialogTitle>
							<div className="flex items-center gap-2">
								<FileText className="w-5 h-5" />
								{selectedDocument?.name}
							</div>
						</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
						<div className="text-center">
							<FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">
								Document preview would appear here
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								{selectedDocument?.type} • Uploaded on{" "}
								{selectedDocument &&
									new Date(
										selectedDocument.uploadDate
									).toLocaleDateString()}
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
