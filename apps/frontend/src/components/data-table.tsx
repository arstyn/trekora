import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DashboardService,
	type LatestBooking,
	type LatestLead,
	type FastFillingBatch,
	type BestPerformingPackage,
} from "@/services/dashboard.service";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function DataTable() {
	const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);
	const [latestLeads, setLatestLeads] = useState<LatestLead[]>([]);
	const [fastFillingBatches, setFastFillingBatches] = useState<FastFillingBatch[]>([]);
	const [bestPerformingPackages, setBestPerformingPackages] = useState<
		BestPerformingPackage[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const [bookings, leads, batches, packages] = await Promise.all([
					DashboardService.getLatestBookings(10),
					DashboardService.getLatestLeads(10),
					DashboardService.getFastFillingBatches(10),
					DashboardService.getBestPerformingPackages(10),
				]);

				setLatestBookings(bookings);
				setLatestLeads(leads);
				setFastFillingBatches(batches);
				setBestPerformingPackages(packages);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch dashboard data"
				);
				toast.error("Failed to fetch dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const getStatusBadgeVariant = (status: string) => {
		switch (status.toLowerCase()) {
			case "confirmed":
			case "completed":
			case "converted":
				return "default";
			case "pending":
			case "new":
			case "contacted":
				return "secondary";
			case "cancelled":
			case "lost":
				return "destructive";
			default:
				return "outline";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const formatDate = (date: Date | string) => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return format(dateObj, "MMM dd, yyyy");
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
					<p className="text-muted-foreground">Loading dashboard data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive mx-6">
				{error}
			</div>
		);
	}

	return (
		<Tabs
			defaultValue="latest-bookings"
			className="flex w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<TabsList className="w-full justify-start">
					<TabsTrigger value="latest-bookings">Latest Bookings</TabsTrigger>
					<TabsTrigger value="latest-leads">Latest Leads</TabsTrigger>
					<TabsTrigger value="fast-filling-batches">
						Fast Filling Batches
					</TabsTrigger>
					<TabsTrigger value="best-performing-packages">
						Best Performing Packages
					</TabsTrigger>
				</TabsList>
			</div>

			{/* Latest Bookings Tab */}
			<TabsContent
				value="latest-bookings"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead>Booking #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Package</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Passengers</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{latestBookings.length > 0 ? (
								latestBookings.map((booking) => (
									<TableRow key={booking.id}>
										<TableCell className="font-medium">
											{booking.bookingNumber}
										</TableCell>
										<TableCell>{booking.customerName}</TableCell>
										<TableCell>{booking.packageName}</TableCell>
										<TableCell>
											{formatCurrency(booking.totalAmount)}
										</TableCell>
										<TableCell>
											{booking.numberOfPassengers}
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(
													booking.status
												)}
											>
												{booking.status}
											</Badge>
										</TableCell>
										<TableCell>
											{booking.createdAt
												? formatDate(booking.createdAt)
												: ""}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										No bookings found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>

			{/* Latest Leads Tab */}
			<TabsContent
				value="latest-leads"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Company</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{latestLeads.length > 0 ? (
								latestLeads.map((lead) => (
									<TableRow key={lead.id}>
										<TableCell className="font-medium">
											{lead.name}
										</TableCell>
										<TableCell>{lead.email}</TableCell>
										<TableCell>{lead.phone}</TableCell>
										<TableCell>{lead.company}</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(
													lead.status
												)}
											>
												{lead.status}
											</Badge>
										</TableCell>
										<TableCell>
											{lead.createdAt
												? formatDate(lead.createdAt)
												: ""}
										</TableCell>
										<TableCell
											className="max-w-xs truncate"
											title={lead.notes}
										>
											{lead.notes}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										No leads found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>

			{/* Fast Filling Batches Tab */}
			<TabsContent
				value="fast-filling-batches"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead>Package</TableHead>
								<TableHead>Destination</TableHead>
								<TableHead>Start Date</TableHead>
								<TableHead>End Date</TableHead>
								<TableHead>Seats</TableHead>
								<TableHead>Fill %</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fastFillingBatches.length > 0 ? (
								fastFillingBatches.map((batch) => (
									<TableRow key={batch.id}>
										<TableCell className="font-medium">
											{batch.packageName}
										</TableCell>
										<TableCell>{batch.destination}</TableCell>
										<TableCell>
											{batch.startDate
												? formatDate(batch.startDate)
												: ""}
										</TableCell>
										<TableCell>
											{batch.endDate
												? formatDate(batch.endDate)
												: ""}
										</TableCell>
										<TableCell>
											{batch.bookedSeats}/{batch.totalSeats}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													batch.fillPercentage > 80
														? "default"
														: batch.fillPercentage > 50
														? "secondary"
														: "outline"
												}
											>
												{batch.fillPercentage}%
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(
													batch.status
												)}
											>
												{batch.status}
											</Badge>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										No batches found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>

			{/* Best Performing Packages Tab */}
			<TabsContent
				value="best-performing-packages"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead>Package Name</TableHead>
								<TableHead>Destination</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Total Bookings</TableHead>
								<TableHead>Total Revenue</TableHead>
								<TableHead>Rating</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bestPerformingPackages.length > 0 ? (
								bestPerformingPackages.map((pkg) => (
									<TableRow key={pkg.id}>
										<TableCell className="font-medium">
											{pkg.name}
										</TableCell>
										<TableCell>{pkg.destination}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className="capitalize"
											>
												{pkg.category}
											</Badge>
										</TableCell>
										<TableCell>{pkg.totalBookings}</TableCell>
										<TableCell>
											{formatCurrency(pkg.totalRevenue)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													pkg.averageRating >= 4
														? "default"
														: pkg.averageRating >= 3
														? "secondary"
														: "outline"
												}
											>
												{pkg.averageRating}/5
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(
													pkg.status
												)}
											>
												{pkg.status}
											</Badge>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										No packages found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>
		</Tabs>
	);
}
