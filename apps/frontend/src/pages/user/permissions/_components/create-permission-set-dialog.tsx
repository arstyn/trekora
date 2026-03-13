import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PermissionService } from "@/services/permission.service";
import type {
    Permission,
    CreatePermissionSetDto,
} from "@/types/permission.types";
import { getSession } from "@/lib/auth-utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CreatePermissionSetDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function CreatePermissionSetDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreatePermissionSetDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<
        string[]
    >([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    useEffect(() => {
        if (open) {
            fetchPermissions();
            // Reset form
            setName("");
            setDescription("");
            setSelectedPermissionIds([]);
        }
    }, [open]);

    const fetchPermissions = async () => {
        try {
            setLoadingPermissions(true);
            const data = await PermissionService.getAllPermissions();
            setPermissions(data);
        } catch (error) {
            toast.error("Failed to load permissions");
            console.error(error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            setLoading(true);
            const session = await getSession();
            if (!session || !(session as any).organizationId) {
                toast.error("Organization ID not found");
                return;
            }

            const data: CreatePermissionSetDto = {
                name: name.trim(),
                description: description.trim() || undefined,
                organizationId: (session as any).organizationId as string,
                permissionIds: selectedPermissionIds,
            };

            await PermissionService.createPermissionSet(data);
            toast.success("Permission set created successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to create permission set");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    // Group permissions by resource
    const permissionsByResource = permissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
            acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Permission Set</DialogTitle>
                        <DialogDescription>
                            Create a new permission set and assign permissions
                            to it
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Sales Manager"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe this permission set..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            {loadingPermissions ? (
                                <div className="text-sm text-muted-foreground">
                                    Loading permissions...
                                </div>
                            ) : (
                                <ScrollArea className="h-[200px] border rounded-md p-4">
                                    <div className="space-y-4">
                                        {Object.entries(
                                            permissionsByResource
                                        ).map(([resource, perms]) => (
                                            <div
                                                key={resource}
                                                className="space-y-2"
                                            >
                                                <div className="font-semibold text-sm uppercase text-muted-foreground">
                                                    {resource}
                                                </div>
                                                <div className="space-y-2 pl-4">
                                                    {perms.map((permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={selectedPermissionIds.includes(
                                                                    permission.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    togglePermission(
                                                                        permission.id
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                            >
                                                                {
                                                                    permission.action
                                                                }{" "}
                                                                -{" "}
                                                                {permission.description ||
                                                                    permission.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                            <div className="text-sm text-muted-foreground">
                                {selectedPermissionIds.length} permission(s)
                                selected
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
