import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { preBookingService } from "@/services/pre-booking.service";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Calendar, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PreBookingResponseDto } from "@/types/pre-booking.types";
import type { IBatches } from "@/types/batches.types";

interface ConvertToBookingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preBookingId: string;
	preBooking: PreBookingResponseDto;
	onSuccess: () => void;
}

export function ConvertToBookingDialog({
	open,
	onOpenChange,
	preBookingId,
	preBooking,
	onSuccess,
}: ConvertToBookingDialogProps) {
	const [loading, setLoading] = useState(false);
	const [batches, setBatches] = useState<IBatches[]>([]);
	const [loadingBatches, setLoadingBatches] = useState(false);
	const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
	const [loadingCustomers, setLoadingCustomers] = useState(false);

	const [formData, setFormData] = useState({
		batchId: "",
		totalAmount: preBooking.estimatedAmount || 0,
		customerIds: preBooking.customer ? [preBooking.customer.id] : [],
		specialRequests: preBooking.specialRequests || "",

		// Initial Payment
		includeInitialPayment: false,
		paymentAmount: 0,
		paymentMethod: "cash" as
			| "bank_transfer"
			| "credit_card"
			| "debit_card"
			| "cash"
			| "upi"
			| "other",
		paymentDate: new Date().toISOString().split("T")[0],
		paymentReference: "",
	});

	useEffect(() => {
		if (open && preBooking.package) {
			fetchBatches();
			fetchCustomers();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, preBooking.package]);

	const fetchBatches = async () => {
		if (!preBooking.package) return;

		try {
			setLoadingBatches(true);
			const response = await axiosInstance.get(
				`/batches/by-package/${preBooking.package.id}`
			);
			setBatches(response.data);
		} catch (error) {
			console.error("Error fetching batches:", error);
			toast.error("Failed to load batches");
		} finally {
			setLoadingBatches(false);
		}
	};

	const fetchCustomers = async () => {
		try {
			setLoadingCustomers(true);
			const response = await axiosInstance.get("/customers?limit=100");
			const customerData = response.data.customers || response.data;
			setCustomers(
				customerData.map(
					(c: { id: string; firstName: string; lastName: string }) => ({
						id: c.id,
						name: `${c.firstName} ${c.lastName}`,
					})
				)
			);
		} catch (error) {
			console.error("Error fetching customers:", error);
			toast.error("Failed to load customers");
		} finally {
			setLoadingCustomers(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.batchId) {
			toast.error("Please select a batch");
			return;
		}

		if (formData.customerIds.length === 0) {
			toast.error("Please select at least one customer");
			return;
		}

		if (formData.totalAmount <= 0) {
			toast.error("Total amount must be greater than zero");
			return;
		}

		try {
			setLoading(true);

			const payload: {
				batchId: string;
				totalAmount: number;
				customerIds: string[];
				specialRequests?: string;
				initialPayment?: {
					amount: number;
					paymentMethod: typeof formData.paymentMethod;
					paymentDate: Date | string;
					paymentReference?: string;
				};
			} = {
				batchId: formData.batchId,
				totalAmount: formData.totalAmount,
				customerIds: formData.customerIds,
				specialRequests: formData.specialRequests || undefined,
			};

			if (formData.includeInitialPayment) {
				if (formData.paymentAmount <= 0) {
					toast.error("Payment amount must be greater than zero");
					return;
				}

				if (formData.paymentAmount > formData.totalAmount) {
					toast.error("Payment amount cannot exceed total amount");
					return;
				}

				payload.initialPayment = {
					amount: formData.paymentAmount,
					paymentMethod: formData.paymentMethod,
					paymentDate: formData.paymentDate,
					paymentReference: formData.paymentReference || undefined,
				};
			}

			await preBookingService.convertToBooking(preBookingId, payload);

			toast.success("Pre-booking converted to booking successfully!");
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error("Error converting to booking:", error);
			toast.error("Failed to convert to booking");
		} finally {
			setLoading(false);
		}
	};

	const selectedBatch = batches.find((b) => b.id === formData.batchId);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Convert Pre-Booking to Booking</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Package Info */}
					{preBooking.package && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Package: <strong>{preBooking.package.name}</strong> - ₹
								{preBooking.package.price.toLocaleString()}
							</AlertDescription>
						</Alert>
					)}

					{/* Batch Selection */}
					<div className="space-y-2">
						<Label htmlFor="batchId">Select Batch *</Label>
						{loadingBatches ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm text-muted-foreground">
									Loading batches...
								</span>
							</div>
						) : (
							<Select
								value={formData.batchId}
								onValueChange={(value) =>
									setFormData({ ...formData, batchId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a batch" />
								</SelectTrigger>
								<SelectContent>
									{batches.map((batch) => (
										<SelectItem key={batch.id} value={batch.id}>
											<div className="flex items-center gap-2">
												<Calendar className="h-3 w-3" />
												{new Date(
													batch.startDate
												).toLocaleDateString()}{" "}
												-{" "}
												{new Date(
													batch.endDate
												).toLocaleDateString()}
												<Users className="h-3 w-3 ml-2" />
												{batch.totalSeats -
													batch.bookedSeats}{" "}
												seats
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{selectedBatch && (
							<div className="text-sm text-muted-foreground">
								<p>Total Seats: {selectedBatch.totalSeats}</p>
								<p>Booked: {selectedBatch.bookedSeats}</p>
								<p>
									Available:{" "}
									{selectedBatch.totalSeats - selectedBatch.bookedSeats}
								</p>
							</div>
						)}
					</div>

					{/* Customer Selection */}
					<div className="space-y-2">
						<Label>Select Customers *</Label>
						{loadingCustomers ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm text-muted-foreground">
									Loading customers...
								</span>
							</div>
						) : (
							<div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
								{customers.map((customer) => (
									<div
										key={customer.id}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={customer.id}
											checked={formData.customerIds.includes(
												customer.id
											)}
											onCheckedChange={(checked) => {
												if (checked) {
													setFormData({
														...formData,
														customerIds: [
															...formData.customerIds,
															customer.id,
														],
													});
												} else {
													setFormData({
														...formData,
														customerIds:
															formData.customerIds.filter(
																(id) => id !== customer.id
															),
													});
												}
											}}
										/>
										<label
											htmlFor={customer.id}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
										>
											{customer.name}
											{preBooking.customer?.id === customer.id && (
												<span className="ml-2 text-xs text-primary">
													(Primary)
												</span>
											)}
										</label>
									</div>
								))}
							</div>
						)}
						<p className="text-sm text-muted-foreground">
							Selected: {formData.customerIds.length} customer(s)
						</p>
					</div>

					{/* Amount and Special Requests */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="totalAmount">Total Amount (₹) *</Label>
							<Input
								id="totalAmount"
								type="number"
								min="0"
								value={formData.totalAmount}
								onChange={(e) =>
									setFormData({
										...formData,
										totalAmount: parseFloat(e.target.value) || 0,
									})
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="specialRequests">Special Requests</Label>
						<Textarea
							id="specialRequests"
							value={formData.specialRequests}
							onChange={(e) =>
								setFormData({
									...formData,
									specialRequests: e.target.value,
								})
							}
							rows={2}
						/>
					</div>

					{/* Initial Payment Section */}
					<div className="space-y-4 border rounded-lg p-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="includeInitialPayment"
								checked={formData.includeInitialPayment}
								onCheckedChange={(checked) =>
									setFormData({
										...formData,
										includeInitialPayment: checked as boolean,
									})
								}
							/>
							<label
								htmlFor="includeInitialPayment"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
							>
								Add Initial Payment
							</label>
						</div>

						{formData.includeInitialPayment && (
							<div className="space-y-4 pl-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="paymentAmount">
											Payment Amount (₹) *
										</Label>
										<Input
											id="paymentAmount"
											type="number"
											min="0"
											max={formData.totalAmount}
											value={formData.paymentAmount}
											onChange={(e) =>
												setFormData({
													...formData,
													paymentAmount:
														parseFloat(e.target.value) || 0,
												})
											}
											required={formData.includeInitialPayment}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="paymentMethod">
											Payment Method *
										</Label>
										<Select
											value={formData.paymentMethod}
											onValueChange={(
												value: typeof formData.paymentMethod
											) =>
												setFormData({
													...formData,
													paymentMethod: value,
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cash">Cash</SelectItem>
												<SelectItem value="bank_transfer">
													Bank Transfer
												</SelectItem>
												<SelectItem value="credit_card">
													Credit Card
												</SelectItem>
												<SelectItem value="debit_card">
													Debit Card
												</SelectItem>
												<SelectItem value="upi">UPI</SelectItem>
												<SelectItem value="other">
													Other
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="paymentDate">
											Payment Date *
										</Label>
										<Input
											id="paymentDate"
											type="date"
											value={formData.paymentDate}
											onChange={(e) =>
												setFormData({
													...formData,
													paymentDate: e.target.value,
												})
											}
											required={formData.includeInitialPayment}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="paymentReference">
											Reference/Transaction ID
										</Label>
										<Input
											id="paymentReference"
											value={formData.paymentReference}
											onChange={(e) =>
												setFormData({
													...formData,
													paymentReference: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Converting...
								</>
							) : (
								"Convert to Booking"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
