import DataTableFooter from "@/components/data-table-footer";
import NAText from "@/components/na-text";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { IBranch } from "@/types/branch.type";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface BranchTableProps {
	branches: IBranch[];
	onBranchClick: (lead: IBranch) => void;
}

export function BranchTable({ branches, onBranchClick }: BranchTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<IBranch>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => row.original.location || <NAText />,
		},
		{
			accessorKey: "isActive",
			header: "Is Active",
			cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => formatDate(row.original.createdAt),
		},
	];

	const table = useReactTable({
		data: branches,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

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
									onClick={() => onBranchClick(row.original)}
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
									No branches found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTableFooter table={table} />
		</div>
	);
}
