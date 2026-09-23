import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { BookingComparisonData } from "@/services/dashboard.service";
import {
	ArrowDownRight,
	ArrowUpRight,
	CalendarDays,
	CheckCircle2,
	Clock,
	Globe2,
	MapPin,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";

interface BookingComparisonSectionProps {
	data: BookingComparisonData | null;
	loading: boolean;
}

export function BookingComparisonSection({
	data,
	loading,
}: BookingComparisonSectionProps) {
	const [regionFilter, setRegionFilter] = useState<
		"all" | "domestic" | "international"
	>("all");

	if (loading || !data) {
		return (
			<Card className="shadow-xs border-border/80">
				<CardHeader className="pb-4">
					<div className="h-6 w-56 bg-muted animate-pulse rounded" />
					<div className="h-4 w-80 bg-muted animate-pulse rounded mt-1.5" />
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-28 bg-muted/50 animate-pulse rounded-xl p-4"
							/>
						))}
					</div>
					<div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
				</CardContent>
			</Card>
		);
	}

	const { thisMonth, lastMonth, changePercentage, recentBookings } = data;

	const filteredBookings = recentBookings.filter((b) => {
		if (regionFilter === "all") return true;
		return b.destinationType === regionFilter;
	});

	const totalThisMonth = thisMonth.total || 1;
	const domesticRatio = Math.round((thisMonth.domestic / totalThisMonth) * 100);
	const intlRatio = Math.round((thisMonth.international / totalThisMonth) * 100);

	return (
		<Card className="shadow-xs border-border/80 transition-all">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<CalendarDays className="h-5 w-5 text-primary shrink-0" />
						<CardTitle className="text-xl font-bold tracking-tight">
							Booking Analytics & MoM Comparison
						</CardTitle>
					</div>
					<CardDescription className="text-xs sm:text-sm">
						Compare This Month vs Last Month bookings across Domestic & International destinations
					</CardDescription>
				</div>

				<div className="flex items-center gap-1 bg-muted/80 p-1 rounded-lg border border-border/40 shrink-0">
					<Button
						variant={regionFilter === "all" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("all")}
						className="h-7 px-2.5 text-xs font-medium"
					>
						All Bookings
					</Button>
					<Button
						variant={regionFilter === "domestic" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("domestic")}
						className="h-7 px-2.5 text-xs font-medium gap-1.5"
					>
						<MapPin className="h-3 w-3 text-blue-500" /> Domestic
					</Button>
					<Button
						variant={regionFilter === "international" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("international")}
						className="h-7 px-2.5 text-xs font-medium gap-1.5"
					>
						<Globe2 className="h-3 w-3 text-purple-500" /> International
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* 4 Standardized Performance Metric Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Card 1: This Month Bookings */}
					<div className="rounded-xl border border-border/80 bg-gradient-to-br from-primary/5 via-card to-card p-4 shadow-2xs flex flex-col justify-between min-h-[116px]">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-semibold tracking-wider">
							<span>THIS MONTH</span>
							<Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background font-normal">
								Current Period
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
								{thisMonth.total}
							</span>
							<span
								className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
									changePercentage.total >= 0
										? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
										: "bg-rose-500/15 text-rose-600 dark:text-rose-400"
								}`}
							>
								{changePercentage.total >= 0 ? (
									<ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
								) : (
									<ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
								)}
								{Math.abs(changePercentage.total)}% MoM
							</span>
						</div>
						<p className="text-[11px] text-muted-foreground mt-2 border-t border-border/40 pt-1.5 flex justify-between">
							<span>Last Month Total:</span>
							<strong className="text-foreground tabular-nums">{lastMonth.total}</strong>
						</p>
					</div>

					{/* Card 2: Domestic Bookings */}
					<div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between min-h-[116px]">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-semibold tracking-wider">
							<span className="flex items-center gap-1.5">
								<MapPin className="h-3.5 w-3.5 text-blue-500" /> DOMESTIC
							</span>
							<Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-semibold">
								{domesticRatio}% Share
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
								{thisMonth.domestic}
							</span>
							<span className="text-xs font-medium text-muted-foreground tabular-nums">
								Last mo: {lastMonth.domestic}
							</span>
						</div>
						<div className="w-full bg-muted h-2 rounded-full mt-2.5 overflow-hidden">
							<div
								className="bg-blue-500 h-full rounded-full transition-all duration-500"
								style={{ width: `${domesticRatio}%` }}
							/>
						</div>
					</div>

					{/* Card 3: International Bookings */}
					<div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between min-h-[116px]">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-semibold tracking-wider">
							<span className="flex items-center gap-1.5">
								<Globe2 className="h-3.5 w-3.5 text-purple-500" /> INTL
							</span>
							<Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-semibold">
								{intlRatio}% Share
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
								{thisMonth.international}
							</span>
							<span className="text-xs font-medium text-muted-foreground tabular-nums">
								Last mo: {lastMonth.international}
							</span>
						</div>
						<div className="w-full bg-muted h-2 rounded-full mt-2.5 overflow-hidden">
							<div
								className="bg-purple-500 h-full rounded-full transition-all duration-500"
								style={{ width: `${intlRatio}%` }}
							/>
						</div>
					</div>

					{/* Card 4: Growth Comparison Summary */}
					<div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between min-h-[116px]">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-semibold tracking-wider">
							<span>GROWTH PACING</span>
							<TrendingUp className="h-4 w-4 text-emerald-500" />
						</div>
						<div className="space-y-1 my-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Domestic Change:</span>
								<span
									className={`font-semibold tabular-nums ${
										changePercentage.domestic >= 0
											? "text-emerald-600 dark:text-emerald-400"
											: "text-rose-600 dark:text-rose-400"
									}`}
								>
									{changePercentage.domestic >= 0 ? "+" : ""}
									{changePercentage.domestic}%
								</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">International Change:</span>
								<span
									className={`font-semibold tabular-nums ${
										changePercentage.international >= 0
											? "text-emerald-600 dark:text-emerald-400"
											: "text-rose-600 dark:text-rose-400"
									}`}
								>
									{changePercentage.international >= 0 ? "+" : ""}
									{changePercentage.international}%
								</span>
							</div>
						</div>
						<div className="text-[11px] text-muted-foreground border-t border-border/40 pt-1 flex justify-between items-center">
							<span>Target Status:</span>
							<Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-200 font-semibold">
								On Track
							</Badge>
						</div>
					</div>
				</div>

				{/* Aligned Recent Booking Details Table */}
				<div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
					<div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-bold text-foreground">
								Recent Booking Details
							</h4>
							<Badge variant="secondary" className="font-medium text-xs px-2">
								{filteredBookings.length} bookings
							</Badge>
						</div>
						<span className="text-xs text-muted-foreground">
							Filtered by: <strong className="capitalize text-foreground">{regionFilter}</strong>
						</span>
					</div>

					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/30 hover:bg-muted/30">
									<TableHead className="w-[140px] font-semibold text-xs text-muted-foreground">
										Booking #
									</TableHead>
									<TableHead className="font-semibold text-xs text-muted-foreground">
										Customer Name
									</TableHead>
									<TableHead className="font-semibold text-xs text-muted-foreground">
										Package Name
									</TableHead>
									<TableHead className="w-[130px] font-semibold text-xs text-muted-foreground">
										Region
									</TableHead>
									<TableHead className="w-[80px] text-center font-semibold text-xs text-muted-foreground">
										Pax
									</TableHead>
									<TableHead className="w-[120px] text-right font-semibold text-xs text-muted-foreground">
										Status
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBookings.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
											No recent bookings match the selected region filter.
										</TableCell>
									</TableRow>
								) : (
									filteredBookings.map((b) => (
										<TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
											<TableCell className="font-semibold text-xs text-primary tabular-nums">
												{b.bookingNumber}
											</TableCell>
											<TableCell className="text-xs font-semibold text-foreground">
												{b.customerName}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">
												{b.packageName}
											</TableCell>
											<TableCell>
												{b.destinationType === "international" ? (
													<Badge
														variant="outline"
														className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] gap-1 px-2 py-0.5"
													>
														<Globe2 className="h-3 w-3" /> Intl
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] gap-1 px-2 py-0.5"
													>
														<MapPin className="h-3 w-3" /> Domestic
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-center text-xs font-semibold">
												<span className="inline-flex items-center justify-center gap-1 bg-muted px-2 py-0.5 rounded-md text-xs tabular-nums">
													<Users className="h-3 w-3 text-muted-foreground" />
													{b.numberOfCustomers}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<Badge
													variant="secondary"
													className={`text-[11px] capitalize gap-1 px-2 py-0.5 font-medium justify-end ${
														b.status === "confirmed"
															? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
															: b.status === "pending"
															? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
															: "bg-muted text-muted-foreground"
													}`}
												>
													{b.status === "confirmed" ? (
														<CheckCircle2 className="h-3 w-3" />
													) : (
														<Clock className="h-3 w-3" />
													)}
													{b.status}
												</Badge>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
