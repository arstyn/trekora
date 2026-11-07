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
import { LeaveService } from "@/services/leave.service";
import type { IEmployeeLeave } from "@/types/leave.types";
import { format } from "date-fns";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Copy,
    FileText,
    User as UserIcon,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LeaveLogsCard } from "./_components/leave-logs-card";
import { ReviewLeaveDialog } from "./_components/review-leave-dialog";

export default function ViewLeavePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasPermission: canApprove } = useHasPermission("leave", "approve");

    const [leave, setLeave] = useState<IEmployeeLeave | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [copied, setCopied] = useState(false);
    const [reviewAction, setReviewAction] = useState<
        "approved" | "rejected" | null
    >(null);

    const fetchLeave = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await LeaveService.getLeaveById(id);
            setLeave(data);
        } catch (err) {
            toast.error("Failed to load leave details");
            navigate("/leaves");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchLogs = useCallback(async () => {
        if (!id) return;
        setLoadingLogs(true);
        try {
            const res = await axiosInstance.get(
                `/activity-log/entity/leave/${id}`
            );
            setLogs(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load leave logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLeave();
        fetchLogs();
    }, [fetchLeave, fetchLogs]);

    const copyLeaveNumber = () => {
        if (!leave) return;
        navigator.clipboard.writeText(leave.leaveNumber);
        setCopied(true);
        toast.success("Copied leave number");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || !leave) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-36 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 lg:col-span-2" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    const statusConfig =
        leave.status === "approved"
            ? {
                  borderAccent: "bg-emerald-500",
                  badgeClass:
                      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                  dotClass: "bg-emerald-500",
                  label: "Approved",
              }
            : leave.status === "rejected" || leave.status === "cancelled"
              ? {
                    borderAccent: "bg-rose-500",
                    badgeClass:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                    dotClass: "bg-rose-500",
                    label:
                        leave.status === "rejected" ? "Rejected" : "Cancelled",
                }
              : {
                    borderAccent: "bg-amber-500",
                    badgeClass:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                    dotClass: "bg-amber-500 animate-pulse",
                    label: "Pending Approval",
                };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* 1. Top Breadcrumb & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    to="/leaves"
                                    className="flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Leaves
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-mono">
                                #{leave.leaveNumber}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {canApprove && leave.status === "pending" && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                            onClick={() => setReviewAction("approved")}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Approve Leave
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => setReviewAction("rejected")}
                        >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Reject Leave
                        </Button>
                    </div>
                )}
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
                                onClick={copyLeaveNumber}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted font-mono text-xs font-semibold hover:bg-muted/80 cursor-pointer"
                            >
                                #{leave.leaveNumber}
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

                            <Badge variant="secondary" className="capitalize">
                                {leave.leaveType} Leave
                            </Badge>
                        </div>

                        <h1 className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight">
                            {leave.totalDays}{" "}
                            {Number(leave.totalDays) === 1 ? "Day" : "Days"}
                            {leave.isHalfDay ? " (Half-Day)" : ""}
                        </h1>

                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {leave.employee?.name || "Employee"} •{" "}
                            {format(new Date(leave.startDate), "MMM d, yyyy")}
                            {leave.startDate !== leave.endDate &&
                                ` to ${format(
                                    new Date(leave.endDate),
                                    "MMM d, yyyy"
                                )}`}{" "}
                            • Applied on{" "}
                            {format(
                                new Date(leave.createdAt),
                                "MMM d, yyyy • h:mm a"
                            )}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Main 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Leave Request Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted/30 border">
                                    <div className="text-xs text-muted-foreground">
                                        Start Date
                                    </div>
                                    <div className="font-mono font-semibold mt-0.5">
                                        {format(
                                            new Date(leave.startDate),
                                            "MMM d, yyyy"
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30 border">
                                    <div className="text-xs text-muted-foreground">
                                        End Date
                                    </div>
                                    <div className="font-mono font-semibold mt-0.5">
                                        {format(
                                            new Date(leave.endDate),
                                            "MMM d, yyyy"
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/30 border space-y-1">
                                <div className="text-xs font-semibold text-muted-foreground">
                                    Reason for Leave
                                </div>
                                <p className="text-sm">{leave.reason}</p>
                            </div>

                            {leave.reviewedBy && (
                                <div className="p-4 rounded-lg bg-muted/30 border space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground">
                                        Reviewed By
                                    </div>
                                    <p className="text-sm font-medium">
                                        {leave.reviewedBy.name} (
                                        {leave.reviewedBy.email})
                                        {leave.reviewedAt &&
                                            ` • ${format(
                                                new Date(leave.reviewedAt),
                                                "MMM d, yyyy • h:mm a"
                                            )}`}
                                    </p>
                                    {leave.reviewNote && (
                                        <p className="text-xs italic text-muted-foreground mt-1">
                                            Reviewer Note: "{leave.reviewNote}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-primary" />
                                Employee Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Name:
                                </span>
                                <span className="font-semibold">
                                    {leave.employee?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Designation:
                                </span>
                                <span className="font-semibold">
                                    {leave.employee?.designation || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Email:
                                </span>
                                <span className="font-mono">
                                    {leave.employee?.email || "N/A"}
                                </span>
                            </div>
                            {leave.employee?.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/employees/${leave.employee?.id}`
                                        )
                                    }
                                >
                                    View Employee Profile
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <LeaveLogsCard logs={logs} loading={loadingLogs} />
                </div>
            </div>

            <ReviewLeaveDialog
                leave={leave}
                action={reviewAction}
                open={Boolean(reviewAction)}
                onOpenChange={(o) => {
                    if (!o) setReviewAction(null);
                }}
                onSuccess={() => {
                    fetchLeave();
                    fetchLogs();
                }}
            />
        </div>
    );
}
