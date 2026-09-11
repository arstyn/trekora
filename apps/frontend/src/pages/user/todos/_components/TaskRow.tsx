import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Clock,
    History,
} from "lucide-react";
import { BookingHoverCard } from "./BookingHoverCard";

interface TaskRowProps {
    task: IWorkflowStep;
    onToggle: (task: IWorkflowStep) => void;
    employees: IEmployee[];
    isAdmin: boolean;
    onAssign: (taskId: string, empId: string) => void;
    onHistory: (task: IWorkflowStep) => void;
}

export function TaskRow({
    task,
    onToggle,
    employees,
    isAdmin,
    onAssign,
    onHistory,
}: TaskRowProps) {
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
        <div
            className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors bg-card hover:bg-muted/40 ${
                isCompleted ? "opacity-70 bg-muted/20" : ""
            }`}
        >
            {/* Left: Checkbox + Title + Description */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Checkbox
                    id={`row-${task.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => onToggle(task)}
                    className="h-4 w-4 rounded transition-all data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />

                <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <label
                            htmlFor={`row-${task.id}`}
                            className={`text-sm font-medium leading-none cursor-pointer truncate ${
                                isCompleted
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                            }`}
                        >
                            {task.label}
                        </label>

                        {task.isMandatory && (
                            <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-semibold border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 gap-1"
                            >
                                <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                                Mandatory
                            </Badge>
                        )}

                        <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground bg-muted/60"
                        >
                            {task.type}
                        </Badge>
                    </div>

                    {task.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xl">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Middle: Workflow badge with hover preview */}
            <div className="hidden md:flex items-center shrink-0">
                <BookingHoverCard workflow={task.workflow} />
            </div>

            {/* Right: Assignee + Date + History button */}
            <div className="flex items-center gap-3 shrink-0">
                {isAdmin ? (
                    <Select
                        value={task.assignedToId || "unassigned"}
                        onValueChange={(val) => onAssign(task.id, val)}
                    >
                        <SelectTrigger className="h-8 text-xs border-dashed border-border/80 bg-background hover:bg-muted/50 w-[140px] sm:w-[150px] rounded-md gap-1.5">
                            <Avatar className="h-4 w-4 shrink-0 text-[9px]">
                                <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                                    {getInitials(task.assignedTo?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-left flex-1">
                                {task.assignedTo?.name || "Unassigned"}
                            </span>
                        </SelectTrigger>
                        <SelectContent align="end">
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
                                                    {getInitials(emp.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{emp.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-[120px] truncate">
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

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="hidden sm:inline-flex items-center text-[11px] text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.updatedAt).toLocaleDateString(
                                    undefined,
                                    {
                                        month: "short",
                                        day: "numeric",
                                    },
                                )}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            Last updated:{" "}
                            {new Date(task.updatedAt).toLocaleString()}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onHistory(task)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0"
                    title="View history"
                >
                    <History className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
