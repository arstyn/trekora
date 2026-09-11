import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    Clock,
    ListTodo,
    Users
} from "lucide-react";
import { useState } from "react";

interface TodoSummaryProps {
    summary: {
        total: number;
        pending: number;
        completed: number;
        skipped: number;
        byAssignee?: { name: string; total: number; completed: number }[];
        byType?: { booking: number; package: number; customer: number };
    } | null;
    selectedEmployee?: string;
    onSelectEmployee?: (empName: string) => void;
}

export function TodoSummary({
    summary,
    selectedEmployee,
    onSelectEmployee,
}: TodoSummaryProps) {
    const [showTeamWorkload, setShowTeamWorkload] = useState(false);

    if (!summary) return null;

    const completionRate =
        summary.total > 0
            ? Math.round((summary.completed / summary.total) * 100)
            : 0;

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
        <div className="space-y-4">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tasks */}
                <Card className="border-border/80 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Tasks
                            </p>
                            <p className="text-2xl font-bold font-mono text-foreground">
                                {summary.total}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Across all active workflows
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <ListTodo className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card className="border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                                Pending Action
                            </p>
                            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                                {summary.pending}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Awaiting execution
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card className="border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                Completed
                            </p>
                            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {summary.completed}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Tasks finished successfully
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Completion Rate */}
                <Card className="border-border/80 bg-card shadow-xs">
                    <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Completion Rate
                            </p>
                            <span className="text-xs font-semibold text-primary font-mono">
                                {completionRate}%
                            </span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                            <span>
                                {summary.completed} of {summary.total} done
                            </span>
                            {summary.byAssignee && summary.byAssignee.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowTeamWorkload((prev) => !prev)
                                    }
                                    className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <Users className="h-3 w-3" />
                                    {showTeamWorkload ? "Hide team" : "Team load"}
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Collapsible/Interactive Team Workload Section (No charts/bars!) */}
            {showTeamWorkload && summary.byAssignee && summary.byAssignee.length > 0 && (
                <Card className="border-border/80 bg-muted/20">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                    Team Workload Distribution
                                </h3>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {summary.byAssignee.length} active team members
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {summary.byAssignee.map((item) => {
                                const userRate =
                                    item.total > 0
                                        ? Math.round(
                                            (item.completed / item.total) *
                                            100,
                                        )
                                        : 0;
                                const isSelected =
                                    selectedEmployee === item.name;

                                return (
                                    <div
                                        key={item.name}
                                        onClick={() =>
                                            onSelectEmployee &&
                                            onSelectEmployee(
                                                isSelected ? "all" : item.name,
                                            )
                                        }
                                        className={`p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                                ? "border-primary bg-primary/5 shadow-xs"
                                                : "border-border/80 bg-card hover:border-border hover:bg-muted/40"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <Avatar className="h-7 w-7 text-xs">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                    {getInitials(item.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-foreground truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">
                                                    {item.completed} / {item.total} done
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-mono h-4 px-1"
                                            >
                                                {userRate}%
                                            </Badge>
                                        </div>
                                        <Progress
                                            value={userRate}
                                            className="h-1.5"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
