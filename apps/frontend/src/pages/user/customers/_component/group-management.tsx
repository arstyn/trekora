import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ICustomer, Group } from "@/types/customer.type";
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface GroupManagementProps {
	groups: Group[];
	customers: ICustomer[];
	onAdd: (group: Group) => void;
	onUpdate: (group: Group) => void;
	onDelete: (groupId: string) => void;
}

export default function GroupManagement({
	groups,
	customers,
	onAdd,
	onUpdate,
	onDelete,
}: GroupManagementProps) {
	const [isAddingGroup, setIsAddingGroup] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
	const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
	const [formData, setFormData] = useState<Group>({
		id: "",
		name: "",
		type: "",
		memberIds: [],
	});

	const handleOpenAddForm = () => {
		setFormData({
			id: "",
			name: "",
			type: "",
			memberIds: [],
		});
		setIsAddingGroup(true);
	};

	const handleOpenEditForm = (group: Group) => {
		setFormData(group);
		setSelectedGroup(group);
	};

	const handleCloseForm = () => {
		setIsAddingGroup(false);
		setSelectedGroup(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleMemberToggle = (customerId: string) => {
		setFormData((prev) => {
			const isSelected = prev.memberIds.includes(customerId);

			if (isSelected) {
				return {
					...prev,
					memberIds: prev.memberIds.filter((id) => id !== customerId),
				};
			} else {
				return {
					...prev,
					memberIds: [...prev.memberIds, customerId],
				};
			}
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedGroup) {
			onUpdate(formData);
		} else {
			onAdd(formData);
		}
		handleCloseForm();
	};

	const confirmDelete = (group: Group) => {
		setGroupToDelete(group);
	};

	const handleDelete = () => {
		if (groupToDelete) {
			onDelete(groupToDelete.id);
			setGroupToDelete(null);
		}
	};

	const getGroupMemberNames = (memberIds: string[]) => {
		return memberIds
			.map(
				(id) =>
					customers.find((c) => c.id === id)?.firstName +
						" " +
						customers.find((c) => c.id === id)?.lastName || "Unknown"
			)
			.join(", ");
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Groups</CardTitle>
					<CardDescription>
						Manage customer groups for family or group trips.
					</CardDescription>
				</div>
				<Button onClick={handleOpenAddForm}>
					<PlusCircle className="mr-2 h-4 w-4" />
					Add Group
				</Button>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Group Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Members</TableHead>
							<TableHead>Member Count</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{groups.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No groups found. Add a new group to get started.
								</TableCell>
							</TableRow>
						) : (
							groups.map((group) => (
								<TableRow key={group.id}>
									<TableCell className="font-medium">
										{group.name}
									</TableCell>
									<TableCell>
										<Badge variant="outline">{group.type}</Badge>
									</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{getGroupMemberNames(group.memberIds)}
									</TableCell>
									<TableCell>{group.memberIds.length}</TableCell>
									<TableCell className="text-right relative">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="cursor-pointer"
												>
													<MoreHorizontal className="h-4 w-4 cursor-pointer" />
													<span className="sr-only">
														Open menu
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="z-50"
											>
												<DropdownMenuItem
													onClick={() =>
														handleOpenEditForm(group)
													}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => confirmDelete(group)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<Dialog
					open={isAddingGroup || !!selectedGroup}
					onOpenChange={handleCloseForm}
				>
					<DialogContent className="sm:max-w-[500px]">
						<form onSubmit={handleSubmit}>
							<DialogHeader>
								<DialogTitle>
									{selectedGroup ? "Edit Group" : "Add New Group"}
								</DialogTitle>
								<DialogDescription>
									{selectedGroup
										? "Update group details and members."
										: "Create a new group for family or group trips."}
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Group Name</Label>
									<Input
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="type">Group Type</Label>
									<Input
										id="type"
										name="type"
										value={formData.type}
										onChange={handleChange}
										placeholder="Family, Corporate, Friends, etc."
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label>Group Members</Label>
									<ScrollArea className="h-[200px] border rounded-md p-2">
										<div className="space-y-2">
											{customers.map((customer) => (
												<div
													key={customer.id}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`customer-${customer.id}`}
														checked={formData.memberIds.includes(
															customer.id || ""
														)}
														onCheckedChange={() =>
															handleMemberToggle(
																customer.id || ""
															)
														}
													/>
													<Label
														htmlFor={`customer-${
															customer.id || ""
														}`}
														className="flex-1"
													>
														{customer.firstName +
															" " +
															customer.lastName}
													</Label>
												</div>
											))}
										</div>
									</ScrollArea>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleCloseForm}
								>
									Cancel
								</Button>
								<Button type="submit">
									{selectedGroup ? "Update Group" : "Add Group"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				<AlertDialog
					open={!!groupToDelete}
					onOpenChange={(open) => !open && setGroupToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete this group. This action
								cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className="bg-destructive text-destructive-foreground"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
