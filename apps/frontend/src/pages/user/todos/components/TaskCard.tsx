import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import { Clock, HistoryIcon, LayoutList, User } from "lucide-react";

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
    return (
        <Card
            key={task.id}
            className={`group border-l-4 transition-all hover:shadow-md ${
                task.status === "completed"
                    ? "border-emerald-500 opacity-75"
                    : "border-amber-500"
            }`}
        >
            <CardContent className="px-5 flex items-start gap-4">
                <Checkbox
                    id={task.id}
                    checked={task.status === "completed"}
                    onCheckedChange={() => onToggle(task)}
                    className="mt-1 h-5 w-5 rounded-full border-2"
                />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <label
                                htmlFor={task.id}
                                className={`font-semibold text-lg leading-none cursor-pointer ${
                                    task.status === "completed"
                                        ? "line-through text-muted-foreground"
                                        : ""
                                }`}
                            >
                                {task.label}
                            </label>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description || "No description provided."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge
                                variant={
                                    task.isMandatory ? "destructive" : "outline"
                                }
                                className="flex gap-1 items-center"
                            >
                                {task.isMandatory && (
                                    <span className="h-1 w-1 rounded-full bg-white mr-1" />
                                )}
                                {task.isMandatory ? "Critical" : "Standard"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {task.type}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onHistory(task)}
                                className="bg-muted/30 rounded-lg hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                            >
                                <HistoryIcon className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-3 border-t">
                        {isAdmin ? (
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                <Select
                                    value={task.assignedToId || "unassigned"}
                                    onValueChange={(val) =>
                                        onAssign(task.id, val)
                                    }
                                >
                                    <SelectTrigger className="h-7 text-xs border-none bg-muted/50 w-[160px] rounded-full">
                                        <SelectValue placeholder="Assign To" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">
                                            Unassigned
                                        </SelectItem>
                                        {employees
                                            .filter((emp) => emp.userId)
                                            .map((emp) => (
                                                <SelectItem
                                                    key={emp.id}
                                                    value={emp.userId!}
                                                >
                                                    {emp.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                {task.assignedTo?.name || "Unassigned"}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <LayoutList className="h-3.5 w-3.5" />
                            Workflow:{" "}
                            <span className="text-primary font-medium tracking-tight">
                                {task.workflow?.name || "General"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                            <Clock className="h-3.5 w-3.5" />
                            Updated:{" "}
                            {new Date(task.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
