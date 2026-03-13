import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2, User } from "lucide-react";
import type { IWorkflowStep } from "@/services/workflow.service";

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
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Task History
                        </div>
                        {selectedTask && (
                            <Badge variant="outline" className="text-xs">
                                {selectedTask.label}
                            </Badge>
                        )}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Chronological log of all activities and changes for this
                        task.
                    </p>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Fetching complete history...
                            </p>
                        </div>
                    ) : historyLogs.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground italic">
                            No activity recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {historyLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="relative flex items-start pl-10"
                                >
                                    <div className="absolute left-3 top-2 mt-px h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm ring-4 ring-background" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="font-bold text-sm">
                                                {log.action === "create"
                                                    ? "Task Created"
                                                    : log.action === "update"
                                                      ? "Status Updated"
                                                      : "Action Recorded"}
                                            </div>
                                            <time className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-muted px-2 py-0.5 rounded">
                                                {new Date(
                                                    log.createdAt,
                                                ).toLocaleString()}
                                            </time>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {log.action === "update" &&
                                            log.newData?.status ? (
                                                <span>
                                                    Status changed to{" "}
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize h-4 text-[10px]"
                                                    >
                                                        {log.newData.status}
                                                    </Badge>
                                                </span>
                                            ) : log.newData?.assignedToId ? (
                                                <span>
                                                    Assigned to a team member
                                                </span>
                                            ) : (
                                                "Maintenance log recorded"
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold">
                                                {log.changedBy?.name ||
                                                    "System Automated"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-4 bg-muted/30 border-t flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg"
                    >
                        Close Review
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
