import DataTableFooter from "@/components/data-table-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";
import { LeaveService } from "@/services/leave.service";
import type { IEmployee } from "@/types/employee.types";
import type {
    IEmployeeLeave,
    ILeaveBalanceSummary,
    LeaveStatus,
} from "@/types/leave.types";
import { format } from "date-fns";
import {
    Calendar,
    CalendarPlus,
    CheckCircle2,
    Clock,
    Eye,
    Search,
    Trash2,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApplyLeaveModal } from "./_components/apply-leave-modal";
import { ReviewLeaveDialog } from "./_components/review-leave-dialog";

const LEAVE_TYPE_LABELS: Record<string, string> = {
    casual: "Casual Leave (CL)",
    sick: "Sick Leave (SL)",
    paid: "Paid / Earned (PL)",
    unpaid: "Loss of Pay (LOP)",
};

const getStatusBadgeClass = (status: LeaveStatus) => {
    switch (status) {
        case "approved":
            return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
        case "rejected":
        case "cancelled":
            return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
        default:
            return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    }
};

export default function LeavesPage() {
    const navigate = useNavigate();
    const { hasPermission: canReadAllLeaves } = useHasPermission(
        "leave",
        "read"
    );
    const { hasPermission: canApproveLeaves } = useHasPermission(
        "leave",
        "approve"
    );
    const { hasPermission: canCreateLeave } = useHasPermission(
        "leave",
        "create"
    );

    const isManagerOrFinance = canReadAllLeaves || canApproveLeaves;

    const [activeTab, setActiveTab] = useState<string>("my");
    const [loadingMy, setLoadingMy] = useState<boolean>(true);
    const [loadingAll, setLoadingAll] = useState<boolean>(false);

    // My Leaves state
    const [myLeaves, setMyLeaves] = useState<IEmployeeLeave[]>([]);
    const [myBalance, setMyBalance] = useState<ILeaveBalanceSummary | null>(
        null
    );

    // Organization-wide leaves state
    const [allLeaves, setAllLeaves] = useState<IEmployeeLeave[]>([]);
    const [orgSummary, setOrgSummary] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [employees, setEmployees] = useState<IEmployee[]>([]);

    // Modals
    const [applyOpen, setApplyOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<{
        leave: IEmployeeLeave | null;
        action: "approved" | "rejected" | null;
    }>({ leave: null, action: null });

    useEffect(() => {
        if (isManagerOrFinance) {
            setActiveTab("all");
        }
    }, [isManagerOrFinance]);

    const fetchMyLeaves = useCallback(async () => {
        setLoadingMy(true);
        try {
            const res = await LeaveService.getMyLeaves();
            setMyLeaves(res.leaves || []);
            setMyBalance(res.balance || null);
        } catch (err) {
            console.error("Failed to fetch my leaves:", err);
        } finally {
            setLoadingMy(false);
        }
    }, []);

    const fetchAllLeaves = useCallback(async () => {
        if (!isManagerOrFinance) return;
        setLoadingAll(true);
        try {
            const res = await LeaveService.getAllLeaves({
                page,
                limit,
                status: statusFilter,
                leaveType: typeFilter,
                search: search.trim() || undefined,
            });
            setAllLeaves(res.data || []);
            setOrgSummary(
                res.summary || {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                }
            );
            setTotal(res.pagination?.total || 0);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch all leaves:", err);
        } finally {
            setLoadingAll(false);
        }
    }, [isManagerOrFinance, page, limit, statusFilter, typeFilter, search]);

    useEffect(() => {
        fetchMyLeaves();
    }, [fetchMyLeaves]);

    useEffect(() => {
        if (isManagerOrFinance) {
            fetchAllLeaves();
            axiosInstance
                .get<IEmployee[]>("/employee")
                .then((r) => setEmployees(r.data || []))
                .catch(() => {});
        }
    }, [isManagerOrFinance, fetchAllLeaves]);

    const handleDeleteLeave = async (leave: IEmployeeLeave) => {
        try {
            await LeaveService.deleteLeave(leave.id);
            toast.success("Leave request deleted");
            fetchMyLeaves();
            fetchAllLeaves();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to delete leave request"
            );
        }
    };

    const refreshAll = () => {
        fetchMyLeaves();
        if (isManagerOrFinance) {
            fetchAllLeaves();
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-primary" />
                        Leave Management
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Track paid and unpaid leaves, annual leave balances, and approval requests.
                    </p>
                </div>
                <Button
                    onClick={() => setApplyOpen(true)}
                    className="gap-2 cursor-pointer"
                >
                    <CalendarPlus className="w-4 h-4" />
                    {isManagerOrFinance
                        ? "Apply / Record Leave"
                        : "Apply for Leave"}
                </Button>
            </div>

            {/* Leave Balance Summary Cards (for current user) */}
            {myBalance && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border border-border/60 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Casual Leave (CL)
                                </p>
                                <p className="text-2xl font-extrabold font-mono mt-1">
                                    {myBalance.balances.casual.remaining}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        / {myBalance.balances.casual.quota} left
                                    </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Used: {myBalance.balances.casual.used} days
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Sick Leave (SL)
                                </p>
                                <p className="text-2xl font-extrabold font-mono mt-1">
                                    {myBalance.balances.sick.remaining}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        / {myBalance.balances.sick.quota} left
                                    </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Used: {myBalance.balances.sick.used} days
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Earned / Paid (PL)
                                </p>
                                <p className="text-2xl font-extrabold font-mono mt-1">
                                    {myBalance.balances.paid.remaining}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        / {myBalance.balances.paid.quota} left
                                    </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Used: {myBalance.balances.paid.used} days
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <Clock className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Unpaid / LOP Taken
                                </p>
                                <p className="text-2xl font-extrabold font-mono mt-1 text-rose-600">
                                    {myBalance.balances.unpaid.used}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        days
                                    </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Deducted in monthly payroll
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
            >
                {isManagerOrFinance && (
                    <TabsList>
                        <TabsTrigger value="all" className="cursor-pointer">
                            All Employee Leaves ({orgSummary.total})
                            {orgSummary.pending > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 bg-amber-100 text-amber-800 font-mono text-[10px]"
                                >
                                    {orgSummary.pending} pending
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="my" className="cursor-pointer">
                            My Leave Requests ({myLeaves.length})
                        </TabsTrigger>
                    </TabsList>
                )}

                {/* ALL EMPLOYEE LEAVES TAB */}
                {isManagerOrFinance && (
                    <TabsContent value="all" className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by employee, leave #, or reason..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) => {
                                        setStatusFilter(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Approved
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Rejected
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={typeFilter}
                                    onValueChange={(v) => {
                                        setTypeFilter(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All Leave Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Leave Types
                                        </SelectItem>
                                        <SelectItem value="casual">
                                            Casual Leave (CL)
                                        </SelectItem>
                                        <SelectItem value="sick">
                                            Sick Leave (SL)
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid / Earned (PL)
                                        </SelectItem>
                                        <SelectItem value="unpaid">
                                            Unpaid / LOP
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Card className="border border-border/60 shadow-xs overflow-hidden">
                            {loadingAll ? (
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : allLeaves.length === 0 ? (
                                <div className="p-12 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold">
                                        No leave records found
                                    </h3>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                        No employee leave requests match your current filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Leave #</TableHead>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Leave Type</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Days</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allLeaves.map((lv) => (
                                                <TableRow key={lv.id}>
                                                    <TableCell className="font-mono text-xs font-semibold">
                                                        {lv.leaveNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-sm">
                                                            {lv.employee
                                                                ?.name || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {lv.employee
                                                                ?.designation ||
                                                                lv.employee
                                                                    ?.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {LEAVE_TYPE_LABELS[
                                                                lv.leaveType
                                                            ] || lv.leaveType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono">
                                                        {format(
                                                            new Date(
                                                                lv.startDate
                                                            ),
                                                            "MMM d, yyyy"
                                                        )}
                                                        {lv.startDate !==
                                                            lv.endDate &&
                                                            ` → ${format(
                                                                new Date(
                                                                    lv.endDate
                                                                ),
                                                                "MMM d, yyyy"
                                                            )}`}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-xs">
                                                        {lv.totalDays}{" "}
                                                        {lv.isHalfDay
                                                            ? "(Half Day)"
                                                            : ""}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                        {lv.reason}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`uppercase text-[10px] font-semibold border ${getStatusBadgeClass(
                                                                lv.status
                                                            )}`}
                                                        >
                                                            {lv.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {canApproveLeaves &&
                                                                lv.status ===
                                                                    "pending" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                                                                            onClick={() =>
                                                                                setReviewTarget(
                                                                                    {
                                                                                        leave: lv,
                                                                                        action: "approved",
                                                                                    }
                                                                                )
                                                                            }
                                                                        >
                                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 px-2 text-rose-700 border-rose-200 hover:bg-rose-50 cursor-pointer"
                                                                            onClick={() =>
                                                                                setReviewTarget(
                                                                                    {
                                                                                        leave: lv,
                                                                                        action: "rejected",
                                                                                    }
                                                                                )
                                                                            }
                                                                        >
                                                                            <XCircle className="w-3.5 h-3.5 mr-1" />
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 px-2 cursor-pointer"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/leaves/${lv.id}`
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="p-4 border-t">
                                        <DataTableFooter
                                            page={page}
                                            limit={limit}
                                            total={total}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                            onLimitChange={(l: number) => {
                                                setLimit(l);
                                                setPage(1);
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </Card>
                    </TabsContent>
                )}

                {/* MY LEAVES TAB */}
                <TabsContent value="my" className="space-y-4">
                    <Card className="border border-border/60 shadow-xs overflow-hidden">
                        {loadingMy ? (
                            <div className="p-6 space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : myLeaves.length === 0 ? (
                            <div className="p-12 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-base font-bold">
                                    No leave requests submitted yet
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    You haven't applied for any leaves yet. Click "Apply for Leave" to submit a new leave request.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setApplyOpen(true)}
                                    className="cursor-pointer"
                                >
                                    <CalendarPlus className="w-4 h-4 mr-1.5" />
                                    Apply for Leave
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Leave #</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLeaves.map((lv) => (
                                        <TableRow key={lv.id}>
                                            <TableCell className="font-mono text-xs font-semibold">
                                                {lv.leaveNumber}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {LEAVE_TYPE_LABELS[
                                                        lv.leaveType
                                                    ] || lv.leaveType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono">
                                                {format(
                                                    new Date(lv.startDate),
                                                    "MMM d, yyyy"
                                                )}
                                                {lv.startDate !== lv.endDate &&
                                                    ` → ${format(
                                                        new Date(lv.endDate),
                                                        "MMM d, yyyy"
                                                    )}`}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-xs">
                                                {lv.totalDays}{" "}
                                                {lv.isHalfDay
                                                    ? "(Half Day)"
                                                    : ""}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                                                {lv.reason}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase text-[10px] font-semibold border ${getStatusBadgeClass(
                                                        lv.status
                                                    )}`}
                                                >
                                                    {lv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 cursor-pointer"
                                                        onClick={() =>
                                                            navigate(
                                                                `/leaves/${lv.id}`
                                                            )
                                                        }
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                    {lv.status ===
                                                        "pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                                                            onClick={() =>
                                                                handleDeleteLeave(
                                                                    lv
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            <ApplyLeaveModal
                open={applyOpen}
                onOpenChange={setApplyOpen}
                onSuccess={refreshAll}
                employees={employees}
                canSelectEmployee={canCreateLeave || isManagerOrFinance}
            />

            <ReviewLeaveDialog
                leave={reviewTarget.leave}
                action={reviewTarget.action}
                open={Boolean(reviewTarget.leave)}
                onOpenChange={(o) => {
                    if (!o) setReviewTarget({ leave: null, action: null });
                }}
                onSuccess={refreshAll}
            />
        </div>
    );
}
