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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PermissionService } from "@/services/permission.service";
import type { Permission, UpdatePermissionDto } from "@/types/permission.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type EditPermissionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission;
    onSuccess: () => void;
};

// Common resources and actions
const RESOURCES = [
    "booking",
    "lead",
    "package",
    "customer",
    "employee",
    "payment",
    "batch",
    "branch",
    "department",
    "role",
    "permission",
    "permission-set",
];

const ACTIONS = [
    "create",
    "read",
    "update",
    "delete",
    "view",
    "export",
    "import",
    "manage",
];

export function EditPermissionDialog({
    open,
    onOpenChange,
    permission,
    onSuccess,
}: EditPermissionDialogProps) {
    const [name, setName] = useState(permission.name);
    const [resource, setResource] = useState(permission.resource);
    const [action, setAction] = useState(permission.action);
    const [description, setDescription] = useState(
        permission.description || ""
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(permission.name);
            setResource(permission.resource);
            setAction(permission.action);
            setDescription(permission.description || "");
        }
    }, [open, permission]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !resource.trim() || !action.trim()) {
            toast.error("Name, resource, and action are required");
            return;
        }

        try {
            setLoading(true);
            const data: UpdatePermissionDto = {
                name: name.trim(),
                resource: resource.trim(),
                action: action.trim(),
                description: description.trim() || undefined,
            };

            await PermissionService.updatePermission(permission.id, data);
            toast.success("Permission updated successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update permission");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Permission</DialogTitle>
                        <DialogDescription>
                            Update the permission details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., booking.create"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="resource">Resource *</Label>
                                <Select
                                    value={resource}
                                    onValueChange={setResource}
                                    required
                                >
                                    <SelectTrigger id="resource">
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RESOURCES.map((res) => (
                                            <SelectItem key={res} value={res}>
                                                {res}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="action">Action *</Label>
                                <Select
                                    value={action}
                                    onValueChange={setAction}
                                    required
                                >
                                    <SelectTrigger id="action">
                                        <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACTIONS.map((act) => (
                                            <SelectItem key={act} value={act}>
                                                {act}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe this permission..."
                                rows={3}
                            />
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
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
