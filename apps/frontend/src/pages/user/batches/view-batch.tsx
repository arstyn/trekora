import NAText from "@/components/na-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios";
import type { IBatches } from "@/types/batches.types";
import type { ICustomer } from "@/types/booking.types";
import type { IEmployee } from "@/types/employee.types";
import { Calendar, Edit, Mail, Phone, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CoordinatorModal } from "./_component/coordinator-modal";
import { CustomerModal } from "./_component/customer-modal";

export default function BatchDetailsPage() {
	const { id } = useParams<{ id: string }>();

	const [batch, setBatch] = useState<IBatches>();
	const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
	const [selectedCoordinator, setSelectedCoordinator] = useState<IEmployee | null>(
		null
	);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	useEffect(() => {
		const getBranch = async () => {
			try {
				const batchData = await axiosInstance.get<IBatches>(`/batches/${id}`);
				setBatch(batchData.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load batches");
				}
			}
		};

		getBranch();
	}, [id]);

	const handleStatusUpdate = async (newStatus: string) => {
		if (!batch || newStatus === batch.status) return;

		setIsUpdatingStatus(true);
		try {
			await axiosInstance.patch(`/batches/${id}`, { status: newStatus });
			setBatch((prev) => (prev ? { ...prev, status: newStatus } : prev));
			toast.success("Batch status updated successfully");
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to update batch status");
			}
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "upcoming":
				return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
			case "completed":
				return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold">{batch?.package?.name}</h1>
						<p className="text-muted-foreground">Batch Details</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{batch && getStatusBadge(batch.status)}
					<div className="flex items-center gap-2">
						<Select
							value={batch?.status}
							onValueChange={handleStatusUpdate}
							disabled={isUpdatingStatus}
						>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="upcoming">Upcoming</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<NavLink to={`/batches/edit/${id}`}>
						<Button>
							<Edit className="w-4 h-4 mr-2" />
							Edit Batch
						</Button>
					</NavLink>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Batch Overview */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Batch Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Start Date
									</p>
									<p className="font-medium">
										{batch &&
											new Date(
												batch.startDate
											).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										End Date
									</p>
									<p className="font-medium">
										{batch &&
											new Date(batch.endDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Users className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Capacity</p>
								<p className="font-medium">
									{batch && batch.bookedSeats}/
									{batch && batch.totalSeats} customers
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Package Details */}
				<Card>
					<CardHeader>
						<CardTitle>Package Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground mb-2">
								Description
							</p>
							<p className="text-sm">
								{batch && batch.package?.description}
							</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground mb-2">
								Destinations
							</p>
							<div className="flex flex-wrap gap-1">
								<Badge variant="outline">
									{batch && batch.package?.destination}
								</Badge>
							</div>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground mb-2">Price</p>
							<p className="text-lg font-bold">
								{batch && batch.package?.price}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Coordinators */}
			<Card>
				<CardHeader>
					<CardTitle>Batch Coordinators</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Experience</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{batch &&
								batch.coordinators?.map((coordinator) => (
									<TableRow
										key={coordinator.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() =>
											setSelectedCoordinator(coordinator)
										}
									>
										<TableCell className="font-medium">
											{coordinator.name || <NAText />}
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{coordinator.role.name || <NAText />}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center gap-1 text-sm">
													<Phone className="w-3 h-3" />
													{coordinator.phone || <NAText />}
												</div>
												<div className="flex items-center gap-1 text-sm">
													<Mail className="w-3 h-3" />
													{coordinator.email || <NAText />}
												</div>
											</div>
										</TableCell>
										<TableCell>
											{coordinator.experience || <NAText />}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
					{batch && batch.coordinators?.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							No coordinators were added
						</div>
					)}
				</CardContent>
			</Card>

			{/* Customers */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Customers ({(batch && batch.customers?.length) || 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Age</TableHead>
								<TableHead>Emergency Contact</TableHead>
								<TableHead>Special Info</TableHead>
								<TableHead>Checklist Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{batch &&
								batch.customers?.map((customer) => {
									const getAge = (dateOfBirth: string) => {
										const today = new Date();
										const birthDate = new Date(dateOfBirth);
										let age =
											today.getFullYear() - birthDate.getFullYear();
										const monthDiff =
											today.getMonth() - birthDate.getMonth();

										if (
											monthDiff < 0 ||
											(monthDiff === 0 &&
												today.getDate() < birthDate.getDate())
										) {
											age--;
										}

										return age;
									};

									return (
										<TableRow
											key={customer.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => setSelectedCustomer(customer)}
										>
											<TableCell className="font-medium">
												{customer.firstName} {customer.lastName}
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center gap-1 text-sm">
														<Phone className="w-3 h-3" />
														{customer.phone}
													</div>
													<div className="flex items-center gap-1 text-sm">
														<Mail className="w-3 h-3" />
														{customer.email}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getAge(customer.dateOfBirth)}
											</TableCell>
											<TableCell className="text-sm">
												{customer.emergencyContactName &&
												customer.emergencyContactPhone
													? `${customer.emergencyContactName} - ${customer.emergencyContactPhone}`
													: "N/A"}
											</TableCell>
											<TableCell>
												{customer.specialRequests ||
												customer.medicalConditions ||
												customer.dietaryRestrictions ? (
													<Badge variant="outline">
														Has Special Info
													</Badge>
												) : (
													<Badge variant="secondary">
														No Special Info
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														customer.checklistStats
															?.completed ===
														customer.checklistStats?.total
															? "default"
															: "secondary"
													}
												>
													{customer.checklistStats?.completed}/
													{customer.checklistStats?.total}{" "}
													Complete
												</Badge>
											</TableCell>
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
					{batch && (!batch.customers || batch.customers?.length === 0) && (
						<div className="text-center py-8 text-muted-foreground">
							No customers were added
						</div>
					)}
				</CardContent>
			</Card>

			{/* Modals */}
			{selectedCustomer && batch && (
				<CustomerModal
					customer={selectedCustomer}
					batchId={batch.id}
					open={!!selectedCustomer}
					onOpenChange={(open) => !open && setSelectedCustomer(null)}
				/>
			)}

			{selectedCoordinator && (
				<CoordinatorModal
					coordinator={selectedCoordinator}
					open={!!selectedCoordinator}
					onOpenChange={(open) => !open && setSelectedCoordinator(null)}
				/>
			)}
		</div>
	);
}
