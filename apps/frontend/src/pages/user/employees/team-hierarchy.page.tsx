import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import { getFileUrl } from "@/lib/utils";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { toast } from "sonner";
import { Users, Loader2 } from "lucide-react";
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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get<IEmployee[]>("/employee/hierarchy/team");
            buildHierarchy(response.data);
        } catch (error) {
            toast.error("Failed to load team hierarchy");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const buildHierarchy = (employees: IEmployee[]) => {
        // Create a map of employees by ID
        const employeeMap = new Map<string, IEmployee>();
        employees.forEach((emp) => employeeMap.set(emp.id, emp));

        // Create nodes for all employees
        const nodeMap = new Map<string, HierarchyNode>();
        employees.forEach((emp) => {
            nodeMap.set(emp.id, {
                employee: emp,
                children: [],
                level: 0,
            });
        });

        // Build the tree structure
        const rootNodes: HierarchyNode[] = [];
        nodeMap.forEach((node) => {
            const managerId = node.employee.managerId;
            if (managerId && nodeMap.has(managerId)) {
                const parent = nodeMap.get(managerId)!;
                parent.children.push(node);
                node.level = parent.level + 1;
            } else {
                rootNodes.push(node);
            }
        });

        // Calculate levels for all nodes
        const calculateLevels = (node: HierarchyNode, level: number) => {
            node.level = level;
            node.children.forEach((child) => calculateLevels(child, level + 1));
        };
        rootNodes.forEach((node) => calculateLevels(node, 0));

        setHierarchy(rootNodes);
    };

    const renderNode = (node: HierarchyNode) => {
        const employee = node.employee;
        const hasChildren = node.children.length > 0;

        return (
            <div key={employee.id} className="flex flex-col items-center">
                <Card
                    className={`w-64 cursor-pointer hover:shadow-lg transition-shadow ${hasChildren ? "border-primary" : ""
                        }`}
                    onClick={() => navigate(`/employees?selected=${employee.id}`)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src={
                                        employee.profilePhoto
                                            ? getFileUrl(getServeFileUrl(employee.profilePhoto))
                                            : "/placeholder.svg"
                                    }
                                    alt={employee.name}
                                    className="object-cover w-full h-full"
                                />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{employee.name}</h3>
                                {employee.email && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        {employee.email}
                                    </p>
                                )}
                            </div>
                        </div>
                        {employee.employeeDepartments &&
                            employee.employeeDepartments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {employee.employeeDepartments.slice(0, 2).map((dep, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {dep.department.name}
                                        </Badge>
                                    ))}
                                    {employee.employeeDepartments.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{employee.employeeDepartments.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            )}
                    </CardContent>
                </Card>

                {hasChildren && (
                    <>
                        <div className="w-0.5 h-6 bg-border my-2" />
                        <div className="flex flex-wrap justify-center gap-8 mt-4">
                            {node.children.map((child) => renderNode(child))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Hierarchy
                            </CardTitle>
                            <CardDescription>
                                Visualize your organization's team structure and reporting relationships
                            </CardDescription>
                        </div>
                        <Button onClick={fetchEmployees} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {hierarchy.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No team hierarchy found</p>
                            <p className="text-sm mt-2">
                                Assign managers to employees to build the hierarchy
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-250px)]">
                            <div className="flex flex-wrap justify-center gap-8 py-4">
                                {hierarchy.map((node) => renderNode(node))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
