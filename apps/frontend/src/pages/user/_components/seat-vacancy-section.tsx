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
			<Card className="shadow-sm">
				<CardHeader>
					<div className="h-6 w-48 bg-muted animate-pulse rounded" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-20 bg-muted/60 animate-pulse rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-sm border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5 text-amber-500" />
						<CardTitle className="text-xl font-bold">
							Upcoming Batch Seat Vacancies
						</CardTitle>
					</div>
					<Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200">
						{items.filter((i) => i.urgency === "high").length} Fast Filling
					</Badge>
				</div>
				<CardDescription>
					Monitor open seats & fast-filling batches to maximize booking conversion
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-3 flex-1">
				{items.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
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
								className={`group p-3.5 rounded-xl border transition-all hover:shadow-xs ${
									item.urgency === "high"
										? "border-rose-300 dark:border-rose-950 bg-rose-500/5"
										: item.urgency === "medium"
										? "border-amber-300 dark:border-amber-950 bg-amber-500/5"
										: "bg-card hover:bg-muted/40"
								}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
												{item.packageName}
											</span>
											{item.destinationType === "international" ? (
												<Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700">
													<Globe2 className="h-2.5 w-2.5 mr-0.5" /> Intl
												</Badge>
											) : (
												<Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700">
													<MapPin className="h-2.5 w-2.5 mr-0.5" /> Domestic
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<MapPin className="h-3 w-3" /> {item.destination}
											</span>
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
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
									</div>

									<div className="flex items-center gap-2 sm:self-center">
										{/* Vacant Badge */}
										{item.urgency === "high" ? (
											<Badge className="bg-rose-500 text-white font-bold text-xs gap-1 animate-pulse">
												<AlertTriangle className="h-3 w-3" />
												Only {item.vacantSeats} seats left!
											</Badge>
										) : (
											<Badge
												variant="secondary"
												className={`text-xs font-medium ${
													item.urgency === "medium"
														? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
														: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
												}`}
											>
												{item.vacantSeats} Vacant Seats
											</Badge>
										)}

										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleCopyLink(item.id)}
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
											className="h-8 text-xs gap-1 font-medium"
										>
											<PlusCircle className="h-3.5 w-3.5" /> Book
										</Button>
									</div>
								</div>

								{/* Seat Filling Progress Bar */}
								<div className="mt-3 flex items-center gap-3">
									<Progress
										value={fillPercentage}
										className={`h-2 flex-1 ${
											item.urgency === "high"
												? "[&>div]:bg-rose-500"
												: item.urgency === "medium"
												? "[&>div]:bg-amber-500"
												: "[&>div]:bg-emerald-500"
										}`}
									/>
									<span className="text-[11px] font-semibold text-muted-foreground tabular-nums w-12 text-right">
										{item.bookedSeats}/{item.totalSeats} ({fillPercentage}%)
									</span>
								</div>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
