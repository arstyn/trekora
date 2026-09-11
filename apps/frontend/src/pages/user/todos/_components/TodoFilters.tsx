import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { IEmployee } from "@/types/employee.types";
import {
    Filter,
    LayoutGrid,
    RotateCcw,
    Search,
    TableProperties,
    X,
} from "lucide-react";
import { useState } from "react";

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
    filterMandatory: string;
    setFilterMandatory: (val: string) => void;
    workflowOptions: Array<{ id: string; name: string }>;
    employees: IEmployee[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    viewMode: "table" | "card";
    setViewMode: (val: "table" | "card") => void;
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
    filterMandatory,
    setFilterMandatory,
    workflowOptions,
    employees,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    onReset,
}: TodoFiltersProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const hasActiveFilters =
        filterStatus !== "all" ||
        filterType !== "all" ||
        filterWorkflow !== "all" ||
        filterEmployee !== "all" ||
        filterMandatory !== "all";

    const activeFilterCount = [
        filterStatus !== "all",
        filterType !== "all",
        filterWorkflow !== "all",
        filterEmployee !== "all",
        filterMandatory !== "all",
    ].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Box */}
            <div className="relative w-48 sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    className="pl-8 pr-7 h-8 text-xs rounded-md bg-background border-border/80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Filter Popup Button */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={hasActiveFilters ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 px-2.5 text-xs rounded-md gap-1.5 border-border/80"
                    >
                        <Filter className="h-3.5 w-3.5 text-primary" />
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="default"
                                className="h-4 min-w-[16px] px-1 text-[9px] font-mono rounded-full justify-center ml-0.5"
                            >
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className="w-80 p-4 space-y-4 shadow-xl border-border/80"
                >
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" />
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Filter Tasks
                            </h4>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3 text-xs">
                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                                Status
                            </Label>
                            <Select
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-md w-full">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="skipped">Skipped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority / Mandatory */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                                Priority
                            </Label>
                            <Select
                                value={filterMandatory}
                                onValueChange={setFilterMandatory}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-md w-full">
                                    <SelectValue placeholder="All Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="mandatory">Mandatory Only</SelectItem>
                                    <SelectItem value="standard">Standard Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                                Task Type
                            </Label>
                            <Select
                                value={filterType}
                                onValueChange={setFilterType}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-md w-full">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="common">Common</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Workflow */}
                        {workflowOptions.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-[11px] text-muted-foreground font-medium">
                                    Workflow / Booking
                                </Label>
                                <Select
                                    value={filterWorkflow}
                                    onValueChange={setFilterWorkflow}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-md w-full truncate">
                                        <SelectValue placeholder="All Workflows" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                        <SelectItem value="all">All Workflows</SelectItem>
                                        {workflowOptions.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id}>
                                                {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Employee (Admins) */}
                        {isAdmin && employees.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-[11px] text-muted-foreground font-medium">
                                    Assignee
                                </Label>
                                <Select
                                    value={filterEmployee}
                                    onValueChange={setFilterEmployee}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-md w-full truncate">
                                        <SelectValue placeholder="All Assignees" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                        <SelectItem value="all">All Assignees</SelectItem>
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
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => setPopoverOpen(false)}
                            className="h-7 text-xs px-3"
                        >
                            Done
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Table Structure Change Icon (View Mode Switcher) - Next to Filter Button */}
            <div className="flex items-center rounded-md border border-border/80 bg-background p-0.5 h-8">
                <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7 rounded-sm"
                    onClick={() => setViewMode("table")}
                    title="Table View (Default)"
                >
                    <TableProperties className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant={viewMode === "card" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7 rounded-sm"
                    onClick={() => setViewMode("card")}
                    title="Card Grid View"
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
