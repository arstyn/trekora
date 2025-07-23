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
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

export default function EditBatchPage() {
	const { id } = useParams<{ id: string }>();

	const [formData, setFormData] = useState({
		packageId: "1",
		startDate: "2024-01-15",
		endDate: "2024-01-25",
		totalSeats: "20",
		coordinators: [
			{
				name: "John Doe",
				type: "Tour Guide",
				phone: "+1-234-567-8900",
				email: "john.doe@example.com",
			},
			{
				name: "Mike Smith",
				type: "Driver",
				phone: "+1-234-567-8901",
				email: "mike.smith@example.com",
			},
		],
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
		console.log("Updating batch:", formData);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center gap-4">
				<NavLink to={`/batches/${id}`}>
					<Button variant="outline" size="sm">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Details
					</Button>
				</NavLink>
				<div>
					<h1 className="text-3xl font-bold">Edit Batch</h1>
					<p className="text-muted-foreground">
						Update batch information and coordinators
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="package">Tour Package</Label>
							<Select
								value={formData.packageId}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, packageId: value }))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a package" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">Himalayan Adventure</SelectItem>
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
						<CardTitle>Batch Coordinators</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Existing Coordinators */}
						{formData.coordinators.length > 0 && (
							<div className="space-y-2">
								<Label>Current Coordinators</Label>
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
							<Label>Add New Coordinator</Label>
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
					<NavLink to={`/batches/${id}`}>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</NavLink>
					<Button type="submit">
						<Save className="w-4 h-4 mr-2" />
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	);
}
