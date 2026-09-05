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
import BookingService from "@/services/booking.service";
import type { IBookingLog } from "@/types/booking.types";
import { format } from "date-fns";
import {
    Activity,
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    Edit3,
    ExternalLink,
    FileText,
    History,
    Mail,
    RotateCcw,
    Trash2,
    UserCheck,
    XCircle,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface BookingLogsCardProps {
    logs: IBookingLog[];
    loading?: boolean;
}

export const BookingLogsCard: React.FC<BookingLogsCardProps> = ({
    logs,
    loading = false,
}) => {
    const getActionMeta = (log: IBookingLog) => {
        const action = log.action.toLowerCase();

        if (action === "status_change" || action === "status") {
            const nextStatus =
                typeof log.newData === "object"
                    ? log.newData?.status?.toLowerCase()
                    : typeof log.newData === "string"
                    ? log.newData.toLowerCase()
                    : "";

            if (nextStatus === "completed") {
                return {
                    label: "Booking Completed",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            }
            if (nextStatus === "cancelled") {
                return {
                    label: "Booking Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            }
            if (nextStatus === "on_hold") {
                return {
                    label: "Booking On Hold",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            }
            return {
                label: "Status Changed",
                icon: Activity,
                dotColor: "bg-blue-500",
                badgeColor:
                    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
            };
        }

        switch (action) {
            case "create":
            case "created":
                return {
                    label: "Booking Created",
                    icon: UserCheck,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "cancel":
            case "cancelled":
                return {
                    label: "Booking Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "batch_change":
            case "move":
                return {
                    label: "Batch Transferred",
                    icon: ArrowRightLeft,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "payment":
            case "payment_add":
                return {
                    label: "Payment Recorded",
                    icon: CreditCard,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "refunded":
                return {
                    label: "Payment Refunded",
                    icon: RotateCcw,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "delete":
            case "traveler_remove":
                return {
                    label: "Record Removed",
                    icon: Trash2,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "update":
            case "updated":
                return {
                    label: "Booking Updated",
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
        return BookingService.formatCurrency(amount);
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
                            const meta = getActionMeta(log);
                            const Icon = meta.icon;
                            const authorName = log.changedBy?.name || "System User";
                            const authorInitials = authorName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            const avatarUrl = (log.changedBy as any)?.profilePhoto
                                ? getFileUrl((log.changedBy as any).profilePhoto)
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
                                        {(log.action === "status_change" || log.action === "status") && (
                                            <div className="space-y-1 pt-0.5">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span>Status:</span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] uppercase font-mono px-1.5 py-0 bg-background"
                                                    >
                                                        {typeof log.previousData === "object"
                                                            ? log.previousData?.status || "pending"
                                                            : String(log.previousData || "pending")}
                                                    </Badge>
                                                    <span>→</span>
                                                    <Badge
                                                        className={`text-[10px] uppercase font-mono px-1.5 py-0 text-white ${
                                                            (typeof log.newData === "object"
                                                                ? log.newData?.status
                                                                : log.newData) === "completed"
                                                                ? "bg-emerald-600 hover:bg-emerald-600"
                                                                : (typeof log.newData === "object"
                                                                      ? log.newData?.status
                                                                      : log.newData) === "cancelled"
                                                                ? "bg-rose-600 hover:bg-rose-600"
                                                                : (typeof log.newData === "object"
                                                                      ? log.newData?.status
                                                                      : log.newData) === "on_hold"
                                                                ? "bg-amber-600 hover:bg-amber-600"
                                                                : "bg-primary hover:bg-primary"
                                                        }`}
                                                    >
                                                        {typeof log.newData === "object"
                                                            ? log.newData?.status || "completed"
                                                            : String(log.newData || "completed")}
                                                    </Badge>
                                                </div>
                                                {typeof log.newData === "object" && log.newData?.reason && (
                                                    <p className="text-[11px] text-muted-foreground italic">
                                                        Note: &quot;{log.newData.reason}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Booking Creation summary */}
                                        {(log.action === "create" || log.action === "created") && (
                                            <div className="text-xs text-muted-foreground pt-0.5 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>Booking record created</span>
                                            </div>
                                        )}

                                        {/* Payment recorded summary */}
                                        {(log.action === "payment" || log.action === "payment_add") &&
                                            log.newData && (
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                                                    {log.newData.amount && (
                                                        <span>
                                                            Amount:{" "}
                                                            <strong className="text-foreground">
                                                                {formatCurrency(Number(log.newData.amount))}
                                                            </strong>
                                                        </span>
                                                    )}
                                                    {log.newData.paymentMethod && (
                                                        <span>
                                                            Method:{" "}
                                                            <strong className="text-foreground uppercase">
                                                                {String(log.newData.paymentMethod).replace(/_/g, " ")}
                                                            </strong>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                        {/* Batch Transfer summary */}
                                        {(log.action === "batch_change" || log.action === "move") && (
                                            <div className="text-xs text-muted-foreground pt-0.5 flex items-center gap-1.5">
                                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-500" />
                                                <span>Batch assignment transferred</span>
                                            </div>
                                        )}

                                        {/* General updates summary */}
                                        {log.action !== "status_change" &&
                                            log.action !== "status" &&
                                            log.action !== "create" &&
                                            log.action !== "created" &&
                                            log.action !== "payment" &&
                                            log.action !== "payment_add" &&
                                            log.action !== "batch_change" &&
                                            log.action !== "move" &&
                                            log.newData &&
                                            typeof log.newData === "object" && (
                                                <div className="space-y-0.5 text-xs text-muted-foreground pt-0.5">
                                                    {Object.entries(log.newData).map(([key, value]) => {
                                                        if (key === "updatedAt" || key === "id") return null;
                                                        return (
                                                            <div key={key} className="flex gap-1.5">
                                                                <span className="text-muted-foreground capitalize font-medium min-w-[70px]">
                                                                    {key.replace(/([A-Z])/g, " $1")}:
                                                                </span>
                                                                <span className="truncate text-foreground font-medium">
                                                                    {typeof value === "object"
                                                                        ? JSON.stringify(value)
                                                                        : String(value)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
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

export default BookingLogsCard;
