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
import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface CreateBatchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateBatchDialog({ open, onOpenChange }: CreateBatchDialogProps) {
	const [formData, setFormData] = useState({
		packageId: "",
		startDate: "",
		endDate: "",
		totalSeats: "",
		coordinators: [] as Array<{
			name: string;
			type: string;
			phone: string;
			email: string;
		}>,
	});

	const [newCoordinator, setNewCoordinator] = useState({
		name: "",
		type: "",
		phone: "",
		email: "",
	});

	const coordinatorTypes = [
		"Tour Guide",
		"Driver",
		"Tour Operator",
		"Local Guide",
		"Medical Support",
	];

	const addCoordinator = () => {
		if (newCoordinator.name && newCoordinator.type) {
			setFormData((prev) => ({
				...prev,
				coordinators: [...prev.coordinators, newCoordinator],
			}));
			setNewCoordinator({ name: "", type: "", phone: "", email: "" });
		}
	};

	const removeCoordinator = (index: number) => {
		setFormData((prev) => ({
			...prev,
			coordinators: prev.coordinators.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Creating batch:", formData);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Batch</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="package">Tour Package</Label>
								<Select
									value={formData.packageId}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											packageId: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a package" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">
											Himalayan Adventure
										</SelectItem>
										<SelectItem value="2">Beach Paradise</SelectItem>
										<SelectItem value="3">
											Cultural Heritage Tour
										</SelectItem>
										<SelectItem value="4">Mountain Trek</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="startDate">Start Date</Label>
									<Input
										id="startDate"
										type="date"
										value={formData.startDate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												startDate: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor="endDate">End Date</Label>
									<Input
										id="endDate"
										type="date"
										value={formData.endDate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												endDate: e.target.value,
											}))
										}
										required
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="totalSeats">Total Seats</Label>
								<Input
									id="totalSeats"
									type="number"
									min="1"
									value={formData.totalSeats}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											totalSeats: e.target.value,
										}))
									}
									required
								/>
							</div>
						</CardContent>
					</Card>

					{/* Coordinators */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Batch Coordinators</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Existing Coordinators */}
							{formData.coordinators.length > 0 && (
								<div className="space-y-2">
									<Label>Added Coordinators</Label>
									{formData.coordinators.map((coordinator, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div>
													<p className="font-medium">
														{coordinator.name}
													</p>
													<p className="text-sm text-muted-foreground">
														{coordinator.phone} •{" "}
														{coordinator.email}
													</p>
												</div>
												<Badge variant="outline">
													{coordinator.type}
												</Badge>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeCoordinator(index)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add New Coordinator */}
							<div className="space-y-3 p-4 border rounded-lg bg-muted/50">
								<Label>Add Coordinator</Label>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder="Name"
										value={newCoordinator.name}
										onChange={(e) =>
											setNewCoordinator((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
									/>
									<Select
										value={newCoordinator.type}
										onValueChange={(value) =>
											setNewCoordinator((prev) => ({
												...prev,
												type: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Role" />
										</SelectTrigger>
										<SelectContent>
											{coordinatorTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										placeholder="Phone"
										value={newCoordinator.phone}
										onChange={(e) =>
											setNewCoordinator((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
									/>
									<Input
										placeholder="Email"
										type="email"
										value={newCoordinator.email}
										onChange={(e) =>
											setNewCoordinator((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
									/>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={addCoordinator}
									className="w-full bg-transparent"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Coordinator
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create Batch</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
