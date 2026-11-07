import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";
import {
    MONTH_NAMES,
    SalarySlipService,
} from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import type { IEmployeeSalary } from "@/types/salary.types";
import { format } from "date-fns";
import {
    ArrowLeft,
    Banknote,
    Building,
    Calendar,
    Check,
    CheckCircle2,
    Copy,
    Download,
    Edit,
    Loader2,
    Mail,
    Printer,
    Sparkles,
    User as UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { SalaryLogsCard } from "./_components/salary-logs-card";
import { SalarySlipPreviewModal } from "./_components/salary-slip-preview-modal";

export default function ViewSalaryPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { hasPermission: canUpdate } = useHasPermission("salary", "update");
    const { hasPermission: canManage } = useHasPermission("salary", "manage");

    const [salary, setSalary] = useState<IEmployeeSalary | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [markingPaid, setMarkingPaid] = useState(false);

    const fetchSalary = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await SalaryService.getSalaryById(id);
            setSalary(data);
        } catch (err) {
            toast.error("Failed to load salary slip details");
            navigate("/salaries");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchLogs = useCallback(async () => {
        if (!id) return;
        setLoadingLogs(true);
        try {
            const res = await axiosInstance.get(
                `/activity-log/entity/salary/${id}`
            );
            setLogs(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load salary logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSalary();
        fetchLogs();
    }, [fetchSalary, fetchLogs]);

    const handleCopySlipNumber = () => {
        if (!salary) return;
        navigator.clipboard.writeText(salary.slipNumber);
        setCopied(true);
        toast.success("Copied salary slip number");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendEmail = async () => {
        if (!salary) return;
        setSendingEmail(true);
        try {
            const updated = await SalaryService.sendSalarySlipEmail(salary.id);
            setSalary(updated);
            toast.success(
                `Salary slip email sent to ${salary.employee?.name} (${salary.employee?.email})`
            );
            fetchLogs();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to send salary slip email"
            );
        } finally {
            setSendingEmail(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!salary) return;
        setMarkingPaid(true);
        try {
            const updated = await SalaryService.updateSalary(salary.id, {
                status: "paid",
                paymentDate: new Date().toISOString().split("T")[0],
            });
            setSalary(updated);
            toast.success("Salary slip marked as Paid");
            fetchLogs();
        } catch (err: any) {
            toast.error("Failed to mark salary as paid");
        } finally {
            setMarkingPaid(false);
        }
    };

    if (loading || !salary) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 lg:col-span-2" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    const fmt = (v: any) => SalarySlipService.formatCurrency(v);
    const monthName = MONTH_NAMES[(salary.month || 1) - 1] || "Month";
    const periodLabel = `${monthName} ${salary.year}`;

    const statusConfig =
        salary.status === "paid"
            ? {
                  borderAccent: "bg-emerald-500",
                  badgeClass:
                      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                  dotClass: "bg-emerald-500",
                  label: "Paid & Disbursed",
              }
            : salary.status === "processed"
              ? {
                    borderAccent: "bg-blue-500",
                    badgeClass:
                        "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
                    dotClass: "bg-blue-500",
                    label: "Processed",
                }
              : {
                    borderAccent: "bg-amber-500",
                    badgeClass:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                    dotClass: "bg-amber-500 animate-pulse",
                    label: "Draft",
                };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* 1. Top Navigation & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    to="/salaries"
                                    className="flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Salaries
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-mono">
                                #{salary.slipNumber}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewOpen(true)}
                        className="gap-1.5 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        Preview / Download PDF
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            SalarySlipService.downloadSalarySlipHTML(
                                salary,
                                salary.organization
                            )
                        }
                        className="gap-1.5 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Download Slip
                    </Button>
                    {canManage && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={sendingEmail}
                            onClick={handleSendEmail}
                            className="gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer"
                        >
                            {sendingEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4" />
                            )}
                            Send Salary Slip Mail
                        </Button>
                    )}
                    {canUpdate && salary.status !== "paid" && (
                        <Button
                            size="sm"
                            disabled={markingPaid}
                            onClick={handleMarkAsPaid}
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                            {markingPaid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            Mark as Paid
                        </Button>
                    )}
                    {canUpdate && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                                navigate(`/salaries/edit/${salary.id}`)
                            }
                            className="gap-1.5 cursor-pointer"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {/* 2. Hero Summary Banner Card */}
            <Card className="relative overflow-hidden border border-border/60 shadow-xs">
                <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${statusConfig.borderAccent}`}
                />
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopySlipNumber}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted font-mono text-xs font-semibold hover:bg-muted/80 cursor-pointer"
                            >
                                #{salary.slipNumber}
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                            </button>

                            <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`}
                                />
                                {statusConfig.label}
                            </div>

                            <Badge variant="secondary">{periodLabel}</Badge>

                            {salary.emailSentAt && (
                                <Badge
                                    variant="outline"
                                    className="bg-purple-50 text-purple-800 border-purple-200 text-xs"
                                >
                                    <Mail className="w-3 h-3 mr-1" />
                                    Email Sent ({salary.emailSentCount})
                                </Badge>
                            )}
                        </div>

                        <h1 className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                            {fmt(salary.netSalary)}
                        </h1>

                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {salary.employee?.name} •{" "}
                            {salary.employee?.designation || "Employee"} •{" "}
                            {SalarySlipService.numberToIndianWords(
                                Number(salary.netSalary)
                            )}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border text-right space-y-1">
                        <div className="text-xs text-muted-foreground">
                            Gross Earnings:{" "}
                            <strong className="font-mono text-foreground">
                                {fmt(salary.grossEarnings)}
                            </strong>
                        </div>
                        <div className="text-xs text-rose-600">
                            Total Deductions:{" "}
                            <strong className="font-mono">
                                -{fmt(salary.totalDeductions)}
                            </strong>
                        </div>
                        {Number(salary.additionalIncentive) > 0 && (
                            <div className="text-xs text-emerald-600 font-semibold">
                                Includes +{fmt(salary.additionalIncentive)}{" "}
                                Additional Incentive
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Main 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Working Days & Leave Breakdown */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Working Days & Leave Summary ({periodLabel})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                            <div className="p-3 rounded-lg bg-muted/30 border">
                                <div className="text-[11px] uppercase text-muted-foreground font-semibold">
                                    Working Days
                                </div>
                                <div className="text-xl font-extrabold font-mono mt-1">
                                    {salary.totalWorkingDays}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border">
                                <div className="text-[11px] uppercase text-muted-foreground font-semibold">
                                    Days Worked
                                </div>
                                <div className="text-xl font-extrabold font-mono mt-1">
                                    {salary.daysWorked}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60">
                                <div className="text-[11px] uppercase text-emerald-700 font-semibold">
                                    Paid Leaves
                                </div>
                                <div className="text-xl font-extrabold font-mono text-emerald-600 mt-1">
                                    {salary.paidLeaves}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60">
                                <div className="text-[11px] uppercase text-rose-700 font-semibold">
                                    Unpaid / LOP
                                </div>
                                <div className="text-xl font-extrabold font-mono text-rose-600 mt-1">
                                    {salary.unpaidLeaves}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/30">
                                <div className="text-[11px] uppercase text-primary font-semibold">
                                    Payable Days
                                </div>
                                <div className="text-xl font-extrabold font-mono text-primary mt-1">
                                    {salary.payableDays}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Earnings & Deductions Side-by-Side Breakdown */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-primary" />
                                Indian Salary Breakdown (Earnings & Deductions)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Earnings */}
                            <div className="space-y-2.5 text-xs">
                                <div className="font-bold uppercase text-emerald-700 border-b pb-1.5">
                                    Earnings (₹)
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Basic Salary
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.basicSalary)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        House Rent Allowance (HRA)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.hra)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Dearness Allowance (DA)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.da)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Conveyance Allowance
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.conveyanceAllowance)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Medical Allowance
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.medicalAllowance)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Special Allowance
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.specialAllowance)}
                                    </span>
                                </div>
                                <div className="flex justify-between p-2 rounded bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 font-semibold">
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Additional Incentive
                                        {salary.incentiveNote
                                            ? ` (${salary.incentiveNote})`
                                            : ""}
                                    </span>
                                    <span className="font-mono font-bold">
                                        {fmt(salary.additionalIncentive)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold text-sm">
                                    <span>Gross Earnings</span>
                                    <span className="font-mono">
                                        {fmt(salary.grossEarnings)}
                                    </span>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="space-y-2.5 text-xs">
                                <div className="font-bold uppercase text-rose-600 border-b pb-1.5">
                                    Deductions (₹)
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Provident Fund (EPF)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.pfDeduction)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Employee State Insurance (ESI)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.esiDeduction)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Professional Tax (PT)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.professionalTax)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Income Tax (TDS)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.tdsDeduction)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>Loss of Pay (LOP) Deduction</span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.lopDeduction)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Other Deductions
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(salary.otherDeductions)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold text-sm text-rose-600">
                                    <span>Total Deductions</span>
                                    <span className="font-mono">
                                        -{fmt(salary.totalDeductions)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-primary" />
                                Employee & Statutory Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Employee:
                                </span>
                                <span className="font-semibold">
                                    {salary.employee?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Email:
                                </span>
                                <span className="font-mono">
                                    {salary.employee?.email || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Bank Name:
                                </span>
                                <span className="font-semibold">
                                    {salary.salaryStructure?.bankName || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Account No:
                                </span>
                                <span className="font-mono">
                                    {salary.salaryStructure?.accountNumber ||
                                        "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    IFSC Code:
                                </span>
                                <span className="font-mono">
                                    {salary.salaryStructure?.ifscCode || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    PAN / UAN:
                                </span>
                                <span className="font-mono">
                                    {salary.salaryStructure?.panNumber || "N/A"}{" "}
                                    /{" "}
                                    {salary.salaryStructure?.uanNumber || "N/A"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary" />
                                Dispersion & Payment Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Payment Mode:
                                </span>
                                <span className="font-semibold uppercase">
                                    {(
                                        salary.paymentMethod || "bank_transfer"
                                    ).replace("_", " ")}
                                </span>
                            </div>
                            {salary.paymentDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Payment Date:
                                    </span>
                                    <span className="font-mono">
                                        {format(
                                            new Date(salary.paymentDate),
                                            "MMM d, yyyy"
                                        )}
                                    </span>
                                </div>
                            )}
                            {salary.paymentReference && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Reference / UTR:
                                    </span>
                                    <span className="font-mono">
                                        {salary.paymentReference}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Last Email Sent:
                                </span>
                                <span className="font-mono">
                                    {salary.emailSentAt
                                        ? format(
                                              new Date(salary.emailSentAt),
                                              "MMM d, yyyy • h:mm a"
                                          )
                                        : "Not sent yet"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <SalaryLogsCard logs={logs} loading={loadingLogs} />
                </div>
            </div>

            <SalarySlipPreviewModal
                salary={salary}
                organization={salary.organization}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
            />
        </div>
    );
}

