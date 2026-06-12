import DataTableFooter from "@/components/data-table-footer";
import { PermissionGuard } from "@/components/permission-guard";
import StatusBadge from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
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
    MoreHorizontal,
    Network,
    Search,
    UserPlus,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActivateDialog } from "./_components/activate-modal";
import { DeactivateDialog } from "./_components/deactivate-dialog";
import { EmployeeModal } from "./_components/employee-modal";

export function EmployeesPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [employees, setEmployees] = useState<IEmployee[]>([]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [modalState, setModalState] = useState<{ open: boolean; mode: "add" | "edit" | "view" }>({
        open: false,
        mode: "add",
    });
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
        null,
    );
    const [activateEmployee, setActivateEmployee] = useState<IEmployee | null>(
        null,
    );

    const [currentTab, setCurrentTab] = useState<"active" | "archived">("active");
    const [isLoading, setIsLoading] = useState(true);

    const getEmployees = async (showArchived = false) => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get<IEmployee[]>(`/employee?archived=${showArchived}`);
            setEmployees(res.data);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load updates");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useLayoutEffect(() => {
        getEmployees(currentTab === "archived");
    }, [currentTab]);

    const [selectedEmployeeIdFromUrl, setSelectedEmployeeIdFromUrl] = useState<string | null>(null);

    // Handle URL parameters for selected employee
    useLayoutEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const employeeId = searchParams.get("selected");
        if (employeeId) {
            const foundEmployee = employees.find((e) => e.id === employeeId);
            if (foundEmployee) {
                setSelectedEmployee(foundEmployee);
                if (selectedEmployeeIdFromUrl !== employeeId) {
                    setModalState({ open: true, mode: "view" });
                    setSelectedEmployeeIdFromUrl(employeeId);
                }
            }
        } else {
            if (selectedEmployeeIdFromUrl) {
                setModalState((prev) => prev.open ? { ...prev, open: false } : prev);
                setSelectedEmployee(null);
                setSelectedEmployeeIdFromUrl(null);
            }
        }
    }, [location.search, employees, selectedEmployeeIdFromUrl]);

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
                                src={(() => {
                                    if (row.original.profilePhoto)
                                        return row.original.profilePhoto;
                                    return "/placeholder.svg";
                                })()}
                                alt={employee.name}
                                className="object-cover w-full h-full"
                            />
                            <AvatarFallback>
                                {employee.name.charAt(0)}
                            </AvatarFallback>
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
            accessorKey: "permissionSets",
            header: "Permission Sets",
            cell: ({ row }) => {
                const employee = row.original;

                // Permission sets may not be loaded in the initial employee list
                // They can be viewed in the employee detail dialog
                const permissionSets = employee.permissionSets ?? [];
                const permissionSetCount = permissionSets.length;

                if (permissionSetCount === 0) {
                    return <span className="text-sm text-muted-foreground">—</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {permissionSets.slice(0, 2).map((set) => (
                            <Badge key={set.id} variant="secondary" className="text-xs">
                                {set.name}
                            </Badge>
                        ))}
                        {permissionSetCount > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{permissionSetCount - 2}
                            </Badge>
                        )}
                    </div>
                );
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
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewEmployee(employee);
                                }}
                            >
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEmployee(employee);
                                }}
                            >
                                Edit details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {employee.isArchived ? (
                                <DropdownMenuItem
                                    className="text-blue-600"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await handleUnarchiveEmployee(employee);
                                    }}
                                >
                                    Unarchive
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    {(employee.status === "inactive" || employee.status === "pending_activation") && (
                                        <DropdownMenuItem
                                            className="text-blue-600"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleResendInvite(employee);
                                            }}
                                        >
                                            {employee.status === "pending_activation" ? "Resend Invite" : "Send Invite"}
                                        </DropdownMenuItem>
                                    )}
                                    {employee.status === "terminated" && (
                                        <DropdownMenuItem
                                            className="text-green-600"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleReactivateEmployee(employee);
                                            }}
                                        >
                                            Reactivate
                                        </DropdownMenuItem>
                                    )}
                                    {employee.status !== "terminated" && (
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeactivateEmployee(employee);
                                            }}
                                        >
                                            Terminate
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="text-amber-600"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleArchiveEmployee(employee);
                                        }}
                                    >
                                        Archive
                                    </DropdownMenuItem>
                                </>
                            )}
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

    const handleResendInvite = async (employee: IEmployee) => {
        try {
            await axiosInstance.post(`/employee/${employee.id}/activateUser`, {});
            if (employee.status === "pending_activation") {
                toast.success("Invite resent successfully");
            } else {
                toast.success("Activation invite sent successfully");
            }
            getEmployees(currentTab === "archived");
        } catch (error) {
            toast.error("Failed to send invite");
        }
    };

    const handleReactivateEmployee = async (employee: IEmployee) => {
        try {
            await axiosInstance.patch(`/employee/${employee.id}/reactivate`, {});
            toast.success("Employee reactivated successfully");
            getEmployees(currentTab === "archived");
        } catch (error) {
            toast.error("Failed to reactivate employee");
        }
    };

    const handleArchiveEmployee = async (employee: IEmployee) => {
        try {
            await axiosInstance.patch(`/employee/${employee.id}/archive`, {});
            toast.success("Employee archived successfully");
            getEmployees(currentTab === "archived");
        } catch (error) {
            toast.error("Failed to archive employee");
        }
    };

    const handleUnarchiveEmployee = async (employee: IEmployee) => {
        try {
            await axiosInstance.patch(`/employee/${employee.id}/unarchive`, {});
            toast.success("Employee unarchived successfully");
            getEmployees(currentTab === "archived");
        } catch (error) {
            toast.error("Failed to unarchive employee");
        }
    };

    // Handle deactivating an employee
    const handleDeactivate = (terminatedEmployee: IEmployee) => {
        setEmployees((prev) =>
            prev.map((employee) =>
                employee.id === terminatedEmployee.id
                    ? { ...employee, ...terminatedEmployee }
                    : employee,
            ),
        );
        getEmployees(currentTab === "archived");
    };

    // Handle employee row click
    const handleEmployeeClick = (employee: IEmployee) => {
        navigate(`?selected=${employee.id}`);
    };

    // Handle viewing an employee
    const handleViewEmployee = (employee: IEmployee) => {
        navigate(`?selected=${employee.id}`);
    };

    // Handle editing an employee
    const handleEditEmployee = (employee: IEmployee) => {
        setSelectedEmployee(employee);
        setModalState({ open: true, mode: "edit" });
    };

    // Handle deactivating an employee
    const handleDeactivateEmployee = (employee: IEmployee) => {
        setSelectedEmployee(employee);
        setIsDeactivateDialogOpen(true);
    };

    // Handle activating an employee
    const handleActivateEmployee = async (activatedEmployee: IEmployee) => {
        try {
            await axiosInstance.post<object, IEmployee>(
                `/employee/${activatedEmployee.id}/activateUser`,
                {},
            );
            toast.success("Activation invite sent successfully");
            getEmployees(currentTab === "archived");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load updates");
            }
        }
    };

    return (
        <div className="space-y-4 px-6 py-5">
            <div className="flex justify-between items-center border-b pb-2">
                <Tabs value={currentTab} onValueChange={(val) => setCurrentTab(val as any)}>
                    <TabsList>
                        <TabsTrigger value="active">Active Employees</TabsTrigger>
                        <TabsTrigger value="archived">Archived Employees</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        value={
                            (table
                                .getColumn("name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("name")
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/employees/hierarchy")}
                        >
                            <Network className="mr-2 h-4 w-4" />
                            Team Hierarchy
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <PermissionGuard resource="employee" action="create">
                            <Button
                                size="sm"
                                onClick={() => setModalState({ open: true, mode: "add" })}
                                className="cursor-pointer"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </PermissionGuard>
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
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
                                            <Skeleton className="h-8 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer"
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    onClick={() =>
                                        handleEmployeeClick(row.original)
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
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

            <EmployeeModal
                mode={modalState.mode}
                open={modalState.open}
                onOpenChange={(open) => {
                    setModalState((prev) => ({ ...prev, open }));
                    if (!open) {
                        setSelectedEmployee(null);
                        navigate("?");
                    }
                }}
                employee={selectedEmployee}
                employees={employees}
                onSuccess={(_, action) => {
                    getEmployees(currentTab === "archived");
                    if (action === "add") {
                        table.setPageIndex(0);
                        table.resetColumnFilters();
                    }
                }}
                onEdit={(employee) => handleEditEmployee(employee)}
                onResendInvite={handleResendInvite}
                onReactivate={handleReactivateEmployee}
                onArchive={handleArchiveEmployee}
                onUnarchive={handleUnarchiveEmployee}
                onTerminate={handleDeactivateEmployee}
            />

            {selectedEmployee && (
                <DeactivateDialog
                    open={isDeactivateDialogOpen}
                    onOpenChange={(open) => {
                        setIsDeactivateDialogOpen(open);
                        if (!open) {
                            setSelectedEmployee(null);
                            navigate("?");
                        }
                    }}
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
