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
import type { IWorkflowStep } from "@/types/workflow.types";
import { format } from "date-fns";
import {
    CheckCircle2,
    FileEdit,
    History,
    Loader2,
    UserCheck,
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
            <DialogContent className="max-w-xl sm:max-w-xl w-[95vw] h-[80vh] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-5 pb-3 border-b bg-muted/20 shrink-0">
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

                <div className="flex-1 overflow-y-auto min-h-0 p-5">
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
                                                <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Log details */}
                                        <div className="flex-1 space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-foreground">
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(
                                                        new Date(log.createdAt),
                                                        "MMM d, h:mm a",
                                                    )}
                                                </span>
                                            </div>

                                            {/* Details text */}
                                            {log.details && (
                                                <p className="text-xs text-muted-foreground">
                                                    {log.details}
                                                </p>
                                            )}

                                            {/* Status Badge changed */}
                                            {isStatusChange && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] font-normal"
                                                    >
                                                        {log.previousData
                                                            ?.status ||
                                                            "Previous"}
                                                    </Badge>
                                                    <span className="text-muted-foreground text-xs">
                                                        →
                                                    </span>
                                                    <Badge
                                                        variant="default"
                                                        className="text-[10px] font-normal bg-emerald-600"
                                                    >
                                                        {log.newData.status}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Changed By Footer */}
                                            <div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-border/30 text-[10px] text-muted-foreground">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
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
                </div>

                <div className="p-3 bg-muted/20 border-t flex justify-end shrink-0">
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
