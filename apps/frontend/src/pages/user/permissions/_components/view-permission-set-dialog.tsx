import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PermissionSet, Permission } from "@/types/permission.types";

type ViewPermissionSetDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permissionSet: PermissionSet;
};

export function ViewPermissionSetDialog({
    open,
    onOpenChange,
    permissionSet,
}: ViewPermissionSetDialogProps) {
    // Group permissions by resource
    const permissionsByResource = (
        permissionSet.permissionSetPermissions || []
    ).reduce((acc, psp) => {
        const permission = psp.permission;
        if (!acc[permission.resource]) {
            acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{permissionSet.name}</DialogTitle>
                    <DialogDescription>
                        {permissionSet.description ||
                            "View permission set details"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold">Description</div>
                        <div className="text-sm text-muted-foreground">
                            {permissionSet.description || "No description"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-semibold">
                            Permissions (
                            {permissionSet.permissionSetPermissions?.length ||
                                0}
                            )
                        </div>
                        {permissionSet.permissionSetPermissions?.length ===
                            0 ? (
                            <div className="text-sm text-muted-foreground">
                                No permissions assigned
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] border rounded-md p-4">
                                <div className="space-y-4">
                                    {Object.entries(permissionsByResource).map(
                                        ([resource, perms]) => (
                                            <div
                                                key={resource}
                                                className="space-y-2"
                                            >
                                                <div className="font-semibold text-sm uppercase text-muted-foreground">
                                                    {resource}
                                                </div>
                                                <div className="space-y-1 pl-4">
                                                    {perms.map((permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="text-sm"
                                                        >
                                                            •{" "}
                                                            {permission.action}{" "}
                                                            -{" "}
                                                            {permission.description ||
                                                                permission.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-semibold">Created At</div>
                        <div className="text-sm text-muted-foreground">
                            {new Date(permissionSet.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
