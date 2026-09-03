import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	ArrowLeft,
	Save,
	Loader2,
	AlertCircle,
	Users,
	Package,
	DollarSign,
	UserCheck,
} from "lucide-react";
import type React from "react";
import BookingService from "@/services/booking.service";
import AgentService from "@/services/agent.service";
import type { IAgent } from "@/types/agent.types";
import { AgentSelector } from "./_components/agent-selector";
import type {
	IBooking,
	IUpdateBookingRequest,
	BookingStatus,
	ICustomer,
} from "@/types/booking.types";
import { toast } from "sonner";

export default function EditBookingPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [booking, setBooking] = useState<IBooking | null>(null);
	const [agents, setAgents] = useState<IAgent[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState<{
		status: BookingStatus;
		totalAmount: number;
		specialRequests: string;
		customerIds: string[];
		selectedCustomers: ICustomer[];
		agentId?: string;
		agentCommissionType?: "percentage" | "fixed";
		agentCommissionValue?: number;
		agentCommissionAmount?: number;
		agentPayoutStatus?: "pending" | "paid" | "cancelled";
	}>({
		status: "pending",
		totalAmount: 0,
		specialRequests: "",
		customerIds: [],
		selectedCustomers: [],
		agentId: undefined,
		agentCommissionType: undefined,
		agentCommissionValue: undefined,
		agentCommissionAmount: 0,
		agentPayoutStatus: "pending",
	});

	useEffect(() => {
		const loadAgents = async () => {
			try {
				const activeAgents = await AgentService.getAllAgents({ status: "active" });
				setAgents(activeAgents);
			} catch (err) {
				console.error("Error loading agents:", err);
			}
		};
		loadAgents();
	}, []);

	const loadBookingData = useCallback(async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError(null);
			const bookingData = await BookingService.getBookingById(id);
			setBooking(bookingData);

			// Populate form with existing data
			setFormData({
				status: bookingData.status,
				totalAmount: bookingData.totalAmount,
				specialRequests: bookingData.specialRequests || "",
				customerIds: bookingData.customers.map((c) => c.id).filter((id): id is string => Boolean(id)),
				selectedCustomers: bookingData.customers,
				agentId: bookingData.agentId || undefined,
				agentCommissionType: bookingData.agentCommissionType,
				agentCommissionValue: bookingData.agentCommissionValue,
				agentCommissionAmount: bookingData.agentCommissionAmount || 0,
				agentPayoutStatus: bookingData.agentPayoutStatus || "pending",
			});
		} catch (err) {
			console.error("Error loading booking:", err);
			setError(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(err as any)?.response?.data?.message || "Failed to load booking details."
			);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (id) {
			loadBookingData();
		}
	}, [id, loadBookingData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!booking || !id) return;

		try {
			setSaving(true);
			setError(null);

			// Validate customers
			if (formData.customerIds.length === 0) {
				setError("At least one customer is required");
				return;
			}

			const updateData: IUpdateBookingRequest = {
				status: formData.status,
				totalAmount: formData.totalAmount,
				specialRequests: formData.specialRequests,
				customerIds: formData.customerIds,
				agentId: formData.agentId || undefined,
				agentCommissionType: formData.agentCommissionType,
				agentCommissionValue: formData.agentCommissionValue,
				agentCommissionAmount: formData.agentCommissionAmount,
				agentPayoutStatus: formData.agentPayoutStatus,
			};

			const updatedBooking = await BookingService.updateBooking(id, updateData);

			toast.success("Booking updated successfully", {
				description: `Booking ${BookingService.formatBookingNumber(
					updatedBooking.bookingNumber
				)} has been updated.`,
			});

			// Navigate back to booking details
			navigate(`/bookings/${id}`);
		} catch (err) {
			console.error("Error updating booking:", err);
			setError(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(err as any)?.response?.data?.message ||
					"Failed to update booking. Please try again."
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex items-center gap-4">
					<NavLink to={id ? `/bookings/${id}` : "/bookings"}>
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back
						</Button>
					</NavLink>
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span>Loading booking details...</span>
					</div>
				</div>
			</div>
		);
	}

	if (error && !booking) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex items-center gap-4">
					<NavLink to="/bookings">
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Bookings
						</Button>
					</NavLink>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{error}
						<Button
							variant="outline"
							size="sm"
							className="ml-4"
							onClick={loadBookingData}
						>
							Try Again
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!booking) return null;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to={`/bookings/${id}`}>
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Details
						</Button>
					</NavLink>
					<div>
						<h1 className="text-3xl font-bold">
							Edit Booking{" "}
							{BookingService.formatBookingNumber(booking.bookingNumber)}
						</h1>
						<p className="text-muted-foreground">
							Update booking information and customer details
						</p>
					</div>
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Customer Information (Read-only) */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Primary Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="space-y-2">
								<Label>Customer Name</Label>
								<Input
									value={`${booking.primaryCustomer.firstName} ${booking.primaryCustomer.lastName}`}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label>Email</Label>
								<Input value={booking.primaryCustomer.email} disabled />
							</div>
							<div className="space-y-2">
								<Label>Phone</Label>
								<Input value={booking.primaryCustomer.phone} disabled />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Package Information (Read-only) */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="w-5 h-5" />
							Package & Batch Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label>Package</Label>
								<Input value={booking.package.name} disabled />
							</div>
							<div className="space-y-2">
								<Label>Batch Dates</Label>
								<Input
									value={`${new Date(
										booking.batch.startDate
									).toLocaleDateString()} - ${new Date(
										booking.batch.endDate
									).toLocaleDateString()}`}
									disabled
								/>
								<p className="text-sm text-muted-foreground mt-1">
									{booking.batch.bookedSeats} /{" "}
									{booking.batch.totalSeats} seats booked
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Booking Status & Amount */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5" />
							Booking Status & Amount
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label htmlFor="status">Booking Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value: BookingStatus) =>
										setFormData((prev) => ({
											...prev,
											status: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="confirmed">
											Confirmed
										</SelectItem>
										<SelectItem value="cancelled">
											Cancelled
										</SelectItem>
										<SelectItem value="completed">
											Completed
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="totalAmount">Total Amount</Label>
								<Input
									id="totalAmount"
									type="number"
									value={formData.totalAmount}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											totalAmount:
												Number.parseFloat(e.target.value) || 0,
										}))
									}
									required
								/>
								<p className="text-sm text-muted-foreground mt-1">
									Current balance:{" "}
									{BookingService.formatCurrency(booking.balanceAmount)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Referring Agent & Commission Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							Referring Agent & Commission Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<AgentSelector
							agents={agents}
							bookingTotalAmount={formData.totalAmount}
							value={{
								agentId: formData.agentId,
								commissionType: formData.agentCommissionType,
								commissionValue: formData.agentCommissionValue,
								commissionAmount: formData.agentCommissionAmount,
							}}
							onChange={(agentData) => {
								setFormData((prev) => ({
									...prev,
									agentId: agentData.agentId,
									agentCommissionType: agentData.commissionType,
									agentCommissionValue: agentData.commissionValue,
									agentCommissionAmount: agentData.commissionAmount,
								}));
							}}
						/>
					</CardContent>
				</Card>

				{/* Customer Details (Read-only display) */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Customer Details ({formData.selectedCustomers.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{formData.selectedCustomers.map((customer) => (
								<div key={customer.id} className="p-4 border rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<Label className="text-sm font-medium">
												Name
											</Label>
											<p className="text-sm">
												{customer.firstName} {customer.lastName}
											</p>
										</div>
										{!(customer.email && customer.email.trim()) && !(customer.phone && customer.phone.trim()) ? (
											<div>
												<Label className="text-sm font-medium">Contact Info</Label>
												<p className="text-sm text-muted-foreground italic">N/A</p>
											</div>
										) : (
											<>
												<div>
													<Label className="text-sm font-medium">Email</Label>
													<p className="text-sm">{customer.email && customer.email.trim() ? customer.email : <span className="text-muted-foreground italic">N/A</span>}</p>
												</div>
												<div>
													<Label className="text-sm font-medium">Phone</Label>
													<p className="text-sm">{customer.phone && customer.phone.trim() ? customer.phone : <span className="text-muted-foreground italic">N/A</span>}</p>
												</div>
											</>
										)}
									</div>
									{(customer.specialRequests ||
										customer.medicalConditions ||
										customer.dietaryRestrictions) && (
										<div className="mt-3 pt-3 border-t">
											<Label className="text-sm font-medium">
												Special Information
											</Label>
											<div className="text-sm space-y-1">
												{customer.specialRequests && (
													<p>
														<strong>Requests:</strong>{" "}
														{customer.specialRequests}
													</p>
												)}
												{customer.medicalConditions && (
													<p>
														<strong>Medical:</strong>{" "}
														{customer.medicalConditions}
													</p>
												)}
												{customer.dietaryRestrictions && (
													<p>
														<strong>Dietary:</strong>{" "}
														{customer.dietaryRestrictions}
													</p>
												)}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
						<p className="text-sm text-muted-foreground mt-4">
							Customer details cannot be edited here. To modify customer
							information, please update the customer profile separately.
						</p>
					</CardContent>
				</Card>

				{/* Special Requests */}
				<Card>
					<CardHeader>
						<CardTitle>Special Requests</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							value={formData.specialRequests}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									specialRequests: e.target.value,
								}))
							}
							placeholder="Any special arrangements or requests..."
							rows={4}
						/>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex justify-between">
					<NavLink to={`/bookings/${id}`}>
						<Button type="button" variant="outline" disabled={saving}>
							Cancel
						</Button>
					</NavLink>
					<Button type="submit" disabled={saving}>
						{saving ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="w-4 h-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
