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
import { format } from "date-fns";
import {
    Activity,
    Archive,
    CheckCircle2,
    Clock,
    Edit,
    ExternalLink,
    FileText,
    History,
    Mail,
    Plus,
    RotateCcw,
    Send,
    Trash2,
    XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export interface IPackageActivity {
    id: string;
    action: string;
    createdAt: string;
    details: any;
    user?: {
        id?: string;
        name: string;
        email?: string;
        avatar?: string;
    } | null;
}

interface PackageLogsCardProps {
    logs: IPackageActivity[];
    loading?: boolean;
}

export const PackageLogsCard: React.FC<PackageLogsCardProps> = ({
    logs,
    loading = false,
}) => {
    const [expanded, setExpanded] = useState(false);

    const getActionMeta = (log: IPackageActivity) => {
        const action = log.action.toLowerCase();

        switch (action) {
            case "create":
                return {
                    label: "Package Created",
                    icon: Plus,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "publish":
            case "publish_update":
                return {
                    label: action === "publish_update" ? "Published Updates" : "Package Published",
                    icon: Send,
                    dotColor: "bg-indigo-500",
                    badgeColor:
                        "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
                };
            case "update":
                return {
                    label: "Package Updated",
                    icon: Edit,
                    dotColor: "bg-blue-500",
                    badgeColor:
                        "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
                };
            case "edit_draft":
                return {
                    label: "Draft Edited",
                    icon: Edit,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "unpublish":
                return {
                    label: "Unpublished",
                    icon: RotateCcw,
                    dotColor: "bg-orange-500",
                    badgeColor:
                        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
                };
            case "archive":
                return {
                    label: "Archived",
                    icon: Archive,
                    dotColor: "bg-slate-500",
                    badgeColor:
                        "bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800",
                };
            case "delete":
            case "discard_changes":
                return {
                    label: action === "discard_changes" ? "Draft Discarded" : "Deleted",
                    icon: Trash2,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
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
            default:
                return {
                    label: action.replace(/_/g, " "),
                    icon: Activity,
                    dotColor: "bg-primary",
                    badgeColor: "bg-primary/10 text-primary border-primary/20",
                };
        }
    };

    const displayedLogs = expanded ? logs : logs.slice(0, 5);

    return (
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
                                History of revisions, publications, and state updates.
                            </p>
                        </div>
                    </div>
                    {logs.length > 0 && (
                        <Badge variant="outline" className="font-mono text-xs">
                            {logs.length} events
                        </Badge>
                    )}
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
                        {displayedLogs.map((log) => {
                            const meta = getActionMeta(log);
                            const Icon = meta.icon;
                            const authorName = log.user?.name || "System User";
                            const authorInitials = authorName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            const avatarUrl = log.user?.avatar
                                ? getFileUrl(log.user.avatar)
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
                                                className={`font-semibold text-[11px] px-2 py-0.5 border capitalize ${meta.badgeColor}`}
                                            >
                                                {meta.label}
                                            </Badge>

                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {format(new Date(log.createdAt), "MMM d, yyyy • HH:mm")}
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
                                                            {log.user?.email && (
                                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                                    <Mail className="w-3 h-3 shrink-0 opacity-70" />
                                                                    {log.user.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {log.user?.id && (
                                                        <div className="pt-3 mt-3 border-t flex justify-end">
                                                            <NavLink to={`/employees/${log.user.id}`}>
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

                                        {/* Details message if string or structured */}
                                        {typeof log.details === "string" ? (
                                            <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                                                {log.details}
                                            </p>
                                        ) : log.details?.changesSummary ? (
                                            <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                                                {log.details.changesSummary}
                                            </p>
                                        ) : null}

                                        {/* Changed fields pill list */}
                                        {log.details?.changedFields && Array.isArray(log.details.changedFields) && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {log.details.changedFields.map((field: string, idx: number) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-[10px] font-mono"
                                                    >
                                                        {field}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {logs.length > 5 && (
                    <div className="pt-4 flex justify-center border-t border-border/40 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-primary font-medium"
                        >
                            {expanded ? "Show Less" : `Show All (${logs.length} events)`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
