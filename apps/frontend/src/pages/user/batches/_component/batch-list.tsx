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
import axiosInstance from "@/lib/axios";
import type { IBatches } from "@/types/batches.types";
import { Calendar, Edit, Eye, MoreHorizontal, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

interface BatchListProps {
	status: "active" | "upcoming" | "completed";
}

export function BatchList({ status }: BatchListProps) {
	const [batches, setBatches] = useState<IBatches[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const getBranch = async () => {
			try {
				const res = await axiosInstance.get(`/batches?status=${status}`);
				setBatches(res.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load batches");
				}
			}
		};

		getBranch();
	}, []);

	const filteredBatches = batches.filter((batch) =>
		batch.package?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
									{batch.package?.name}
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
										{/* {batch.coordinators.map(
											(coordinator: string, index: number) => (
												<div
													key={index}
													className="text-sm text-muted-foreground"
												>
													{coordinator}
												</div>
											)
										)} */}
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
