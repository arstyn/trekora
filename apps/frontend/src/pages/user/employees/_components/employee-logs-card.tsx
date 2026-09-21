import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteLogs } from "@/hooks/use-infinite-logs";
import axiosInstance from "@/lib/axios";
import { getFileUrl } from "@/lib/utils";
import { format } from "date-fns";
import {
    Activity,
    CheckCircle2,
    Edit3,
    ExternalLink,
    FileText,
    History,
    Loader2,
    Mail,
    Send,
    Shield,
    UserCheck,
    Users,
    XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export interface IEmployeeLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    metadata?: Record<string, any>;
    performedBy?: {
        id?: string;
        name: string;
        email?: string;
        profilePhoto?: string;
    } | null;
}

interface EmployeeLogsCardProps {
    logs: IEmployeeLog[];
    loading?: boolean;
    entityId?: string;
    totalCount?: number;
}

export const EmployeeLogsCard: React.FC<EmployeeLogsCardProps> = ({
    logs,
    loading = false,
    entityId,
    totalCount,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const total = totalCount ?? logs.length;

    const {
        modalLogs,
        loadingMore,
        hasMore,
        scrollContainerRef,
        sentinelRef,
        handleScroll,
        loadMore,
    } = useInfiniteLogs<IEmployeeLog>({
        initialLogs: logs,
        totalCount: total,
        isOpen: isModalOpen,
        pageSize: 15,
        fetchPage: async ({ page, limit, offset }) => {
            if (!entityId) return { data: [], total };
            const res = await axiosInstance.get(`/activity-log/employee/${entityId}`, {
                params: { page, limit, offset },
            });
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const newTotal = Array.isArray(res.data) ? res.data.length : (res.data.total ?? total);
            return { data, total: newTotal };
        },
    });

    const getActionMeta = (log: IEmployeeLog) => {
        const action = log.action.toLowerCase();

        if (action.includes("invite")) {
            return {
                label: action.includes("resent") ? "Invite Resent" : "Invite Sent",
                icon: Send,
                dotColor: "bg-blue-500",
                badgeColor:
                    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
            };
        }
        if (action.includes("status") || action.includes("activate") || action.includes("deactivate")) {
            const isInactive = action.includes("deactivat");
            return {
                label: isInactive ? "Account Deactivated" : "Status Changed",
                icon: isInactive ? XCircle : CheckCircle2,
                dotColor: isInactive ? "bg-rose-500" : "bg-emerald-500",
                badgeColor: isInactive
                    ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
            };
        }
        if (action.includes("role") || action.includes("permission")) {
            return {
                label: "Permissions Updated",
                icon: Shield,
                dotColor: "bg-amber-500",
                badgeColor:
                    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
            };
        }
        if (action.includes("branch")) {
            return {
                label: "Branch Assigned",
                icon: Users,
                dotColor: "bg-purple-500",
                badgeColor:
                    "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
            };
        }
        if (action.includes("profile") || action.includes("update")) {
            return {
                label: "Profile Updated",
                icon: Edit3,
                dotColor: "bg-indigo-500",
                badgeColor:
                    "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
            };
        }

        switch (action) {
            case "create":
            case "created":
                return {
                    label: "Employee Created",
                    icon: UserCheck,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
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

    const renderLogItem = (log: IEmployeeLog) => {
        const meta = getActionMeta(log);
        const Icon = meta.icon;
        const authorName = log.performedBy?.name || "System";
        const authorInitials = authorName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
        const avatarUrl = log.performedBy?.profilePhoto
            ? getFileUrl(log.performedBy.profilePhoto)
            : undefined;

        return (
            <div key={log.id} className="relative flex items-start gap-3 group">
                {/* Centered Timeline Marker */}
                <div
                    className={`h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5 ${meta.dotColor}`}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content Card */}
                <div className="flex-1 min-w-0 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <Badge
                            variant="outline"
                            className={`font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeColor}`}
                        >
                            {meta.label}
                        </Badge>

                        <span className="text-[11px] text-muted-foreground font-mono">
                            {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                        </span>
                    </div>

                    {/* Performer with HoverCard */}
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
                                        {log.performedBy?.email && (
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3 shrink-0 opacity-70" />
                                                {log.performedBy.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {log.performedBy?.id && (
                                    <div className="pt-3 mt-3 border-t flex justify-end">
                                        <NavLink to={`/employees/${log.performedBy.id}`}>
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

                    {/* Description / Details */}
                    <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                        {log.details}
                    </p>

                    {/* Reason or Metadata */}
                    {log.metadata?.reason && (
                        <div className="p-2 bg-background/80 rounded border border-border/50 text-xs">
                            <span className="font-semibold text-muted-foreground">Reason: </span>
                            <span className="text-foreground">{log.metadata.reason}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const displayedLogs = logs.slice(0, 5);

    return (
        <>
            <Card className="shadow-xs border border-border/80">
                <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <div>
                                <CardTitle className="text-base font-bold tracking-tight">
                                    Activity & Audit Logs
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Complete timeline of invitations, status transitions, and actions.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            {total} {total === 1 ? "entry" : "entries"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                            <FileText className="w-8 h-8 mb-2 opacity-40" />
                            <p className="font-medium text-xs">No activity logs recorded</p>
                        </div>
                    ) : (
                        <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                            {displayedLogs.map(renderLogItem)}
                        </div>
                    )}

                    {total > 5 && (
                        <div className="pt-4 flex justify-center border-t border-border/40 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs text-primary font-medium hover:text-primary/80 hover:bg-primary/5 transition-colors gap-1.5"
                            >
                                <History className="w-3.5 h-3.5" />
                                Show All ({total} events)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Audit Logs Modal with Infinite Scroll */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl sm:max-w-2xl w-[95vw] h-[80vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 sm:p-5 border-b shrink-0">
                        <div className="flex items-center justify-between pr-6">
                            <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Activity & Audit Logs
                            </DialogTitle>
                            <Badge variant="secondary" className="font-normal text-xs font-mono">
                                {total} {total === 1 ? "entry" : "entries"}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Complete timeline of invitations, status transitions, and actions.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-5"
                    >
                        <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                            {modalLogs.map(renderLogItem)}
                        </div>

                        {hasMore && !loadingMore && (
                            <div className="flex justify-center pt-2 pb-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadMore()}
                                    className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
                                >
                                    <History className="w-3.5 h-3.5" />
                                    Load More Logs
                                </Button>
                            </div>
                        )}

                        {loadingMore && (
                            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span>Loading older logs...</span>
                            </div>
                        )}

                        {!hasMore && (
                            <p className="text-center text-xs text-muted-foreground/60 py-3">
                                All {total} events loaded
                            </p>
                        )}

                        <div ref={sentinelRef} className="h-4 w-full shrink-0" />
                    </div>

                    <div className="p-3 px-5 border-t bg-muted/10 flex justify-end shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsModalOpen(false)}
                            className="text-xs"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EmployeeLogsCard;
