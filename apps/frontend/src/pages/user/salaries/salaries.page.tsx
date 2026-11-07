import DataTableFooter from "@/components/data-table-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    MONTH_NAMES,
    SalarySlipService,
} from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import type { IOrganization } from "@/types/organization.types";
import type {
    IEmployeeSalary,
    IEmployeeSalaryStructure,
    ISalaryListSummary,
    SalaryStatus,
} from "@/types/salary.types";
import { format } from "date-fns";
import {
    Banknote,
    CheckCircle2,
    Eye,
    FileSpreadsheet,
    Loader2,
    Mail,
    Plus,
    Printer,
    Search,
    Send,
    Settings,
    Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DisperseSalaryDialog } from "./_components/disperse-salary-dialog";
import { SalarySlipPreviewModal } from "./_components/salary-slip-preview-modal";

const getSalaryStatusBadge = (status: SalaryStatus) => {
    switch (status) {
        case "paid":
            return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
        case "processed":
            return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
        default:
            return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    }
};

export default function SalariesPage() {
    const navigate = useNavigate();
    const { hasPermission: canReadSalaries } = useHasPermission(
        "salary",
        "read"
    );
    const { hasPermission: canCreateSalary } = useHasPermission(
        "salary",
        "create"
    );
    const { hasPermission: canManageSalary } = useHasPermission(
        "salary",
        "manage"
    );

    const now = new Date();
    const [activeTab, setActiveTab] = useState<string>("my");

    // Admin/Finance Payroll state
    const [salaries, setSalaries] = useState<IEmployeeSalary[]>([]);
    const [summary, setSummary] = useState<ISalaryListSummary>({
        totalRecords: 0,
        totalPayroll: 0,
        totalGross: 0,
        totalIncentives: 0,
        paidCount: 0,
        processedCount: 0,
        draftCount: 0,
        emailSentCount: 0,
    });
    const [loadingAll, setLoadingAll] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<string>(
        String(now.getFullYear())
    );
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    // Employee Self-Service state
    const [mySalaries, setMySalaries] = useState<IEmployeeSalary[]>([]);
    const [myStructure, setMyStructure] =
        useState<IEmployeeSalaryStructure | null>(null);
    const [orgData, setOrgData] = useState<IOrganization | null>(null);
    const [loadingMy, setLoadingMy] = useState(true);

    // Modals & Email states
    const [previewSalary, setPreviewSalary] = useState<IEmployeeSalary | null>(
        null
    );
    const [disperseOpen, setDisperseOpen] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    useEffect(() => {
        if (canReadSalaries) {
            setActiveTab("payroll");
        }
    }, [canReadSalaries]);

    const fetchMySalaries = useCallback(async () => {
        setLoadingMy(true);
        try {
            const res = await SalaryService.getMySalaries();
            setMySalaries(res.salaries || []);
            setMyStructure(res.structure || null);
            setOrgData(res.organization || null);
        } catch (err) {
            console.error("Failed to load my salaries:", err);
        } finally {
            setLoadingMy(false);
        }
    }, []);

    const fetchAllSalaries = useCallback(async () => {
        if (!canReadSalaries) return;
        setLoadingAll(true);
        try {
            const res = await SalaryService.getAllSalaries({
                page,
                limit,
                month:
                    selectedMonth !== "all" ? Number(selectedMonth) : undefined,
                year: selectedYear !== "all" ? Number(selectedYear) : undefined,
                status: statusFilter,
                search: search.trim() || undefined,
            });
            setSalaries(res.data || []);
            setSummary(res.summary);
            setTotal(res.pagination?.total || 0);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Failed to load salaries:", err);
        } finally {
            setLoadingAll(false);
        }
    }, [
        canReadSalaries,
        page,
        limit,
        selectedMonth,
        selectedYear,
        statusFilter,
        search,
    ]);

    useEffect(() => {
        fetchMySalaries();
    }, [fetchMySalaries]);

    useEffect(() => {
        if (canReadSalaries) {
            fetchAllSalaries();
        }
    }, [canReadSalaries, fetchAllSalaries]);

    const handleSendSingleEmail = async (sal: IEmployeeSalary) => {
        setSendingEmailId(sal.id);
        try {
            await SalaryService.sendSalarySlipEmail(sal.id);
            toast.success(
                `Salary slip email sent to ${sal.employee?.name} (${sal.employee?.email})`
            );
            fetchAllSalaries();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to send salary slip email"
            );
        } finally {
            setSendingEmailId(null);
        }
    };

    const fmt = (val: any) => SalarySlipService.formatCurrency(val);
    const disperseMonth =
        selectedMonth !== "all" ? Number(selectedMonth) : now.getMonth() + 1;
    const disperseYear =
        selectedYear !== "all" ? Number(selectedYear) : now.getFullYear();

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Banknote className="w-7 h-7 text-primary" />
                        Salary & Payroll Management
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Indian payroll structure, additional incentives, working days & leave deductions, PDF payslips, and salary dispersion emails.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {canManageSalary && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    navigate("/settings/salary-slip")
                                }
                                className="gap-1.5 cursor-pointer"
                            >
                                <Settings className="w-4 h-4" />
                                Salary Slip Layout
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDisperseOpen(true)}
                                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                Disperse Salary Emails
                            </Button>
                        </>
                    )}
                    {canCreateSalary && (
                        <Button
                            size="sm"
                            onClick={() => navigate("/salaries/create")}
                            className="gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Generate Salary Slip
                        </Button>
                    )}
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-5"
            >
                {canReadSalaries && (
                    <TabsList>
                        <TabsTrigger value="payroll" className="cursor-pointer">
                            Organization Payroll ({summary.totalRecords})
                        </TabsTrigger>
                        <TabsTrigger value="my" className="cursor-pointer">
                            My Salary & Payslips ({mySalaries.length})
                        </TabsTrigger>
                    </TabsList>
                )}

                {/* ADMIN / FINANCE PAYROLL TAB */}
                {canReadSalaries && (
                    <TabsContent value="payroll" className="space-y-5">
                        {/* 4 KPI Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border border-border/60 shadow-2xs">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                                            Total Net Payroll
                                        </p>
                                        <p className="text-2xl font-extrabold font-mono mt-1 text-primary">
                                            {fmt(summary.totalPayroll)}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Gross: {fmt(summary.totalGross)}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-border/60 shadow-2xs">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                                            Additional Incentives
                                        </p>
                                        <p className="text-2xl font-extrabold font-mono mt-1 text-emerald-600">
                                            {fmt(summary.totalIncentives)}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Bonus & performance incentives
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-border/60 shadow-2xs">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                                            Paid / Processed Slips
                                        </p>
                                        <p className="text-2xl font-extrabold font-mono mt-1">
                                            {summary.paidCount} Paid{" "}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                • {summary.processedCount}{" "}
                                                Processed
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Drafts: {summary.draftCount}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-border/60 shadow-2xs">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                                            Salary Slips Emailed
                                        </p>
                                        <p className="text-2xl font-extrabold font-mono mt-1">
                                            {summary.emailSentCount}{" "}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                / {summary.totalRecords} sent
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Manual dispersion trigger
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by employee or slip #..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <Select
                                    value={selectedMonth}
                                    onValueChange={(v) => {
                                        setSelectedMonth(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Months" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Months
                                        </SelectItem>
                                        {MONTH_NAMES.map((m, idx) => (
                                            <SelectItem
                                                key={m}
                                                value={String(idx + 1)}
                                            >
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedYear}
                                    onValueChange={(v) => {
                                        setSelectedYear(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Years
                                        </SelectItem>
                                        {[
                                            now.getFullYear() - 1,
                                            now.getFullYear(),
                                            now.getFullYear() + 1,
                                        ].map((yr) => (
                                            <SelectItem
                                                key={yr}
                                                value={String(yr)}
                                            >
                                                {yr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) => {
                                        setStatusFilter(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="processed">
                                            Processed
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Payroll Table */}
                        <Card className="border border-border/60 shadow-xs overflow-hidden">
                            {loadingAll ? (
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : salaries.length === 0 ? (
                                <div className="p-12 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold">
                                        No salary slips generated yet
                                    </h3>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                        Generate monthly salary slips for your employees with Indian statutory components, leave deductions, and additional incentives.
                                    </p>
                                    {canCreateSalary && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                navigate("/salaries/create")
                                            }
                                            className="cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4 mr-1.5" />
                                            Generate First Salary Slip
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Slip #</TableHead>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>
                                                    Days (Payable / LOP)
                                                </TableHead>
                                                <TableHead>
                                                    Gross / Incentive
                                                </TableHead>
                                                <TableHead>
                                                    Deductions
                                                </TableHead>
                                                <TableHead>
                                                    Net Payable
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Mail Sent</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {salaries.map((sal) => (
                                                <TableRow key={sal.id}>
                                                    <TableCell className="font-mono text-xs font-semibold">
                                                        {sal.slipNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-sm">
                                                            {sal.employee
                                                                ?.name || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {sal.employee
                                                                ?.designation ||
                                                                sal.employee
                                                                    ?.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold">
                                                        {
                                                            MONTH_NAMES[
                                                                (sal.month ||
                                                                    1) - 1
                                                            ]
                                                        }{" "}
                                                        {sal.year}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono">
                                                        <span>
                                                            {sal.payableDays}/
                                                            {
                                                                sal.totalWorkingDays
                                                            }{" "}
                                                            days
                                                        </span>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            PL: {sal.paidLeaves}{" "}
                                                            • LOP:{" "}
                                                            <span className="text-rose-600">
                                                                {
                                                                    sal.unpaidLeaves
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        <div>
                                                            {fmt(
                                                                sal.grossEarnings
                                                            )}
                                                        </div>
                                                        {Number(
                                                            sal.additionalIncentive
                                                        ) > 0 && (
                                                            <div className="text-[11px] text-emerald-600 font-semibold">
                                                                +
                                                                {fmt(
                                                                    sal.additionalIncentive
                                                                )}{" "}
                                                                Incentive
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-rose-600">
                                                        -
                                                        {fmt(
                                                            sal.totalDeductions
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-extrabold text-sm text-primary">
                                                        {fmt(sal.netSalary)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`uppercase text-[10px] font-semibold border ${getSalaryStatusBadge(
                                                                sal.status
                                                            )}`}
                                                        >
                                                            {sal.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sal.emailSentAt ? (
                                                            <div className="text-[11px]">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-purple-50 text-purple-800 border-purple-200 text-[10px]"
                                                                >
                                                                    Sent (
                                                                    {
                                                                        sal.emailSentCount
                                                                    }
                                                                    )
                                                                </Badge>
                                                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                                    {format(
                                                                        new Date(
                                                                            sal.emailSentAt
                                                                        ),
                                                                        "MMM d • h:mm a"
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                Not sent
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2 cursor-pointer"
                                                                title="Preview & Download PDF"
                                                                onClick={() =>
                                                                    setPreviewSalary(
                                                                        sal
                                                                    )
                                                                }
                                                            >
                                                                <Printer className="w-3.5 h-3.5 mr-1" />
                                                                PDF
                                                            </Button>
                                                            {canManageSalary && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2 text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer"
                                                                    title="Send Salary Slip Email to Employee"
                                                                    disabled={
                                                                        sendingEmailId ===
                                                                        sal.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleSendSingleEmail(
                                                                            sal
                                                                        )
                                                                    }
                                                                >
                                                                    {sendingEmailId ===
                                                                    sal.id ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Mail className="w-3.5 h-3.5" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 px-2 cursor-pointer"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/salaries/${sal.id}`
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

                {/* EMPLOYEE SELF-SERVICE TAB ("MY SALARY & PAYSLIPS") */}
                <TabsContent value="my" className="space-y-6">
                    {/* My Salary Structure Card */}
                    {myStructure && (
                        <Card className="border border-border/60 shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-primary" />
                                    My Base Salary Structure (Monthly)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            Basic Salary
                                        </div>
                                        <div className="font-mono font-bold text-sm mt-0.5">
                                            {fmt(myStructure.basicSalary)}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            HRA
                                        </div>
                                        <div className="font-mono font-bold text-sm mt-0.5">
                                            {fmt(myStructure.hra)}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            DA + Allowances
                                        </div>
                                        <div className="font-mono font-bold text-sm mt-0.5">
                                            {fmt(
                                                Number(myStructure.da || 0) +
                                                    Number(
                                                        myStructure.conveyanceAllowance ||
                                                            0
                                                    ) +
                                                    Number(
                                                        myStructure.medicalAllowance ||
                                                            0
                                                    ) +
                                                    Number(
                                                        myStructure.specialAllowance ||
                                                            0
                                                    )
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            Provident Fund (EPF)
                                        </div>
                                        <div className="font-mono font-bold text-sm text-rose-600 mt-0.5">
                                            -{fmt(myStructure.pfEmployee)}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            PT + ESI + TDS
                                        </div>
                                        <div className="font-mono font-bold text-sm text-rose-600 mt-0.5">
                                            -
                                            {fmt(
                                                Number(
                                                    myStructure.professionalTax ||
                                                        0
                                                ) +
                                                    Number(
                                                        myStructure.esi || 0
                                                    ) +
                                                    Number(myStructure.tds || 0)
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <div className="text-muted-foreground">
                                            Bank / PAN
                                        </div>
                                        <div className="font-mono font-semibold text-xs mt-0.5 truncate">
                                            {myStructure.bankName || "N/A"} •{" "}
                                            {myStructure.panNumber || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* My Monthly Payslips Table */}
                    <Card className="border border-border/60 shadow-xs overflow-hidden">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-primary" />
                                My Monthly Salary Slips
                            </CardTitle>
                        </CardHeader>
                        {loadingMy ? (
                            <div className="p-6 space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : mySalaries.length === 0 ? (
                            <div className="p-12 text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-base font-bold">
                                    No salary slips available yet
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    Once the Finance or Admin team generates your monthly salary slips, you can view and download them as PDF here.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Slip #</TableHead>
                                        <TableHead>Month & Year</TableHead>
                                        <TableHead>
                                            Payable Days (Leaves)
                                        </TableHead>
                                        <TableHead>Gross Earnings</TableHead>
                                        <TableHead>
                                            Additional Incentive
                                        </TableHead>
                                        <TableHead>Total Deductions</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            PDF / View
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mySalaries.map((sal) => (
                                        <TableRow key={sal.id}>
                                            <TableCell className="font-mono text-xs font-semibold">
                                                {sal.slipNumber}
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm">
                                                {
                                                    MONTH_NAMES[
                                                        (sal.month || 1) - 1
                                                    ]
                                                }{" "}
                                                {sal.year}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {sal.payableDays}/
                                                {sal.totalWorkingDays} days (PL:{" "}
                                                {sal.paidLeaves}, LOP:{" "}
                                                {sal.unpaidLeaves})
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {fmt(sal.grossEarnings)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-emerald-600 font-semibold">
                                                {fmt(sal.additionalIncentive)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-rose-600">
                                                -{fmt(sal.totalDeductions)}
                                            </TableCell>
                                            <TableCell className="font-mono font-extrabold text-sm text-primary">
                                                {fmt(sal.netSalary)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase text-[10px] font-semibold border ${getSalaryStatusBadge(
                                                        sal.status
                                                    )}`}
                                                >
                                                    {sal.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 px-2.5 cursor-pointer"
                                                        onClick={() =>
                                                            setPreviewSalary(
                                                                sal
                                                            )
                                                        }
                                                    >
                                                        <Printer className="w-3.5 h-3.5 mr-1" />
                                                        View / PDF
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 cursor-pointer"
                                                        onClick={() =>
                                                            navigate(
                                                                `/salaries/${sal.id}`
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
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            <SalarySlipPreviewModal
                salary={previewSalary}
                organization={orgData}
                open={Boolean(previewSalary)}
                onOpenChange={(o) => {
                    if (!o) setPreviewSalary(null);
                }}
            />

            <DisperseSalaryDialog
                open={disperseOpen}
                onOpenChange={setDisperseOpen}
                month={disperseMonth}
                year={disperseYear}
                eligibleCount={summary.paidCount + summary.processedCount}
                onSuccess={fetchAllSalaries}
            />
        </div>
    );
}
