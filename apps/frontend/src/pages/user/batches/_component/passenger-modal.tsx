import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Edit, Info, Mail, MoreVertical, Phone, Plus, Save, Trash2, User, X } from "lucide-react";
import { useState } from "react";

interface PassengerModalProps {
	passenger: any;
	packageCheckList?: ICheckList[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PassengerModal({
	passenger,
	packageCheckList,
	open,
	onOpenChange,
}: PassengerModalProps) {
	const [checklist, setChecklist] = useState(passenger?.checklist || {});
	const [customItems, setCustomItems] = useState<ICheckList[]>([]);
	const [newItemInput, setNewItemInput] = useState("");
	const [showAddInput, setShowAddInput] = useState(false);
	const [editingItem, setEditingItem] = useState<{ id: string; task: string } | null>(null);

	if (!passenger) return null;

	const handleChecklistChange = (item: string, checked: boolean) => {
		setChecklist((prev: any) => ({
			...prev,
			[item]: checked,
		}));
	};

	const addCustomItem = () => {
		if (newItemInput.trim()) {
			const newItem: ICheckList = {
				id: `custom_${Date.now()}`,
				task: newItemInput.trim(),
			};
			setCustomItems((prev) => [...prev, newItem]);
			setNewItemInput("");
			setShowAddInput(false);
		}
	};

	const removeCustomItem = (itemId: string) => {
		setCustomItems((prev) => prev.filter((item) => item.id !== itemId));
		// Also remove from checklist state
		setChecklist((prev: any) => {
			const updated = { ...prev };
			delete updated[itemId];
			return updated;
		});
	};

	const editItem = (itemId: string, currentTask: string) => {
		setEditingItem({ id: itemId, task: currentTask });
	};

	const saveEdit = (newTask: string) => {
		if (editingItem && newTask.trim()) {
			// Update custom items if it's a custom item
			setCustomItems((prev) => 
				prev.map((item) => 
					item.id === editingItem.id 
						? { ...item, task: newTask.trim() }
						: item
				)
			);
			
			// Update package checklist items would require props callback
			// For now, we'll just handle custom items
		}
		setEditingItem(null);
	};

	const cancelEdit = () => {
		setEditingItem(null);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			if (editingItem) {
				const target = e.target as HTMLInputElement;
				saveEdit(target.value);
			} else {
				addCustomItem();
			}
		} else if (e.key === "Escape") {
			if (editingItem) {
				cancelEdit();
			} else {
				setShowAddInput(false);
				setNewItemInput("");
			}
		}
	};

	const saveChecklist = () => {
		// Here you would save both the original checklist and custom items to your backend
		console.log("Saving checklist:", checklist);
		console.log("Custom items:", customItems);
		// Show success message or handle error
	};

	const allItems = [...(packageCheckList || []), ...customItems];
	const completedItems = Object.values(checklist).filter(Boolean).length;
	const totalItems = allItems.length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						Passenger Details - {passenger.name}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 overflow-y-auto flex-1 pr-2">
					{/* Basic Information */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">{passenger.phone}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{passenger.email}</p>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Age</p>
								<p className="font-medium">{passenger.age} years</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Emergency Contact
								</p>
								<p className="font-medium">
									{passenger.emergencyContact}
								</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Checklist Section */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Travel Checklist</h3>
							<div className="flex items-center gap-2">
								<Badge
									variant={
										completedItems === totalItems
											? "default"
											: "secondary"
									}
								>
									{completedItems}/{totalItems} Complete
								</Badge>
								<Button
									size="sm"
									variant="outline"
									onClick={() => setShowAddInput(true)}
								>
									<Plus className="w-4 h-4 mr-1" />
									Add Item
								</Button>
							</div>
						</div>

						{/* Add new item input */}
						{showAddInput && (
							<div className="mb-4 p-3  rounded-lg">
								<div className="flex items-center gap-2">
									<Input
										placeholder="Enter new checklist item..."
										value={newItemInput}
										onChange={(e) => setNewItemInput(e.target.value)}
										onKeyDown={handleKeyPress}
										autoFocus
										className="flex-1"
									/>
									<Button
										size="sm"
										onClick={addCustomItem}
										disabled={!newItemInput.trim()}
									>
										Add
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => {
											setShowAddInput(false);
											setNewItemInput("");
										}}
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							</div>
						)}

						<div className="space-y-3">
							{/* Original package checklist items */}
							{packageCheckList &&
								packageCheckList.map((item, index) => (
									<div
										key={index}
										className="flex items-center space-x-3 p-3 border rounded-lg"
									>
										<Checkbox
											id={item.id}
											checked={checklist[item.id] || false}
											onCheckedChange={(checked) =>
												handleChecklistChange(item.id, !!checked)
											}
										/>
										{editingItem?.id === item.id ? (
											<div className="flex items-center gap-2 flex-1">
												<Input
													defaultValue={editingItem.task}
													onKeyDown={handleKeyPress}
													onBlur={(e) => saveEdit(e.target.value)}
													autoFocus
													className="flex-1"
												/>
												<Button
													size="sm"
													variant="ghost"
													onClick={cancelEdit}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										) : (
											<>
												<label
													htmlFor={item.id}
													className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													{item.task}
												</label>
												<div className="flex items-center gap-1">
													{!checklist[item.id] && (
														<AlertCircle className="w-4 h-4 text-amber-500" />
													)}
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0"
															>
																<MoreVertical className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => editItem(item.id, item.task)}>
																<Edit className="w-4 h-4 mr-2" />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem 
																onClick={() => removeCustomItem(item.id)}
																className="text-red-600"
															>
																<Trash2 className="w-4 h-4 mr-2" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</>
										)}
									</div>
								))}

							{/* Custom checklist items */}
							{customItems.map((item, index) => (
								<div
									key={item.id}
									className="flex items-center space-x-3 p-3 border rounded-lg"
								>
									<Checkbox
										id={item.id}
										checked={checklist[item.id] || false}
										onCheckedChange={(checked) =>
											handleChecklistChange(item.id, !!checked)
										}
									/>
									{editingItem?.id === item.id ? (
										<div className="flex items-center gap-2 flex-1">
											<Input
												defaultValue={editingItem.task}
												onKeyDown={handleKeyPress}
												onBlur={(e) => saveEdit(e.target.value)}
												autoFocus
												className="flex-1"
											/>
											<Button
												size="sm"
												variant="ghost"
												onClick={cancelEdit}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									) : (
										<>
											<label
												htmlFor={item.id}
												className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											>
												{item.task}
											</label>
											<div className="flex items-center gap-1">
												{!checklist[item.id] && (
													<AlertCircle className="w-4 h-4 text-amber-500" />
												)}
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															size="sm"
															variant="ghost"
															className="h-8 w-8 p-0"
														>
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => editItem(item.id, item.task)}>
															<Edit className="w-4 h-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem 
															onClick={() => removeCustomItem(item.id)}
															className="text-red-600"
														>
															<Trash2 className="w-4 h-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</>
									)}
								</div>
							))}
						</div>

						{completedItems < totalItems && (
							<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
								<div className="flex items-center gap-2">
									<AlertCircle className="w-4 h-4 text-amber-600" />
									<p className="text-sm text-amber-800">
										{totalItems - completedItems} item(s) still
										pending completion
									</p>
								</div>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4 flex-shrink-0">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						<Button onClick={saveChecklist}>
							<Save className="w-4 h-4 mr-2" />
							Save Checklist
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}