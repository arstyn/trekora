import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { BatchList } from "./_component/batch-list";
import { CreateBatchDialog } from "./_component/create-batch-dialog";
import { CalendarView } from "./_component/calendar-view";
import type { IBatches } from "@/types/batches.types";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// Mock data
const dashboardStats = {
	totalActiveBatches: 12,
	totalUpcomingBatches: 8,
	totalSeatsLeft: 156,
	fastFillingBatches: 3,
};

export default function BatchesPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [fastFillingBatches, setFastFillingBatches] = useState<IBatches[]>([]);

	useEffect(() => {
		const getBranch = async () => {
			try {
				const res = await axiosInstance.get(`/batches/fast-filling`);
				setFastFillingBatches(res.data);
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

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Batch Management</h1>
					<p className="text-muted-foreground">
						Manage tour package batches and track performance
					</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Create Batch
				</Button>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Batches
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalActiveBatches}
						</div>
						<p className="text-xs text-muted-foreground">Currently running</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Upcoming Batches
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalUpcomingBatches}
						</div>
						<p className="text-xs text-muted-foreground">Starting soon</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Available Seats
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalSeatsLeft}
						</div>
						<p className="text-xs text-muted-foreground">
							Across all upcoming batches
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Fast Filling
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.fastFillingBatches}
						</div>
						<p className="text-xs text-muted-foreground">
							{">"} 75% capacity
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Fast Filling Batches */}
			<Card>
				<CardHeader>
					<CardTitle>Fast Filling Batches</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{fastFillingBatches.map((batch) => (
							<div
								key={batch.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="font-semibold">
											{batch.package?.name}
										</h3>
										{batch.fillRate && (
											<Badge
												variant={
													batch.fillRate >= 90
														? "destructive"
														: "secondary"
												}
											>
												{batch.fillRate}% Full
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										Starts:{" "}
										{new Date(batch.startDate).toLocaleDateString()}
									</p>
									<div className="flex items-center gap-2">
										<Progress
											value={batch.fillRate}
											className="flex-1"
										/>
										<span className="text-sm text-muted-foreground">
											{batch.bookedSeats}/{batch.totalSeats} seats
										</span>
									</div>
								</div>
								<NavLink to={`/batches/${batch.id}`}>
									<Button variant="outline" size="sm">
										View Details
									</Button>
								</NavLink>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Batch Tabs */}
			<Tabs defaultValue="active" className="space-y-4">
				<TabsList>
					<TabsTrigger value="active">Active Batches</TabsTrigger>
					<TabsTrigger value="upcoming">Upcoming Batches</TabsTrigger>
					<TabsTrigger value="completed">Completed Batches</TabsTrigger>
					<TabsTrigger value="calendar">Calendar View</TabsTrigger>
				</TabsList>

				<TabsContent value="active">
					<BatchList status="active" />
				</TabsContent>

				<TabsContent value="upcoming">
					<BatchList status="upcoming" />
				</TabsContent>

				<TabsContent value="completed">
					<BatchList status="completed" />
				</TabsContent>

				<TabsContent value="calendar">
					<CalendarView />
				</TabsContent>
			</Tabs>

			<CreateBatchDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</div>
	);
}
