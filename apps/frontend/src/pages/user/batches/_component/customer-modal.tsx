"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import type { ICustomer } from "@/types/booking.types";
import type { ICheckList, IBatchChecklist } from "@/types/checklist.types";
import {
	AlertCircle,
	Heart,
	Mail,
	MapPin,
	Phone,
	Save,
	Shield,
	User,
	Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface CustomerModalProps {
	customer: ICustomer;
	packageCheckList?: ICheckList[];
	batchId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CustomerModal({
	customer,
	batchId,
	open,
	onOpenChange,
}: CustomerModalProps) {
	const [batchChecklists, setBatchChecklists] = useState<IBatchChecklist[]>([]);
	const [isLoadingChecklists, setIsLoadingChecklists] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const fetchBatchChecklists = useCallback(async () => {
		setIsLoadingChecklists(true);
		try {
			const response = await axiosInstance.get<IBatchChecklist[]>(
				`/batches/${batchId}/checklists`
			);
			setBatchChecklists(response.data);
		} catch (error) {
			console.error("Error fetching checklists:", error);
			toast.error("Failed to load checklists");
		} finally {
			setIsLoadingChecklists(false);
		}
	}, [batchId]);

	useEffect(() => {
		if (open && batchId) {
			fetchBatchChecklists();
		}
	}, [open, batchId, fetchBatchChecklists]);

	if (!customer) return null;

	const handleChecklistToggle = (checklistId: string) => {
		setBatchChecklists((prev) =>
			prev.map((item) =>
				item.id === checklistId ? { ...item, completed: !item.completed } : item
			)
		);
		setHasChanges(true);
	};

	const handleSaveChecklists = async () => {
		setIsSaving(true);
		try {
			// Update each changed checklist item
			const updatePromises = batchChecklists.map((item) =>
				axiosInstance.patch(`/batches/checklists/${item.id}`, {
					completed: item.completed,
				})
			);

			await Promise.all(updatePromises);
			setHasChanges(false);
			toast.success("Checklists updated successfully");
		} catch (error) {
			console.error("Error saving checklists:", error);
			toast.error("Failed to save checklists");
		} finally {
			setIsSaving(false);
		}
	};

	// Group checklists by type
	const packageChecklists = batchChecklists.filter((item) => item.type === "package");
	const groupChecklists = batchChecklists.filter((item) => item.type === "group");
	const individualChecklists = batchChecklists.filter(
		(item) => item.type === "individual" && item.customerId === customer.id
	);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getAge = (dateOfBirth: string) => {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	};

	const getGenderDisplay = (gender: string) => {
		switch (gender) {
			case "male":
				return "Male";
			case "female":
				return "Female";
			case "other":
				return "Other";
			case "prefer_not_to_say":
				return "Prefer not to say";
			default:
				return gender;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-6xl max-h-[90vh] p-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<User className="w-5 h-5 text-primary" />
						Customer Details
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="h-[calc(90vh-120px)] px-4 sm:px-6">
					<div className="space-y-4 sm:space-y-6 py-4">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
							{/* Personal Information */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										<User className="w-4 h-4 text-primary" />
										Personal Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground">
												Full Name
											</label>
											<p className="text-sm font-medium">
												{customer.firstName}{" "}
												{customer.middleName &&
													`${customer.middleName} `}
												{customer.lastName}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground">
												Age
											</label>
											<p className="text-sm font-medium">
												{getAge(customer.dateOfBirth)} years
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground">
												Date of Birth
											</label>
											<p className="text-sm font-medium">
												{formatDate(customer.dateOfBirth)}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground">
												Gender
											</label>
											<Badge
												variant="secondary"
												className="text-xs"
											>
												{getGenderDisplay(customer.gender)}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Contact Information */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										<Phone className="w-4 h-4 text-primary" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
												<Mail className="w-3 h-3" />
												Email
											</label>
											<p className="text-sm font-medium">
												{customer.email}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
												<Phone className="w-3 h-3" />
												Phone
											</label>
											<p className="text-sm font-medium">
												{customer.phone}
											</p>
										</div>
										{customer.alternativePhone && (
											<div className="space-y-2">
												<label className="text-sm font-medium text-muted-foreground">
													Alternative Phone
												</label>
												<p className="text-sm font-medium">
													{customer.alternativePhone}
												</p>
											</div>
										)}
										<div className="space-y-2 sm:col-span-2">
											<label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
												<MapPin className="w-3 h-3" />
												Address
											</label>
											<p className="text-sm font-medium">
												{customer.address}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Emergency Contact */}
							{(customer.emergencyContactName ||
								customer.emergencyContactPhone) && (
								<Card className="lg:col-span-2">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<AlertCircle className="w-4 h-4 text-destructive" />
											Emergency Contact
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											{customer.emergencyContactName && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Name
													</label>
													<p className="text-sm font-medium">
														{customer.emergencyContactName}
													</p>
												</div>
											)}
											{customer.emergencyContactPhone && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Phone
													</label>
													<p className="text-sm font-medium">
														{customer.emergencyContactPhone}
													</p>
												</div>
											)}
											{customer.emergencyContactRelation && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Relation
													</label>
													<Badge
														variant="outline"
														className="text-xs"
													>
														{
															customer.emergencyContactRelation
														}
													</Badge>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Travel Information */}
							{(customer.specialRequests ||
								customer.medicalConditions ||
								customer.dietaryRestrictions) && (
								<Card className="lg:col-span-2">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Heart className="w-4 h-4 text-pink-500" />
											Travel Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											{customer.specialRequests && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Special Requests
													</label>
													<p className="text-sm font-medium">
														{customer.specialRequests}
													</p>
												</div>
											)}
											{customer.medicalConditions && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Medical Conditions
													</label>
													<p className="text-sm font-medium">
														{customer.medicalConditions}
													</p>
												</div>
											)}
											{customer.dietaryRestrictions && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Dietary Restrictions
													</label>
													<p className="text-sm font-medium">
														{customer.dietaryRestrictions}
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Document Information */}
							{(customer.passportNumber ||
								customer.voterId ||
								customer.aadhaarId) && (
								<Card className="lg:col-span-2">
									<CardHeader className="pb-3">
										<CardTitle className="text-lg flex items-center gap-2">
											<Shield className="w-4 h-4 text-blue-500" />
											Document Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											{customer.passportNumber && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Passport Number
													</label>
													<p className="text-sm font-medium">
														{customer.passportNumber}
													</p>
													{customer.passportExpiryDate && (
														<Badge
															variant="outline"
															className="text-xs"
														>
															Expires:{" "}
															{formatDate(
																customer.passportExpiryDate
															)}
														</Badge>
													)}
												</div>
											)}
											{customer.voterId && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Voter ID
													</label>
													<p className="text-sm font-medium">
														{customer.voterId}
													</p>
												</div>
											)}
											{customer.aadhaarId && (
												<div className="space-y-2">
													<label className="text-sm font-medium text-muted-foreground">
														Aadhaar ID
													</label>
													<p className="text-sm font-medium">
														{customer.aadhaarId}
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Checklist Section - Full Width */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg flex items-center gap-2">
										<AlertCircle className="w-4 h-4 text-orange-500" />
										Travel Checklist
									</CardTitle>
									{hasChanges && (
										<Button
											size="sm"
											onClick={handleSaveChecklists}
											disabled={isSaving}
										>
											{isSaving ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="w-4 h-4 mr-2" />
													Save Changes
												</>
											)}
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{isLoadingChecklists ? (
									<div className="space-y-4">
										<Skeleton className="h-8 w-full" />
										<Skeleton className="h-8 w-full" />
										<Skeleton className="h-8 w-full" />
										<Skeleton className="h-8 w-full" />
									</div>
								) : (
									<>
										{/* Package Checklist Items */}
										{packageChecklists.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<h4 className="font-medium text-sm text-muted-foreground">
														Package Checklist
													</h4>
													<Badge
														variant="outline"
														className="text-xs"
													>
														{
															packageChecklists.filter(
																(item) => item.completed
															).length
														}
														/{packageChecklists.length}{" "}
														Complete
													</Badge>
												</div>
												<div className="space-y-2">
													{packageChecklists.map((item) => (
														<div
															key={item.id}
															className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors border"
														>
															<Checkbox
																id={`package-${item.id}`}
																checked={item.completed}
																onCheckedChange={() =>
																	handleChecklistToggle(
																		item.id
																	)
																}
															/>
															<div className="flex-1 space-y-1">
																<label
																	htmlFor={`package-${item.id}`}
																	className={`text-sm font-medium leading-none cursor-pointer ${
																		item.completed
																			? "line-through text-muted-foreground"
																			: ""
																	}`}
																>
																	{item.item}
																	{item.mandatory && (
																		<Badge
																			variant="destructive"
																			className="ml-2 text-xs"
																		>
																			Required
																		</Badge>
																	)}
																</label>
																{item.notes && (
																	<p className="text-xs text-muted-foreground">
																		{item.notes}
																	</p>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Group Checklist Items */}
										{groupChecklists.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<h4 className="font-medium text-sm text-muted-foreground">
														Group Checklist
													</h4>
													<Badge
														variant="outline"
														className="text-xs"
													>
														{
															groupChecklists.filter(
																(item) => item.completed
															).length
														}
														/{groupChecklists.length} Complete
													</Badge>
												</div>
												<div className="space-y-2">
													{groupChecklists.map((item) => (
														<div
															key={item.id}
															className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors border"
														>
															<Checkbox
																id={`group-${item.id}`}
																checked={item.completed}
																onCheckedChange={() =>
																	handleChecklistToggle(
																		item.id
																	)
																}
															/>
															<div className="flex-1 space-y-1">
																<label
																	htmlFor={`group-${item.id}`}
																	className={`text-sm font-medium leading-none cursor-pointer ${
																		item.completed
																			? "line-through text-muted-foreground"
																			: ""
																	}`}
																>
																	{item.item}
																	{item.mandatory && (
																		<Badge
																			variant="destructive"
																			className="ml-2 text-xs"
																		>
																			Required
																		</Badge>
																	)}
																</label>
																{item.notes && (
																	<p className="text-xs text-muted-foreground">
																		{item.notes}
																	</p>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Individual Checklist Items */}
										{individualChecklists.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<h4 className="font-medium text-sm text-muted-foreground">
														Individual Checklist
													</h4>
													<Badge
														variant="outline"
														className="text-xs"
													>
														{
															individualChecklists.filter(
																(item) => item.completed
															).length
														}
														/{individualChecklists.length}{" "}
														Complete
													</Badge>
												</div>
												<div className="space-y-2">
													{individualChecklists.map((item) => (
														<div
															key={item.id}
															className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors border"
														>
															<Checkbox
																id={`individual-${item.id}`}
																checked={item.completed}
																onCheckedChange={() =>
																	handleChecklistToggle(
																		item.id
																	)
																}
															/>
															<div className="flex-1 space-y-1">
																<label
																	htmlFor={`individual-${item.id}`}
																	className={`text-sm font-medium leading-none cursor-pointer ${
																		item.completed
																			? "line-through text-muted-foreground"
																			: ""
																	}`}
																>
																	{item.item}
																	{item.mandatory && (
																		<Badge
																			variant="destructive"
																			className="ml-2 text-xs"
																		>
																			Required
																		</Badge>
																	)}
																</label>
																{item.notes && (
																	<p className="text-xs text-muted-foreground">
																		{item.notes}
																	</p>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* No Checklists Message */}
										{packageChecklists.length === 0 &&
											groupChecklists.length === 0 &&
											individualChecklists.length === 0 && (
												<div className="text-center py-8 text-muted-foreground">
													<AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
													<p>
														No checklists available for this
														customer
													</p>
												</div>
											)}

										{/* Checklist Progress */}
										{(packageChecklists.length > 0 ||
											groupChecklists.length > 0 ||
											individualChecklists.length > 0) && (
											<div className="pt-4 border-t">
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium text-muted-foreground">
														Overall Progress:
													</span>
													<div className="flex items-center gap-2">
														<div className="text-sm font-medium">
															{
																batchChecklists.filter(
																	(item) =>
																		item.completed &&
																		(item.type !==
																			"individual" ||
																			item.customerId ===
																				customer.id)
																).length
															}{" "}
															/{" "}
															{packageChecklists.length +
																groupChecklists.length +
																individualChecklists.length}
														</div>
														<Badge
															variant="secondary"
															className="text-xs"
														>
															{Math.round(
																(batchChecklists.filter(
																	(item) =>
																		item.completed &&
																		(item.type !==
																			"individual" ||
																			item.customerId ===
																				customer.id)
																).length /
																	(packageChecklists.length +
																		groupChecklists.length +
																		individualChecklists.length ||
																		1)) *
																	100
															)}
															% Complete
														</Badge>
													</div>
												</div>
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
