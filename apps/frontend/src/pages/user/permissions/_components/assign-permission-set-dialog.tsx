import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PermissionService } from "@/services/permission.service";
import type { PermissionSet } from "@/types/permission.types";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { IUser } from "@/types/user.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AssignPermissionSetDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permissionSet: PermissionSet;
    onSuccess: () => void;
};

export function AssignPermissionSetDialog({
    open,
    onOpenChange,
    permissionSet,
    onSuccess,
}: AssignPermissionSetDialogProps) {
    const [assignType, setAssignType] = useState<"user" | "employee">(
        "employee"
    );
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [users, setUsers] = useState<IUser[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchEmployees();
            // Reset form
            setSelectedUserId("");
            setSelectedEmployeeId("");
            setAssignType("employee");
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await axiosInstance.get<IUser[]>("/user");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoadingEmployees(true);
            const response = await axiosInstance.get<IEmployee[]>("/employee");
            setEmployees(response.data);
        } catch (error) {
            console.error("Failed to load employees:", error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (assignType === "user" && !selectedUserId) {
            toast.error("Please select a user");
            return;
        }

        if (assignType === "employee" && !selectedEmployeeId) {
            toast.error("Please select an employee");
            return;
        }

        try {
            setLoading(true);
            await PermissionService.assignPermissionSet(permissionSet.id, {
                userId: assignType === "user" ? selectedUserId : undefined,
                employeeId:
                    assignType === "employee" ? selectedEmployeeId : undefined,
            });
            toast.success("Permission set assigned successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to assign permission set");
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
                        <DialogTitle>Assign Permission Set</DialogTitle>
                        <DialogDescription>
                            Assign "{permissionSet.name}" to a user or employee
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignType">Assign To</Label>
                            <Select
                                value={assignType}
                                onValueChange={(value: "user" | "employee") => {
                                    setAssignType(value);
                                    setSelectedUserId("");
                                    setSelectedEmployeeId("");
                                }}
                            >
                                <SelectTrigger id="assignType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employee">
                                        Employee
                                    </SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {assignType === "user" ? (
                            <div className="space-y-2">
                                <Label htmlFor="userId">User *</Label>
                                {loadingUsers ? (
                                    <div className="text-sm text-muted-foreground">
                                        Loading users...
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedUserId}
                                        onValueChange={setSelectedUserId}
                                        required
                                    >
                                        <SelectTrigger id="userId">
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="employeeId">Employee *</Label>
                                {loadingEmployees ? (
                                    <div className="text-sm text-muted-foreground">
                                        Loading employees...
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedEmployeeId}
                                        onValueChange={setSelectedEmployeeId}
                                        required
                                    >
                                        <SelectTrigger id="employeeId">
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.name}{" "}
                                                    {employee.email &&
                                                        `(${employee.email})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        )}
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
                            {loading ? "Assigning..." : "Assign"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
