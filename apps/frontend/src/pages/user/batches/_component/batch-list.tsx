import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Calendar, Edit, Eye, MoreHorizontal, Search, Users } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

interface BatchListProps {
	status: "active" | "upcoming" | "completed";
}

// Mock data
const mockBatches = {
	active: [
		{
			id: "1",
			packageName: "Himalayan Adventure",
			startDate: "2024-01-15",
			endDate: "2024-01-25",
			totalSeats: 20,
			bookedSeats: 18,
			coordinators: ["John Doe (Tour Guide)", "Mike Smith (Driver)"],
			status: "active",
		},
		{
			id: "2",
			packageName: "Beach Paradise",
			startDate: "2024-01-20",
			endDate: "2024-01-27",
			totalSeats: 15,
			bookedSeats: 12,
			coordinators: ["Sarah Wilson (Tour Guide)"],
			status: "active",
		},
	],
	upcoming: [
		{
			id: "3",
			packageName: "Cultural Heritage Tour",
			startDate: "2024-02-15",
			endDate: "2024-02-22",
			totalSeats: 25,
			bookedSeats: 19,
			coordinators: ["David Brown (Tour Guide)", "Lisa Johnson (Driver)"],
			status: "upcoming",
		},
		{
			id: "4",
			packageName: "Mountain Trek",
			startDate: "2024-02-20",
			endDate: "2024-02-28",
			totalSeats: 12,
			bookedSeats: 8,
			coordinators: ["Tom Wilson (Tour Guide)"],
			status: "upcoming",
		},
	],
	completed: [
		{
			id: "5",
			packageName: "City Explorer",
			startDate: "2023-12-10",
			endDate: "2023-12-15",
			totalSeats: 18,
			bookedSeats: 18,
			coordinators: ["Anna Davis (Tour Guide)", "Chris Lee (Driver)"],
			status: "completed",
		},
	],
};

export function BatchList({ status }: BatchListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const batches = mockBatches[status] || [];

	const filteredBatches = batches.filter((batch) =>
		batch.packageName.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle className="capitalize">{status} Batches</CardTitle>
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search batches..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 w-64"
							/>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Package Name</TableHead>
							<TableHead>Duration</TableHead>
							<TableHead>Capacity</TableHead>
							<TableHead>Coordinators</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredBatches.map((batch) => (
							<TableRow key={batch.id}>
								<TableCell className="font-medium">
									{batch.packageName}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 text-sm">
										<Calendar className="w-4 h-4" />
										{new Date(
											batch.startDate
										).toLocaleDateString()} -{" "}
										{new Date(batch.endDate).toLocaleDateString()}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />
										{batch.bookedSeats}/{batch.totalSeats}
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										{batch.coordinators.map((coordinator, index) => (
											<div
												key={index}
												className="text-sm text-muted-foreground"
											>
												{coordinator}
											</div>
										))}
									</div>
								</TableCell>
								<TableCell>{getStatusBadge(batch.status)}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<NavLink
													to={`/batches/${batch.id}`}
													className="flex items-center"
												>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</NavLink>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<NavLink
													to={`/batches/${batch.id}/edit`}
													className="flex items-center"
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit Batch
												</NavLink>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{filteredBatches.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						No {status} batches found.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
