import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { DashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/services/dashboard.service";

export function SectionCards() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const data = await DashboardService.getDashboardStats();
				setStats(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch stats");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="@container/card">
						<CardHeader className="relative">
							<CardDescription className="h-4 w-24 bg-muted animate-pulse rounded" />
							<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums h-8 w-32 bg-muted animate-pulse rounded" />
						</CardHeader>
					</Card>
				))}
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="px-4 lg:px-6">
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
					{error || "Failed to load dashboard statistics"}
				</div>
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const formatPercentage = (value: number) => {
		const sign = value >= 0 ? "+" : "";
		return `${sign}${(value * 100).toFixed(1)}%`;
	};

	return (
		<div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
			<Card className="@container/card">
				<CardHeader className="relative">
					<CardDescription>Total Revenue</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						{formatCurrency(stats.totalRevenue)}
					</CardTitle>
					<div className="absolute right-4 top-4">
						<Badge
							variant="outline"
							className="flex gap-1 rounded-lg text-xs"
						>
							{stats.revenueChange >= 0 ? (
								<TrendingUpIcon className="size-3" />
							) : (
								<TrendingDownIcon className="size-3" />
							)}
							{formatPercentage(stats.revenueChange)}
						</Badge>
					</div>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.revenueChange >= 0 ? "Trending up" : "Trending down"} this
						month{" "}
						{stats.revenueChange >= 0 ? (
							<TrendingUpIcon className="size-4" />
						) : (
							<TrendingDownIcon className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						Revenue for the current month
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader className="relative">
					<CardDescription>New Customers</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						{stats.newCustomers.toLocaleString()}
					</CardTitle>
					<div className="absolute right-4 top-4">
						<Badge
							variant="outline"
							className="flex gap-1 rounded-lg text-xs"
						>
							{stats.customerChange >= 0 ? (
								<TrendingUpIcon className="size-3" />
							) : (
								<TrendingDownIcon className="size-3" />
							)}
							{formatPercentage(stats.customerChange)}
						</Badge>
					</div>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.customerChange >= 0 ? "Up" : "Down"}{" "}
						{Math.abs(stats.customerChange * 100).toFixed(1)}% this period{" "}
						{stats.customerChange >= 0 ? (
							<TrendingUpIcon className="size-4" />
						) : (
							<TrendingDownIcon className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.customerChange >= 0
							? "Strong acquisition"
							: "Acquisition needs attention"}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader className="relative">
					<CardDescription>Total Bookings</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						{stats.totalBookings.toLocaleString()}
					</CardTitle>
					<div className="absolute right-4 top-4">
						<Badge
							variant="outline"
							className="flex gap-1 rounded-lg text-xs"
						>
							{stats.bookingChange >= 0 ? (
								<TrendingUpIcon className="size-3" />
							) : (
								<TrendingDownIcon className="size-3" />
							)}
							{formatPercentage(stats.bookingChange)}
						</Badge>
					</div>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.bookingChange >= 0 ? "Strong" : "Weak"} booking{" "}
						{stats.bookingChange >= 0 ? (
							<TrendingUpIcon className="size-4" />
						) : (
							<TrendingDownIcon className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.bookingChange >= 0
							? "Bookings exceed targets"
							: "Bookings below targets"}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader className="relative">
					<CardDescription>Growth Rate</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						{formatPercentage(stats.growthRate)}
					</CardTitle>
					<div className="absolute right-4 top-4">
						<Badge
							variant="outline"
							className="flex gap-1 rounded-lg text-xs"
						>
							{stats.growthRate >= 0 ? (
								<TrendingUpIcon className="size-3" />
							) : (
								<TrendingDownIcon className="size-3" />
							)}
							{formatPercentage(stats.growthRate)}
						</Badge>
					</div>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.growthRate >= 0 ? "Steady" : "Declining"} performance{" "}
						{stats.growthRate >= 0 ? (
							<TrendingUpIcon className="size-4" />
						) : (
							<TrendingDownIcon className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.growthRate >= 0
							? "Meets growth projections"
							: "Below growth projections"}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
