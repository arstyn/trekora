import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Search, LayoutList } from "lucide-react";
import type { IEmployee } from "@/types/employee.types";

interface TodoFiltersProps {
    isAdmin: boolean;
    filterStatus: string;
    setFilterStatus: (val: string) => void;
    filterType: string;
    setFilterType: (val: string) => void;
    filterWorkflow: string;
    setFilterWorkflow: (val: string) => void;
    filterEmployee: string;
    setFilterEmployee: (val: string) => void;
    workflowOptions: Array<{ id: string; name: string }>;
    employees: IEmployee[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    onReset: () => void;
}

export function TodoFilters({
    isAdmin,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterWorkflow,
    setFilterWorkflow,
    filterEmployee,
    setFilterEmployee,
    workflowOptions,
    employees,
    searchQuery,
    setSearchQuery,
    onReset,
}: TodoFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Workspace
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <LayoutList className="h-4 w-4" />
                    {isAdmin
                        ? "Manage organization workflows and team productivity."
                        : "Focus on your assigned tasks for today."}
                </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                    <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                    >
                        <SelectTrigger className="w-[120px] h-9 rounded-full bg-muted/30 border-none">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[120px] h-9 rounded-full bg-muted/30 border-none">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="individual">
                                Individual
                            </SelectItem>
                            <SelectItem value="common">Common</SelectItem>
                        </SelectContent>
                    </Select>

                    {workflowOptions.length > 0 && (
                        <Select
                            value={filterWorkflow}
                            onValueChange={setFilterWorkflow}
                        >
                            <SelectTrigger className="w-[150px] h-9 rounded-full bg-muted/30 border-none">
                                <SelectValue placeholder="Workflow" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Workflows
                                </SelectItem>
                                {workflowOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {isAdmin && employees.length > 0 && (
                        <Select
                            value={filterEmployee}
                            onValueChange={setFilterEmployee}
                        >
                            <SelectTrigger className="w-[150px] h-9 rounded-full bg-muted/30 border-none">
                                <SelectValue placeholder="Employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Employees
                                </SelectItem>
                                <SelectItem value="unassigned">
                                    Unassigned
                                </SelectItem>
                                {employees
                                    .filter((e) => e.userId)
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
                    )}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Find a task..."
                        className="pl-10 h-10 rounded-full bg-muted/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 shrink-0"
                    onClick={onReset}
                >
                    <Clock className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
