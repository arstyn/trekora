import DataTableFooter from "@/components/data-table-footer";
import StatusBadge from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AxiosRequest } from "@/lib/axios";
import type { IDepartment } from "@/types/department.type";
import type { IEmployee } from "@/types/employee.types";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDown,
	ChevronUp,
	Download,
	Filter,
	MoreHorizontal,
	Search,
	UserPlus,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { ActivateDialog } from "./_component/activate-modal";
import { AddEmployeeModal } from "./_component/add-employee-modal";
import { DeactivateDialog } from "./_component/deactivate-dialog";
import { EditEmployeeDialog } from "./_component/edit-employee-dialog";
import { ViewEmployeeDialog } from "./_component/view-employee-dialog";
import type { IRole } from "@/types/role.types";

export function TeamsPage() {
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [departments, setDepartments] = useState<IDepartment[]>([]);
	const [roles, setRoles] = useState<IRole[]>([]);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
	const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
	const [activateEmployee, setActivateEmployee] = useState<IEmployee | null>(null);

	const getEmployees = async () => {
		try {
			const employeesData = await AxiosRequest.get<IEmployee[]>("/employee");
			setEmployees(employeesData);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};
	const getDepartments = async () => {
		try {
			const departmentsData = await AxiosRequest.get<IDepartment[]>("/department");
			setDepartments(departmentsData);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};
	const getRoles = async () => {
		try {
			const rolesData = await AxiosRequest.get<IRole[]>("/role");
			setRoles(rolesData);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};

	useLayoutEffect(() => {
		getEmployees();
		getDepartments();
		getRoles();
	}, []);

	// Define the columns for the table
	const columns: ColumnDef<IEmployee>[] = [
		{
			accessorKey: "name",
			header: "Team",
			cell: ({ row }) => {
				const employee = row.original;
				return (
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarImage
								src={employee.avatar || "/placeholder.svg"}
								alt={employee.name}
							/>
							<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{employee.name}</div>
							<div className="text-sm text-muted-foreground">
								{employee.email}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "employeeDepartments",
			header: ({ column }) => {
				return (
					<div
						className="flex items-center cursor-pointer"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Department
						{column.getIsSorted() === "asc" ? (
							<ChevronUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ChevronDown className="ml-2 h-4 w-4" />
						) : null}
					</div>
				);
			},
			cell: ({ row }) => {
				const employee = row.original;
				// If employee.role is an object, display its name property
				if (
					employee.employeeDepartments &&
					Array.isArray(employee.employeeDepartments) &&
					employee.employeeDepartments.length > 0
				) {
					return (
						<span className="capitalize">
							{employee.employeeDepartments
								.map((ed) => ed.department.name)
								.join(", ") || ""}
						</span>
					);
				}
			},
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const employee = row.original;
				// If employee.role is an object, display its name property
				if (
					employee.role &&
					typeof employee.role === "object" &&
					"name" in employee.role
				) {
					return <span className="capitalize">{employee.role.name || ""}</span>;
				}
				// Fallback: display as string
				return <span className="capitalize">{employee.role || ""}</span>;
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <StatusBadge status={row.original.status} />,
		},
		{
			accessorKey: "hire_date",
			header: ({ column }) => {
				return (
					<div
						className="flex items-center cursor-pointer"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Join Date
						{column.getIsSorted() === "asc" ? (
							<ChevronUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<ChevronDown className="ml-2 h-4 w-4" />
						) : null}
					</div>
				);
			},
			cell: ({ row }) => {
				const date = row.original.joinDate
					? new Date(row.original.joinDate)
					: null;

				if (!date) {
					return <div></div>;
				}
				return <div>{date.toLocaleDateString()}</div>;
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const employee = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => handleViewEmployee(employee)}
							>
								View details
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleEditEmployee(employee)}
							>
								Edit details
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-green-600"
								onClick={() => {
									setActivateEmployee(employee);
									setIsActivateDialogOpen(true);
								}}
							>
								Activate
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => handleDeactivateEmployee(employee)}
								disabled={employee.status === "terminated"}
							>
								Terminate
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: employees,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	// Handle department filter change
	const handleDepartmentChange = (value: string) => {
		setDepartmentFilter(value);
		if (value === "all") {
			table.getColumn("department")?.setFilterValue("");
		} else {
			table.getColumn("department")?.setFilterValue(value);
		}
	};

	// Handle deactivating an employee
	const handleDeactivate = (terminatedEmployee: IEmployee) => {
		setEmployees((prev) =>
			prev.map((employee) =>
				employee.id === terminatedEmployee.id
					? { ...employee, ...terminatedEmployee }
					: employee
			)
		);
	};

	// Handle viewing an employee
	const handleViewEmployee = (employee: IEmployee) => {
		setSelectedEmployee(employee);
		setIsViewDialogOpen(true);
	};

	// Handle editing an employee
	const handleEditEmployee = (employee: IEmployee) => {
		setSelectedEmployee(employee);
		setIsEditDialogOpen(true);
	};

	// Handle deactivating an employee
	const handleDeactivateEmployee = (employee: IEmployee) => {
		setSelectedEmployee(employee);
		setIsDeactivateDialogOpen(true);
	};

	// Handle activating an employee
	const handleActivateEmployee = async (activatedEmployee: IEmployee) => {
		try {
			const employee = await AxiosRequest.post<object, IEmployee>(
				`/employee/${activatedEmployee.id}/activateUser`,
				{}
			);
			setEmployees((prev) =>
				prev.map((emp) =>
					emp.id === employee.id ? { ...emp, ...employee } : emp
				)
			);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};

	// Handle updating an employee
	const handleUpdateEmployee = (id: string, updatedEmployee: Partial<IEmployee>) => {
		setEmployees((prev) =>
			prev.map((employee) =>
				employee.id === id ? { ...employee, ...updatedEmployee } : employee
			)
		);
	};

	return (
		<div className="space-y-4 px-6 py-5">
			<div className="flex flex-col sm:flex-row justify-between gap-4">
				<div className="flex w-full sm:w-auto items-center gap-2">
					<Search className="h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search employees..."
						value={
							(table.getColumn("name")?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table.getColumn("name")?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select
							value={departmentFilter}
							onValueChange={handleDepartmentChange}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Department" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Departments</SelectItem>
								{departments.map((department, index) => (
									<SelectItem key={index} value={department.name}>
										{department.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							<Download className="mr-2 h-4 w-4" />
							Export
						</Button>
						<Button
							size="sm"
							onClick={() => setIsAddModalOpen(true)}
							className="cursor-pointer"
						>
							<UserPlus className="mr-2 h-4 w-4" />
							Add Employee
						</Button>
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<DataTableFooter table={table} />

			<AddEmployeeModal
				table={table}
				open={isAddModalOpen}
				onOpenChange={setIsAddModalOpen}
				employees={employees}
				setEmployees={setEmployees}
				departments={departments}
				roles={roles}
			/>

			{selectedEmployee && (
				<ViewEmployeeDialog
					open={isViewDialogOpen}
					onOpenChange={(open) => {
						setIsViewDialogOpen(open);
						setSelectedEmployee(null);
					}}
					employee={selectedEmployee}
					onEdit={(employee) => handleEditEmployee(employee)}
				/>
			)}

			{selectedEmployee && (
				<EditEmployeeDialog
					open={isEditDialogOpen}
					onOpenChange={(open) => {
						setIsEditDialogOpen(open);
						setSelectedEmployee(null);
					}}
					employee={selectedEmployee}
					onUpdateEmployee={handleUpdateEmployee}
					departments={departments}
					roles={roles}
				/>
			)}

			{selectedEmployee && (
				<DeactivateDialog
					open={isDeactivateDialogOpen}
					onOpenChange={setIsDeactivateDialogOpen}
					employee={selectedEmployee}
					onDeactivate={handleDeactivate}
				/>
			)}

			<ActivateDialog
				open={isActivateDialogOpen}
				onOpenChange={(open) => {
					setIsActivateDialogOpen(open);
					if (!open) setActivateEmployee(null);
				}}
				employee={activateEmployee}
				onActivate={async (employee) => {
					await handleActivateEmployee(employee);
					setIsActivateDialogOpen(false);
					setActivateEmployee(null);
				}}
			/>
		</div>
	);
}
