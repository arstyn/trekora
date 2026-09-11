import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import {
    AlertCircle,
    Calendar,
    Clock,
    History,
} from "lucide-react";
import { BookingHoverCard } from "./BookingHoverCard";

interface TaskCardProps {
    task: IWorkflowStep;
    onToggle: (task: IWorkflowStep) => void;
    employees: IEmployee[];
    isAdmin: boolean;
    onAssign: (taskId: string, empId: string) => void;
    onHistory: (task: IWorkflowStep) => void;
}

export function TaskCard({
    task,
    onToggle,
    employees,
    isAdmin,
    onAssign,
    onHistory,
}: TaskCardProps) {
    const isCompleted = task.status === "completed";

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
        <Card
            className={`group transition-all duration-200 hover:shadow-md border-border/80 ${isCompleted
                ? "opacity-75 bg-muted/20 border-muted-foreground/20"
                : "bg-card hover:border-primary/40"
                }`}
        >
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                {/* Header Row: Checkbox + Title + Badges */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                            id={`card-${task.id}`}
                            checked={isCompleted}
                            onCheckedChange={() => onToggle(task)}
                            className="mt-1 h-5 w-5 rounded-md transition-all data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shrink-0"
                        />

                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <label
                                    htmlFor={`card-${task.id}`}
                                    className={`text-base font-semibold leading-snug cursor-pointer transition-colors ${isCompleted
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground group-hover:text-primary"
                                        }`}
                                >
                                    {task.label}
                                </label>

                                {task.isMandatory ? (
                                    <Badge
                                        variant="outline"
                                        className="h-5 px-1.5 text-[10px] font-semibold border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 gap-1"
                                    >
                                        <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                                        Mandatory
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground bg-muted/30"
                                    >
                                        Standard
                                    </Badge>
                                )}

                                <Badge
                                    variant="secondary"
                                    className="h-5 px-1.5 text-[10px] capitalize font-medium text-muted-foreground bg-muted/60"
                                >
                                    {task.type}
                                </Badge>
                            </div>

                            {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5 leading-relaxed">
                                    {task.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onHistory(task)}
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                                    >
                                        <History className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Activity Log</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Footer Row: Workflow Tag + Assignee Dropdown + Date */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Workflow Tag with Hover Details */}
                        <BookingHoverCard workflow={task.workflow} />

                        {/* Assignee */}
                        {isAdmin ? (
                            <div className="flex items-center gap-1.5">
                                <Select
                                    value={task.assignedToId || "unassigned"}
                                    onValueChange={(val) =>
                                        onAssign(task.id, val)
                                    }
                                >
                                    <SelectTrigger className="h-7 text-xs border-dashed border-border/80 bg-background hover:bg-muted/50 w-[150px] rounded-md gap-1.5 px-2">
                                        <Avatar className="h-4 w-4 shrink-0 text-[9px]">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                                                {getInitials(
                                                    task.assignedTo?.name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate text-left flex-1">
                                            {task.assignedTo?.name ||
                                                "Unassigned"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectItem value="unassigned">
                                            <span className="text-muted-foreground">
                                                Unassigned
                                            </span>
                                        </SelectItem>
                                        {employees
                                            .filter((emp) => emp.userId)
                                            .map((emp) => (
                                                <SelectItem
                                                    key={emp.id}
                                                    value={emp.userId!}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-4 w-4 text-[9px]">
                                                            <AvatarFallback className="text-[9px]">
                                                                {getInitials(
                                                                    emp.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{emp.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Avatar className="h-4 w-4 shrink-0 text-[9px]">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                                        {getInitials(task.assignedTo?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                    {task.assignedTo?.name || "Unassigned"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Dates: Created & Due */}
                    <div className="flex items-center gap-2.5 text-[11px] ml-auto">
                        <span
                            className="inline-flex items-center gap-1 text-muted-foreground"
                            title={`Created on ${new Date(task.createdAt).toLocaleString()}`}
                        >
                            <Clock className="h-3 w-3 opacity-60" />
                            {new Date(task.createdAt).toLocaleDateString(
                                undefined,
                                {
                                    month: "short",
                                    day: "numeric",
                                },
                            )}
                        </span>

                        {(() => {
                            const raw =
                                task.dueDate ||
                                task.config?.dueDate ||
                                task.config?.deadline;
                            const dueDate = raw ? new Date(raw) : null;
                            const isOverdue =
                                dueDate &&
                                !isCompleted &&
                                dueDate.getTime() <
                                    new Date().setHours(0, 0, 0, 0);

                            if (dueDate && !isNaN(dueDate.getTime())) {
                                return (
                                    <span
                                        className={`inline-flex items-center gap-1 font-medium ${
                                            isOverdue
                                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                                : "text-foreground/80 font-medium"
                                        }`}
                                        title={
                                            isOverdue
                                                ? `Overdue! Was due ${dueDate.toLocaleDateString()}`
                                                : `Due on ${dueDate.toLocaleDateString()}`
                                        }
                                    >
                                        {isOverdue ? (
                                            <AlertCircle className="h-3 w-3 text-rose-500" />
                                        ) : (
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        Due{" "}
                                        {dueDate.toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                );
                            }

                            return null;
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
