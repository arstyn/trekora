import { Badge } from "@/components/ui/badge";
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
import { Calendar, DollarSign, Upload, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface CreateBookingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// Mock data
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

export function CreateBookingDialog({ open, onOpenChange }: CreateBookingDialogProps) {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		// Customer Details
		customerName: "",
		customerEmail: "",
		customerPhone: "",
		customerAddress: "",

		// Package & Batch Selection
		packageId: "",
		batchId: "",
		numberOfPassengers: 1,

		// Passenger Details
		passengers: [
			{
				name: "",
				age: "",
				email: "",
				phone: "",
				emergencyContact: "",
				specialRequirements: "",
			},
		],

		// Payment Details
		totalAmount: 0,
		advanceAmount: 0,
		paymentMethod: "",
		paymentReference: "",
		paymentScreenshot: null as File | null,

		// Additional Details
		specialRequests: "",
	});

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
	};

	const updatePassenger = (index: number, field: string, value: string) => {
		const newPassengers = [...formData.passengers];
		newPassengers[index] = { ...newPassengers[index], [field]: value };
		setFormData((prev) => ({ ...prev, passengers: newPassengers }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Creating booking:", formData);
		onOpenChange(false);
		setStep(1);
		// Reset form
		setFormData({
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			customerAddress: "",
			packageId: "",
			batchId: "",
			numberOfPassengers: 1,
			passengers: [
				{
					name: "",
					age: "",
					email: "",
					phone: "",
					emergencyContact: "",
					specialRequirements: "",
				},
			],
			totalAmount: 0,
			advanceAmount: 0,
			paymentMethod: "",
			paymentReference: "",
			paymentScreenshot: null,
			specialRequests: "",
		});
	};

	const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
	const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Booking - Step {step} of 4</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Step 1: Customer Details */}
					{step === 1 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">
									Customer Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="customerName">Full Name *</Label>
										<Input
											id="customerName"
											value={formData.customerName}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													customerName: e.target.value,
												}))
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
												setFormData((prev) => ({
													...prev,
													customerEmail: e.target.value,
												}))
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
												setFormData((prev) => ({
													...prev,
													customerPhone: e.target.value,
												}))
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
											setFormData((prev) => ({
												...prev,
												customerAddress: e.target.value,
											}))
										}
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Step 2: Package & Batch Selection */}
					{step === 2 && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Package & Batch Selection
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="package">Select Package *</Label>
										<Select
											value={formData.packageId}
											onValueChange={(value) => {
												setFormData((prev) => ({
													...prev,
													packageId: value,
													batchId: "",
													totalAmount:
														packages.find(
															(p) => p.id === value
														)?.price || 0,
												}));
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Choose a package" />
											</SelectTrigger>
											<SelectContent>
												{packages.map((pkg) => (
													<SelectItem
														key={pkg.id}
														value={pkg.id}
													>
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
															setFormData((prev) => ({
																...prev,
																batchId: batch.id,
															}))
														}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<Calendar className="w-4 h-4" />
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
																		{
																			batch.availableSeats
																		}{" "}
																		seats available
																		out of{" "}
																		{batch.totalSeats}
																	</p>
																</div>
															</div>
															<Badge
																variant={
																	batch.availableSeats >
																	5
																		? "default"
																		: "secondary"
																}
															>
																{batch.availableSeats}{" "}
																Available
															</Badge>
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{formData.batchId && (
										<div>
											<Label htmlFor="passengers">
												Number of Passengers *
											</Label>
											<Select
												value={formData.numberOfPassengers.toString()}
												onValueChange={(value) =>
													updatePassengerCount(
														Number.parseInt(value)
													)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Array.from(
														{
															length: Math.min(
																selectedBatch?.availableSeats ||
																	1,
																10
															),
														},
														(_, i) => (
															<SelectItem
																key={i + 1}
																value={(i + 1).toString()}
															>
																{i + 1} Passenger
																{i > 0 ? "s" : ""}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</div>
									)}

									{formData.totalAmount > 0 && (
										<div className="p-4 bg-muted/50 rounded-lg">
											<div className="flex items-center justify-between">
												<span className="font-medium">
													Total Amount:
												</span>
												<span className="text-xl font-bold">
													${formData.totalAmount}
												</span>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{/* Step 3: Passenger Details */}
					{step === 3 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">
									Passenger Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{formData.passengers.map((passenger, index) => (
									<div
										key={index}
										className="p-4 border rounded-lg space-y-4"
									>
										<h4 className="font-medium flex items-center gap-2">
											<Users className="w-4 h-4" />
											Passenger {index + 1}
										</h4>
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
							</CardContent>
						</Card>
					)}

					{/* Step 4: Payment Details */}
					{step === 4 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">
									Payment Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Total Amount</Label>
										<div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
											<DollarSign className="w-4 h-4" />
											<span className="font-bold">
												${formData.totalAmount}
											</span>
										</div>
									</div>
									<div>
										<Label htmlFor="advanceAmount">
											Advance Payment *
										</Label>
										<Input
											id="advanceAmount"
											type="number"
											min="0"
											max={formData.totalAmount}
											value={formData.advanceAmount}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													advanceAmount:
														Number.parseInt(e.target.value) ||
														0,
												}))
											}
											required
										/>
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
												<SelectItem value="bank_transfer">
													Bank Transfer
												</SelectItem>
												<SelectItem value="credit_card">
													Credit Card
												</SelectItem>
												<SelectItem value="debit_card">
													Debit Card
												</SelectItem>
												<SelectItem value="cash">Cash</SelectItem>
												<SelectItem value="upi">UPI</SelectItem>
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
												setFormData((prev) => ({
													...prev,
													paymentReference: e.target.value,
												}))
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

								<div>
									<Label htmlFor="specialRequests">
										Special Requests
									</Label>
									<Textarea
										id="specialRequests"
										value={formData.specialRequests}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												specialRequests: e.target.value,
											}))
										}
										placeholder="Any special arrangements or requests..."
										rows={3}
									/>
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
											<div className="flex justify-between border-t pt-2">
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
					)}

					{/* Navigation Buttons */}
					<div className="flex justify-between">
						<div>
							{step > 1 && (
								<Button
									type="button"
									variant="outline"
									onClick={prevStep}
								>
									Previous
								</Button>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							{step < 4 ? (
								<Button type="button" onClick={nextStep}>
									Next
								</Button>
							) : (
								<Button type="submit">Create Booking</Button>
							)}
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
