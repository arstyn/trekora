import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import { TaskCard } from "./TaskCard";
import { TaskTable } from "./TaskTable";

interface TaskListProps {
    tasks: IWorkflowStep[];
    viewMode?: "table" | "card";
    onToggle: (task: IWorkflowStep) => void;
    employees: IEmployee[];
    isAdmin: boolean;
    onAssign: (taskId: string, empId: string) => void;
    onHistory: (task: IWorkflowStep) => void;
    emptyMessage?: string;
}

export function TaskList({
    tasks,
    viewMode = "table",
    onToggle,
    employees,
    isAdmin,
    onAssign,
    onHistory,
    emptyMessage,
}: TaskListProps) {
    if (viewMode === "card") {
        if (tasks.length === 0) {
            return (
                <TaskTable
                    tasks={tasks}
                    onToggle={onToggle}
                    employees={employees}
                    isAdmin={isAdmin}
                    onAssign={onAssign}
                    onHistory={onHistory}
                    emptyMessage={emptyMessage}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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

    // Default: Table structure
    return (
        <TaskTable
            tasks={tasks}
            onToggle={onToggle}
            employees={employees}
            isAdmin={isAdmin}
            onAssign={onAssign}
            onHistory={onHistory}
            emptyMessage={emptyMessage}
        />
    );
}
