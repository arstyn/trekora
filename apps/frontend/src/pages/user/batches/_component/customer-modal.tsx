"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ICustomer } from "@/types/booking.types";
import type { ICheckList } from "@/types/checklist.types";
import {
	AlertCircle,
	Edit,
	Heart,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Plus,
	Save,
	Shield,
	Trash2,
	User,
	X,
} from "lucide-react";
import { useState } from "react";

interface CustomerModalProps {
	customer: ICustomer;
	packageCheckList?: ICheckList[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CustomerModal({
	customer,
	packageCheckList,
	open,
	onOpenChange,
}: CustomerModalProps) {
	const [checklist, setChecklist] = useState(customer?.checklist || {});
	const [customItems, setCustomItems] = useState<ICheckList[]>([]);
	const [newItemInput, setNewItemInput] = useState("");
	const [showAddInput, setShowAddInput] = useState(false);
	const [editingItem, setEditingItem] = useState<{ id: string; task: string } | null>(
		null
	);

	if (!customer) return null;

	const handleChecklistChange = (item: string, checked: boolean) => {
		setChecklist((prev: Record<string, boolean>) => ({
			...prev,
			[item]: checked,
		}));
	};

	const addCustomItem = () => {
		if (newItemInput.trim()) {
			const newItem: ICheckList = {
				id: `custom_${Date.now()}`,
				task: newItemInput.trim(),
				description: "",
				category: "booking",
				dueDate: "",
				completed: false,
			};
			setCustomItems((prev) => [...prev, newItem]);
			setNewItemInput("");
			setShowAddInput(false);
		}
	};

	const editCustomItem = (id: string, newTask: string) => {
		setCustomItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, task: newTask } : item))
		);
		setEditingItem(null);
	};

	const deleteCustomItem = (id: string) => {
		setCustomItems((prev) => prev.filter((item) => item.id !== id));
		setEditingItem(null);
	};

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
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowAddInput(true)}
									>
										<Plus className="w-4 h-4 mr-2" />
										Add Item
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Package Checklist Items */}
								{packageCheckList && packageCheckList.length > 0 && (
									<div className="space-y-3">
										<h4 className="font-medium text-sm text-muted-foreground">
											Package Checklist
										</h4>
										<div className="space-y-2">
											{packageCheckList.map((item) => (
												<div
													key={item.id}
													className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
												>
													<Checkbox
														id={`package-${item.id}`}
														checked={
															checklist[item.task] || false
														}
														onCheckedChange={(checked) =>
															handleChecklistChange(
																item.task,
																checked as boolean
															)
														}
													/>
													<label
														htmlFor={`package-${item.id}`}
														className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
													>
														{item.task}
													</label>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Custom Checklist Items */}
								{customItems.length > 0 && (
									<div className="space-y-3">
										<h4 className="font-medium text-sm text-muted-foreground">
											Custom Items
										</h4>
										<div className="space-y-2">
											{customItems.map((item) => (
												<div
													key={item.id}
													className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
												>
													<Checkbox
														id={`custom-${item.id}`}
														checked={
															checklist[item.task] || false
														}
														onCheckedChange={(checked) =>
															handleChecklistChange(
																item.task,
																checked as boolean
															)
														}
													/>
													{editingItem?.id === item.id ? (
														<div className="flex items-center space-x-2 flex-1">
															<Input
																value={editingItem.task}
																onChange={(e) =>
																	setEditingItem({
																		...editingItem,
																		task: e.target
																			.value,
																	})
																}
																className="flex-1"
															/>
															<Button
																size="sm"
																variant="outline"
																onClick={() =>
																	editCustomItem(
																		item.id,
																		editingItem.task
																	)
																}
															>
																<Save className="w-3 h-3" />
															</Button>
															<Button
																size="sm"
																variant="outline"
																onClick={() =>
																	setEditingItem(null)
																}
															>
																<X className="w-3 h-3" />
															</Button>
														</div>
													) : (
														<>
															<label
																htmlFor={`custom-${item.id}`}
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
															>
																{item.task}
															</label>
															<DropdownMenu>
																<DropdownMenuTrigger
																	asChild
																>
																	<Button
																		variant="ghost"
																		size="sm"
																	>
																		<MoreVertical className="w-3 h-3" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem
																		onClick={() =>
																			setEditingItem(
																				{
																					id: item.id,
																					task: item.task,
																				}
																			)
																		}
																	>
																		<Edit className="w-3 h-3 mr-2" />
																		Edit
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() =>
																			deleteCustomItem(
																				item.id
																			)
																		}
																		className="text-red-600"
																	>
																		<Trash2 className="w-3 h-3 mr-2" />
																		Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Add New Item Input */}
								{showAddInput && (
									<div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg border">
										<Input
											placeholder="Add custom checklist item..."
											value={newItemInput}
											onChange={(e) =>
												setNewItemInput(e.target.value)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													addCustomItem();
												}
											}}
											className="flex-1"
										/>
										<Button size="sm" onClick={addCustomItem}>
											<Plus className="w-3 h-3" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setShowAddInput(false);
												setNewItemInput("");
											}}
										>
											<X className="w-3 h-3" />
										</Button>
									</div>
								)}

								{/* Checklist Progress */}
								<div className="pt-4 border-t">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-muted-foreground">
											Progress:
										</span>
										<div className="flex items-center gap-2">
											<div className="text-sm font-medium">
												{
													Object.values(checklist).filter(
														Boolean
													).length
												}{" "}
												/{" "}
												{(packageCheckList?.length || 0) +
													customItems.length}
											</div>
											<Badge
												variant="secondary"
												className="text-xs"
											>
												{Math.round(
													(Object.values(checklist).filter(
														Boolean
													).length /
														((packageCheckList?.length || 0) +
															customItems.length || 1)) *
														100
												)}
												% Complete
											</Badge>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
