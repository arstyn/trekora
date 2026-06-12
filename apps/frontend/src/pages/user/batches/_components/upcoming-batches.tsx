import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import axiosInstance from "@/lib/axios";
import type { IBatches } from "@/types/batches.types";
import { Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

export function UpcomingBatches() {
	const [upcomingBatches, setUpcomingBatches] = useState<IBatches[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getUpcomingBatches = async () => {
			try {
				setLoading(true);
				const response = await axiosInstance.get<IBatches[]>(
					"/batches?status=upcoming"
				);
				setUpcomingBatches(response.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load upcoming batches");
				}
			} finally {
				setLoading(false);
			}
		};

		getUpcomingBatches();
	}, []);

	const getDaysUntilStart = (startDate: Date) => {
		const today = new Date();
		const start = new Date(startDate);
		const diffTime = start.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const getUrgencyBadge = (daysUntil: number) => {
		if (daysUntil <= 3) return "destructive";
		if (daysUntil <= 7) return "secondary";
		return "outline";
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Upcoming Batches</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="w-5 h-5" />
					Upcoming Batches
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{upcomingBatches.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No upcoming batches
						</div>
					) : (
						upcomingBatches.map((batch) => {
							const daysUntil = getDaysUntilStart(batch.startDate);
							const fillRate = batch.fillRate || 0;

							return (
								<div
									key={batch.id}
									className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="space-y-3">
										{/* Header with package name and urgency */}
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold text-sm line-clamp-2">
														{batch.package?.name}
													</h3>
													<Badge>
														<div className="flex items-center gap-1">
															<Calendar className="w-3 h-3" />
															<span>
																{new Date(
																	batch.startDate
																).toLocaleDateString()}
															</span>
														</div>
													</Badge>
												</div>
												<div className="flex items-center gap-2 mt-1 text-xs">
													<Badge
														variant={getUrgencyBadge(
															daysUntil
														)}
													>
														{daysUntil === 0
															? "Today"
															: daysUntil === 1
															? "Tomorrow"
															: `${daysUntil} days`}
													</Badge>
													<Badge variant="outline">
														{fillRate}% Full
													</Badge>
												</div>
											</div>
										</div>
										{/* Capacity info */}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<div className="flex items-center gap-1">
													<Users className="w-3 h-3" />
													<span>Capacity</span>
												</div>
												<span className="font-medium">
													{batch.bookedSeats}/{batch.totalSeats}
												</span>
											</div>
											<Progress value={fillRate} className="h-2" />
										</div>

										{/* Action button */}
										<NavLink
											to={`/batches/${batch.id}`}
											className="block"
										>
											<Button
												variant="outline"
												size="sm"
												className="w-full cursor-pointer"
											>
												View Details
											</Button>
										</NavLink>
									</div>
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
