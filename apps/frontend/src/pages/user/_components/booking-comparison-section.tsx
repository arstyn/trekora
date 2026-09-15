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
			<Card className="shadow-sm">
				<CardHeader>
					<div className="h-6 w-48 bg-muted animate-pulse rounded" />
					<div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-24 bg-muted/60 animate-pulse rounded-lg p-4"
							/>
						))}
					</div>
					<div className="h-48 bg-muted/40 animate-pulse rounded-lg" />
				</CardContent>
			</Card>
		);
	}

	const { thisMonth, lastMonth, changePercentage, recentBookings } = data;

	const filteredBookings = recentBookings.filter((b) => {
		if (regionFilter === "all") return true;
		return b.destinationType === regionFilter;
	});

	// Domestic vs International percentage ratios for visual bars
	const totalThisMonth = thisMonth.total || 1;
	const domesticRatio = Math.round((thisMonth.domestic / totalThisMonth) * 100);
	const intlRatio = Math.round((thisMonth.international / totalThisMonth) * 100);

	return (
		<Card className="shadow-sm border-border/80">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<CalendarDays className="h-5 w-5 text-primary" />
						<CardTitle className="text-xl font-bold">
							Booking Analytics & MoM Comparison
						</CardTitle>
					</div>
					<CardDescription className="mt-1">
						Compare This Month vs Last Month bookings across Domestic & International destinations
					</CardDescription>
				</div>
				<div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
					<Button
						variant={regionFilter === "all" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("all")}
						className="h-7 text-xs font-medium"
					>
						All Bookings
					</Button>
					<Button
						variant={regionFilter === "domestic" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("domestic")}
						className="h-7 text-xs font-medium gap-1"
					>
						<MapPin className="h-3 w-3" /> Domestic
					</Button>
					<Button
						variant={regionFilter === "international" ? "default" : "ghost"}
						size="sm"
						onClick={() => setRegionFilter("international")}
						className="h-7 text-xs font-medium gap-1"
					>
						<Globe2 className="h-3 w-3" /> International
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* 4 Performance Metric Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* This Month Bookings */}
					<div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-card p-4 shadow-2xs">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
							<span>THIS MONTH BOOKINGS</span>
							<Badge variant="outline" className="text-xs bg-background">
								Current Period
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-extrabold tracking-tight text-foreground">
								{thisMonth.total}
							</span>
							<span
								className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
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
						<p className="text-xs text-muted-foreground mt-2">
							Last month total: <strong className="text-foreground">{lastMonth.total}</strong>
						</p>
					</div>

					{/* Domestic Bookings */}
					<div className="rounded-xl border bg-card p-4 shadow-2xs">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
							<span className="flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5 text-blue-500" /> DOMESTIC BOOKINGS
							</span>
							<Badge variant="secondary" className="text-xs">
								{domesticRatio}% Share
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-bold tracking-tight text-foreground">
								{thisMonth.domestic}
							</span>
							<span className="text-xs font-medium text-muted-foreground">
								Last mo: {lastMonth.domestic}
							</span>
						</div>
						<div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
							<div
								className="bg-blue-500 h-full rounded-full transition-all duration-500"
								style={{ width: `${domesticRatio}%` }}
							/>
						</div>
					</div>

					{/* International Bookings */}
					<div className="rounded-xl border bg-card p-4 shadow-2xs">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
							<span className="flex items-center gap-1">
								<Globe2 className="h-3.5 w-3.5 text-purple-500" /> INTL BOOKINGS
							</span>
							<Badge variant="secondary" className="text-xs">
								{intlRatio}% Share
							</Badge>
						</div>
						<div className="mt-2 flex items-baseline justify-between">
							<span className="text-3xl font-bold tracking-tight text-foreground">
								{thisMonth.international}
							</span>
							<span className="text-xs font-medium text-muted-foreground">
								Last mo: {lastMonth.international}
							</span>
						</div>
						<div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
							<div
								className="bg-purple-500 h-full rounded-full transition-all duration-500"
								style={{ width: `${intlRatio}%` }}
							/>
						</div>
					</div>

					{/* Growth Comparison Summary */}
					<div className="rounded-xl border bg-card p-4 shadow-2xs flex flex-col justify-between">
						<div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
							<span>GROWTH SUMMARY</span>
							<TrendingUp className="h-4 w-4 text-emerald-500" />
						</div>
						<div className="space-y-1.5 mt-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Domestic Change:</span>
								<span
									className={`font-semibold ${
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
									className={`font-semibold ${
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
						<div className="text-[11px] text-muted-foreground border-t pt-2 mt-2">
							Target Pace: <strong className="text-emerald-600 font-medium">On Track</strong>
						</div>
					</div>
				</div>

				{/* Recent Booking Details Table */}
				<div className="rounded-lg border overflow-hidden">
					<div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
						<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
							<span>Recent Booking Details</span>
							<Badge variant="outline" className="font-normal text-xs">
								{filteredBookings.length} records
							</Badge>
						</h4>
					</div>

					<Table>
						<TableHeader>
							<TableRow className="bg-muted/20">
								<TableHead>Booking #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Package Name</TableHead>
								<TableHead>Region</TableHead>
								<TableHead className="text-center">Pax</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredBookings.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
										No bookings matching selected region filter.
									</TableCell>
								</TableRow>
							) : (
								filteredBookings.map((b) => (
									<TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
										<TableCell className="font-semibold text-xs text-primary">
											{b.bookingNumber}
										</TableCell>
										<TableCell className="text-sm font-medium text-foreground">
											{b.customerName}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
											{b.packageName}
										</TableCell>
										<TableCell>
											{b.destinationType === "international" ? (
												<Badge
													variant="outline"
													className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] gap-1"
												>
													<Globe2 className="h-3 w-3" /> Intl
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] gap-1"
												>
													<MapPin className="h-3 w-3" /> Domestic
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-center text-xs font-semibold">
											<span className="inline-flex items-center gap-1 bg-muted/80 px-2 py-0.5 rounded text-xs">
												<Users className="h-3 w-3 text-muted-foreground" />
												{b.numberOfCustomers}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className={`text-[11px] capitalize gap-1 ${
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
			</CardContent>
		</Card>
	);
}
