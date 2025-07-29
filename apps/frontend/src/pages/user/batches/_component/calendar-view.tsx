import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { IBatches } from "@/types/batches.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BatchTooltip } from "./batch-tooltip";

export function CalendarView() {
	const [batches, setBatches] = useState<IBatches[]>([]);

	const [currentDate, setCurrentDate] = useState(new Date());
	const [hoveredBatch, setHoveredBatch] = useState<IBatches | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	// Get first day of the month and number of days
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
	const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
	const firstDayWeekday = firstDayOfMonth.getDay();
	const daysInMonth = lastDayOfMonth.getDate();

	useEffect(() => {
		const getBranch = async () => {
			try {
				const res = await axiosInstance.get(`/batches`);
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

	// Generate calendar days
	const calendarDays = [];

	// Add empty cells for days before the first day of the month
	for (let i = 0; i < firstDayWeekday; i++) {
		calendarDays.push(null);
	}

	// Add days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		calendarDays.push(day);
	}

	const navigateMonth = (direction: "prev" | "next") => {
		setCurrentDate((prev) => {
			const newDate = new Date(prev);
			if (direction === "prev") {
				newDate.setMonth(prev.getMonth() - 1);
			} else {
				newDate.setMonth(prev.getMonth() + 1);
			}
			return newDate;
		});
	};

	const getBatchesForDate = (day: number) => {
		const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
			2,
			"0"
		)}-${String(day).padStart(2, "0")}`;
		return batches.filter((batch) => {
			const startDate = new Date(batch.startDate);
			const endDate = new Date(batch.endDate);
			const currentDateObj = new Date(dateStr);
			return currentDateObj >= startDate && currentDateObj <= endDate;
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-500";
			case "upcoming":
				return "bg-blue-500";
			case "completed":
				return "bg-gray-500";
			default:
				return "bg-gray-400";
		}
	};

	const handleBatchHover = (batch: IBatches, event: React.MouseEvent) => {
		setHoveredBatch(batch);
		setTooltipPosition({ x: event.clientX, y: event.clientY });
	};

	const handleBatchLeave = () => {
		setHoveredBatch(null);
	};

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-2xl">
							{monthNames[currentMonth]} {currentYear}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigateMonth("prev")}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentDate(new Date())}
							>
								Today
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigateMonth("next")}
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1">
						{/* Day headers */}
						{dayNames.map((day) => (
							<div
								key={day}
								className="p-2 text-center font-semibold text-sm text-muted-foreground border-b"
							>
								{day}
							</div>
						))}

						{/* Calendar days */}
						{calendarDays.map((day, index) => {
							const batchesArr = day ? getBatchesForDate(day) : [];
							const isToday =
								day &&
								new Date().getDate() === day &&
								new Date().getMonth() === currentMonth &&
								new Date().getFullYear() === currentYear;

							return (
								<div
									key={index}
									className={cn(
										"min-h-[120px] p-1 border border-border/50 bg-background",
										day ? "hover:bg-muted/50" : "bg-muted/20",
										isToday && "bg-blue-50 border-blue-200"
									)}
								>
									{day && (
										<>
											<div
												className={cn(
													"text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
													isToday && "bg-blue-500 text-white"
												)}
											>
												{day}
											</div>
											<div className="space-y-1">
												{batchesArr.slice(0, 3).map((batch) => (
													<div
														key={batch.id}
														className={cn(
															"text-xs p-1 rounded cursor-pointer text-white font-medium truncate",
															getStatusColor(batch.status)
														)}
														onMouseEnter={(e) =>
															handleBatchHover(batch, e)
														}
														onMouseLeave={handleBatchLeave}
														onMouseMove={(e) =>
															setTooltipPosition({
																x: e.clientX,
																y: e.clientY,
															})
														}
													>
														{batch.package?.name}
													</div>
												))}
												{batches.length > 3 && (
													<div className="text-xs text-muted-foreground font-medium">
														+{batches.length - 3} more
													</div>
												)}
											</div>
										</>
									)}
								</div>
							);
						})}
					</div>

					{/* Legend */}
					<div className="flex items-center gap-4 mt-4 pt-4 border-t">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-green-500"></div>
							<span className="text-sm">Active</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-blue-500"></div>
							<span className="text-sm">Upcoming</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-gray-500"></div>
							<span className="text-sm">Completed</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tooltip */}
			{hoveredBatch && (
				<BatchTooltip
					batch={hoveredBatch}
					position={tooltipPosition}
					onClose={() => setHoveredBatch(null)}
				/>
			)}
		</div>
	);
}
