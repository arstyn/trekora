import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    Activity,
    CheckCircle2,
    CreditCard,
    Edit3,
    History,
    Mail,
} from "lucide-react";

interface ISalaryLogEntry {
    id: string;
    action: string;
    details: string;
    metadata?: any;
    createdAt: string;
    performedBy?: {
        id?: string;
        name?: string;
        email?: string;
    };
}

export function SalaryLogsCard({
    logs,
    loading,
}: {
    logs: ISalaryLogEntry[];
    loading?: boolean;
}) {
    const getActionMeta = (action: string) => {
        if (action.includes("email_sent")) {
            return {
                label: "SALARY SLIP EMAILED",
                nodeBg: "bg-purple-500",
                badgeClass:
                    "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                Icon: Mail,
            };
        }
        if (action.includes("paid") || action.includes("created")) {
            return {
                label: action.replace(/_/g, " ").toUpperCase(),
                nodeBg: "bg-emerald-500",
                badgeClass:
                    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                Icon: action.includes("paid") ? CreditCard : CheckCircle2,
            };
        }
        return {
            label: action.replace(/_/g, " ").toUpperCase(),
            nodeBg: "bg-blue-500",
            badgeClass:
                "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
            Icon: Edit3,
        };
    };

    return (
        <Card className="border border-border/60 shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Audit & Activity Logs
                </CardTitle>
                <Badge
                    variant="secondary"
                    className="font-normal text-xs font-mono"
                >
                    {logs.length} entries
                </Badge>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold">
                            No activity logs recorded
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Salary updates, status transitions, and email dispersions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                        {logs.map((log) => {
                            const meta = getActionMeta(log.action);
                            const IconComp = meta.Icon;
                            return (
                                <div
                                    key={log.id}
                                    className="relative flex gap-3 items-start"
                                >
                                    <div
                                        className={`h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5 ${meta.nodeBg}`}
                                    >
                                        <IconComp className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeClass}`}
                                            >
                                                {meta.label}
                                            </Badge>
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {format(
                                                    new Date(log.createdAt),
                                                    "MMM d, yyyy • h:mm a"
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-foreground">
                                            {log.details}
                                        </p>
                                        {log.performedBy && (
                                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarFallback className="text-[9px]">
                                                        {(
                                                            log.performedBy
                                                                .name || "U"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>
                                                    By{" "}
                                                    <strong className="text-foreground">
                                                        {log.performedBy.name ||
                                                            log.performedBy
                                                                .email}
                                                    </strong>
                                                </span>
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
}

