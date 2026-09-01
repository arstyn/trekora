import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	type DashboardActiveOffer,
} from "@/services/dashboard.service";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tag, Sparkles, MapPin, Calendar, Users, Ticket } from "lucide-react";
import { CreateBookingDialog } from "@/pages/user/bookings/_components/create-booking-dialog";

export function DataTable() {
	const navigate = useNavigate();
	const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);
	const [latestLeads, setLatestLeads] = useState<LatestLead[]>([]);
	const [fastFillingBatches, setFastFillingBatches] = useState<FastFillingBatch[]>([]);
	const [bestPerformingPackages, setBestPerformingPackages] = useState<
		BestPerformingPackage[]
	>([]);
	const [activeOffers, setActiveOffers] = useState<DashboardActiveOffer[]>([]);
	const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const [bookings, leads, batches, packages, offers] = await Promise.all([
					DashboardService.getLatestBookings(10),
					DashboardService.getLatestLeads(10),
					DashboardService.getFastFillingBatches(10),
					DashboardService.getBestPerformingPackages(10),
					DashboardService.getActiveOffers(10),
				]);

				setLatestBookings(bookings);
				setLatestLeads(leads);
				setFastFillingBatches(batches);
				setBestPerformingPackages(packages);
				setActiveOffers(offers || []);
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
		<>
		<Tabs
			defaultValue="active-offers"
			className="flex w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<TabsList className="w-full justify-start overflow-x-auto">
					<TabsTrigger value="active-offers" className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
						<Sparkles className="w-3.5 h-3.5 text-amber-500" />
						Special Offers {activeOffers.length > 0 && `(${activeOffers.length})`}
					</TabsTrigger>
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
										<TableCell>{booking.numberOfCustomers}</TableCell>
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

			{/* Active Offers Tab */}
			<TabsContent
				value="active-offers"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border border-amber-500/20 bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead>Special Offer</TableHead>
								<TableHead>Discount Rate</TableHead>
								<TableHead>Package & Destination</TableHead>
								<TableHead>Batch Departure</TableHead>
								<TableHead>Seats Left</TableHead>
								<TableHead>Eligibility</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{activeOffers.length > 0 ? (
								activeOffers.map((offer) => (
									<TableRow key={offer.id} className="hover:bg-amber-500/5 transition-colors">
										<TableCell className="font-semibold text-foreground">
											<div className="flex items-center gap-1.5">
												<Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
												<span>{offer.name}</span>
											</div>
											{offer.description && (
												<p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
													{offer.description}
												</p>
											)}
										</TableCell>
										<TableCell>
											<Badge className="bg-amber-600 hover:bg-amber-600 text-white font-mono text-xs">
												{offer.discountMode === "range" &&
												offer.minDiscountValue !== undefined &&
												offer.minDiscountValue !== null
													? offer.discountType === "percentage"
														? `${offer.minDiscountValue}% - ${offer.maxDiscountValue}% OFF`
														: `₹${Number(offer.minDiscountValue).toLocaleString("en-IN")} - ₹${Number(offer.maxDiscountValue).toLocaleString("en-IN")} OFF`
													: offer.discountType === "percentage"
													? `${offer.discountValue}% OFF`
													: `₹${Number(offer.discountValue).toLocaleString("en-IN")} OFF`}
											</Badge>
											{offer.maxDiscountCap && (
												<div className="text-[10px] text-muted-foreground mt-0.5">
													Cap: ₹{Number(offer.maxDiscountCap).toLocaleString("en-IN")}
												</div>
											)}
										</TableCell>
										<TableCell>
											<div className="space-y-0.5">
												<p className="font-medium text-xs text-foreground line-clamp-1">
													{offer.packageName}
												</p>
												{offer.destination && (
													<p className="text-[11px] text-muted-foreground flex items-center gap-1">
														<MapPin className="w-3 h-3 text-amber-500" />
														{offer.destination}
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-xs flex items-center gap-1 text-muted-foreground">
												<Calendar className="w-3 h-3 text-amber-500" />
												<span>
													{format(new Date(offer.batchStartDate), "MMM dd")} - {format(new Date(offer.batchEndDate), "MMM dd, yyyy")}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span className={offer.availableSeats <= 5 ? "font-bold text-rose-600 text-xs" : "font-semibold text-emerald-600 text-xs"}>
												{offer.availableSeats} of {offer.totalSeats} seats left
											</span>
										</TableCell>
										<TableCell>
											<span className="text-xs text-muted-foreground flex items-center gap-1">
												<Users className="w-3.5 h-3.5 text-muted-foreground" />
												{offer.minTravelers > 1 ? `Min ${offer.minTravelers} Pax` : "All Bookings"}
												{offer.discountScope === "passenger" ? " • Per Pax" : " • Total"}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-xs text-muted-foreground">
												{offer.validUntil ? format(new Date(offer.validUntil), "MMM dd, yyyy") : "No Expiry"}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
													onClick={() => navigate(`/batches/view?id=${offer.batchId}`)}
												>
													View Batch
												</Button>
												<Button
													size="sm"
													className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
													onClick={() => {
														setSelectedBatchId(offer.batchId);
														setBookingDialogOpen(true);
													}}
												>
													<Ticket className="w-3 h-3 mr-1" />
													Book
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
										No active batch special offers at this time.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</TabsContent>
		</Tabs>

		{/* Quick Booking Dialog from DataTable */}
		{bookingDialogOpen && (
			<CreateBookingDialog
				open={bookingDialogOpen}
				onOpenChange={(open) => {
					setBookingDialogOpen(open);
					if (!open) setSelectedBatchId(null);
				}}
				onBookingCreated={() => {
					setBookingDialogOpen(false);
					setSelectedBatchId(null);
					navigate("/bookings");
				}}
				preselectedBatchId={selectedBatchId || undefined}
			/>
		)}
		</>
	);
}
