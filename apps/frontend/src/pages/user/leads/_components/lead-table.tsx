import DataTableFooter from "@/components/data-table-footer";
import NAText from "@/components/na-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { ILead, ILeadStatus } from "@/types/lead/lead.entity";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Users, Building, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LeadStatusBadge } from "./lead-status-badge";

interface LeadTableProps {
	leads: ILead[];
	isLoading?: boolean;
	onStatusChange: (leadId: string, status: ILeadStatus) => void;
	onLeadClick: (lead: ILead) => void;
}

export function LeadTable({ leads, isLoading, onStatusChange, onLeadClick }: LeadTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<ILead>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				const name = row.original.name;
				const company = row.original.company;
				const leadId = row.original.id;
				const isCompany = row.original.leadType === "company" || (row.original.leadType !== "individual" && !!row.original.company);
				return (
					<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
						{isCompany ? (
							<Building className="h-4 w-4 text-purple-500 mr-0.5 shrink-0" />
						) : (
							<User className="h-4 w-4 text-blue-500 mr-0.5 shrink-0" />
						)}
						{name ? (
							<Link
								to={`/leads/${leadId}`}
								className="font-medium text-primary hover:underline"
							>
								{name}
							</Link>
						) : null}
						{company ? (
							name ? (
								<Badge variant="outline" className="text-xs bg-muted/50 font-normal">
									{company}
								</Badge>
							) : (
								<Link
									to={`/leads/${leadId}`}
									className="hover:underline"
								>
									<Badge variant="outline" className="text-xs bg-muted/50 font-normal text-primary border-primary/30">
										{company}
									</Badge>
								</Link>
							)
						) : null}
					</div>
				);
			},
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
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => formatDate(row.original.createdAt),
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
				const lead = row.original;
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
									onStatusChange(lead.id, "new");
								}}
							>
								Mark as New
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onStatusChange(lead.id, "contacted");
								}}
							>
								Mark as Contacted
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onStatusChange(lead.id, "qualified");
								}}
							>
								Mark as Qualified
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onStatusChange(lead.id, "lost");
								}}
							>
								Mark as Lost
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onStatusChange(lead.id, "converted");
								}}
							>
								Mark as Converted
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: leads,
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
						{isLoading ? (
							Array.from({ length: 5 }).map((_, index) => (
								<TableRow key={`skeleton-${index}`}>
									{columns.map((_, i) => (
										<TableCell key={`skeleton-cell-${index}-${i}`}>
											<Skeleton className="h-6 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									onClick={() => onLeadClick(row.original)}
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
									className="h-64 text-center"
								>
									<div className="flex flex-col items-center justify-center py-12">
										<div className="text-center">
											<div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
												<Users className="h-10 w-10 text-primary" />
											</div>
											<h3 className="text-xl font-semibold text-primary mb-2">
												No leads found
											</h3>
											<p className="text-muted-foreground max-w-sm mx-auto">
												Get started by adding a new lead.
											</p>
										</div>
									</div>
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
