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
import { useHasPermission } from "@/hooks/use-permissions";
import { PermissionService } from "@/services/permission.service";
import type { PermissionSet } from "@/types/permission.types";
import { Plus, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssignPermissionSetDialog } from "./_components/assign-permission-set-dialog";
import { CreatePermissionSetDialog } from "./_components/create-permission-set-dialog";
import { EditPermissionSetDialog } from "./_components/edit-permission-set-dialog";
import { ViewPermissionSetDialog } from "./_components/view-permission-set-dialog";

export default function PermissionSetsPage() {
    const { hasPermission: canManage, loading: permissionLoading } = useHasPermission("permission-set", "manage");
    const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedPermissionSet, setSelectedPermissionSet] =
        useState<PermissionSet | null>(null);

    const fetchPermissionSets = async () => {
        try {
            setLoading(true);
            const data = await PermissionService.getAllPermissionSets();
            setPermissionSets(data);
        } catch (error) {
            toast.error("Failed to load permission sets");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canManage) {
            fetchPermissionSets();
        }
    }, [canManage]);

    const filteredPermissionSets = permissionSets.filter((ps) =>
        ps.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleView = (permissionSet: PermissionSet) => {
        setSelectedPermissionSet(permissionSet);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (permissionSet: PermissionSet) => {
        setSelectedPermissionSet(permissionSet);
        setIsEditDialogOpen(true);
    };

    const handleAssign = (permissionSet: PermissionSet) => {
        setSelectedPermissionSet(permissionSet);
        setIsAssignDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this permission set?")) {
            return;
        }

        try {
            await PermissionService.deletePermissionSet(id);
            toast.success("Permission set deleted successfully");
            fetchPermissionSets();
        } catch (error) {
            toast.error("Failed to delete permission set");
            console.error(error);
        }
    };

    if (permissionLoading) {
        return <div>Loading...</div>;
    }

    if (!canManage) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Permission Sets</CardTitle>
                            <CardDescription>
                                Manage permission sets and assign them to users
                                or employees
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Permission Set
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search permission sets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Permissions Count</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPermissionSets.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8"
                                        >
                                            No permission sets found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPermissionSets.map(
                                        (permissionSet) => (
                                            <TableRow key={permissionSet.id}>
                                                <TableCell className="font-medium">
                                                    {permissionSet.name}
                                                </TableCell>
                                                <TableCell>
                                                    {permissionSet.description ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {permissionSet
                                                        .permissionSetPermissions
                                                        ?.length || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        permissionSet.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleView(
                                                                    permissionSet
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    permissionSet
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAssign(
                                                                    permissionSet
                                                                )
                                                            }
                                                            title="Assign to user/employee"
                                                        >
                                                            <UserPlus className="h-4 w-4 mr-1" />
                                                            Assign
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    permissionSet.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreatePermissionSetDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchPermissionSets}
            />

            {selectedPermissionSet && (
                <>
                    <ViewPermissionSetDialog
                        open={isViewDialogOpen}
                        onOpenChange={setIsViewDialogOpen}
                        permissionSet={selectedPermissionSet}
                    />
                    <EditPermissionSetDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        permissionSet={selectedPermissionSet}
                        onSuccess={fetchPermissionSets}
                    />
                    <AssignPermissionSetDialog
                        open={isAssignDialogOpen}
                        onOpenChange={setIsAssignDialogOpen}
                        permissionSet={selectedPermissionSet}
                        onSuccess={fetchPermissionSets}
                    />
                </>
            )}
        </div>
    );
}
