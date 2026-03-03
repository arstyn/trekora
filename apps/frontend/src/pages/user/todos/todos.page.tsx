import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import workflowService, {
    type IWorkflowStep,
} from "@/services/workflow.service";
import type { IEmployee } from "@/types/employee.types";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskHistoryDialog } from "./components/TaskHistoryDialog";
import { TaskList } from "./components/TaskList";
import { TodoAnalytics } from "./components/TodoAnalytics";
import { TodoFilters } from "./components/TodoFilters";
import { TodoSummary } from "./components/TodoSummary";

export default function TodosPage() {
    const [userData, setUserData] = useState<IEmployee | null>(null);
    const [tasks, setTasks] = useState<IWorkflowStep[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("my-tasks");

    // Filters state
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterWorkflow, setFilterWorkflow] = useState<string>("all");
    const [filterEmployee, setFilterEmployee] = useState<string>("all");

    // History state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<IWorkflowStep | null>(
        null,
    );
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const isAdmin = useMemo(() => {
        if (!userData?.permissionSets) return false;
        return userData.permissionSets.some(
            (ps) =>
                ps.name.toLowerCase().includes("admin") ||
                ps.name.toLowerCase().includes("manager"),
        );
    }, [userData]);

    const fetchProfileData = async () => {
        try {
            const res = await axiosInstance.get<IEmployee>(`/employee/profile`);
            setUserData(res.data);
            return res.data;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get<IEmployee[]>("/employee");
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const profile = await fetchProfileData();
            if (!profile) return;

            const isUserAdmin = profile.permissionSets?.some(
                (ps) =>
                    ps.name.toLowerCase().includes("admin") ||
                    ps.name.toLowerCase().includes("manager"),
            );

            if (isUserAdmin) {
                const [allTasks, stats] = await Promise.all([
                    workflowService.getAllSteps(),
                    workflowService.getSummary(),
                ]);
                setTasks(allTasks);
                setSummary(stats);
                await fetchEmployees();
            } else {
                const myTasks = await workflowService.getAssignedSteps();
                setTasks(myTasks);
            }
        } catch (error) {
            console.error("Error fetching todos:", error);
            toast.error("Failed to load todos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleTask = async (task: IWorkflowStep) => {
        try {
            const newStatus =
                task.status === "completed" ? "pending" : "completed";
            await workflowService.updateStep(task.id, { status: newStatus });

            setTasks((prev) =>
                prev.map((t) =>
                    t.id === task.id ? { ...t, status: newStatus } : t,
                ),
            );

            toast.success(
                newStatus === "completed" ? "Task completed!" : "Task reopened",
            );

            if (isAdmin) {
                const stats = await workflowService.getSummary();
                setSummary(stats);
            }
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const handleAssignTask = async (taskId: string, employeeId: string) => {
        try {
            const targetEmployeeId =
                employeeId === "unassigned" ? null : employeeId;

            await workflowService.updateStep(taskId, {
                assignedToId: targetEmployeeId || undefined,
            });

            const assignedTo = targetEmployeeId
                ? employees.find((e) => e.userId === targetEmployeeId)
                : null;

            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId
                        ? {
                              ...t,
                              assignedToId: targetEmployeeId || undefined,
                              assignedTo: assignedTo
                                  ? {
                                        id: assignedTo.id,
                                        name: assignedTo.name,
                                        email: assignedTo.email || "",
                                    }
                                  : undefined,
                          }
                        : t,
                ),
            );

            toast.success(
                targetEmployeeId
                    ? "Task assigned successfully"
                    : "Task unassigned",
            );

            if (isAdmin) {
                const stats = await workflowService.getSummary();
                setSummary(stats);
            }
        } catch (error) {
            toast.error("Failed to assign task");
        }
    };

    const handleViewHistory = async (task: IWorkflowStep) => {
        setSelectedTask(task);
        setIsHistoryOpen(true);
        setLoadingHistory(true);
        try {
            const history = await workflowService.getStepHistory(task.id);
            setHistoryLogs(history);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const workflowOptions = useMemo(() => {
        const unique = new Map();
        tasks.forEach((t) => {
            if (t.workflow) {
                unique.set(t.workflow.id, t.workflow.name);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [tasks]);

    const baseFilteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                task.assignedTo?.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesStatus =
                filterStatus === "all" || task.status === filterStatus;
            const matchesType =
                filterType === "all" || task.type === filterType;
            const matchesWorkflow =
                filterWorkflow === "all" || task.workflowId === filterWorkflow;
            const matchesEmployee =
                filterEmployee === "all" ||
                (filterEmployee === "unassigned"
                    ? !task.assignedToId
                    : task.assignedToId === filterEmployee);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesWorkflow &&
                matchesEmployee
            );
        });
    }, [
        tasks,
        searchQuery,
        filterStatus,
        filterType,
        filterWorkflow,
        filterEmployee,
    ]);

    const tabCounts = useMemo(() => {
        return {
            "my-tasks": baseFilteredTasks.filter(
                (t) => t.assignedToId === userData?.userId,
            ).length,
            unassigned: baseFilteredTasks.filter((t) => !t.assignedToId).length,
            "all-tasks": baseFilteredTasks.length,
        };
    }, [baseFilteredTasks, userData]);

    const filteredTasks = useMemo(() => {
        if (activeTab === "my-tasks") {
            return baseFilteredTasks.filter(
                (t) => t.assignedToId === userData?.userId,
            );
        } else if (activeTab === "unassigned") {
            return baseFilteredTasks.filter((t) => !t.assignedToId);
        }
        return baseFilteredTasks;
    }, [baseFilteredTasks, activeTab, userData]);

    const chartData = useMemo(() => {
        if (!summary) return [];
        return [
            { name: "Completed", value: summary.completed, color: "#10b981" },
            { name: "Pending", value: summary.pending, color: "#f59e0b" },
            { name: "Skipped", value: summary.skipped, color: "#6b7280" },
        ];
    }, [summary]);

    if (loading && !tasks.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                    Loading your workspace...
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <TodoFilters
                isAdmin={isAdmin}
                employees={employees}
                filterEmployee={filterEmployee}
                filterStatus={filterStatus}
                filterType={filterType}
                filterWorkflow={filterWorkflow}
                searchQuery={searchQuery}
                setFilterEmployee={setFilterEmployee}
                setFilterStatus={setFilterStatus}
                setFilterType={setFilterType}
                setFilterWorkflow={setFilterWorkflow}
                setSearchQuery={setSearchQuery}
                workflowOptions={workflowOptions}
                onReset={() => {
                    setFilterStatus("all");
                    setFilterType("all");
                    setFilterWorkflow("all");
                    setFilterEmployee("all");
                    setSearchQuery("");
                    fetchData();
                }}
            />

            {isAdmin && summary && <TodoSummary summary={summary} />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div
                    className={`${isAdmin ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}
                >
                    <Tabs defaultValue="my-tasks" onValueChange={setActiveTab}>
                        <TabsList className="grid w-fit grid-cols-3 bg-muted/40 p-1 rounded-lg">
                            <TabsTrigger
                                value="my-tasks"
                                className="rounded-md px-4 gap-2"
                            >
                                My Tasks
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 rounded-full text-[10px] h-4 min-w-[20px] justify-center bg-muted/50"
                                >
                                    {tabCounts["my-tasks"]}
                                </Badge>
                            </TabsTrigger>
                            {isAdmin && (
                                <>
                                    <TabsTrigger
                                        value="unassigned"
                                        className="rounded-md px-4 gap-2"
                                    >
                                        Unassigned
                                        <Badge
                                            variant="secondary"
                                            className="px-1.5 py-0 rounded-full text-[10px] h-4 min-w-[20px] justify-center bg-muted/50"
                                        >
                                            {tabCounts.unassigned}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="all-tasks"
                                        className="rounded-md px-4 gap-2"
                                    >
                                        All Team Tasks
                                        <Badge
                                            variant="secondary"
                                            className="px-1.5 py-0 rounded-full text-[10px] h-4 min-w-[20px] justify-center bg-muted/50"
                                        >
                                            {tabCounts["all-tasks"]}
                                        </Badge>
                                    </TabsTrigger>
                                </>
                            )}
                        </TabsList>

                        <TabsContent value="my-tasks" className="mt-6">
                            <TaskList
                                tasks={filteredTasks}
                                onToggle={handleToggleTask}
                                employees={employees}
                                isAdmin={isAdmin}
                                onAssign={handleAssignTask}
                                onHistory={handleViewHistory}
                                emptyMessage="Everything's done! You have no pending tasks assigned to you."
                            />
                        </TabsContent>

                        {isAdmin && (
                            <>
                                <TabsContent
                                    value="unassigned"
                                    className="mt-6"
                                >
                                    <TaskList
                                        tasks={filteredTasks}
                                        onToggle={handleToggleTask}
                                        employees={employees}
                                        isAdmin={isAdmin}
                                        onAssign={handleAssignTask}
                                        onHistory={handleViewHistory}
                                        emptyMessage="No unassigned tasks found."
                                    />
                                </TabsContent>
                                <TabsContent value="all-tasks" className="mt-6">
                                    <TaskList
                                        tasks={filteredTasks}
                                        onToggle={handleToggleTask}
                                        employees={employees}
                                        isAdmin={isAdmin}
                                        onAssign={handleAssignTask}
                                        onHistory={handleViewHistory}
                                    />
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                </div>

                {isAdmin && (
                    <TodoAnalytics chartData={chartData} summary={summary} />
                )}
            </div>

            <TaskHistoryDialog
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                selectedTask={selectedTask}
                loadingHistory={loadingHistory}
                historyLogs={historyLogs}
            />
        </div>
    );
}
