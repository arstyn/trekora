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
import { ArrowLeft, Plus, Save, Trash2, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

// Mock data - in real app, this would come from API
const packages = [
	{ id: "1", name: "Himalayan Adventure", price: 1200 },
	{ id: "2", name: "Beach Paradise", price: 800 },
	{ id: "3", name: "Cultural Heritage Tour", price: 950 },
	{ id: "4", name: "Mountain Trek", price: 1100 },
];

const availableBatches = {
	"1": [
		{
			id: "1",
			startDate: "2024-02-15",
			endDate: "2024-02-25",
			availableSeats: 2,
			totalSeats: 20,
		},
		{
			id: "5",
			startDate: "2024-03-15",
			endDate: "2024-03-25",
			availableSeats: 8,
			totalSeats: 20,
		},
	],
	"2": [
		{
			id: "2",
			startDate: "2024-02-20",
			endDate: "2024-02-27",
			availableSeats: 3,
			totalSeats: 15,
		},
	],
	"3": [
		{
			id: "3",
			startDate: "2024-02-25",
			endDate: "2024-03-04",
			availableSeats: 6,
			totalSeats: 25,
		},
	],
	"4": [
		{
			id: "4",
			startDate: "2024-03-01",
			endDate: "2024-03-09",
			availableSeats: 4,
			totalSeats: 12,
		},
	],
};

// Mock existing booking data
const existingBookingData = {
	id: "BK001",
	bookingDate: "2024-01-20",
	status: "confirmed",

	// Customer Information
	customer: {
		name: "John Smith",
		email: "john.smith@email.com",
		phone: "+1-234-567-8900",
		address: "123 Main Street, New York, NY 10001",
	},

	// Package & Batch Information
	packageId: "1",
	batchId: "1",
	numberOfPassengers: 2,

	// Passengers
	passengers: [
		{
			id: "p1",
			name: "John Smith",
			age: "35",
			email: "john.smith@email.com",
			phone: "+1-234-567-8900",
			emergencyContact: "Jane Smith (+1-234-567-8901)",
			specialRequirements: "Vegetarian meals",
		},
		{
			id: "p2",
			name: "Jane Smith",
			age: "32",
			email: "jane.smith@email.com",
			phone: "+1-234-567-8901",
			emergencyContact: "John Smith (+1-234-567-8900)",
			specialRequirements: "None",
		},
	],

	// Payment Information
	payment: {
		totalAmount: 2400,
		advancePaid: 1200,
		balanceAmount: 1200,
		paymentMethod: "Bank Transfer",
		paymentReference: "TXN123456789",
		paymentScreenshot: null as File | null,
	},

	// Additional Information
	specialRequests: "Please arrange for airport pickup and drop-off.",
};

export default function EditBookingPage() {
	const { id } = useParams<{ id: string }>();

	const [formData, setFormData] = useState({
		// Customer Details
		customerName: existingBookingData.customer.name,
		customerEmail: existingBookingData.customer.email,
		customerPhone: existingBookingData.customer.phone,
		customerAddress: existingBookingData.customer.address,

		// Package & Batch Selection
		packageId: existingBookingData.packageId,
		batchId: existingBookingData.batchId,
		numberOfPassengers: existingBookingData.numberOfPassengers,

		// Passenger Details
		passengers: existingBookingData.passengers,

		// Payment Details
		totalAmount: existingBookingData.payment.totalAmount,
		advanceAmount: existingBookingData.payment.advancePaid,
		paymentMethod: existingBookingData.payment.paymentMethod,
		paymentReference: existingBookingData.payment.paymentReference,
		paymentScreenshot: existingBookingData.payment.paymentScreenshot,

		// Additional Details
		specialRequests: existingBookingData.specialRequests,

		// Status
		status: existingBookingData.status,
	});

	const [hasChanges, setHasChanges] = useState(false);

	const selectedPackage = packages.find((p) => p.id === formData.packageId);
	const batches = formData.packageId
		? availableBatches[formData.packageId as keyof typeof availableBatches] || []
		: [];
	const selectedBatch = batches.find((b) => b.id === formData.batchId);

	const updatePassengerCount = (count: number) => {
		const newPassengers = Array.from(
			{ length: count },
			(_, i) =>
				formData.passengers[i] || {
					id: `p${i + 1}`,
					name: "",
					age: "",
					email: "",
					phone: "",
					emergencyContact: "",
					specialRequirements: "",
				}
		);
		setFormData((prev) => ({
			...prev,
			numberOfPassengers: count,
			passengers: newPassengers,
			totalAmount: selectedPackage ? selectedPackage.price * count : 0,
		}));
		setHasChanges(true);
	};

	const updatePassenger = (index: number, field: string, value: string) => {
		const newPassengers = [...formData.passengers];
		newPassengers[index] = { ...newPassengers[index], [field]: value };
		setFormData((prev) => ({ ...prev, passengers: newPassengers }));
		setHasChanges(true);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
			setHasChanges(true);
		}
	};

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Updating booking:", formData);
		setHasChanges(false);
		// Show success message or redirect
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
						<h1 className="text-3xl font-bold">Edit Booking {id}</h1>
						<p className="text-muted-foreground">
							Update booking information and details
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(formData.status)}
					{hasChanges && <Badge variant="outline">Unsaved Changes</Badge>}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle>Customer Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="customerName">Full Name *</Label>
								<Input
									id="customerName"
									value={formData.customerName}
									onChange={(e) =>
										handleInputChange("customerName", e.target.value)
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="customerEmail">Email *</Label>
								<Input
									id="customerEmail"
									type="email"
									value={formData.customerEmail}
									onChange={(e) =>
										handleInputChange("customerEmail", e.target.value)
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="customerPhone">Phone *</Label>
								<Input
									id="customerPhone"
									value={formData.customerPhone}
									onChange={(e) =>
										handleInputChange("customerPhone", e.target.value)
									}
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="customerAddress">Address</Label>
							<Textarea
								id="customerAddress"
								value={formData.customerAddress}
								onChange={(e) =>
									handleInputChange("customerAddress", e.target.value)
								}
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Package & Batch Selection */}
				<Card>
					<CardHeader>
						<CardTitle>Package & Batch Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="package">Package *</Label>
							<Select
								value={formData.packageId}
								onValueChange={(value) => {
									const pkg = packages.find((p) => p.id === value);
									handleInputChange("packageId", value);
									handleInputChange("batchId", "");
									handleInputChange(
										"totalAmount",
										pkg ? pkg.price * formData.numberOfPassengers : 0
									);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose a package" />
								</SelectTrigger>
								<SelectContent>
									{packages.map((pkg) => (
										<SelectItem key={pkg.id} value={pkg.id}>
											{pkg.name} - ${pkg.price}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{formData.packageId && (
							<div>
								<Label>Available Batches</Label>
								<div className="grid gap-3 mt-2">
									{batches.map((batch) => (
										<div
											key={batch.id}
											className={`p-4 border rounded-lg cursor-pointer transition-colors ${
												formData.batchId === batch.id
													? "border-primary bg-primary/5"
													: "hover:bg-muted/50"
											}`}
											onClick={() =>
												handleInputChange("batchId", batch.id)
											}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div>
														<p className="font-medium">
															{new Date(
																batch.startDate
															).toLocaleDateString()}{" "}
															-{" "}
															{new Date(
																batch.endDate
															).toLocaleDateString()}
														</p>
														<p className="text-sm text-muted-foreground">
															{batch.availableSeats} seats
															available out of{" "}
															{batch.totalSeats}
														</p>
													</div>
												</div>
												<Badge
													variant={
														batch.availableSeats > 5
															? "default"
															: "secondary"
													}
												>
													{batch.availableSeats} Available
												</Badge>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{formData.batchId && (
							<div>
								<Label htmlFor="passengers">Number of Passengers *</Label>
								<Select
									value={formData.numberOfPassengers.toString()}
									onValueChange={(value) =>
										updatePassengerCount(Number.parseInt(value))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from(
											{
												length: Math.min(
													selectedBatch?.availableSeats || 1,
													10
												),
											},
											(_, i) => (
												<SelectItem
													key={i + 1}
													value={(i + 1).toString()}
												>
													{i + 1} Passenger{i > 0 ? "s" : ""}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Booking Status */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div>
							<Label htmlFor="status">Status</Label>
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
									<SelectItem value="confirmed">Confirmed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Passenger Details */}
				<Card>
					<CardHeader>
						<CardTitle>Passenger Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{formData.passengers.map((passenger, index) => (
							<div
								key={passenger.id}
								className="p-4 border rounded-lg space-y-4"
							>
								<div className="flex items-center justify-between">
									<h4 className="font-medium">Passenger {index + 1}</h4>
									{formData.passengers.length > 1 && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												const newPassengers =
													formData.passengers.filter(
														(_, i) => i !== index
													);
												setFormData((prev) => ({
													...prev,
													passengers: newPassengers,
													numberOfPassengers:
														newPassengers.length,
													totalAmount: selectedPackage
														? selectedPackage.price *
														  newPassengers.length
														: 0,
												}));
												setHasChanges(true);
											}}
										>
											<Trash2 className="w-4 h-4 mr-1" />
											Remove
										</Button>
									)}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Full Name *</Label>
										<Input
											value={passenger.name}
											onChange={(e) =>
												updatePassenger(
													index,
													"name",
													e.target.value
												)
											}
											required
										/>
									</div>
									<div>
										<Label>Age *</Label>
										<Input
											type="number"
											value={passenger.age}
											onChange={(e) =>
												updatePassenger(
													index,
													"age",
													e.target.value
												)
											}
											required
										/>
									</div>
									<div>
										<Label>Email</Label>
										<Input
											type="email"
											value={passenger.email}
											onChange={(e) =>
												updatePassenger(
													index,
													"email",
													e.target.value
												)
											}
										/>
									</div>
									<div>
										<Label>Phone</Label>
										<Input
											value={passenger.phone}
											onChange={(e) =>
												updatePassenger(
													index,
													"phone",
													e.target.value
												)
											}
										/>
									</div>
								</div>
								<div>
									<Label>Emergency Contact *</Label>
									<Input
										value={passenger.emergencyContact}
										onChange={(e) =>
											updatePassenger(
												index,
												"emergencyContact",
												e.target.value
											)
										}
										placeholder="Name and phone number"
										required
									/>
								</div>
								<div>
									<Label>Special Requirements</Label>
									<Textarea
										value={passenger.specialRequirements}
										onChange={(e) =>
											updatePassenger(
												index,
												"specialRequirements",
												e.target.value
											)
										}
										placeholder="Dietary restrictions, medical conditions, etc."
										rows={2}
									/>
								</div>
							</div>
						))}

						{/* Add Passenger Button */}
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								const newPassenger = {
									id: `p${formData.passengers.length + 1}`,
									name: "",
									age: "",
									email: "",
									phone: "",
									emergencyContact: "",
									specialRequirements: "",
								};
								const newPassengers = [
									...formData.passengers,
									newPassenger,
								];
								setFormData((prev) => ({
									...prev,
									passengers: newPassengers,
									numberOfPassengers: newPassengers.length,
									totalAmount: selectedPackage
										? selectedPackage.price * newPassengers.length
										: 0,
								}));
								setHasChanges(true);
							}}
							className="w-full"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Another Passenger
						</Button>
					</CardContent>
				</Card>

				{/* Payment Information */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Total Amount</Label>
								<div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
									<span className="font-bold">
										${formData.totalAmount}
									</span>
								</div>
							</div>
							<div>
								<Label htmlFor="advanceAmount">Advance Payment *</Label>
								<Input
									id="advanceAmount"
									type="number"
									min="0"
									max={formData.totalAmount}
									value={formData.advanceAmount}
									onChange={(e) =>
										handleInputChange(
											"advanceAmount",
											Number.parseInt(e.target.value) || 0
										)
									}
									required
								/>
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
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="paymentReference">
									Payment Reference
								</Label>
								<Input
									id="paymentReference"
									value={formData.paymentReference}
									onChange={(e) =>
										handleInputChange(
											"paymentReference",
											e.target.value
										)
									}
									placeholder="Transaction ID, Check number, etc."
								/>
							</div>
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

						{formData.advanceAmount > 0 && (
							<div className="p-4 bg-muted/50 rounded-lg">
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Total Amount:</span>
										<span className="font-medium">
											${formData.totalAmount}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Advance Payment:</span>
										<span className="font-medium">
											${formData.advanceAmount}
										</span>
									</div>
									<Separator />
									<div className="flex justify-between">
										<span className="font-medium">
											Balance Amount:
										</span>
										<span className="font-bold">
											$
											{formData.totalAmount -
												formData.advanceAmount}
										</span>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Special Requests */}
				<Card>
					<CardHeader>
						<CardTitle>Special Requests</CardTitle>
					</CardHeader>
					<CardContent>
						<div>
							<Label htmlFor="specialRequests">Additional Notes</Label>
							<Textarea
								id="specialRequests"
								value={formData.specialRequests}
								onChange={(e) =>
									handleInputChange("specialRequests", e.target.value)
								}
								placeholder="Any special arrangements or requests..."
								rows={4}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex justify-between items-center pt-6">
					<div className="flex gap-2">
						<NavLink to={`/bookings/${id}`}>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</NavLink>
					</div>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								if (
									confirm(
										"Are you sure you want to cancel this booking?"
									)
								) {
									handleInputChange("status", "cancelled");
									// Handle cancellation logic
								}
							}}
						>
							Cancel Booking
						</Button>
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
