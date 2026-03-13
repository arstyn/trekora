import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import { getFileUrl } from "@/lib/utils";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { toast } from "sonner";
import { Users, Loader2, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HierarchyNode {
    employee: IEmployee;
    children: HierarchyNode[];
    level: number;
}

export default function TeamHierarchyPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get<IEmployee[]>(
                "/employee/hierarchy/team",
            );
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
        const originalScale = 1;
        const padding = 100; // Safe margin around the tree

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Measure the actual tree content dimensions
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        // Calculate scale to fit both width and height
        const scaleX = (containerWidth - padding) / contentWidth;
        const scaleY = (containerHeight - padding) / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1); // Cap at 1 (100%) for small trees

        setScale(newScale);
        setPosition({ x: 0, y: 0 }); // Centered by default due to flex justify-center
    };

    const buildHierarchy = (employees: IEmployee[]) => {
        const nodeMap = new Map<string, HierarchyNode>();
        employees.forEach((emp) => {
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

        return (
            <div key={employee.id} className="flex flex-col items-center">
                <Card
                    className={`w-64 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${
                        hasChildren
                            ? "border-primary/50 shadow-primary/5"
                            : "border-border shadow-sm"
                    } group overflow-hidden`}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employees?selected=${employee.id}`);
                    }}
                >
                    <CardContent className="p-4 relative bg-card">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                                    <AvatarImage
                                        src={
                                            employee.profilePhoto
                                                ? getFileUrl(
                                                      getServeFileUrl(
                                                          employee.profilePhoto,
                                                      ),
                                                  )
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
                                {employee.email && (
                                    <p className="text-[10px] text-muted-foreground truncate tracking-tight font-medium opacity-80">
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
                    <div className="flex flex-col items-center relative">
                        {/* Vertical line from parent */}
                        <div className="w-0.5 h-10 bg-gradient-to-b from-primary/50 to-primary/20" />

                        <div className="flex gap-12 relative px-10">
                            {node.children.map((child, idx) => {
                                const isFirst = idx === 0;
                                const isLast = idx === node.children.length - 1;
                                const isOnly = node.children.length === 1;

                                return (
                                    <div
                                        key={child.employee.id}
                                        className="relative flex flex-col items-center"
                                    >
                                        {!isOnly && (
                                            <div
                                                className={`absolute top-0 h-0.5 bg-primary/20 ${
                                                    isFirst
                                                        ? "left-1/2 right-0"
                                                        : isLast
                                                          ? "left-0 right-1/2"
                                                          : "left-0 right-0"
                                                }`}
                                            />
                                        )}
                                        <div className="w-0.5 h-10 bg-primary/20 relative z-10" />
                                        {renderNode(child)}
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

                <div className="flex items-center gap-2 bg-card border p-1 rounded-lg shadow-sm w-fit">
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
                            className="min-w-max min-h-max p-40 flex flex-nowrap gap-24 items-start"
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
        </div>
    );
}
