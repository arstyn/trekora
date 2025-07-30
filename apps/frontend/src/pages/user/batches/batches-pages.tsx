import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import type { IBatches, IBatchStats } from "@/types/batches.types";
import { AlertTriangle, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import { BatchList } from "./_component/batch-list";
import { CalendarView } from "./_component/calendar-view";
import { CreateBatchDialog } from "./_component/create-batch-dialog";

export default function BatchesPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [fastFillingBatches, setFastFillingBatches] = useState<IBatches[]>([]);
	const [dashboardStats, setDashboardStats] = useState<IBatchStats>();

	useEffect(() => {
		const getBatches = async () => {
			try {
				const [fastFilling, stats] = await Promise.all([
					axiosInstance.get<IBatches[]>(`/batches/fast-filling`),
					axiosInstance.get<IBatchStats>(`/batches/stats`),
				]);

				setFastFillingBatches(fastFilling.data);
				setDashboardStats(stats.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load batches");
				}
			}
		};

		getBatches();
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
							{dashboardStats && dashboardStats.activeBatches}
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
							{dashboardStats && dashboardStats.upcomingBatches}
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
							{dashboardStats && dashboardStats.availableSeats}
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
							{dashboardStats && dashboardStats.fastFilling}
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
					{fastFillingBatches.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							No fast filling batches available to display
						</div>
					)}
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
