import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface AddPaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// Mock bookings data
const mockBookings = [
	{
		id: "BK001",
		customerName: "John Smith",
		packageName: "Himalayan Adventure",
		totalAmount: 2400,
		paidAmount: 1200,
		balanceAmount: 1200,
	},
	{
		id: "BK002",
		customerName: "Sarah Johnson",
		packageName: "Beach Paradise",
		totalAmount: 3200,
		paidAmount: 800,
		balanceAmount: 2400,
	},
	{
		id: "BK003",
		customerName: "Mike Wilson",
		packageName: "Cultural Heritage Tour",
		totalAmount: 950,
		paidAmount: 475,
		balanceAmount: 475,
	},
];

export function AddPaymentDialog({ open, onOpenChange }: AddPaymentDialogProps) {
	const [formData, setFormData] = useState({
		bookingId: "",
		amount: "",
		paymentType: "",
		paymentMethod: "",
		paymentReference: "",
		paymentDate: new Date().toISOString().split("T")[0],
		paymentScreenshot: null as File | null,
		notes: "",
	});

	const [bookingSearch, setBookingSearch] = useState("");

	const selectedBooking = mockBookings.find(
		(booking) => booking.id === formData.bookingId
	);

	const filteredBookings = mockBookings.filter(
		(booking) =>
			booking.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
			booking.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
			booking.packageName.toLowerCase().includes(bookingSearch.toLowerCase())
	);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Adding payment:", formData);
		onOpenChange(false);
		// Reset form
		setFormData({
			bookingId: "",
			amount: "",
			paymentType: "",
			paymentMethod: "",
			paymentReference: "",
			paymentDate: new Date().toISOString().split("T")[0],
			paymentScreenshot: null,
			notes: "",
		});
		setBookingSearch("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Payment</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Booking Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Select Booking</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="bookingSearch">Search Booking</Label>
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										id="bookingSearch"
										placeholder="Search by booking ID, customer name, or package..."
										value={bookingSearch}
										onChange={(e) => setBookingSearch(e.target.value)}
										className="pl-8"
									/>
								</div>
							</div>

							{bookingSearch && (
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{filteredBookings.map((booking) => (
										<div
											key={booking.id}
											className={`p-3 border rounded-lg cursor-pointer transition-colors ${
												formData.bookingId === booking.id
													? "border-primary bg-primary/5"
													: "hover:bg-muted/50"
											}`}
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													bookingId: booking.id,
												}))
											}
										>
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">
														{booking.id} -{" "}
														{booking.customerName}
													</p>
													<p className="text-sm text-muted-foreground">
														{booking.packageName}
													</p>
												</div>
												<div className="text-right text-sm">
													<p>Total: ${booking.totalAmount}</p>
													<p>Paid: ${booking.paidAmount}</p>
													<p className="font-medium">
														Balance: ${booking.balanceAmount}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{selectedBooking && (
								<div className="p-4 bg-muted/50 rounded-lg">
									<h4 className="font-medium mb-2">Selected Booking</h4>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p>
												<span className="font-medium">
													Booking ID:
												</span>{" "}
												{selectedBooking.id}
											</p>
											<p>
												<span className="font-medium">
													Customer:
												</span>{" "}
												{selectedBooking.customerName}
											</p>
											<p>
												<span className="font-medium">
													Package:
												</span>{" "}
												{selectedBooking.packageName}
											</p>
										</div>
										<div>
											<p>
												<span className="font-medium">
													Total Amount:
												</span>{" "}
												${selectedBooking.totalAmount}
											</p>
											<p>
												<span className="font-medium">
													Paid Amount:
												</span>{" "}
												${selectedBooking.paidAmount}
											</p>
											<p>
												<span className="font-medium">
													Balance:
												</span>{" "}
												${selectedBooking.balanceAmount}
											</p>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Payment Details */}
					{formData.bookingId && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Payment Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="amount">Payment Amount *</Label>
										<Input
											id="amount"
											type="number"
											min="0"
											max={selectedBooking?.balanceAmount}
											value={formData.amount}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													amount: e.target.value,
												}))
											}
											placeholder="Enter amount"
											required
										/>
									</div>
									<div>
										<Label htmlFor="paymentType">
											Payment Type *
										</Label>
										<Select
											value={formData.paymentType}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													paymentType: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select payment type" />
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
												<SelectItem value="refund">
													Refund
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="paymentMethod">
											Payment Method *
										</Label>
										<Select
											value={formData.paymentMethod}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													paymentMethod: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select payment method" />
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
												<SelectItem value="Cheque">
													Cheque
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="paymentDate">
											Payment Date *
										</Label>
										<Input
											id="paymentDate"
											type="date"
											value={formData.paymentDate}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													paymentDate: e.target.value,
												}))
											}
											required
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="paymentReference">
										Payment Reference
									</Label>
									<Input
										id="paymentReference"
										value={formData.paymentReference}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												paymentReference: e.target.value,
											}))
										}
										placeholder="Transaction ID, Check number, etc."
									/>
								</div>

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
											setFormData((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
										placeholder="Additional notes about this payment..."
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Action Buttons */}
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!formData.bookingId || !formData.amount}
						>
							Add Payment
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
