import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import {
    ChevronDown,
    ChevronUp,
    Loader2,
    Maximize2,
    Move,
    Search,
    Users,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmployeeModal } from "./_components/employee-modal";

interface HierarchyNode {
    employee: IEmployee;
    children: HierarchyNode[];
    level: number;
}

export default function TeamHierarchyPage() {
    const [loading, setLoading] = useState(true);
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: "view" | "edit";
        employee: IEmployee | null;
    }>({
        open: false,
        mode: "view",
        employee: null,
    });

    const handleArchiveEmployee = async (emp: IEmployee) => {
        try {
            await axiosInstance.post(`/employee/${emp.id}/archive`);
            toast.success("Employee archived successfully");
            fetchEmployees();
            setModalState((prev) => ({ ...prev, open: false }));
        } catch (error) {
            toast.error("Failed to archive employee");
            console.error(error);
        }
    };

    const handleUnarchiveEmployee = async (emp: IEmployee) => {
        try {
            await axiosInstance.post(`/employee/${emp.id}/unarchive`);
            toast.success("Employee un-archived successfully");
            fetchEmployees();
            setModalState((prev) => ({ ...prev, open: false }));
        } catch (error) {
            toast.error("Failed to un-archive employee");
            console.error(error);
        }
    };

    const handleReactivateEmployee = async (emp: IEmployee) => {
        try {
            await axiosInstance.post(`/employee/${emp.id}/reactivate`);
            toast.success("Employee reactivated successfully");
            fetchEmployees();
            setModalState((prev) => ({ ...prev, open: false }));
        } catch (error) {
            toast.error("Failed to reactivate employee");
            console.error(error);
        }
    };

    const handleResendInvite = async (emp: IEmployee) => {
        try {
            await axiosInstance.post(`/employee/${emp.id}/resend-invite`);
            toast.success("Invitation resent successfully");
        } catch (error) {
            toast.error("Failed to resend invitation");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get<IEmployee[]>(
                "/employee/hierarchy/team",
            );
            setEmployees(response.data);
            buildHierarchy(response.data);
        } catch (error) {
            toast.error("Failed to load team hierarchy");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fitToView = () => {
        if (!containerRef.current || !contentRef.current) return;

        const container = containerRef.current;
        const content = contentRef.current;

        // Reset scale and position for measurement
        const padding = 100; // Safe margin around the tree

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Measure the actual tree content dimensions
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        // Calculate scale to fit both width and height, capped at a minimum readable scale (0.85)
        const scaleX = (containerWidth - padding) / contentWidth;
        const scaleY = (containerHeight - padding) / contentHeight;
        const newScale = Math.max(Math.min(scaleX, scaleY, 1), 0.85);

        setScale(newScale);
        setPosition({ x: 0, y: 0 }); // Centered by default due to flex justify-center
    };

    const buildHierarchy = (employeesList: IEmployee[]) => {
        const nodeMap = new Map<string, HierarchyNode>();
        employeesList.forEach((emp) => {
            nodeMap.set(emp.id, {
                employee: emp,
                children: [],
                level: 0,
            });
        });

        const rootNodes: HierarchyNode[] = [];
        nodeMap.forEach((node) => {
            const managerId = node.employee.managerId;
            if (managerId && nodeMap.has(managerId)) {
                const parent = nodeMap.get(managerId)!;
                parent.children.push(node);
            } else {
                rootNodes.push(node);
            }
        });

        const calculateLevels = (node: HierarchyNode, level: number) => {
            node.level = level;
            node.children.forEach((child) => calculateLevels(child, level + 1));
        };
        rootNodes.forEach((node) => calculateLevels(node, 0));

        setHierarchy(rootNodes);

        // Use timeout to allow DOM to render before fitting
        setTimeout(fitToView, 100);
    };

    const toggleCollapse = (id: string) => {
        setCollapsedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => setCollapsedNodes(new Set());

    const collapseAll = () => {
        const ids = new Set<string>();
        const traverse = (node: HierarchyNode) => {
            if (node.children.length > 0) {
                ids.add(node.employee.id);
                node.children.forEach(traverse);
            }
        };
        hierarchy.forEach(traverse);
        setCollapsedNodes(ids);
    };

    const findPathToNode = (
        nodes: HierarchyNode[],
        targetId: string,
    ): string[] | null => {
        for (const node of nodes) {
            if (node.employee.id === targetId) {
                return [];
            }
            const path = findPathToNode(node.children, targetId);
            if (path !== null) {
                return [node.employee.id, ...path];
            }
        }
        return null;
    };

    const chunkChildren = (children: HierarchyNode[]): HierarchyNode[][] => {
        const rows: HierarchyNode[][] = [];
        const chunkSize = 2;
        for (let i = 0; i < children.length; i += chunkSize) {
            rows.push(children.slice(i, i + chunkSize));
        }
        return rows;
    };

    const handleSelectEmployee = (empId: string) => {
        const path = findPathToNode(hierarchy, empId);
        if (path) {
            setCollapsedNodes((prev) => {
                const next = new Set(prev);
                path.forEach((id) => next.delete(id));
                return next;
            });
        }

        setHighlightedNode(empId);
        setSearchQuery("");
        setShowResults(false);

        const selectedEmp = employees.find((e) => e.id === empId);

        setTimeout(() => {
            const card = document.getElementById(`node-${empId}`);
            const content = contentRef.current;
            const container = containerRef.current;

            if (card && content && container) {
                const cardRect = card.getBoundingClientRect();
                const contentRect = content.getBoundingClientRect();

                const relativeX = (cardRect.left - contentRect.left) / scale;
                const relativeY = (cardRect.top - contentRect.top) / scale;

                const targetScale = 0.85;

                const contentCenterX = contentRect.width / (2 * scale);
                const contentCenterY = contentRect.height / (2 * scale);

                const cardCenterX = relativeX + cardRect.width / (2 * scale);
                const cardCenterY = relativeY + cardRect.height / (2 * scale);

                const dx = cardCenterX - contentCenterX;
                const dy = cardCenterY - contentCenterY;

                setScale(targetScale);
                setPosition({
                    x: -dx * targetScale,
                    y: -dy * targetScale,
                });
            }

            if (selectedEmp) {
                setModalState({
                    open: true,
                    mode: "view",
                    employee: selectedEmp,
                });
            }
        }, 150);

        setTimeout(() => {
            setHighlightedNode(null);
        }, 3000);
    };

    const getReportsCount = (node: HierarchyNode): number => {
        let count = node.children.length;
        node.children.forEach((child) => {
            count += getReportsCount(child);
        });
        return count;
    };

    const filteredEmployees =
        searchQuery.trim() === ""
            ? []
            : employees
                .filter((emp) => {
                    const query = searchQuery.toLowerCase();
                    const matchesName = emp.name.toLowerCase().includes(query);
                    const matchesEmail =
                        emp.email?.toLowerCase().includes(query) || false;
                    const matchesDesignation =
                        emp.designation?.toLowerCase().includes(query) ||
                        false;
                    const matchesDepartment =
                        emp.employeeDepartments?.some((dep) =>
                            dep.department.name
                                .toLowerCase()
                                .includes(query),
                        ) || false;
                    return (
                        matchesName ||
                        matchesEmail ||
                        matchesDesignation ||
                        matchesDepartment
                    );
                })
                .slice(0, 8);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setScale((prev) => Math.min(Math.max(prev + delta, 0.1), 2));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            // Left click only
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.1));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const renderNode = (node: HierarchyNode) => {
        const employee = node.employee;
        const hasChildren = node.children.length > 0;
        const isCollapsed = collapsedNodes.has(employee.id);
        const isHighlighted = highlightedNode === employee.id;

        return (
            <div key={employee.id} className="flex flex-col items-center">
                <div className="relative">
                    <Card
                        id={`node-${employee.id}`}
                        className={`w-64 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${isHighlighted
                            ? "border-primary shadow-primary/20 animate-highlight-node"
                            : hasChildren
                                ? "border-primary/50 shadow-primary/5"
                                : "border-border shadow-sm"
                            } group overflow-hidden`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalState({
                                open: true,
                                mode: "view",
                                employee: employee,
                            });
                        }}
                    >
                        <CardContent className="p-4 relative bg-card">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                                        <AvatarImage
                                            src={
                                                employee.profilePhoto
                                                    ? employee.profilePhoto
                                                    : "/placeholder.svg"
                                            }
                                            alt={employee.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary/5 text-primary">
                                            {employee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                        {employee.name}
                                    </h3>
                                    {employee.designation && (
                                        <p className="text-[11px] text-muted-foreground truncate font-semibold opacity-90">
                                            {employee.designation}
                                        </p>
                                    )}
                                    {employee.email && (
                                        <p className="text-[10px] text-muted-foreground truncate tracking-tight font-medium opacity-80 mt-0.5">
                                            {employee.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {employee.employeeDepartments &&
                                employee.employeeDepartments.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {employee.employeeDepartments.map(
                                            (dep, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="px-1.5 py-0 text-[9px] font-semibold bg-primary/5 text-primary border-none"
                                                >
                                                    {dep.department.name}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapse(employee.id);
                            }}
                            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background hover:bg-muted border border-border shadow-md rounded-full px-2 py-0.5 flex items-center gap-1 z-30 hover:scale-105 transition-all text-[10px] font-bold ${isCollapsed
                                ? "text-primary border-primary/30 ring-1 ring-primary/20"
                                : "text-muted-foreground"
                                }`}
                            title={
                                isCollapsed ? "Expand team" : "Collapse team"
                            }
                        >
                            {isCollapsed ? (
                                <>
                                    <ChevronDown className="h-3 w-3" />
                                    <span>
                                        {getReportsCount(node)}{" "}
                                        {getReportsCount(node) === 1
                                            ? "report"
                                            : "reports"}
                                    </span>
                                </>
                            ) : (
                                <ChevronUp className="h-3 w-3" />
                            )}
                        </button>
                    )}
                </div>

                {hasChildren && !isCollapsed && (
                    <div className="flex flex-col items-center relative">
                        {/* Vertical line from parent */}
                        <div className="w-0.5 h-10 bg-gradient-to-b from-primary/50 to-primary/20" />

                        <div className="flex flex-col items-center gap-0">
                            {chunkChildren(node.children).map((rowChildren, rowIndex, allRows) => {
                                const isLastRow = rowIndex === allRows.length - 1;
                                const isFirstRow = rowIndex === 0;

                                return (
                                    <div key={rowIndex} className="relative flex flex-col items-center">
                                        {!isFirstRow && (
                                            <div
                                                className={`h-10 ${
                                                    isLastRow
                                                        ? "w-0.5 bg-primary/20 relative z-10"
                                                        : ""
                                                }`}
                                            />
                                        )}

                                        <div className="flex gap-12 relative px-10">
                                            {rowChildren.map((child, idx) => {
                                                const isFirst = idx === 0;
                                                const isLast = idx === rowChildren.length - 1;
                                                const isOnly = rowChildren.length === 1;

                                                return (
                                                    <div
                                                        key={child.employee.id}
                                                        className="relative flex flex-col items-center"
                                                    >
                                                        {!isOnly && (
                                                            <div
                                                                className={`absolute top-0 h-0.5 bg-primary/20 ${isFirst
                                                                    ? "left-1/2 right-[-24px]"
                                                                    : isLast
                                                                        ? "left-[-24px] right-1/2"
                                                                        : "left-[-24px] right-[-24px]"
                                                                    }`}
                                                            />
                                                        )}
                                                        <div className="w-0.5 h-10 bg-primary/20 relative z-10" />
                                                        {renderNode(child)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {!isLastRow && (
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-primary/20 left-1/2 -translate-x-1/2 z-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 md:p-8 flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Building team tree...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 flex flex-col h-[calc(100vh-100px)]">
            <style>{`
                @keyframes pulse-highlight {
                    0%, 100% {
                        outline: 2px solid transparent;
                        outline-offset: 2px;
                        box-shadow: 0 0 0 0 rgba(var(--primary), 0);
                    }
                    50% {
                        outline: 2px solid hsl(var(--primary));
                        outline-offset: 4px;
                        box-shadow: 0 0 0 10px rgba(var(--primary), 0.3);
                    }
                }
                .animate-highlight-node {
                    animation: pulse-highlight 1.5s ease-in-out 2;
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Team Hierarchy
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Experience the interactive organization flow and
                        reporting lines.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div ref={searchContainerRef} className="relative w-72">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search employee, dept..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowResults(true);
                                }}
                                onFocus={() => setShowResults(true)}
                                className="pl-9 h-10 w-full"
                            />
                        </div>

                        {showResults && filteredEmployees.length > 0 && (
                            <div className="absolute top-full mt-1.5 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-72 overflow-y-auto">
                                {filteredEmployees.map((emp) => (
                                    <button
                                        key={emp.id}
                                        onClick={() =>
                                            handleSelectEmployee(emp.id)
                                        }
                                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent text-left transition-colors"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={
                                                    emp.profilePhoto ||
                                                    "/placeholder.svg"
                                                }
                                                alt={emp.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                                {emp.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate text-foreground">
                                                {emp.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {emp.designation || "Employee"}{" "}
                                                {emp.employeeDepartments &&
                                                    emp.employeeDepartments
                                                        .length > 0 && (
                                                        <span>
                                                            •{" "}
                                                            {
                                                                emp
                                                                    .employeeDepartments[0]
                                                                    .department
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showResults &&
                            searchQuery.trim() !== "" &&
                            filteredEmployees.length === 0 && (
                                <div className="absolute top-full mt-1.5 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl z-50 p-4 text-center text-xs text-muted-foreground">
                                    No employees found
                                </div>
                            )}
                    </div>

                    <div className="flex items-center gap-1 bg-card border p-1 rounded-lg shadow-sm w-fit">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={collapseAll}
                            className="h-8 w-8"
                            title="Collapse All"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={expandAll}
                            className="h-8 w-8"
                            title="Expand All"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={zoomOut}
                            className="h-8 w-8"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="w-12 text-center text-xs font-bold text-muted-foreground">
                            {Math.round(scale * 100)}%
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={zoomIn}
                            className="h-8 w-8"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetZoom}
                            className="h-8 w-8"
                            title="Reset View"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fitToView}
                            className="h-8 w-8"
                            title="Fit to Screen"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-grab"
                            title="Pan Mode"
                        >
                            <Move className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 rounded-2xl border bg-muted/30 overflow-hidden relative select-none cursor-grab active:cursor-grabbing group shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
                    backgroundSize: `${40 * scale}px ${40 * scale}px`,
                    backgroundPosition: `${position.x}px ${position.y}px`,
                }}
            >
                {hierarchy.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Clear as day</h3>
                        <p className="text-sm">No reporting lines found yet.</p>
                    </div>
                ) : (
                    <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        }}
                    >
                        <div
                            ref={contentRef}
                            className="p-40 flex flex-wrap gap-x-24 gap-y-36 justify-center items-start"
                            style={{
                                width: hierarchy.length > 3 ? "1720px" : "max-content",
                            }}
                        >
                            {hierarchy.map((node) => renderNode(node))}
                        </div>
                    </div>
                )}

                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-full border text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded border">
                            Ctrl
                        </kbd>{" "}
                        +{" "}
                        <kbd className="px-1.5 py-0.5 bg-muted rounded border">
                            Wheel
                        </kbd>{" "}
                        to zoom
                    </div>
                </div>
            </div>

            <EmployeeModal
                mode={modalState.mode}
                open={modalState.open}
                onOpenChange={(open) => {
                    setModalState((prev) => ({ ...prev, open }));
                }}
                employee={modalState.employee}
                employees={employees}
                onSuccess={() => {
                    fetchEmployees();
                }}
                onEdit={(emp) => {
                    setModalState({
                        open: true,
                        mode: "edit",
                        employee: emp,
                    });
                }}
                onArchive={handleArchiveEmployee}
                onUnarchive={handleUnarchiveEmployee}
                onReactivate={handleReactivateEmployee}
                onResendInvite={handleResendInvite}
            />
        </div>
    );
}
