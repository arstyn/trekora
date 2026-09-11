import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IWorkflowStep } from "@/types/workflow.types";
import {
    Activity,
    CheckCircle2,
    History,
    Loader2,
    UserCheck
} from "lucide-react";

interface TaskHistoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTask: IWorkflowStep | null;
    loadingHistory: boolean;
    historyLogs: any[];
}

export function TaskHistoryDialog({
    isOpen,
    onOpenChange,
    selectedTask,
    loadingHistory,
    historyLogs,
}: TaskHistoryDialogProps) {
    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            Activity & Audit History
                        </DialogTitle>
                        {selectedTask && (
                            <Badge
                                variant="outline"
                                className="text-xs font-normal max-w-[200px] truncate"
                            >
                                {selectedTask.label}
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Complete chronological audit log of updates and status transitions for this task.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-5">
                    {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground">
                                Loading task audit history...
                            </p>
                        </div>
                    ) : historyLogs.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-xs italic">
                            No activity recorded yet for this task.
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:h-full before:w-px before:bg-border">
                            {historyLogs.map((log) => {
                                const isStatusChange =
                                    log.newData && log.newData.status;
                                const isAssignedChange =
                                    log.newData &&
                                    log.newData.assignedToId !== undefined;

                                return (
                                    <div
                                        key={log.id}
                                        className="relative flex items-start gap-3.5 pl-1"
                                    >
                                        {/* Icon node */}
                                        <div className="h-7 w-7 rounded-full border bg-background flex items-center justify-center shrink-0 z-10 text-primary">
                                            {isStatusChange ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : isAssignedChange ? (
                                                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                                            ) : (
                                                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-1 pt-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {log.action === "create"
                                                        ? "Task Created"
                                                        : isStatusChange
                                                            ? "Status Changed"
                                                            : isAssignedChange
                                                                ? "Assignee Updated"
                                                                : "Task Updated"}
                                                </span>
                                                <time className="text-[10px] text-muted-foreground font-mono">
                                                    {new Date(
                                                        log.createdAt,
                                                    ).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </time>
                                            </div>

                                            {/* Details */}
                                            <div className="text-xs text-muted-foreground">
                                                {isStatusChange && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        Status updated to{" "}
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] h-4 px-1.5 capitalize font-medium"
                                                        >
                                                            {log.newData.status}
                                                        </Badge>
                                                    </span>
                                                )}
                                                {isAssignedChange && (
                                                    <span>
                                                        Task reassigned to a team member
                                                    </span>
                                                )}
                                                {!isStatusChange &&
                                                    !isAssignedChange && (
                                                        <span>
                                                            Task details or configuration updated
                                                        </span>
                                                    )}
                                            </div>

                                            {/* User */}
                                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                                                <Avatar className="h-4 w-4 text-[8px]">
                                                    <AvatarFallback className="text-[8px]">
                                                        {getInitials(
                                                            log.changedBy?.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>
                                                    {log.changedBy?.name ||
                                                        "System"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-3 bg-muted/20 border-t flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-xs h-8"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
