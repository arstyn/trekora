import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar, Users, DollarSign, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { preBookingService } from "@/services/pre-booking.service";
import { PreBookingStatus, type PreBookingResponseDto } from "@/types/pre-booking.types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConvertToBookingDialog } from "./convert-to-booking-dialog";
import { UpdatePackageDialog } from "./update-package-dialog";
import { UpdateCustomerDetailsDialog } from "./update-customer-details-dialog";
import { CreateCustomerDialog } from "./create-customer-dialog";

interface PreBookingDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preBookingId: string;
	onUpdate?: () => void;
}

export function PreBookingDetailDialog({
	open,
	onOpenChange,
	preBookingId,
	onUpdate,
}: PreBookingDetailDialogProps) {
	const [preBooking, setPreBooking] = useState<PreBookingResponseDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [updatePackageOpen, setUpdatePackageOpen] = useState(false);
	const [updateCustomerDetailsOpen, setUpdateCustomerDetailsOpen] = useState(false);
	const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
	const [convertToBookingOpen, setConvertToBookingOpen] = useState(false);

	useEffect(() => {
		if (open && preBookingId) {
			fetchPreBooking();
		}
	}, [open, preBookingId]);

	const fetchPreBooking = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await preBookingService.getOne(preBookingId);
			setPreBooking(data);
		} catch (err) {
			console.error("Error fetching pre-booking:", err);
			setError("Failed to load pre-booking details");
			toast.error("Failed to load pre-booking details");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdate = () => {
		fetchPreBooking();
		if (onUpdate) {
			onUpdate();
		}
	};

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

	const display = (value?: string | number | boolean | null) =>
		value !== undefined && value !== null && value !== "" ? (
			value
		) : (
			<span className="text-muted-foreground italic">N/A</span>
		);

	if (loading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<div className="flex h-[300px] items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error || !preBooking) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error || "Pre-booking not found"}
						</AlertDescription>
					</Alert>
				</DialogContent>
			</Dialog>
		);
	}

	const canUpdatePackage =
		preBooking.status === PreBookingStatus.PENDING ||
		preBooking.status === PreBookingStatus.CUSTOMER_DETAILS_PENDING;

	const canUpdateCustomerDetails =
		preBooking.status === PreBookingStatus.CUSTOMER_DETAILS_PENDING;

	const canCreateCustomer =
		preBooking.status === PreBookingStatus.CUSTOMER_DETAILS_PENDING &&
		preBooking.temporaryCustomerDetails;

	const canConvertToBooking =
		preBooking.status === PreBookingStatus.CUSTOMER_CREATED &&
		preBooking.customer &&
		preBooking.package;

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between">
							<span>Pre-Booking Details</span>
							{getStatusBadge(preBooking.status)}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<Detail
								label="Pre-Booking Number"
								value={preBooking.preBookingNumber}
							/>
							<Detail label="Status" value={display(preBooking.status)} />
							<Detail
								label="Created At"
								value={format(new Date(preBooking.createdAt), "PPP")}
							/>
							<Detail
								label="Updated At"
								value={format(new Date(preBooking.updatedAt), "PPP")}
							/>
						</div>

						<Tabs defaultValue="details" className="w-full">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="lead">Lead Info</TabsTrigger>
								<TabsTrigger value="package">Package Info</TabsTrigger>
								<TabsTrigger value="customer">Customer Info</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<Detail
										label="Number of Travelers"
										value={
											<div className="flex items-center gap-1">
												<Users className="h-4 w-4" />
												{preBooking.numberOfTravelers}
											</div>
										}
									/>
									{preBooking.estimatedAmount && (
										<Detail
											label="Estimated Amount"
											value={
												<div className="flex items-center gap-1">
													<DollarSign className="h-4 w-4" />
													{formatCurrency(
														preBooking.estimatedAmount
													)}
												</div>
											}
										/>
									)}
									{preBooking.preferredStartDate && (
										<Detail
											label="Preferred Start Date"
											value={
												<div className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{format(
														new Date(
															preBooking.preferredStartDate
														),
														"PPP"
													)}
												</div>
											}
										/>
									)}
									{preBooking.preferredEndDate && (
										<Detail
											label="Preferred End Date"
											value={
												<div className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{format(
														new Date(
															preBooking.preferredEndDate
														),
														"PPP"
													)}
												</div>
											}
										/>
									)}
								</div>
								{preBooking.specialRequests && (
									<Detail
										label="Special Requests"
										value={preBooking.specialRequests}
									/>
								)}
								{preBooking.notes && (
									<Detail label="Notes" value={preBooking.notes} />
								)}

								{canUpdatePackage && (
									<Button
										onClick={() => setUpdatePackageOpen(true)}
										className="w-full"
									>
										Update Package & Dates
									</Button>
								)}
							</TabsContent>

							<TabsContent value="lead" className="space-y-4">
								{preBooking.lead ? (
									<div className="grid grid-cols-2 gap-4">
										<Detail
											label="Name"
											value={preBooking.lead.name}
										/>
										<Detail
											label="Email"
											value={display(preBooking.lead.email)}
										/>
										<Detail
											label="Phone"
											value={display(preBooking.lead.phone)}
										/>
										<Detail
											label="Status"
											value={display(preBooking.lead.status)}
										/>
									</div>
								) : (
									<p className="text-muted-foreground">
										No lead information available
									</p>
								)}
							</TabsContent>

							<TabsContent value="package" className="space-y-4">
								{preBooking.package ? (
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<Detail
												label="Package Name"
												value={
													<div className="flex items-center gap-1">
														<Package className="h-4 w-4" />
														{preBooking.package.name}
													</div>
												}
											/>
											<Detail
												label="Price"
												value={formatCurrency(
													preBooking.package.price
												)}
											/>
											<Detail
												label="Destination"
												value={display(
													preBooking.package.destination
												)}
											/>
											<Detail
												label="Duration"
												value={display(
													preBooking.package.duration
												)}
											/>
										</div>
									</div>
								) : (
									<div className="space-y-4">
										<p className="text-muted-foreground">
											No package selected yet
										</p>
										{canUpdatePackage && (
											<Button
												onClick={() => setUpdatePackageOpen(true)}
												className="w-full"
											>
												Select Package & Dates
											</Button>
										)}
									</div>
								)}
							</TabsContent>

							<TabsContent value="customer" className="space-y-4">
								{preBooking.customer ? (
									<div className="grid grid-cols-2 gap-4">
										<Detail
											label="First Name"
											value={preBooking.customer.firstName}
										/>
										<Detail
											label="Last Name"
											value={preBooking.customer.lastName}
										/>
										<Detail
											label="Email"
											value={preBooking.customer.email}
										/>
										<Detail
											label="Phone"
											value={preBooking.customer.phone}
										/>
									</div>
								) : preBooking.temporaryCustomerDetails ? (
									<div className="space-y-4">
										<p className="text-sm font-medium">
											Temporary Customer Details:
										</p>
										<div className="grid grid-cols-2 gap-4">
											<Detail
												label="First Name"
												value={display(
													preBooking.temporaryCustomerDetails
														.firstName
												)}
											/>
											<Detail
												label="Last Name"
												value={display(
													preBooking.temporaryCustomerDetails
														.lastName
												)}
											/>
											<Detail
												label="Email"
												value={display(
													preBooking.temporaryCustomerDetails
														.email
												)}
											/>
											<Detail
												label="Phone"
												value={display(
													preBooking.temporaryCustomerDetails
														.phone
												)}
											/>
											<Detail
												label="Address"
												value={display(
													preBooking.temporaryCustomerDetails
														.address
												)}
											/>
											<Detail
												label="Date of Birth"
												value={display(
													preBooking.temporaryCustomerDetails
														.dateOfBirth
												)}
											/>
										</div>
										{preBooking.temporaryCustomerDetails.notes && (
											<Detail
												label="Notes"
												value={
													preBooking.temporaryCustomerDetails
														.notes
												}
											/>
										)}
										<div className="flex gap-2">
											{canUpdateCustomerDetails && (
												<Button
													onClick={() =>
														setUpdateCustomerDetailsOpen(true)
													}
													variant="outline"
													className="flex-1"
												>
													Update Details
												</Button>
											)}
											{canCreateCustomer && (
												<Button
													onClick={() =>
														setCreateCustomerOpen(true)
													}
													className="flex-1"
												>
													Create Customer
												</Button>
											)}
										</div>
									</div>
								) : (
									<div className="space-y-4">
										<p className="text-muted-foreground">
											No customer details available
										</p>
										{canUpdateCustomerDetails && (
											<Button
												onClick={() =>
													setUpdateCustomerDetailsOpen(true)
												}
												className="w-full"
											>
												Add Customer Details
											</Button>
										)}
									</div>
								)}

								{preBooking.booking && (
									<Alert>
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											Converted to Booking:{" "}
											{preBooking.booking.bookingNumber}
										</AlertDescription>
									</Alert>
								)}
							</TabsContent>
						</Tabs>

						{/* Action Buttons */}
						<div className="flex justify-between gap-2 pt-4 border-t">
							<div>
								{canConvertToBooking && (
									<Button onClick={() => setConvertToBookingOpen(true)}>
										Convert to Booking
									</Button>
								)}
							</div>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Close
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Sub-dialogs */}
			{updatePackageOpen && (
				<UpdatePackageDialog
					open={updatePackageOpen}
					onOpenChange={setUpdatePackageOpen}
					preBookingId={preBookingId}
					currentData={{
						packageId: preBooking.package?.id,
						preferredStartDate: preBooking.preferredStartDate,
						preferredEndDate: preBooking.preferredEndDate,
						numberOfTravelers: preBooking.numberOfTravelers,
						specialRequests: preBooking.specialRequests,
						estimatedAmount: preBooking.estimatedAmount,
					}}
					onSuccess={handleUpdate}
				/>
			)}

			{updateCustomerDetailsOpen && (
				<UpdateCustomerDetailsDialog
					open={updateCustomerDetailsOpen}
					onOpenChange={setUpdateCustomerDetailsOpen}
					preBookingId={preBookingId}
					currentDetails={preBooking.temporaryCustomerDetails}
					onSuccess={handleUpdate}
				/>
			)}

			{createCustomerOpen && (
				<CreateCustomerDialog
					open={createCustomerOpen}
					onOpenChange={setCreateCustomerOpen}
					preBookingId={preBookingId}
					temporaryDetails={preBooking.temporaryCustomerDetails}
					onSuccess={handleUpdate}
				/>
			)}

			{convertToBookingOpen && (
				<ConvertToBookingDialog
					open={convertToBookingOpen}
					onOpenChange={setConvertToBookingOpen}
					preBookingId={preBookingId}
					preBooking={preBooking}
					onSuccess={() => {
						handleUpdate();
						onOpenChange(false);
					}}
				/>
			)}
		</>
	);
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm mt-1">{value}</p>
		</div>
	);
}
