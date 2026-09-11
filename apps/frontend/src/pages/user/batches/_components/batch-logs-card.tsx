import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBatchLog } from "@/types/batches.types";
import { format } from "date-fns";
import {
    Activity,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    History,
    Mail,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface BatchLogsCardProps {
    logs: IBatchLog[];
    loading?: boolean;
}

export const BatchLogsCard: React.FC<BatchLogsCardProps> = ({
    logs,
    loading = false,
}) => {
    const getActionMeta = (log: IBatchLog) => {
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
                    label: "Batch Completed",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            }
            if (nextStatus === "cancelled") {
                return {
                    label: "Batch Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
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
                    label: "Batch Created",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "approval_requested":
                return {
                    label: "Approval Requested",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "approval_approved":
                return {
                    label: "Approval Granted",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "approval_rejected":
                return {
                    label: "Approval Rejected",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "coordinator_add":
                return {
                    label: "Coordinator Added",
                    icon: Users,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "coordinator_remove":
                return {
                    label: "Coordinator Removed",
                    icon: Trash2,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "slots_blocked":
                return {
                    label: "Slots Blocked",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "slots_released":
                return {
                    label: "Slots Released",
                    icon: Trash2,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "slots_expired":
                return {
                    label: "Slots Expired",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "slots_converted":
                return {
                    label: "Slots Converted",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "update":
            case "updated":
                return {
                    label: "Batch Updated",
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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-12 w-full rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No activity recorded yet</p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                            Modifications, status updates, and coordinator changes will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                        {logs.map((log) => {
                            const meta = getActionMeta(log);
                            const ActionIcon = meta.icon;
                            const authorName = log.changedBy?.name || "Automated System";
                            const authorInitials = authorName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                                <div key={log.id} className="relative flex items-start gap-3 group">
                                    {/* Timeline Node Marker */}
                                    <div
                                        className={`h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5 ${meta.dotColor}`}
                                    >
                                        <ActionIcon className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Log Entry Content Box */}
                                    <div className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2 min-w-0">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeColor}`}
                                            >
                                                {meta.label}
                                            </Badge>
                                            <time className="text-[11px] text-muted-foreground font-mono">
                                                {format(new Date(log.createdAt), "MMM d, yyyy • HH:mm")}
                                            </time>
                                        </div>

                                        {/* Performer Attribution with HoverCard */}
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span>By</span>
                                            <HoverCard openDelay={200} closeDelay={150}>
                                                <HoverCardTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors cursor-pointer group/user"
                                                    >
                                                        <Avatar className="w-4 h-4 border shrink-0">
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
                                                            ? log.previousData?.status || "active"
                                                            : String(log.previousData || "active")}
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
                                                                : "bg-blue-600 hover:bg-blue-600"
                                                        }`}
                                                    >
                                                        {typeof log.newData === "object"
                                                            ? log.newData?.status || "active"
                                                            : String(log.newData || "active")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        {/* General updates summary */}
                                        {log.action !== "status_change" &&
                                            log.action !== "status" &&
                                            log.action !== "create" &&
                                            log.action !== "created" &&
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

export default BatchLogsCard;
