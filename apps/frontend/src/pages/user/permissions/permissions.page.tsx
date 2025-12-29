import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PermissionService } from "@/services/permission.service";
import type { Permission } from "@/types/permission.types";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreatePermissionDialog } from "./_components/create-permission-dialog";
import { EditPermissionDialog } from "./_components/edit-permission-dialog";
import { useHasRole } from "@/hooks/use-permissions";
import { useNavigate } from "react-router-dom";

export default function PermissionsPage() {
    const navigate = useNavigate();
    const { hasRole: isAdmin, loading: roleLoading } = useHasRole("admin");
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [resourceFilter, setResourceFilter] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            toast.error("You don't have permission to access this page");
            navigate("/");
        }
    }, [isAdmin, roleLoading, navigate]);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const data = await PermissionService.getAllPermissions();
            setPermissions(data);
        } catch (error) {
            toast.error("Failed to load permissions");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchPermissions();
        }
    }, [isAdmin]);

    const filteredPermissions = permissions.filter((perm) => {
        const matchesSearch = perm.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            perm.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm.action.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesResource = resourceFilter === "all" || perm.resource === resourceFilter;
        return matchesSearch && matchesResource;
    });

    // Get unique resources for filter
    const uniqueResources = Array.from(
        new Set(permissions.map((p) => p.resource))
    ).sort();

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this permission?")) {
            return;
        }

        try {
            await PermissionService.deletePermission(id);
            toast.success("Permission deleted successfully");
            fetchPermissions();
        } catch (error) {
            toast.error("Failed to delete permission");
            console.error(error);
        }
    };

    if (roleLoading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Manage system permissions (resources and actions)
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Permission
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search permissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={resourceFilter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setResourceFilter("all")}
                            >
                                All Resources
                            </Button>
                            {uniqueResources.map((resource) => (
                                <Button
                                    key={resource}
                                    variant={resourceFilter === resource ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setResourceFilter(resource)}
                                >
                                    {resource}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPermissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No permissions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPermissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">
                                                {permission.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {permission.resource}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {permission.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {permission.description || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(permission)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(permission.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreatePermissionDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchPermissions}
            />

            {selectedPermission && (
                <EditPermissionDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    permission={selectedPermission}
                    onSuccess={fetchPermissions}
                />
            )}
        </div>
    );
}

