import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

type DeactivateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: IEmployee | null;
    onDeactivate: (deletedEmployee: IEmployee) => void;
};

export function DeactivateDialog({
    open,
    onOpenChange,
    employee,
    onDeactivate,
}: DeactivateDialogProps) {
    const [error, setError] = useState<string | null>(null);

    if (!employee) {
        return null;
    }

    const handleDeactivate = async () => {
        if (!employee) return;

        try {
            const res = await axiosInstance.patch<IEmployee>(
                `/employee/${employee.id}/terminate`,
            );

            if (res) {
                onDeactivate(res.data);
                onOpenChange(false);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to terminate employee",
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Terminate Employee
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to terminate this employee?
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                        This will change {employee.name}'s status to
                        "terminated" and revoke their access to company systems.
                    </AlertDescription>
                </Alert>

                <div className="py-2">
                    <h4 className="text-sm font-medium">Employee details:</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Name:</p>
                            <p className="font-medium">{employee.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">ID:</p>
                            <p className="font-medium">{employee.id}</p>
                        </div>
                        <div>
                            {employee.employeeDepartments &&
                                employee.employeeDepartments.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Departments
                                        </p>
                                        <ul className="list-disc list-inside text-sm">
                                            {employee.employeeDepartments.map(
                                                (dep, idx) => (
                                                    <li key={idx}>
                                                        {dep.department.name ||
                                                            "N/A"}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {error && <div className="text-red-500">{error}</div>}

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeactivate}>
                        Terminate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
