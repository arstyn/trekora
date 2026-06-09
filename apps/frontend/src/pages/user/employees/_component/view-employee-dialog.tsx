import StatusBadge from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PermissionService } from "@/services/permission.service";
import type { IEmployee } from "@/types/employee.types";
import type { PermissionSet } from "@/types/permission.types";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { History } from "lucide-react";

interface IActivityLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    performedBy?: {
        name: string;
        email: string;
    };
}

type ViewEmployeeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: IEmployee | null;
    onEdit?: (employee: IEmployee) => void;
};

export function ViewEmployeeDialog({
    open,
    onOpenChange,
    employee,
    onEdit,
}: ViewEmployeeDialogProps) {
    const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
    const [loadingPermissionSets, setLoadingPermissionSets] = useState(false);
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);

    useEffect(() => {
        if (open && employee?.id) {
            loadPermissionSets();
            loadLogs();
            setShowAllLogs(false);
        }
    }, [open, employee?.id]);

    const loadPermissionSets = async () => {
        if (!employee?.id) return;
        try {
            setLoadingPermissionSets(true);
            const sets = await PermissionService.getPermissionSetsForEmployee(
                employee.id,
            );
            setPermissionSets(sets);
        } catch (error) {
            console.error("Failed to load permission sets:", error);
            toast.error("Failed to load permission sets");
        } finally {
            setLoadingPermissionSets(false);
        }
    };

    const loadLogs = async () => {
        if (!employee?.id) return;
        try {
            setLoadingLogs(true);
            const res = await axiosInstance.get<IActivityLog[]>(
                `/activity-log/employee/${employee.id}`,
            );
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    if (!employee) return null;

    // Format join date
    const formattedDate = employee.joinDate
        ? format(new Date(employee.joinDate), "PPP")
        : "";

    // Format date of birth
    const formattedDOB = employee.dateOfBirth
        ? format(new Date(employee.dateOfBirth), "PPP")
        : "";

    // Helper for empty fields
    const display = (value?: string | number | boolean | null) =>
        value !== undefined && value !== null && value !== "" ? (
            value
        ) : (
            <span className="text-muted-foreground italic">N/A</span>
        );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center justify-between">
                        Employee Details
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-8 pr-4">
                        <div className="flex items-center border-b pb-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={(() => {
                                        if (employee.profilePhoto)
                                            return employee.profilePhoto;

                                        return "/placeholder.svg";
                                    })()}
                                    alt={employee.name}
                                    className="object-cover w-full h-full"
                                />
                                <AvatarFallback className="text-lg">
                                    {employee.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center justify-between w-full px-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {employee.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {employee.email}
                                    </p>
                                </div>
                                <StatusBadge status={employee.status} />
                            </div>
                        </div>

                        <div className="max-h-[50vh] overflow-auto space-y-5">
                            <div className="grid grid-cols-2 gap-6 ">
                                <div className="space-y-3">
                                    <Detail
                                        label="Employee ID"
                                        value={employee.id}
                                    />
                                    <Detail
                                        label="Branch"
                                        value={display(employee.branch?.name)}
                                    />
                                    <Detail
                                        label="Manager"
                                        value={display(employee.manager?.name)}
                                    />
                                    <Detail
                                        label="Organization"
                                        value={display(
                                            employee.organization?.name,
                                        )}
                                    />
                                    <Detail
                                        label="Email"
                                        value={display(employee.email)}
                                    />
                                    <Detail
                                        label="Phone"
                                        value={display(employee.phone)}
                                    />
                                    <Detail
                                        label="Marital Status"
                                        value={display(employee.maritalStatus)}
                                    />
                                    <Detail
                                        label="Address"
                                        value={display(employee.address)}
                                    />
                                    <Detail
                                        label="Date of Birth"
                                        value={display(formattedDOB)}
                                    />
                                    <Detail
                                        label="Gender"
                                        value={display(employee.gender)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Detail
                                        label="Nationality"
                                        value={display(employee.nationality)}
                                    />
                                    <Detail
                                        label="Experience"
                                        value={display(employee.experience)}
                                    />
                                    <Detail
                                        label="Additional Info"
                                        value={display(
                                            employee.additional_info,
                                        )}
                                    />
                                    <Detail
                                        label="Nationality"
                                        value={display(employee.nationality)}
                                    />

                                    <Detail
                                        label="Join Date"
                                        value={display(formattedDate)}
                                    />
                                    <Detail
                                        label="Employment Duration"
                                        value={
                                            employee.joinDate &&
                                            calculateDuration(employee.joinDate)
                                        }
                                    />
                                    <Detail
                                        label="Created At"
                                        value={format(
                                            new Date(employee.createdAt),
                                            "PPP",
                                        )}
                                    />
                                    <Detail
                                        label="Updated At"
                                        value={format(
                                            new Date(employee.updatedAt),
                                            "PPP",
                                        )}
                                    />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Status
                                        </p>
                                        <StatusBadge status={employee.status} />
                                    </div>
                                </div>
                            </div>

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

                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Permission Sets
                                </p>
                                {loadingPermissionSets ? (
                                    <p className="text-sm text-muted-foreground">
                                        Loading...
                                    </p>
                                ) : permissionSets.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {permissionSets.map((set) => (
                                            <Badge
                                                key={set.id}
                                                variant="secondary"
                                            >
                                                {set.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        No permission sets assigned
                                    </p>
                                )}
                            </div>

                            <div className="border-t pt-4 pr-2">
                                <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                    <History className="h-4 w-4" />
                                    Activity History
                                </p>
                                {loadingLogs ? (
                                    <p className="text-sm text-muted-foreground">Loading history...</p>
                                ) : logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {(showAllLogs ? logs : logs.slice(0, 3)).map((log) => (
                                            <div key={log.id} className="text-xs bg-muted/40 p-2.5 rounded-lg border flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-foreground font-medium">{log.details}</p>
                                                    <p className="text-muted-foreground">
                                                        By: {log.performedBy ? `${log.performedBy.name} (${log.performedBy.email})` : "System"}
                                                    </p>
                                                </div>
                                                <span className="text-muted-foreground shrink-0 font-medium">
                                                    {new Date(log.createdAt).toLocaleString(undefined, {
                                                        dateStyle: "short",
                                                        timeStyle: "short"
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                        {logs.length > 3 && (
                                            <div className="flex justify-center pt-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAllLogs(!showAllLogs)}
                                                    className="text-xs font-semibold text-primary hover:text-primary/90"
                                                >
                                                    {showAllLogs ? "View Less" : `View More (${logs.length - 3} more)`}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No activities recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="pt-4 flex justify-end gap-2 border-t flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    {onEdit && employee && (
                        <Button
                            onClick={() => {
                                onEdit(employee);
                                onOpenChange(false);
                            }}
                        >
                            Edit Employee
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    );
}

function calculateDuration(joinDate: Date): string {
    const start = new Date(joinDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }

    if (years > 0) {
        return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"
            }`;
    } else {
        return `${months} ${months === 1 ? "month" : "months"}`;
    }
}
