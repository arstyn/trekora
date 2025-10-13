import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import type { ILead, ILeadStatus } from "@/types/lead/lead.entity";
import type { IPackages } from "@/types/package.schema";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { preBookingService } from "@/services/pre-booking.service";
import { LeadForm } from "./lead-form";
import { LeadUpdates } from "./lead-updates";
import { ReminderTab } from "./reminder-tab";
import { Package, Users, MapPin, IndianRupee } from "lucide-react";

type ViewLeadDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lead: ILead | null;
	onEdit: (isCreating: boolean, leadData: ILead) => void;
};

export function ViewLeadDialog({
	open,
	onOpenChange,
	lead,
	onEdit,
}: ViewLeadDialogProps) {
	const [showEditForm, setShowEditForm] = useState(false);
	const [isConverting, setIsConverting] = useState(false);
	const [packages, setPackages] = useState<IPackages[]>([]);
	const navigate = useNavigate();

	// Fetch packages if lead has package preferences
	useEffect(() => {
		const fetchPackages = async () => {
			if (!lead) return;

			const hasPackageData =
				lead.preferredPackageId ||
				(lead.consideredPackageIds && lead.consideredPackageIds.length > 0);

			if (hasPackageData) {
				try {
					const res = await axiosInstance.get<IPackages[]>("/packages");
					setPackages(res.data);
				} catch (error) {
					console.error("Failed to fetch packages:", error);
				}
			}
		};
		fetchPackages();
	}, [lead]);

	if (!lead) return null;

	// Helper for empty fields
	const display = (value?: string | number | boolean | null) =>
		value !== undefined && value !== null && value !== "" ? (
			value
		) : (
			<span className="text-muted-foreground italic">N/A</span>
		);

	const updateLeadStatus = async (status: ILeadStatus) => {
		try {
			const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, {
				name: lead.name,
				status: status,
			});
			if (res) {
				onEdit(false, { ...lead, ...res.data });
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};

	const handleConvertToPreBooking = async () => {
		try {
			setIsConverting(true);
			const preBooking = await preBookingService.convertLeadToPreBooking({
				leadId: lead.id,
			});
			toast.success("Lead converted to pre-booking successfully!");
			onOpenChange(false);
			navigate(`/pre-bookings?selected=${preBooking.id}`);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to convert lead to pre-booking");
			}
		} finally {
			setIsConverting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(on) => {
				onOpenChange(on);
				setShowEditForm(false);
			}}
		>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Lead Details
					</DialogTitle>
				</DialogHeader>

				{!showEditForm && (
					<div className="space-y-8">
						{/* Lead details */}
						<div className="max-h-[50vh] overflow-auto space-y-5">
							<div className="grid grid-cols-2 gap-6 ">
								{/* Left column */}
								<div className="space-y-3">
									<Detail label="Name" value={display(lead.name)} />
									<Detail
										label="Company"
										value={display(lead.company)}
									/>
									<Detail label="Email" value={display(lead.email)} />
								</div>
								{/* Right column */}
								<div className="space-y-3">
									<Detail label="Phone" value={display(lead.phone)} />
									<Detail label="Status" value={display(lead.status)} />
									<Detail
										label="Created At"
										value={format(new Date(lead.createdAt), "PPP")}
									/>
								</div>
							</div>

							{/* Package Preferences Section */}
							{(lead.preferredPackageId ||
								(lead.consideredPackageIds &&
									lead.consideredPackageIds.length > 0) ||
								lead.numberOfPassengers > 1) && (
								<>
									<Separator className="my-4" />
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2 text-base">
												<Package className="h-4 w-4" />
												Package Preferences
											</CardTitle>
											<CardDescription>
												Package selection and travel details
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Number of Passengers */}
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm font-medium">
													Number of Passengers:
												</span>
												<Badge variant="secondary">
													{lead.numberOfPassengers || 1}{" "}
													{lead.numberOfPassengers === 1
														? "person"
														: "people"}
												</Badge>
											</div>

											{/* Preferred Package */}
											{lead.preferredPackageId && (
												<div className="space-y-2">
													<div className="flex items-center gap-2 text-sm font-medium">
														<Package className="h-4 w-4 text-muted-foreground" />
														Preferred Package
													</div>
													{lead.preferredPackage ? (
														<Card className="bg-muted/50">
															<CardContent className="p-3">
																<div className="flex items-start justify-between gap-2">
																	<div className="space-y-1 flex-1">
																		<p className="font-medium">
																			{
																				lead
																					.preferredPackage
																					.name
																			}
																		</p>
																		<div className="flex items-center gap-2 text-sm text-muted-foreground">
																			<MapPin className="h-3 w-3" />
																			<span>
																				{
																					lead
																						.preferredPackage
																						.destination
																				}
																			</span>
																		</div>
																		<div className="flex items-center gap-2 text-sm font-medium">
																			<IndianRupee className="h-3 w-3" />
																			<span>
																				₹
																				{
																					lead
																						.preferredPackage
																						.price
																				}
																			</span>
																		</div>
																	</div>
																	<Badge variant="default">
																		Selected
																	</Badge>
																</div>
															</CardContent>
														</Card>
													) : (
														packages.find(
															(p) =>
																p.id ===
																lead.preferredPackageId
														) && (
															<Card className="bg-muted/50">
																<CardContent className="p-3">
																	<div className="flex items-start justify-between gap-2">
																		<div className="space-y-1 flex-1">
																			<p className="font-medium">
																				{
																					packages.find(
																						(
																							p
																						) =>
																							p.id ===
																							lead.preferredPackageId
																					)
																						?.name
																				}
																			</p>
																			<div className="flex items-center gap-2 text-sm text-muted-foreground">
																				<MapPin className="h-3 w-3" />
																				<span>
																					{
																						packages.find(
																							(
																								p
																							) =>
																								p.id ===
																								lead.preferredPackageId
																						)
																							?.destination
																					}
																				</span>
																			</div>
																			<div className="flex items-center gap-2 text-sm font-medium">
																				<IndianRupee className="h-3 w-3" />
																				<span>
																					₹
																					{
																						packages.find(
																							(
																								p
																							) =>
																								p.id ===
																								lead.preferredPackageId
																						)
																							?.price
																					}
																				</span>
																			</div>
																		</div>
																		<Badge variant="default">
																			Selected
																		</Badge>
																	</div>
																</CardContent>
															</Card>
														)
													)}
												</div>
											)}

											{/* Considered Packages */}
											{lead.consideredPackageIds &&
												lead.consideredPackageIds.length > 0 && (
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-sm font-medium">
															<Package className="h-4 w-4 text-muted-foreground" />
															Considered Packages (
															{
																lead.consideredPackageIds
																	.length
															}
															)
														</div>
														<div className="space-y-2">
															{lead.consideredPackageIds.map(
																(pkgId) => {
																	const pkg =
																		packages.find(
																			(p) =>
																				p.id ===
																				pkgId
																		);
																	if (!pkg) return null;
																	return (
																		<Card
																			key={pkgId}
																			className="bg-muted/30"
																		>
																			<CardContent className="p-3">
																				<div className="flex items-start justify-between gap-2">
																					<div className="space-y-1 flex-1">
																						<p className="text-sm font-medium">
																							{
																								pkg.name
																							}
																						</p>
																						<div className="flex items-center gap-3 text-xs text-muted-foreground">
																							<div className="flex items-center gap-1">
																								<MapPin className="h-3 w-3" />
																								<span>
																									{
																										pkg.destination
																									}
																								</span>
																							</div>
																							<div className="flex items-center gap-1">
																								<IndianRupee className="h-3 w-3" />
																								<span>
																									₹
																									{
																										pkg.price
																									}
																								</span>
																							</div>
																						</div>
																					</div>
																					<Badge
																						variant="outline"
																						className="text-xs"
																					>
																						Considered
																					</Badge>
																				</div>
																			</CardContent>
																		</Card>
																	);
																}
															)}
														</div>
													</div>
												)}

											{/* Estimated Total */}
											{lead.preferredPackage &&
												lead.numberOfPassengers && (
													<div className="pt-2 border-t">
														<div className="flex items-center justify-between text-sm">
															<span className="font-medium">
																Estimated Total:
															</span>
															<span className="text-lg font-bold flex items-center gap-1">
																<IndianRupee className="h-4 w-4" />
																{(
																	Number(
																		lead
																			.preferredPackage
																			.price
																	) *
																	lead.numberOfPassengers
																).toLocaleString()}
															</span>
														</div>
														<p className="text-xs text-muted-foreground mt-1">
															Based on{" "}
															{lead.numberOfPassengers}{" "}
															{lead.numberOfPassengers === 1
																? "passenger"
																: "passengers"}{" "}
															× ₹
															{lead.preferredPackage.price}
														</p>
													</div>
												)}
										</CardContent>
									</Card>
								</>
							)}
						</div>

						{/* Status Strip */}
						<div className="flex items-center w-full rounded-lg overflow-hidden shadow-sm border border-gray-300 text-sm font-medium mt-6">
							{["new", "contacted", "qualified", "lost", "converted"].map(
								(status, index) => {
									const statusOrder = [
										"new",
										"contacted",
										"qualified",
										"lost",
										"converted",
									];
									const currentIndex = statusOrder.indexOf(lead.status);
									const isUpcoming = index > currentIndex;

									return (
										<Button
											key={status}
											className="rounded-none flex-1 cursor-pointer"
											variant={`${
												isUpcoming ? "ghost" : "default"
											}`}
											onClick={() =>
												updateLeadStatus(status as ILeadStatus)
											}
										>
											{status.charAt(0).toUpperCase() +
												status.slice(1)}
										</Button>
									);
								}
							)}
						</div>

						{/* Tabs for Chat and Updates */}
						<Tabs defaultValue="chat">
							<TabsList className="flex justify-center">
								<TabsTrigger value="chat">Chat</TabsTrigger>
								<TabsTrigger value="updates">Updates</TabsTrigger>
								<TabsTrigger value="reminders">Reminders</TabsTrigger>
							</TabsList>
							<TabsContent value="chat">
								<div className="p-4 border rounded-md">
									<p className="text-sm text-muted-foreground">
										Chat messages go here...
									</p>
									<p className="text-sm italic">[Dummy data]</p>
								</div>
							</TabsContent>
							<TabsContent value="updates">
								<LeadUpdates leadId={lead.id} />
							</TabsContent>
							<TabsContent value="reminders">
								<ReminderTab leadId={lead.id} />
							</TabsContent>
						</Tabs>

						<div className="pt-4 pr-4 flex justify-between gap-2 border-t">
							<Button
								variant="default"
								onClick={handleConvertToPreBooking}
								disabled={isConverting}
							>
								{isConverting
									? "Converting..."
									: "Convert to Pre-Booking"}
							</Button>
							<div className="flex gap-2">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Close
								</Button>
								<Button onClick={() => setShowEditForm(true)}>
									Edit Lead
								</Button>
							</div>
						</div>
					</div>
				)}

				{showEditForm && (
					<LeadForm
						lead={lead}
						isCreating={false}
						onSave={onEdit}
						onClose={() => setShowEditForm(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

// Helper component for details
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm">{value}</p>
		</div>
	);
}
