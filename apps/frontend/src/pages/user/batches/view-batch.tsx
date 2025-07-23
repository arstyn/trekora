import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, Edit, Mail, Phone, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { CoordinatorModal } from "./_component/coordinator-modal";
import { PassengerModal } from "./_component/passenger-modal";

// Mock data
const batchData = {
	id: "1",
	packageName: "Himalayan Adventure",
	startDate: "2024-01-15",
	endDate: "2024-01-25",
	totalSeats: 20,
	bookedSeats: 18,
	status: "active",
	packageDetails: {
		description:
			"Experience the breathtaking beauty of the Himalayas with our comprehensive adventure package.",
		destinations: ["Kathmandu", "Pokhara", "Annapurna Base Camp"],
		inclusions: ["Accommodation", "Meals", "Transportation", "Guide"],
		price: "$1,200",
	},
	coordinators: [
		{
			id: "c1",
			name: "John Doe",
			type: "Tour Guide",
			phone: "+1-234-567-8900",
			email: "john.doe@example.com",
			experience: "5 years",
			specialization: "Mountain Trekking",
		},
		{
			id: "c2",
			name: "Mike Smith",
			type: "Driver",
			phone: "+1-234-567-8901",
			email: "mike.smith@example.com",
			experience: "8 years",
			specialization: "Mountain Roads",
		},
	],
	passengers: [
		{
			id: "p1",
			name: "Alice Johnson",
			email: "alice@example.com",
			phone: "+1-234-567-8902",
			age: 28,
			emergencyContact: "Bob Johnson (+1-234-567-8903)",
			checklist: {
				passport: true,
				visa: false,
				insurance: true,
				medicalClearance: false,
				equipment: true,
			},
		},
		{
			id: "p2",
			name: "David Wilson",
			email: "david@example.com",
			phone: "+1-234-567-8904",
			age: 35,
			emergencyContact: "Sarah Wilson (+1-234-567-8905)",
			checklist: {
				passport: true,
				visa: true,
				insurance: true,
				medicalClearance: true,
				equipment: false,
			},
		},
	],
};

export default function BatchDetailsPage() {
	const { id } = useParams<{ id: string }>();

	const [selectedPassenger, setSelectedPassenger] = useState<any>(null);
	const [selectedCoordinator, setSelectedCoordinator] = useState<any>(null);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "upcoming":
				return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
			case "completed":
				return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to="/batches">
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Batches
						</Button>
					</NavLink>
					<div>
						<h1 className="text-3xl font-bold">{batchData.packageName}</h1>
						<p className="text-muted-foreground">Batch Details</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(batchData.status)}
					<NavLink to={`/batches/${id}/edit`}>
						<Button>
							<Edit className="w-4 h-4 mr-2" />
							Edit Batch
						</Button>
					</NavLink>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Batch Overview */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Batch Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Start Date
									</p>
									<p className="font-medium">
										{new Date(
											batchData.startDate
										).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										End Date
									</p>
									<p className="font-medium">
										{new Date(batchData.endDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Users className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Capacity</p>
								<p className="font-medium">
									{batchData.bookedSeats}/{batchData.totalSeats}{" "}
									passengers
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Package Details */}
				<Card>
					<CardHeader>
						<CardTitle>Package Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground mb-2">
								Description
							</p>
							<p className="text-sm">
								{batchData.packageDetails.description}
							</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground mb-2">
								Destinations
							</p>
							<div className="flex flex-wrap gap-1">
								{batchData.packageDetails.destinations.map(
									(dest, index) => (
										<Badge key={index} variant="outline">
											{dest}
										</Badge>
									)
								)}
							</div>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground mb-2">Price</p>
							<p className="text-lg font-bold">
								{batchData.packageDetails.price}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Coordinators */}
			<Card>
				<CardHeader>
					<CardTitle>Batch Coordinators</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Experience</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{batchData.coordinators.map((coordinator) => (
								<TableRow
									key={coordinator.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => setSelectedCoordinator(coordinator)}
								>
									<TableCell className="font-medium">
										{coordinator.name}
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{coordinator.type}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<div className="flex items-center gap-1 text-sm">
												<Phone className="w-3 h-3" />
												{coordinator.phone}
											</div>
											<div className="flex items-center gap-1 text-sm">
												<Mail className="w-3 h-3" />
												{coordinator.email}
											</div>
										</div>
									</TableCell>
									<TableCell>{coordinator.experience}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Passengers */}
			<Card>
				<CardHeader>
					<CardTitle>Passengers ({batchData.passengers.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Age</TableHead>
								<TableHead>Emergency Contact</TableHead>
								<TableHead>Checklist Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{batchData.passengers.map((passenger) => {
								const completedItems = Object.values(
									passenger.checklist
								).filter(Boolean).length;
								const totalItems = Object.keys(
									passenger.checklist
								).length;

								return (
									<TableRow
										key={passenger.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => setSelectedPassenger(passenger)}
									>
										<TableCell className="font-medium">
											{passenger.name}
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center gap-1 text-sm">
													<Phone className="w-3 h-3" />
													{passenger.phone}
												</div>
												<div className="flex items-center gap-1 text-sm">
													<Mail className="w-3 h-3" />
													{passenger.email}
												</div>
											</div>
										</TableCell>
										<TableCell>{passenger.age}</TableCell>
										<TableCell className="text-sm">
											{passenger.emergencyContact}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													completedItems === totalItems
														? "default"
														: "secondary"
												}
											>
												{completedItems}/{totalItems} Complete
											</Badge>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Modals */}
			<PassengerModal
				passenger={selectedPassenger}
				open={!!selectedPassenger}
				onOpenChange={(open) => !open && setSelectedPassenger(null)}
			/>

			<CoordinatorModal
				coordinator={selectedCoordinator}
				open={!!selectedCoordinator}
				onOpenChange={(open) => !open && setSelectedCoordinator(null)}
			/>
		</div>
	);
}
