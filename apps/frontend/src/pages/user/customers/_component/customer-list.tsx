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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types/customer.type";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

interface CustomerListProps {
	customers: Customer[];
	onSelect: (customer: Customer) => void;
	onDelete: (customerId: string) => void;
}

export default function CustomerList({
	customers,
	onSelect,
	onDelete,
}: CustomerListProps) {
	const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

	const confirmDelete = (customer: Customer) => {
		setCustomerToDelete(customer);
	};

	const handleDelete = () => {
		if (customerToDelete?.id) {
			onDelete(customerToDelete.id);
			setCustomerToDelete(null);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Customers</CardTitle>
				<CardDescription>
					Manage your travel agency customers and their information.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{customers.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No customers found. Add a new customer to get started.
								</TableCell>
							</TableRow>
						) : (
							customers.map((customer) => (
								<TableRow key={customer.id}>
									<TableCell className="font-medium">
										{customer.name}
									</TableCell>
									<TableCell>{customer.email}</TableCell>
									<TableCell>{customer.phone}</TableCell>
									<TableCell>
										<Badge
											variant={
												customer.status === "active"
													? "default"
													: "secondary"
											}
										>
											{customer.status}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">
														Open menu
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => onSelect(customer)}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														confirmDelete(customer)
													}
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

				<AlertDialog
					open={!!customerToDelete}
					onOpenChange={(open) => !open && setCustomerToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete the customer and cancel all
								their associated itineraries. This action cannot be
								undone.
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
