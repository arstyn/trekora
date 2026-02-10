import DataTableFooter from "@/components/data-table-footer";
import NAText from "@/components/na-text";
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
import type { ICustomer } from "@/types/customer.type";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";

interface CustomerListProps {
	customers: ICustomer[];
	onDelete: (customerId: string) => void;
	onCustomerClick: (customer: ICustomer) => void;
}

export default function CustomerList({
	customers,
	onDelete,
	onCustomerClick,
}: CustomerListProps) {
	const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(null);
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<ICustomer>[] = [
		{
			accessorKey: "firstName",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<img
						src={(() => {
							if (row.original.profilePhoto) {
								return getFileUrl(
									getServeFileUrl(row.original.profilePhoto)
								);
							}
							return "/placeholder.svg";
						})()}
						alt="Profile"
						className="w-8 h-8 rounded-full object-cover"
					/>

					<span className="font-medium">
						{row.original.firstName} {row.original.lastName}
					</span>
				</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => row.original.email || <NAText />,
		},
		{
			accessorKey: "phone",
			header: "Phone",
			cell: ({ row }) => row.original.phone || <NAText />,
		},
		{
			accessorKey: "passportNumber",
			header: "Passport",
			cell: ({ row }) => row.original.passportNumber || <NAText />,
		},
		{
			accessorKey: "gender",
			header: "Gender",
			cell: ({ row }) => (
				<Badge variant="outline" className="capitalize">
					{row.original.gender?.replace("_", " ")}
				</Badge>
			),
		},
		{
			accessorKey: "createdBy",
			header: "Created By",
			cell: ({ row }) => {
				const createdBy = row.original.createdBy;
				return createdBy ? (
					<span className="text-sm text-muted-foreground">
						{createdBy.name || createdBy.email || "Unknown"}
					</span>
				) : (
					<NAText />
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const customer = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setCustomerToDelete(customer);
								}}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: customers,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	const handleDelete = () => {
		if (customerToDelete?.id) {
			onDelete(customerToDelete.id);
			setCustomerToDelete(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="overflow-x-auto rounded-lg border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									onClick={() => onCustomerClick(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No customers found. Add a new customer to get started.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTableFooter table={table} />

			<AlertDialog
				open={!!customerToDelete}
				onOpenChange={(open) => !open && setCustomerToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the customer and cancel all their
							associated itineraries. This action cannot be undone.
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
		</div>
	);
}
