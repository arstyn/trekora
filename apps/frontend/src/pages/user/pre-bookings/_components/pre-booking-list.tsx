import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Calendar,
	DollarSign,
	Eye,
	Loader2,
	MoreHorizontal,
	Search,
	Users,
	AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { preBookingService } from "@/services/pre-booking.service";
import { PreBookingStatus, type PreBookingSummaryDto } from "@/types/pre-booking.types";
import { toast } from "sonner";
import { PreBookingDetailDialog } from "./pre-booking-detail-dialog";

interface PreBookingListProps {
	status?: string;
	onRefresh?: () => void;
}

export function PreBookingList({ status, onRefresh }: PreBookingListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [preBookings, setPreBookings] = useState<PreBookingSummaryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedPreBookingId, setSelectedPreBookingId] = useState<string | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		fetchPreBookings();
	}, [status]);

	// Handle URL query param for selected pre-booking
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const selectedId = params.get("selected");
		if (selectedId) {
			setSelectedPreBookingId(selectedId);
			setIsDetailDialogOpen(true);
		}
	}, [location.search]);

	const fetchPreBookings = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await preBookingService.getAll(
				status as PreBookingStatus | undefined,
				100,
				0
			);

			setPreBookings(data);
		} catch (err) {
			console.error("Error fetching pre-bookings:", err);
			setError("Failed to load pre-bookings. Please try again.");
			toast.error("Failed to load pre-bookings");
		} finally {
			setLoading(false);
		}
	};

	const handleViewDetails = (id: string) => {
		setSelectedPreBookingId(id);
		setIsDetailDialogOpen(true);
		navigate(`?selected=${id}`);
	};

	const handleCloseDetail = () => {
		setIsDetailDialogOpen(false);
		setSelectedPreBookingId(null);
		navigate(location.pathname);
		if (onRefresh) {
			onRefresh();
		}
		fetchPreBookings();
	};

	const handleCancelPreBooking = async (id: string) => {
		try {
			await preBookingService.cancel(id);
			toast.success("Pre-booking cancelled successfully");
			fetchPreBookings();
			if (onRefresh) {
				onRefresh();
			}
		} catch (err) {
			console.error("Error cancelling pre-booking:", err);
			toast.error("Failed to cancel pre-booking");
		}
	};

	const filteredPreBookings = preBookings.filter(
		(preBooking) =>
			preBooking.preBookingNumber
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			preBooking.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(preBooking.packageName &&
				preBooking.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case PreBookingStatus.PENDING:
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case PreBookingStatus.CUSTOMER_DETAILS_PENDING:
				return (
					<Badge className="bg-blue-100 text-blue-800">Details Pending</Badge>
				);
			case PreBookingStatus.CUSTOMER_CREATED:
				return (
					<Badge className="bg-green-100 text-green-800">
						Customer Created
					</Badge>
				);
			case PreBookingStatus.CONVERTED_TO_BOOKING:
				return <Badge className="bg-purple-100 text-purple-800">Converted</Badge>;
			case PreBookingStatus.CANCELLED:
				return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex h-[300px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{/* Search */}
				<div className="flex items-center space-x-2">
					<div className="relative flex-1">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search pre-bookings..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8"
						/>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Pre-Booking #</TableHead>
								<TableHead>Lead Name</TableHead>
								<TableHead>Package</TableHead>
								<TableHead>Travelers</TableHead>
								<TableHead>Start Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPreBookings.length > 0 ? (
								filteredPreBookings.map((preBooking) => (
									<TableRow
										key={preBooking.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleViewDetails(preBooking.id)}
									>
										<TableCell className="font-medium">
											{preBooking.preBookingNumber}
										</TableCell>
										<TableCell>{preBooking.leadName}</TableCell>
										<TableCell>
											{preBooking.packageName || "N/A"}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{preBooking.numberOfTravelers}
											</div>
										</TableCell>
										<TableCell>
											{preBooking.preferredStartDate ? (
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{new Date(
														preBooking.preferredStartDate
													).toLocaleDateString()}
												</div>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>
											{preBooking.estimatedAmount ? (
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													{formatCurrency(
														preBooking.estimatedAmount
													)}
												</div>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>
											{getStatusBadge(preBooking.status)}
										</TableCell>
										<TableCell>
											{new Date(
												preBooking.createdAt
											).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger
													asChild
													onClick={(e) => e.stopPropagation()}
												>
													<Button
														variant="ghost"
														className="h-8 w-8 p-0"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															handleViewDetails(
																preBooking.id
															);
														}}
													>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
													{preBooking.status !==
														PreBookingStatus.CANCELLED &&
														preBooking.status !==
															PreBookingStatus.CONVERTED_TO_BOOKING && (
															<DropdownMenuItem
																onClick={(e) => {
																	e.stopPropagation();
																	handleCancelPreBooking(
																		preBooking.id
																	);
																}}
																className="text-red-600"
															>
																Cancel Pre-Booking
															</DropdownMenuItem>
														)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={9} className="h-24 text-center">
										No pre-bookings found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Detail Dialog */}
			{selectedPreBookingId && (
				<PreBookingDetailDialog
					open={isDetailDialogOpen}
					onOpenChange={handleCloseDetail}
					preBookingId={selectedPreBookingId}
					onUpdate={fetchPreBookings}
				/>
			)}
		</>
	);
}
