import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileUrl } from "@/lib/utils";
import type { PaymentLog } from "@/types/payment.types";
import { format } from "date-fns";
import {
    Activity,
    Archive,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    FileText,
    History,
    Mail,
    Paperclip,
    RotateCcw,
    XCircle,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface PaymentLogsCardProps {
    logs: PaymentLog[];
    loading?: boolean;
}

export const PaymentLogsCard: React.FC<PaymentLogsCardProps> = ({
    logs,
    loading = false,
}) => {
    const getActionMeta = (action: string) => {
        switch (action.toLowerCase()) {
            case "verified":
            case "completed":
                return {
                    label: "Payment Verified",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "created":
                return {
                    label: "Payment Created",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "failed":
                return {
                    label: "Payment Failed",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "refunded":
                return {
                    label: "Payment Refunded",
                    icon: RotateCcw,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "archived":
                return {
                    label: "Payment Archived",
                    icon: Archive,
                    dotColor: "bg-gray-500",
                    badgeColor:
                        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                };
            case "receipt_uploaded":
                return {
                    label: "Receipt Uploaded",
                    icon: Paperclip,
                    dotColor: "bg-blue-500",
                    badgeColor:
                        "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
                };
            case "updated":
                return {
                    label: "Payment Updated",
                    icon: Edit3,
                    dotColor: "bg-indigo-500",
                    badgeColor:
                        "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
                };
            default:
                return {
                    label: action.replace(/_/g, " "),
                    icon: Activity,
                    dotColor: "bg-primary",
                    badgeColor: "bg-primary/10 text-primary border-primary/20",
                };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        Audit & Activity Logs
                    </CardTitle>
                    <Badge variant="secondary" className="font-normal text-xs font-mono">
                        {logs.length} {logs.length === 1 ? "entry" : "entries"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-5">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <FileText className="w-8 h-8 mb-2 opacity-40" />
                        <p className="font-medium text-xs">No activity logs recorded</p>
                    </div>
                ) : (
                    <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                        {logs.map((log) => {
                            const meta = getActionMeta(log.action);
                            const Icon = meta.icon;
                            const authorName = log.changedBy?.name || "System User";
                            const authorInitials = authorName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            const avatarUrl = log.changedBy?.profilePhoto
                                ? getFileUrl(log.changedBy.profilePhoto)
                                : undefined;

                            return (
                                <div key={log.id} className="relative flex items-start gap-3 group">
                                    {/* Centered Timeline Marker */}
                                    <div
                                        className={`h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5 ${meta.dotColor}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Compact & Clean Content Card */}
                                    <div className="flex-1 min-w-0 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2">
                                        {/* Action Badge & Timestamp */}
                                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeColor}`}
                                            >
                                                {meta.label}
                                            </Badge>

                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {format(new Date(log.createdAt), "MMM d, yyyy • HH:mm")}
                                            </span>
                                        </div>

                                        {/* Performer with HoverCard Popup */}
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-muted-foreground">By</span>
                                            <HoverCard openDelay={150} closeDelay={150}>
                                                <HoverCardTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer group/user focus:outline-none"
                                                    >
                                                        <Avatar className="w-5 h-5 ring-1 ring-border shrink-0">
                                                            {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                {authorInitials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-foreground group-hover/user:text-primary transition-colors underline-offset-2 hover:underline">
                                                            {authorName}
                                                        </span>
                                                    </button>
                                                </HoverCardTrigger>
                                                <HoverCardContent align="start" className="w-72 p-4 shadow-lg">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="w-12 h-12 border shrink-0">
                                                            {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                                                            <AvatarFallback className="text-base bg-primary/10 text-primary font-bold">
                                                                {authorInitials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <h4 className="text-sm font-semibold truncate text-foreground">
                                                                {authorName}
                                                            </h4>
                                                            {log.changedBy?.email && (
                                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                                    <Mail className="w-3 h-3 shrink-0 opacity-70" />
                                                                    {log.changedBy.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {log.changedBy?.id && (
                                                        <div className="pt-3 mt-3 border-t flex justify-end">
                                                            <NavLink to={`/employees/${log.changedBy.id}`}>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                                                                    See Full Details
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </Button>
                                                            </NavLink>
                                                        </div>
                                                    )}
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>

                                        {/* Status transition diff */}
                                        {log.action === "verified" && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                                                <span>Status:</span>
                                                <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 bg-background">
                                                    {log.previousData?.status || "pending"}
                                                </Badge>
                                                <span>→</span>
                                                <Badge className="text-[10px] uppercase font-mono px-1.5 py-0 bg-emerald-600 hover:bg-emerald-600 text-white">
                                                    {log.newData?.status || "completed"}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Payment Creation summary */}
                                        {log.action === "created" && log.newData && (
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                                                {log.newData.amount && (
                                                    <span>
                                                        Amount: <strong className="text-foreground">{formatCurrency(Number(log.newData.amount))}</strong>
                                                    </span>
                                                )}
                                                {log.newData.paymentMethod && (
                                                    <span>
                                                        Method: <strong className="text-foreground capitalize">{String(log.newData.paymentMethod).replace(/_/g, " ")}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Receipt upload summary */}
                                        {log.action === "receipt_uploaded" && log.newData && (
                                            <div className="text-xs text-muted-foreground pt-0.5 flex items-center gap-1.5">
                                                <Paperclip className="w-3.5 h-3.5 text-primary" />
                                                <span>Uploaded {log.newData.filesCount || 1} receipt document(s)</span>
                                            </div>
                                        )}

                                        {/* Failed summary */}
                                        {log.action === "failed" && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                                                <span>Status:</span>
                                                <Badge variant="destructive" className="text-[10px] uppercase font-mono px-1.5 py-0">
                                                    Failed
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PaymentLogsCard;
