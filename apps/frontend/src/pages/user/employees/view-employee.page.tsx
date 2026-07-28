import StatusBadge from "@/components/status-badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import { format } from "date-fns";
import {
    Archive,
    ArrowLeft,
    Briefcase,
    Building,
    Calendar,
    Edit,
    FileText,
    History,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Send,
    ShieldAlert,
    Trash2,
    User as UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActivateDialog } from "./_components/activate-modal";
import { DeactivateDialog } from "./_components/deactivate-dialog";
import { EmployeeModal } from "./_components/employee-modal";

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

export default function ViewEmployeePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState<IEmployee | null>(null);
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isActivateOpen, setIsActivateOpen] = useState(false);
    const [isResendConfirmOpen, setIsResendConfirmOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

    const fetchEmployee = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await axiosInstance.get<IEmployee>(`/employee/${id}`);
            setEmployee(res.data);
        } catch (error) {
            console.error("Failed to load employee details:", error);
            toast.error("Failed to load employee details");
            navigate("/employees");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchLogs = useCallback(async () => {
        if (!id) return;
        try {
            setLoadingLogs(true);
            const res = await axiosInstance.get<IActivityLog[]>(`/activity-log/employee/${id}`);
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    }, [id]);
    useEffect(() => {
        fetchEmployee();
        fetchLogs();
    }, [fetchEmployee, fetchLogs]);

    const handleSendInvite = async () => {
        if (!employee) return;
        try {
            await axiosInstance.post(`/employee/${employee.id}/activateUser`, {});
            toast.success("Invitation sent successfully");
            fetchEmployee();
            fetchLogs();
        } catch (error) {
            toast.error("Failed to send invitation");
        }
    };

    const handleReactivate = async () => {
        if (!employee) return;
        try {
            await axiosInstance.patch(`/employee/${employee.id}/reactivate`, {});
            toast.success("Employee reactivated successfully");
            fetchEmployee();
            fetchLogs();
        } catch (error) {
            toast.error("Failed to reactivate employee");
        }
    };

    const handleArchive = async () => {
        if (!employee) return;
        try {
            await axiosInstance.patch(`/employee/${employee.id}/archive`, {});
            toast.success("Employee archived successfully");
            fetchEmployee();
            fetchLogs();
        } catch (error) {
            toast.error("Failed to archive employee");
        }
    };

    const handleUnarchive = async () => {
        if (!employee) return;
        try {
            await axiosInstance.patch(`/employee/${employee.id}/unarchive`, {});
            toast.success("Employee un-archived successfully");
            fetchEmployee();
            fetchLogs();
        } catch (error) {
            toast.error("Failed to un-archive employee");
        }
    };

    const handleDeactivateSuccess = (updatedEmp: IEmployee) => {
        setEmployee(updatedEmp);
        toast.success("Employee terminated successfully");
        fetchEmployee();
        fetchLogs();
    };

    const handleEditSuccess = (updatedEmp: IEmployee) => {
        setEmployee(updatedEmp);
        toast.success("Employee details updated successfully");
        fetchEmployee();
        fetchLogs();
    };

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card className="w-full">
                    <CardContent className="p-6 flex gap-6 items-center">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 col-span-2" />
                    <Skeleton className="h-64 col-span-1" />
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8 text-center space-y-4">
                <h3 className="text-xl font-bold">Employee not found</h3>
                <Button onClick={() => navigate("/employees")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
                </Button>
            </div>
        );
    }

    const formattedDate = employee.joinDate ? format(new Date(employee.joinDate), "PPP") : "";
    const formattedDOB = employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "PPP") : "";
    const display = (value?: string | number | boolean | null) =>
        value !== undefined && value !== null && value !== "" ? (
            value
        ) : (
            <span className="text-muted-foreground italic">N/A</span>
        );

    const calculateDuration = (joinDate: Date): string => {
        const start = new Date(joinDate);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        if (years > 0) {
            return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
        }
        return `${months} ${months === 1 ? "month" : "months"}`;
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header Banner */}
            <div className="bg-card rounded-xl border p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

                <div className="flex items-center gap-5 z-10">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 ring-4 ring-background">
                        <AvatarImage
                            src={employee.profilePhoto || "/placeholder.svg"}
                            alt={employee.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                            {employee.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
                            <StatusBadge status={employee.status} />
                            {employee.isArchived && (
                                <Badge variant="destructive" className="text-xs uppercase font-semibold">
                                    Archived
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0" />
                            {display(employee.email)}
                        </p>
                        {employee.designation && (
                            <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4 shrink-0" />
                                {employee.designation}
                            </p>
                        )}
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto z-10">
                    {/* Invite Actions */}
                    {employee.isArchived ? (
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                            onClick={handleUnarchive}
                        >
                            <Archive className="mr-2 h-4 w-4" /> Unarchive
                        </Button>
                    ) : (
                        <>
                            {(employee.status === "inactive" || employee.status === "pending_activation" || !employee.userId) && (
                                <Button
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setIsResendConfirmOpen(true)}
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {employee.status === "pending_activation" || (employee.status === "active" && !employee.userId)
                                        ? "Resend Invite"
                                        : "Send Invite"}
                                </Button>
                            )}
                            {employee.status === "terminated" ? (
                                <Button
                                    variant="outline"
                                    className="text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50 hover:text-green-700"
                                    onClick={() => setIsActivateOpen(true)}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Reactivate
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => setIsDeactivateOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Terminate
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="text-amber-600 border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:text-amber-700"
                                onClick={() => setIsArchiveConfirmOpen(true)}
                            >
                                <Archive className="mr-2 h-4 w-4" /> Archive
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setIsEditModalOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit details
                    </Button>
                </div>
            </div>

            {/* Content Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2 - Left Details Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal & Contact Contact Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b flex flex-row items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Personal Details</CardTitle>
                                <p className="text-xs text-muted-foreground">Demographic and contact information</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</p>
                                    <p className="text-sm font-medium capitalize">{display(employee.gender)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marital Status</p>
                                    <p className="text-sm font-medium capitalize">{display(employee.maritalStatus)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of Birth</p>
                                    <p className="text-sm font-medium">{display(formattedDOB)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nationality</p>
                                    <p className="text-sm font-medium">{display(employee.nationality)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        {display(employee.phone)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
                                    <p className="text-sm font-medium flex items-start gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        {display(employee.address)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Work Profile Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b flex flex-row items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Professional Profile</CardTitle>
                                <p className="text-xs text-muted-foreground">Role, manager, branch, and organizational context</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee ID</p>
                                    <p className="text-sm font-medium select-all">{employee.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Designation</p>
                                    <p className="text-sm font-medium">{display(employee.designation)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialization</p>
                                    <p className="text-sm font-medium">{display(employee.specialization)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</p>
                                    <p className="text-sm font-medium">{display(employee.experience)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branch</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                        {display(employee.branch?.name)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manager</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        {display(employee.manager?.name)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                        {display(employee.organization?.name)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Join Date</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        {display(formattedDate)}
                                    </p>
                                </div>
                                {employee.joinDate && (
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tenure</p>
                                        <p className="text-sm font-medium">{calculateDuration(employee.joinDate)}</p>
                                    </div>
                                )}
                            </div>

                            {employee.employeeDepartments && employee.employeeDepartments.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Departments</p>
                                    <div className="flex flex-wrap gap-2">
                                        {employee.employeeDepartments.map((dep, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                                                {dep.department.name || "N/A"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Column 3 - Right Panel */}
                <div className="space-y-6">
                    {/* Access & Authorizations */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b flex flex-row items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Access & Security</CardTitle>
                                <p className="text-xs text-muted-foreground">Permission settings and account bindings</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">User Account Status</p>
                                <div className="flex items-center gap-2">
                                    {employee.userId ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Linked Account</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200">Unlinked Account</Badge>
                                    )}
                                </div>
                                {!employee.userId && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        This employee does not have a linked credentials account. They must be invited to sign up and login.
                                    </p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Permission Sets</p>
                                {employee.permissionSets && employee.permissionSets.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {employee.permissionSets.map((set) => (
                                            <Badge key={set.id} variant="secondary" className="text-xs">
                                                {set.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No permission sets assigned</p>
                                )}
                            </div>

                            {employee.verificationDocument && (
                                <div className="border-t pt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Identification Verification</p>
                                    <a
                                        href={employee.verificationDocument}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1.5"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View Verification Document ({display(employee.verificationDocumentType)})
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline Activity History */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b flex flex-row items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Activity Timeline</CardTitle>
                                <p className="text-xs text-muted-foreground">Historical records for employee</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingLogs ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : logs.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="relative border-l border-border pl-4 space-y-4">
                                        {(showAllLogs ? logs : logs.slice(0, 5)).map((log) => (
                                            <div key={log.id} className="relative space-y-1">
                                                <div className="absolute -left-[21px] mt-1.5 bg-background border rounded-full h-2.5 w-2.5" />
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-xs font-medium text-foreground leading-snug">{log.details}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>By: {log.performedBy ? log.performedBy.name : "System"}</span>
                                                    <span>
                                                        {new Date(log.createdAt).toLocaleString(undefined, {
                                                            dateStyle: "short",
                                                            timeStyle: "short",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {logs.length > 5 && (
                                        <div className="flex justify-center pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowAllLogs(!showAllLogs)}
                                                className="text-xs font-semibold text-primary hover:text-primary/90"
                                            >
                                                {showAllLogs ? "Show Less" : `Show More (${logs.length - 5} more)`}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic text-center py-4">No activities recorded</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals & Dialogs integrations */}
            {isEditModalOpen && (
                <EmployeeModal
                    mode="edit"
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    employee={employee}
                    onSuccess={handleEditSuccess}
                />
            )}

            {isDeactivateOpen && (
                <DeactivateDialog
                    open={isDeactivateOpen}
                    onOpenChange={setIsDeactivateOpen}
                    employee={employee}
                    onDeactivate={handleDeactivateSuccess}
                />
            )}

            {isActivateOpen && (
                <ActivateDialog
                    open={isActivateOpen}
                    onOpenChange={setIsActivateOpen}
                    employee={employee}
                    onActivate={handleReactivate}
                />
            )}

            {/* Resend Invite Confirmation */}
            <AlertDialog open={isResendConfirmOpen} onOpenChange={setIsResendConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {employee.status === "pending_activation" || (employee.status === "active" && !employee.userId)
                                ? "Resend Invitation?"
                                : "Send Invitation?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {employee.status === "pending_activation" || (employee.status === "active" && !employee.userId)
                                ? `A new invitation email will be sent to ${employee.email}. Any previously sent invite links may still be valid.`
                                : `An invitation email will be sent to ${employee.email}, allowing them to register and log in to the system.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setIsResendConfirmOpen(false);
                                handleSendInvite();
                            }}
                        >
                            {employee.status === "pending_activation" || (employee.status === "active" && !employee.userId)
                                ? "Resend Invite"
                                : "Send Invite"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Archive Confirmation */}
            <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Employee?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Archiving <span className="font-semibold text-foreground">{employee.name}</span> will remove them from active lists and restrict access. You can unarchive them at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                                setIsArchiveConfirmOpen(false);
                                handleArchive();
                            }}
                        >
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
