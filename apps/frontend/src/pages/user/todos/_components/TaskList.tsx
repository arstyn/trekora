import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import { Check } from "lucide-react";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
    tasks: IWorkflowStep[];
    onToggle: (task: IWorkflowStep) => void;
    employees: IEmployee[];
    isAdmin: boolean;
    onAssign: (taskId: string, empId: string) => void;
    onHistory: (task: IWorkflowStep) => void;
    emptyMessage?: string;
}

export function TaskList({
    tasks,
    onToggle,
    employees,
    isAdmin,
    onAssign,
    onHistory,
    emptyMessage,
}: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl">
                <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full mb-4">
                    <Check className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">All Clear</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                    {emptyMessage || "No tasks match your criteria."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    employees={employees}
                    isAdmin={isAdmin}
                    onAssign={onAssign}
                    onHistory={onHistory}
                />
            ))}
        </div>
    );
}
