import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import workflowService from "@/services/workflow.service";
import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import {
    ListTodo,
    RefreshCw,
    Shield,
    UserCheck,
    Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskHistoryDialog } from "./_components/TaskHistoryDialog";
import { TaskList } from "./_components/TaskList";
import { TodoFilters } from "./_components/TodoFilters";
import { TodoSummary } from "./_components/TodoSummary";

export default function TodosPage() {
    const [userData, setUserData] = useState<IEmployee | null>(null);
    const [tasks, setTasks] = useState<IWorkflowStep[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("my-tasks");
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    // Filters state
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterWorkflow, setFilterWorkflow] = useState<string>("all");
    const [filterEmployee, setFilterEmployee] = useState<string>("all");
    const [filterMandatory, setFilterMandatory] = useState<string>("all");

    // History state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<IWorkflowStep | null>(null);
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

    const fetchData = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const profile = userData || (await fetchProfileData());
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
                if (employees.length === 0) {
                    await fetchEmployees();
                }
            } else {
                const myTasks = await workflowService.getAssignedSteps();
                setTasks(myTasks);
            }

            if (isManualRefresh) {
                toast.success("Tasks refreshed");
            }
        } catch (error) {
            console.error("Error fetching todos:", error);
            toast.error("Failed to load todos");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleTask = async (task: IWorkflowStep) => {
        try {
            const newStatus =
                task.status === "completed" ? "pending" : "completed";

            // Optimistic update
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === task.id ? { ...t, status: newStatus } : t,
                ),
            );

            await workflowService.updateStep(task.id, { status: newStatus });

            toast.success(
                newStatus === "completed"
                    ? `Task marked complete: "${task.label}"`
                    : `Task reopened: "${task.label}"`,
            );

            if (isAdmin) {
                const stats = await workflowService.getSummary();
                setSummary(stats);
            }
        } catch (error) {
            // Roll back on failure
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
            );
            toast.error("Failed to update task");
        }
    };

    const handleAssignTask = async (taskId: string, employeeId: string) => {
        try {
            const targetEmployeeId =
                employeeId === "unassigned" ? null : employeeId;

            const assignedTo = targetEmployeeId
                ? employees.find((e) => e.userId === targetEmployeeId)
                : null;

            // Optimistic update
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

            await workflowService.updateStep(taskId, {
                assignedToId: targetEmployeeId || undefined,
            });

            toast.success(
                targetEmployeeId
                    ? `Assigned to ${assignedTo?.name || "employee"}`
                    : "Task unassigned",
            );

            if (isAdmin) {
                const stats = await workflowService.getSummary();
                setSummary(stats);
            }
        } catch (error) {
            toast.error("Failed to assign task");
            fetchData();
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
                const cleanName =
                    t.workflow.name
                        .replace(/^booking\s*[:-]?\s*/i, "")
                        .replace(/\s*flow$/i, "")
                        .trim() || t.workflow.name;
                unique.set(t.workflow.id, cleanName);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [tasks]);

    const baseFilteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                task.label.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.assignedTo?.name.toLowerCase().includes(query) ||
                task.workflow?.name.toLowerCase().includes(query);

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
                    : task.assignedToId === filterEmployee ||
                    task.assignedTo?.name === filterEmployee);
            const matchesMandatory =
                filterMandatory === "all" ||
                (filterMandatory === "mandatory"
                    ? task.isMandatory
                    : !task.isMandatory);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesWorkflow &&
                matchesEmployee &&
                matchesMandatory
            );
        });
    }, [
        tasks,
        searchQuery,
        filterStatus,
        filterType,
        filterWorkflow,
        filterEmployee,
        filterMandatory,
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

    const currentTabTasks = useMemo(() => {
        if (activeTab === "my-tasks") {
            return baseFilteredTasks.filter(
                (t) => t.assignedToId === userData?.userId,
            );
        } else if (activeTab === "unassigned") {
            return baseFilteredTasks.filter((t) => !t.assignedToId);
        }
        return baseFilteredTasks;
    }, [baseFilteredTasks, activeTab, userData]);

    const handleResetFilters = () => {
        setFilterStatus("all");
        setFilterType("all");
        setFilterWorkflow("all");
        setFilterEmployee("all");
        setFilterMandatory("all");
        setSearchQuery("");
    };

    return (
        <div className="w-full p-4 sm:p-6 space-y-6">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <ListTodo className="h-7 w-7 text-primary" />
                        Tasks & Workflows
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {isAdmin
                            ? "Manage operational workflow steps, assignments, and team execution."
                            : "Your assigned operational tasks and action items for today."}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="text-xs h-9 gap-1.5"
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            {summary ? (
                <TodoSummary
                    summary={summary}
                    selectedEmployee={filterEmployee}
                    onSelectEmployee={(empName) =>
                        setFilterEmployee((prev) =>
                            prev === empName ? "all" : empName,
                        )
                    }
                />
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : null}

            {/* Main Task Workspace (Full Width) */}
            <div className="space-y-4">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3">
                        <TabsList className="bg-muted/50 p-1 rounded-lg h-9 self-start lg:self-auto">
                            <TabsTrigger
                                value="my-tasks"
                                className="rounded-md px-3 text-xs gap-1.5 h-7"
                            >
                                <UserCheck className="h-3.5 w-3.5" />
                                My Tasks
                                <Badge
                                    variant="secondary"
                                    className="ml-1 px-1.5 py-0 h-4 text-[10px] font-mono rounded-full bg-background"
                                >
                                    {tabCounts["my-tasks"]}
                                </Badge>
                            </TabsTrigger>

                            {isAdmin && (
                                <>
                                    <TabsTrigger
                                        value="unassigned"
                                        className="rounded-md px-3 text-xs gap-1.5 h-7"
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                        Unassigned
                                        <Badge
                                            variant="secondary"
                                            className="ml-1 px-1.5 py-0 h-4 text-[10px] font-mono rounded-full bg-background"
                                        >
                                            {tabCounts.unassigned}
                                        </Badge>
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="all-tasks"
                                        className="rounded-md px-3 text-xs gap-1.5 h-7"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        All Team Tasks
                                        <Badge
                                            variant="secondary"
                                            className="ml-1 px-1.5 py-0 h-4 text-[10px] font-mono rounded-full bg-background"
                                        >
                                            {tabCounts["all-tasks"]}
                                        </Badge>
                                    </TabsTrigger>
                                </>
                            )}
                        </TabsList>

                        {/* Search, Filter Popover & Table View Switcher placed right here */}
                        <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
                            <TodoFilters
                                isAdmin={isAdmin}
                                employees={employees}
                                filterEmployee={filterEmployee}
                                filterStatus={filterStatus}
                                filterType={filterType}
                                filterWorkflow={filterWorkflow}
                                filterMandatory={filterMandatory}
                                searchQuery={searchQuery}
                                viewMode={viewMode}
                                setFilterEmployee={setFilterEmployee}
                                setFilterStatus={setFilterStatus}
                                setFilterType={setFilterType}
                                setFilterWorkflow={setFilterWorkflow}
                                setFilterMandatory={setFilterMandatory}
                                setSearchQuery={setSearchQuery}
                                setViewMode={setViewMode}
                                workflowOptions={workflowOptions}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </div>

                    {/* Loading Skeleton */}
                    {loading && !tasks.length ? (
                        <div className="space-y-2 pt-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton
                                    key={i}
                                    className="h-14 w-full rounded-lg"
                                />
                            ))}
                        </div>
                    ) : (
                        <>
                            <TabsContent value="my-tasks" className="pt-2 m-0">
                                <TaskList
                                    tasks={currentTabTasks}
                                    viewMode={viewMode}
                                    onToggle={handleToggleTask}
                                    employees={employees}
                                    isAdmin={isAdmin}
                                    onAssign={handleAssignTask}
                                    onHistory={handleViewHistory}
                                    emptyMessage="Everything is done! You have no pending tasks assigned to you."
                                />
                            </TabsContent>

                            {isAdmin && (
                                <>
                                    <TabsContent
                                        value="unassigned"
                                        className="pt-2 m-0"
                                    >
                                        <TaskList
                                            tasks={currentTabTasks}
                                            viewMode={viewMode}
                                            onToggle={handleToggleTask}
                                            employees={employees}
                                            isAdmin={isAdmin}
                                            onAssign={handleAssignTask}
                                            onHistory={handleViewHistory}
                                            emptyMessage="Great news! There are no unassigned workflow steps currently."
                                        />
                                    </TabsContent>

                                    <TabsContent
                                        value="all-tasks"
                                        className="pt-2 m-0"
                                    >
                                        <TaskList
                                            tasks={currentTabTasks}
                                            viewMode={viewMode}
                                            onToggle={handleToggleTask}
                                            employees={employees}
                                            isAdmin={isAdmin}
                                            onAssign={handleAssignTask}
                                            onHistory={handleViewHistory}
                                            emptyMessage="No tasks found matching your search and filter criteria."
                                        />
                                    </TabsContent>
                                </>
                            )}
                        </>
                    )}
                </Tabs>
            </div>

            {/* History Audit Modal */}
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
