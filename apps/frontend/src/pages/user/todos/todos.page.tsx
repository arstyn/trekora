import DataTableFooter from "@/components/data-table-footer";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
    const [workflowOptions, setWorkflowOptions] = useState<
        Array<{ id: string; name: string }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("my-tasks");
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    // Pagination state
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialLimit = parseInt(searchParams.get("limit") || "10", 10);
    const [pagination, setPagination] = useState({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 1,
    });

    // Tab counts state
    const [tabCounts, setTabCounts] = useState({
        "my-tasks": 0,
        unassigned: 0,
        "all-tasks": 0,
    });

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

    const isFirstRender = useRef(true);

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

    const loadTasks = async (
        targetPage: number = pagination.page,
        targetLimit: number = pagination.limit,
        search: string = searchQuery,
        isManualRefresh = false,
    ) => {
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

            const filterParams = {
                page: targetPage,
                limit: targetLimit,
                search: search.trim() || undefined,
                status: filterStatus !== "all" ? filterStatus : undefined,
                type: filterType !== "all" ? filterType : undefined,
                workflowId: filterWorkflow !== "all" ? filterWorkflow : undefined,
                assignedToId: filterEmployee !== "all" ? filterEmployee : undefined,
                isMandatory: filterMandatory !== "all" ? filterMandatory : undefined,
                tab: activeTab,
            };

            if (isUserAdmin) {
                const [stepRes, stats, counts, wfList] = await Promise.all([
                    workflowService.getAllSteps(filterParams),
                    workflowService.getSummary(),
                    workflowService.getStepCounts(),
                    workflowOptions.length === 0
                        ? workflowService.getWorkflowsList()
                        : Promise.resolve(null),
                ]);

                if (stepRes && "pagination" in stepRes) {
                    setTasks(stepRes.data);
                    setPagination(stepRes.pagination);
                } else if (Array.isArray(stepRes)) {
                    setTasks(stepRes);
                    setPagination({
                        page: targetPage,
                        limit: targetLimit,
                        total: stepRes.length,
                        totalPages: Math.max(1, Math.ceil(stepRes.length / targetLimit)),
                    });
                }

                setSummary(stats);
                if (counts) {
                    setTabCounts({
                        "my-tasks": counts.myTasks,
                        unassigned: counts.unassigned,
                        "all-tasks": counts.allTasks,
                    });
                }
                if (wfList) {
                    const cleaned = wfList.map((w) => ({
                        id: w.id,
                        name:
                            w.name
                                .replace(/^booking\s*[:-]?\s*/i, "")
                                .replace(/\s*flow$/i, "")
                                .trim() || w.name,
                    }));
                    setWorkflowOptions(cleaned);
                }
                if (employees.length === 0) {
                    await fetchEmployees();
                }
            } else {
                const stepRes = await workflowService.getAssignedSteps(filterParams);
                if (stepRes && "pagination" in stepRes) {
                    setTasks(stepRes.data);
                    setPagination(stepRes.pagination);
                    setTabCounts((prev) => ({
                        ...prev,
                        "my-tasks": stepRes.pagination.total,
                    }));
                } else if (Array.isArray(stepRes)) {
                    setTasks(stepRes);
                    setPagination({
                        page: targetPage,
                        limit: targetLimit,
                        total: stepRes.length,
                        totalPages: Math.max(1, Math.ceil(stepRes.length / targetLimit)),
                    });
                    setTabCounts((prev) => ({
                        ...prev,
                        "my-tasks": stepRes.length,
                    }));
                }
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

    // Debounced search and filter watcher
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadTasks(initialPage, initialLimit, searchQuery);
            return;
        }

        const timer = setTimeout(() => {
            setPagination((prev) => ({ ...prev, page: 1 }));
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", "1");
                return next;
            });
            loadTasks(1, pagination.limit, searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [
        searchQuery,
        filterStatus,
        filterType,
        filterWorkflow,
        filterEmployee,
        filterMandatory,
        activeTab,
    ]);

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
                const [stats, counts] = await Promise.all([
                    workflowService.getSummary(),
                    workflowService.getStepCounts(),
                ]);
                setSummary(stats);
                if (counts) {
                    setTabCounts({
                        "my-tasks": counts.myTasks,
                        unassigned: counts.unassigned,
                        "all-tasks": counts.allTasks,
                    });
                }
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
                const [stats, counts] = await Promise.all([
                    workflowService.getSummary(),
                    workflowService.getStepCounts(),
                ]);
                setSummary(stats);
                if (counts) {
                    setTabCounts({
                        "my-tasks": counts.myTasks,
                        unassigned: counts.unassigned,
                        "all-tasks": counts.allTasks,
                    });
                }
            }
        } catch (error) {
            toast.error("Failed to assign task");
            loadTasks(pagination.page, pagination.limit, searchQuery);
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

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", newPage.toString());
            return next;
        });
        loadTasks(newPage, pagination.limit, searchQuery);
    };

    const handleLimitChange = (newLimit: number) => {
        setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("limit", newLimit.toString());
            next.set("page", "1");
            return next;
        });
        loadTasks(1, newLimit, searchQuery);
    };

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setPagination((prev) => ({ ...prev, page: 1 }));
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", "1");
            return next;
        });
    };

    const handleResetFilters = () => {
        setFilterStatus("all");
        setFilterType("all");
        setFilterWorkflow("all");
        setFilterEmployee("all");
        setFilterMandatory("all");
        setSearchQuery("");
        setPagination((prev) => ({ ...prev, page: 1 }));
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", "1");
            return next;
        });
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
                        onClick={() =>
                            loadTasks(
                                pagination.page,
                                pagination.limit,
                                searchQuery,
                                true,
                            )
                        }
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
                    onValueChange={handleTabChange}
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
                                    tasks={tasks}
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
                                            tasks={tasks}
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
                                            tasks={tasks}
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

                            {/* Standard Pagination & Rows Per Page Footer */}
                            {pagination.total > 0 && (
                                <div className="pt-2">
                                    <DataTableFooter
                                        page={pagination.page}
                                        limit={pagination.limit}
                                        total={pagination.total}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                        onLimitChange={handleLimitChange}
                                        entityName="tasks"
                                    />
                                </div>
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
