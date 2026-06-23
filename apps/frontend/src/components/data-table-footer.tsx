import { type Table } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface DataTableFooterProps<TYPE> {
	table?: Table<TYPE>;
	page?: number;
	limit?: number;
	total?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	onLimitChange?: (limit: number) => void;
	entityName?: string;
}

export default function DataTableFooter<TYPE>({
	table,
	page,
	limit,
	total,
	totalPages,
	onPageChange,
	onLimitChange,
	entityName = "results",
}: DataTableFooterProps<TYPE>) {
	const isManual = !table;

	const currentPage = isManual ? (page ?? 1) : (table.getState().pagination.pageIndex + 1);
	const pageSize = isManual ? (limit ?? 10) : table.getState().pagination.pageSize;
	const totalItems = isManual ? (total ?? 0) : table.getFilteredRowModel().rows.length;
	const totalPagesCount = isManual ? (totalPages ?? 0) : table.getPageCount();

	const isSelectedRowModelNotEmpty = table && table.getFilteredSelectedRowModel().rows.length !== 0;

	const canPrevious = isManual ? (currentPage > 1) : table.getCanPreviousPage();
	const canNext = isManual ? (currentPage < totalPagesCount) : table.getCanNextPage();

	const handleFirstPage = () => {
		if (isManual) {
			onPageChange?.(1);
		} else {
			table.setPageIndex(0);
		}
	};

	const handlePreviousPage = () => {
		if (isManual) {
			onPageChange?.(currentPage - 1);
		} else {
			table.previousPage();
		}
	};

	const handleNextPage = () => {
		if (isManual) {
			onPageChange?.(currentPage + 1);
		} else {
			table.nextPage();
		}
	};

	const handleLastPage = () => {
		if (isManual) {
			onPageChange?.(totalPagesCount);
		} else {
			table.setPageIndex(totalPagesCount - 1);
		}
	};

	const handlePageSizeChange = (val: string) => {
		const newSize = Number(val);
		if (isManual) {
			onLimitChange?.(newSize);
		} else {
			table.setPageSize(newSize);
		}
	};

	return (
		<div className="flex items-center justify-between px-4 py-4">
			<div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
				{isSelectedRowModelNotEmpty
					? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
					: totalItems > 0
					? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} ${entityName}`
					: `No ${entityName} found`}
			</div>
			<div className="flex w-full items-center gap-8 lg:w-fit">
				<div className="hidden items-center gap-2 lg:flex">
					<Label htmlFor="rows-per-page" className="text-sm font-medium">
						Rows per page
					</Label>
					<Select
						value={`${pageSize}`}
						onValueChange={handlePageSizeChange}
					>
						<SelectTrigger className="w-20" id="rows-per-page">
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-fit items-center justify-center text-sm font-medium">
					Page {currentPage} of {totalPagesCount}
				</div>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={handleFirstPage}
						disabled={!canPrevious}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeftIcon />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={handlePreviousPage}
						disabled={!canPrevious}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={handleNextPage}
						disabled={!canNext}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon />
					</Button>
					<Button
						variant="outline"
						className="hidden size-8 lg:flex"
						size="icon"
						onClick={handleLastPage}
						disabled={!canNext}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRightIcon />
					</Button>
				</div>
			</div>
		</div>
	);
}
