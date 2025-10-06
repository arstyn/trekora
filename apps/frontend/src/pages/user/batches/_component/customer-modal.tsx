"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
import type { ICustomer } from "@/types/booking.types";
import type { ICheckList } from "@/types/checklist.types";

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
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						Customer Details
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<User className="w-4 h-4" />
							Personal Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600">
									Full Name
								</label>
								<p className="text-sm">
									{customer.firstName}{" "}
									{customer.middleName && `${customer.middleName} `}
									{customer.lastName}
								</p>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600">
									Age
								</label>
								<p className="text-sm">
									{getAge(customer.dateOfBirth)} years
								</p>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600">
									Date of Birth
								</label>
								<p className="text-sm">
									{formatDate(customer.dateOfBirth)}
								</p>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600">
									Gender
								</label>
								<p className="text-sm">
									{getGenderDisplay(customer.gender)}
								</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Contact Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Phone className="w-4 h-4" />
							Contact Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600 flex items-center gap-1">
									<Mail className="w-3 h-3" />
									Email
								</label>
								<p className="text-sm">{customer.email}</p>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600 flex items-center gap-1">
									<Phone className="w-3 h-3" />
									Phone
								</label>
								<p className="text-sm">{customer.phone}</p>
							</div>
							{customer.alternativePhone && (
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Alternative Phone
									</label>
									<p className="text-sm">{customer.alternativePhone}</p>
								</div>
							)}
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-600 flex items-center gap-1">
									<MapPin className="w-3 h-3" />
									Address
								</label>
								<p className="text-sm">{customer.address}</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Emergency Contact */}
					{(customer.emergencyContactName ||
						customer.emergencyContactPhone) && (
						<>
							<div className="space-y-4">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									Emergency Contact
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{customer.emergencyContactName && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Name
											</label>
											<p className="text-sm">
												{customer.emergencyContactName}
											</p>
										</div>
									)}
									{customer.emergencyContactPhone && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Phone
											</label>
											<p className="text-sm">
												{customer.emergencyContactPhone}
											</p>
										</div>
									)}
									{customer.emergencyContactRelation && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Relation
											</label>
											<p className="text-sm">
												{customer.emergencyContactRelation}
											</p>
										</div>
									)}
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Travel Information */}
					{(customer.specialRequests ||
						customer.medicalConditions ||
						customer.dietaryRestrictions) && (
						<>
							<div className="space-y-4">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Heart className="w-4 h-4" />
									Travel Information
								</h3>
								<div className="space-y-4">
									{customer.specialRequests && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Special Requests
											</label>
											<p className="text-sm">
												{customer.specialRequests}
											</p>
										</div>
									)}
									{customer.medicalConditions && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Medical Conditions
											</label>
											<p className="text-sm">
												{customer.medicalConditions}
											</p>
										</div>
									)}
									{customer.dietaryRestrictions && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Dietary Restrictions
											</label>
											<p className="text-sm">
												{customer.dietaryRestrictions}
											</p>
										</div>
									)}
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Document Information */}
					{(customer.passportNumber ||
						customer.voterId ||
						customer.aadhaarId) && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Shield className="w-4 h-4" />
								Document Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{customer.passportNumber && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Passport Number
										</label>
										<p className="text-sm">
											{customer.passportNumber}
										</p>
										{customer.passportExpiryDate && (
											<p className="text-xs text-gray-500">
												Expires:{" "}
												{formatDate(customer.passportExpiryDate)}
											</p>
										)}
									</div>
								)}
								{customer.voterId && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Voter ID
										</label>
										<p className="text-sm">{customer.voterId}</p>
									</div>
								)}
								{customer.aadhaarId && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Aadhaar ID
										</label>
										<p className="text-sm">{customer.aadhaarId}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Checklist Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<AlertCircle className="w-4 h-4" />
								Travel Checklist
							</h3>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowAddInput(true)}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Item
							</Button>
						</div>

						{/* Package Checklist Items */}
						{packageCheckList && packageCheckList.length > 0 && (
							<div className="space-y-3">
								<h4 className="font-medium text-sm text-gray-600">
									Package Checklist
								</h4>
								{packageCheckList.map((item) => (
									<div
										key={item.id}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`package-${item.id}`}
											checked={checklist[item.task] || false}
											onCheckedChange={(checked) =>
												handleChecklistChange(
													item.task,
													checked as boolean
												)
											}
										/>
										<label
											htmlFor={`package-${item.id}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{item.task}
										</label>
									</div>
								))}
							</div>
						)}

						{/* Custom Checklist Items */}
						{customItems.length > 0 && (
							<div className="space-y-3">
								<h4 className="font-medium text-sm text-gray-600">
									Custom Items
								</h4>
								{customItems.map((item) => (
									<div
										key={item.id}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`custom-${item.id}`}
											checked={checklist[item.task] || false}
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
															task: e.target.value,
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
													onClick={() => setEditingItem(null)}
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
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="w-3 h-3" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() =>
																setEditingItem({
																	id: item.id,
																	task: item.task,
																})
															}
														>
															<Edit className="w-3 h-3 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																deleteCustomItem(item.id)
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
						)}

						{/* Add New Item Input */}
						{showAddInput && (
							<div className="flex items-center space-x-2">
								<Input
									placeholder="Add custom checklist item..."
									value={newItemInput}
									onChange={(e) => setNewItemInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											addCustomItem();
										}
									}}
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
							<div className="flex items-center justify-between text-sm">
								<span>Progress:</span>
								<span>
									{Object.values(checklist).filter(Boolean).length} /{" "}
									{(packageCheckList?.length || 0) + customItems.length}{" "}
									completed
								</span>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
