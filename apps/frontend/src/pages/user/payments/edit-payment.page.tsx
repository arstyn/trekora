import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

// Mock existing payment data
const existingPaymentData = {
	id: "PAY001",
	bookingId: "BK001",
	paymentDate: "2024-01-20",
	status: "completed",

	customer: {
		name: "John Smith",
		email: "john.smith@email.com",
	},

	booking: {
		packageName: "Himalayan Adventure",
		totalAmount: 2400,
		paidAmount: 2400,
		balanceAmount: 0,
	},

	payment: {
		amount: 1200,
		paymentType: "advance",
		paymentMethod: "Bank Transfer",
		paymentReference: "TXN123456789",
		paymentScreenshot: null as File | null,
		notes: "Initial advance payment for Himalayan Adventure package",
	},
};

export default function EditPaymentPage() {
	const { id } = useParams<{ id: string }>();

	const [formData, setFormData] = useState({
		amount: existingPaymentData.payment.amount.toString(),
		paymentType: existingPaymentData.payment.paymentType,
		paymentMethod: existingPaymentData.payment.paymentMethod,
		paymentReference: existingPaymentData.payment.paymentReference,
		paymentDate: existingPaymentData.paymentDate,
		paymentScreenshot: existingPaymentData.payment.paymentScreenshot,
		notes: existingPaymentData.payment.notes,
		status: existingPaymentData.status,
	});

	const [hasChanges, setHasChanges] = useState(false);

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
			setHasChanges(true);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Updating payment:", formData);
		setHasChanges(false);
		// Show success message or redirect
	};

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

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to={`/payments/${id}`}>
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Details
						</Button>
					</NavLink>
					<div>
						<h1 className="text-3xl font-bold">Edit Payment {id}</h1>
						<p className="text-muted-foreground">
							Update payment information and details
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(formData.status)}
					{hasChanges && <Badge variant="outline">Unsaved Changes</Badge>}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Booking Information (Read-only) */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Booking ID</Label>
								<div className="p-2 bg-muted/50 rounded">
									<NavLink
										to={`/bookings/${existingPaymentData.bookingId}`}
										className="text-blue-600 hover:underline"
									>
										{existingPaymentData.bookingId}
									</NavLink>
								</div>
							</div>
							<div>
								<Label>Customer</Label>
								<div className="p-2 bg-muted/50 rounded">
									{existingPaymentData.customer.name}
								</div>
							</div>
						</div>
						<div>
							<Label>Package</Label>
							<div className="p-2 bg-muted/50 rounded">
								{existingPaymentData.booking.packageName}
							</div>
						</div>
						<Separator />
						<div className="grid grid-cols-3 gap-4 text-sm">
							<div>
								<Label>Total Amount</Label>
								<div className="p-2 bg-muted/50 rounded font-medium">
									${existingPaymentData.booking.totalAmount}
								</div>
							</div>
							<div>
								<Label>Paid Amount</Label>
								<div className="p-2 bg-muted/50 rounded font-medium">
									${existingPaymentData.booking.paidAmount}
								</div>
							</div>
							<div>
								<Label>Balance</Label>
								<div className="p-2 bg-muted/50 rounded font-medium">
									${existingPaymentData.booking.balanceAmount}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Payment Details */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="amount">Payment Amount *</Label>
								<Input
									id="amount"
									type="number"
									min="0"
									value={formData.amount}
									onChange={(e) =>
										handleInputChange("amount", e.target.value)
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="paymentType">Payment Type *</Label>
								<Select
									value={formData.paymentType}
									onValueChange={(value) =>
										handleInputChange("paymentType", value)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="advance">
											Advance Payment
										</SelectItem>
										<SelectItem value="balance">
											Balance Payment
										</SelectItem>
										<SelectItem value="partial">
											Partial Payment
										</SelectItem>
										<SelectItem value="refund">Refund</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="paymentMethod">Payment Method *</Label>
								<Select
									value={formData.paymentMethod}
									onValueChange={(value) =>
										handleInputChange("paymentMethod", value)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Bank Transfer">
											Bank Transfer
										</SelectItem>
										<SelectItem value="Credit Card">
											Credit Card
										</SelectItem>
										<SelectItem value="Debit Card">
											Debit Card
										</SelectItem>
										<SelectItem value="Cash">Cash</SelectItem>
										<SelectItem value="UPI">UPI</SelectItem>
										<SelectItem value="Cheque">Cheque</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="paymentDate">Payment Date *</Label>
								<Input
									id="paymentDate"
									type="date"
									value={formData.paymentDate}
									onChange={(e) =>
										handleInputChange("paymentDate", e.target.value)
									}
									required
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="paymentReference">Payment Reference</Label>
							<Input
								id="paymentReference"
								value={formData.paymentReference}
								onChange={(e) =>
									handleInputChange("paymentReference", e.target.value)
								}
								placeholder="Transaction ID, Check number, etc."
							/>
						</div>

						<div>
							<Label htmlFor="status">Payment Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									handleInputChange("status", value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
									<SelectItem value="refunded">Refunded</SelectItem>
									<SelectItem value="archived">Archived</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Documents */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Documents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="paymentScreenshot">
								Payment Screenshot/Receipt
							</Label>
							<div className="mt-2">
								<label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
									<div className="text-center">
										<Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">
											{formData.paymentScreenshot
												? formData.paymentScreenshot.name
												: "Click to upload payment proof"}
										</p>
									</div>
									<input
										type="file"
										className="hidden"
										accept="image/*,.pdf"
										onChange={handleFileUpload}
									/>
								</label>
							</div>
						</div>

						<div>
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								value={formData.notes}
								onChange={(e) =>
									handleInputChange("notes", e.target.value)
								}
								placeholder="Additional notes about this payment..."
								rows={4}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex justify-between items-center pt-6">
					<div>
						<NavLink to={`/payments/${id}`}>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</NavLink>
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={!hasChanges}>
							<Save className="w-4 h-4 mr-2" />
							Save Changes
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
