import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SeatVacancyItem } from "@/services/dashboard.service";
import {
	AlertTriangle,
	Calendar,
	Check,
	Copy,
	Globe2,
	MapPin,
	PlusCircle,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SeatVacancySectionProps {
	items: SeatVacancyItem[];
	loading: boolean;
}

export function SeatVacancySection({
	items,
	loading,
}: SeatVacancySectionProps) {
	const navigate = useNavigate();
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopyLink = (id: string) => {
		navigator.clipboard.writeText(`${window.location.origin}/user/batches?batchId=${id}`);
		setCopiedId(id);
		toast.success("Batch link copied to clipboard");
		setTimeout(() => setCopiedId(null), 2000);
	};

	if (loading) {
		return (
			<Card className="shadow-xs border-border/80">
				<CardHeader className="pb-3">
					<div className="h-6 w-48 bg-muted animate-pulse rounded" />
					<div className="h-4 w-72 bg-muted animate-pulse rounded mt-1" />
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-28 bg-muted/50 animate-pulse rounded-xl" />
					))}
				</CardContent>
			</Card>
		);
	}

	const fastFillingCount = items.filter((i) => i.urgency === "high").length;

	return (
		<Card className="shadow-xs border-border/80 flex flex-col">
			<CardHeader className="pb-4 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
							<Users className="h-5 w-5" />
						</div>
						<div>
							<CardTitle className="text-lg font-bold tracking-tight">
								Upcoming Seat Vacancies
							</CardTitle>
							<CardDescription className="text-xs mt-0.5">
								Monitor open seats & fast-filling batches to maximize bookings
							</CardDescription>
						</div>
					</div>
					<Badge
						variant="outline"
						className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold shrink-0"
					>
						{fastFillingCount} Fast Filling
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-4 flex-1 flex flex-col min-h-0">
				<div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-dashboard-scroll flex-1">
					{items.length === 0 ? (

						<div className="py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl flex items-center justify-center">
							No active batch seat vacancies found.
						</div>
					) : (
						items.map((item) => {
							const fillPercentage = Math.round(
								(item.bookedSeats / (item.totalSeats || 1)) * 100
							);

							return (
								<div
									key={item.id}
									className={`group p-4 rounded-xl border transition-all ${
										item.urgency === "high"
											? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
											: item.urgency === "medium"
											? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
											: "bg-card hover:bg-muted/40 border-border/80"
									}`}
								>
									{/* Top Header Row */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
										<div className="flex items-center gap-2 flex-wrap min-w-0">
											<h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
												{item.packageName}
											</h4>
											{item.destinationType === "international" ? (
												<Badge
													variant="outline"
													className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border-purple-500/20"
												>
													<Globe2 className="h-2.5 w-2.5 mr-1" /> Intl
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20"
												>
													<MapPin className="h-2.5 w-2.5 mr-1" /> Domestic
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-2 shrink-0">
											{item.urgency === "high" ? (
												<Badge className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 gap-1 animate-pulse shadow-2xs">
													<AlertTriangle className="h-3 w-3" />
													Only {item.vacantSeats} left!
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className={`text-xs px-2.5 py-0.5 font-semibold ${
														item.urgency === "medium"
															? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
															: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
													}`}
												>
													{item.vacantSeats} Vacant Seats
												</Badge>
											)}
										</div>
									</div>

									{/* Sub Details Row */}
									<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1 pb-3">
										<div className="flex items-center gap-3 flex-wrap">
											<span className="flex items-center gap-1 font-medium text-foreground">
												<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
												{item.destination}
											</span>
											<span className="flex items-center gap-1">
												<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
												{new Date(item.startDate).toLocaleDateString("en-IN", {
													month: "short",
													day: "numeric",
												})}{" "}
												-{" "}
												{new Date(item.endDate).toLocaleDateString("en-IN", {
													month: "short",
													day: "numeric",
												})}
											</span>
										</div>

										{/* Action Buttons */}
										<div className="flex items-center gap-1.5">
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleCopyLink(item.id)}
												className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
												title="Copy Batch Link"
											>
												{copiedId === item.id ? (
													<Check className="h-3.5 w-3.5 text-emerald-500" />
												) : (
													<Copy className="h-3.5 w-3.5" />
												)}
											</Button>

											<Button
												size="sm"
												onClick={() => navigate(`/user/bookings?action=new&batchId=${item.id}`)}
												className="h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs"
											>
												<PlusCircle className="h-3.5 w-3.5" /> Book
											</Button>
										</div>
									</div>

									{/* Seat Capacity Progress Bar */}
									<div className="space-y-1 border-t border-border/40 pt-2.5">
										<div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
											<span>Seat Occupancy</span>
											<span className="tabular-nums font-bold text-foreground">
												{item.bookedSeats}/{item.totalSeats} ({fillPercentage}%)
											</span>
										</div>
										<Progress
											value={fillPercentage}
											className={`h-2 ${
												item.urgency === "high"
													? "[&>div]:bg-rose-500"
													: item.urgency === "medium"
													? "[&>div]:bg-amber-500"
													: "[&>div]:bg-emerald-500"
											}`}
										/>
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
