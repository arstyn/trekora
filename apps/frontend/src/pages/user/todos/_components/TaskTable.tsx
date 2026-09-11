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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    CheckCircle2,
    Clock,
    History,
} from "lucide-react";
import { BookingHoverCard } from "./BookingHoverCard";

interface TaskTableProps {
    tasks: IWorkflowStep[];
    onToggle: (task: IWorkflowStep) => void;
    employees: IEmployee[];
    isAdmin: boolean;
    onAssign: (taskId: string, empId: string) => void;
    onHistory: (task: IWorkflowStep) => void;
    emptyMessage?: string;
}

export function TaskTable({
    tasks,
    onToggle,
    employees,
    isAdmin,
    onAssign,
    onHistory,
    emptyMessage,
}: TaskTableProps) {
    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const getDueDate = (task: IWorkflowStep): Date | null => {
        const raw = task.dueDate || task.config?.dueDate || task.config?.deadline;
        if (raw) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) return d;
        }
        return null;
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 border border-dashed rounded-xl text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-semibold text-foreground">
                        All Caught Up!
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {emptyMessage ||
                            "No tasks match your current filters. Great work maintaining operational momentum!"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[50px] text-center align-middle"></TableHead>
                        <TableHead className="min-w-[280px] align-middle">Task Details</TableHead>
                        <TableHead className="w-[180px] align-middle">Workflow</TableHead>
                        <TableHead className="w-[120px] align-middle">Priority</TableHead>
                        <TableHead className="w-[100px] align-middle">Type</TableHead>
                        <TableHead className="w-[180px] align-middle">Assignee</TableHead>
                        <TableHead className="w-[115px] align-middle">Created</TableHead>
                        <TableHead className="w-[130px] align-middle">Due Date</TableHead>
                        <TableHead className="w-[70px] text-right align-middle pr-4">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => {
                        const isCompleted = task.status === "completed";

                        return (
                            <TableRow
                                key={task.id}
                                className={`group transition-colors ${
                                    isCompleted
                                        ? "bg-muted/15 opacity-70 hover:opacity-100"
                                        : "hover:bg-muted/40"
                                }`}
                            >
                                {/* Checkbox - Vertically Centered */}
                                <TableCell className="text-center py-3 pl-4 pr-1 align-middle">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            id={`table-${task.id}`}
                                            checked={isCompleted}
                                            onCheckedChange={() => onToggle(task)}
                                            className="h-4 w-4 rounded transition-all data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />
                                    </div>
                                </TableCell>

                                {/* Task Label & Description - Vertically Centered */}
                                <TableCell className="py-3 pr-4 align-middle">
                                    <div className="space-y-0.5">
                                        <label
                                            htmlFor={`table-${task.id}`}
                                            className={`text-sm font-semibold cursor-pointer block leading-tight ${
                                                isCompleted
                                                    ? "line-through text-muted-foreground"
                                                    : "text-foreground group-hover:text-primary transition-colors"
                                            }`}
                                        >
                                            {task.label}
                                        </label>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Workflow with Sidebar Tickets icon, Booking text removed & Hover Card */}
                                <TableCell className="py-3 align-middle">
                                    <BookingHoverCard workflow={task.workflow} />
                                </TableCell>

                                {/* Priority / Mandatory - Vertically Centered */}
                                <TableCell className="py-3 align-middle">
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
                                </TableCell>

                                {/* Type - Vertically Centered */}
                                <TableCell className="py-3 align-middle">
                                    <Badge
                                        variant="secondary"
                                        className="h-5 px-1.5 text-[10px] capitalize font-normal text-muted-foreground bg-muted/60"
                                    >
                                        {task.type}
                                    </Badge>
                                </TableCell>

                                {/* Assignee - Vertically Centered */}
                                <TableCell className="py-3 align-middle">
                                    {isAdmin ? (
                                        <Select
                                            value={task.assignedToId || "unassigned"}
                                            onValueChange={(val) =>
                                                onAssign(task.id, val)
                                            }
                                        >
                                            <SelectTrigger className="h-7 text-xs border-dashed border-border/80 bg-background hover:bg-muted/50 w-[160px] rounded-md gap-1.5 px-2">
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
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Avatar className="h-4 w-4 shrink-0 text-[9px]">
                                                <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                                                    {getInitials(
                                                        task.assignedTo?.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">
                                                {task.assignedTo?.name ||
                                                    "Unassigned"}
                                            </span>
                                        </div>
                                    )}
                                </TableCell>

                                {/* Created Date - Vertically Centered */}
                                <TableCell className="py-3 align-middle">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex items-center text-xs text-muted-foreground gap-1 cursor-default">
                                                    <Clock className="h-3 w-3 shrink-0 opacity-60" />
                                                    {new Date(
                                                        task.createdAt,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year:
                                                                new Date(
                                                                    task.createdAt,
                                                                ).getFullYear() !==
                                                                new Date().getFullYear()
                                                                    ? "numeric"
                                                                    : undefined,
                                                        },
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Created on{" "}
                                                {new Date(
                                                    task.createdAt,
                                                ).toLocaleString()}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>

                                {/* Due Date - Vertically Centered */}
                                <TableCell className="py-3 align-middle">
                                    {(() => {
                                        const dueDate = getDueDate(task);
                                        const now = new Date();
                                        const isOverdue =
                                            dueDate &&
                                            !isCompleted &&
                                            dueDate.getTime() <
                                                new Date().setHours(0, 0, 0, 0);
                                        const isDueToday =
                                            dueDate &&
                                            !isCompleted &&
                                            dueDate.toDateString() ===
                                                now.toDateString();

                                        if (dueDate) {
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className={`inline-flex items-center text-xs font-medium gap-1 px-2 py-0.5 rounded-md ${
                                                                    isOverdue
                                                                        ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                                                                        : isDueToday
                                                                          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                                                                          : "text-foreground/80 bg-muted/40"
                                                                }`}
                                                            >
                                                                {isOverdue ? (
                                                                    <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                                                                ) : (
                                                                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                )}
                                                                {dueDate.toLocaleDateString(
                                                                    undefined,
                                                                    {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year:
                                                                            dueDate.getFullYear() !==
                                                                            now.getFullYear()
                                                                                ? "numeric"
                                                                                : undefined,
                                                                    },
                                                                )}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {isOverdue
                                                                ? `Overdue! Was due ${dueDate.toLocaleDateString()}`
                                                                : isDueToday
                                                                  ? "Due Today"
                                                                  : `Due on ${dueDate.toLocaleDateString()}`}
                                                            <br />
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Updated:{" "}
                                                                {new Date(
                                                                    task.updatedAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        }

                                        return (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="inline-flex items-center text-xs text-muted-foreground/60 gap-1 cursor-default">
                                                            <Clock className="h-3 w-3 shrink-0 opacity-40" />
                                                            <span>-</span>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        No due date set
                                                        <br />
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Last updated:{" "}
                                                            {new Date(
                                                                task.updatedAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        );
                                    })()}
                                </TableCell>

                                {/* Actions - Vertically Centered */}
                                <TableCell className="py-3 text-right align-middle pr-4">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onHistory(task)}
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                                                >
                                                    <History className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Activity Log</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
