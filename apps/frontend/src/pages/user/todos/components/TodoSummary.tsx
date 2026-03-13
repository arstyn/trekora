import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle2, ClipboardList, Clock } from "lucide-react";

interface TodoSummaryProps {
    summary: {
        total: number;
        pending: number;
        completed: number;
        skipped: number;
    } | null;
}

export function TodoSummary({ summary }: TodoSummaryProps) {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ClipboardList className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{summary.total}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Across all active workflows
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Clock className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-amber-600">
                        {summary.pending}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Waiting for action
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-emerald-600">
                        {summary.completed}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Goal reached
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BarChart3 className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completion Rate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                        {summary.total > 0
                            ? Math.round(
                                  (summary.completed / summary.total) * 100,
                              )
                            : 0}
                        %
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Efficiency ratio
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
