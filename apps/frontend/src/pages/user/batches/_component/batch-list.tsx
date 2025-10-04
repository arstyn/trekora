import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { format } from "date-fns";
import { Calendar, Edit, Eye, MoreHorizontal, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BatchListProps {
	status: "active" | "upcoming" | "completed";
}

export function BatchList({ status }: BatchListProps) {
	const [batches, setBatches] = useState<IBatches[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();

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
	}, [status]);

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

	const handleRowClick = (batchId: string, event: React.MouseEvent) => {
		// Prevent navigation if clicking on the dropdown menu
		if (
			(event.target as HTMLElement).closest("[data-radix-collection-item]") ||
			(event.target as HTMLElement).closest("button")
		) {
			return;
		}
		navigate(`/batches/${batchId}`);
	};

	const formatDate = (dateInput: string | Date) => {
		const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
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
							<TableRow
								key={batch.id}
								className="cursor-pointer hover:bg-muted/50"
								onClick={(e) => handleRowClick(batch.id, e)}
							>
								<TableCell className="font-medium">
									{batch.package?.name}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1 text-sm">
										<Calendar className="w-4 h-4" />
										{formatDate(batch.startDate)} -{" "}
										{formatDate(batch.endDate)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />
										{batch.bookedSeats}/{batch.totalSeats}
									</div>
								</TableCell>
								<TableCell>
									<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
										{batch.coordinators?.map(
											(coordinator, index: number) => (
												<HoverCard key={index}>
													<HoverCardTrigger asChild>
														<Avatar>
															<AvatarImage
																src={coordinator.avatar}
															/>
															<AvatarFallback>
																{coordinator.name.slice(
																	0,
																	2
																)}
															</AvatarFallback>
														</Avatar>
													</HoverCardTrigger>
													<HoverCardContent className="w-80">
														<div className="flex gap-4">
															<Avatar>
																<AvatarImage
																	src={
																		coordinator.avatar
																	}
																/>
																<AvatarFallback>
																	{coordinator.name.slice(
																		0,
																		2
																	)}
																</AvatarFallback>
															</Avatar>
															<div className="space-y-1">
																<h4 className="text-sm font-semibold">
																	{coordinator.name}
																</h4>
																<p className="text-sm">
																	{coordinator.email}
																</p>
																<div className="text-muted-foreground text-xs">
																	{coordinator.joinDate &&
																		`Joined ${format(
																			new Date(
																				coordinator.joinDate
																			),
																			"PPP"
																		)}`}
																</div>
															</div>
														</div>
													</HoverCardContent>
												</HoverCard>
											)
										)}
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
													to={`/batches/edit/${batch.id}`}
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
