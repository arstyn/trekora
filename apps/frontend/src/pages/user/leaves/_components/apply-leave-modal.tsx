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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LeaveService } from "@/services/leave.service";
import type { IEmployee } from "@/types/employee.types";
import type { LeaveStatus, LeaveType } from "@/types/leave.types";
import { CalendarPlus, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApplyLeaveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    employees?: IEmployee[];
    canSelectEmployee?: boolean;
    defaultEmployeeId?: string;
}

export function ApplyLeaveModal({
    open,
    onOpenChange,
    onSuccess,
    employees = [],
    canSelectEmployee = false,
    defaultEmployeeId,
}: ApplyLeaveModalProps) {
    const today = new Date().toISOString().split("T")[0];
    const [employeeId, setEmployeeId] = useState<string>(
        defaultEmployeeId || ""
    );
    const [leaveType, setLeaveType] = useState<LeaveType>("casual");
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);
    const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
    const [reason, setReason] = useState<string>("");
    const [autoApprove, setAutoApprove] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            setEmployeeId(defaultEmployeeId || "");
            setLeaveType("casual");
            setStartDate(today);
            setEndDate(today);
            setIsHalfDay(false);
            setReason("");
            setAutoApprove(false);
        }
    }, [open, defaultEmployeeId, today]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Please provide a reason for the leave");
            return;
        }
        if (!isHalfDay && endDate < startDate) {
            toast.error("End date cannot be earlier than start date");
            return;
        }

        setSubmitting(true);
        try {
            const status: LeaveStatus | undefined =
                canSelectEmployee && autoApprove ? "approved" : undefined;

            await LeaveService.createLeave({
                employeeId: employeeId || undefined,
                leaveType,
                startDate,
                endDate: isHalfDay ? startDate : endDate,
                isHalfDay,
                reason: reason.trim(),
                status,
            });

            toast.success(
                status === "approved"
                    ? "Leave recorded and approved"
                    : "Leave request submitted successfully"
            );
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to submit leave request"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-primary" />
                        {canSelectEmployee
                            ? "Apply / Record Employee Leave"
                            : "Apply for Leave"}
                    </DialogTitle>
                    <DialogDescription>
                        Select the leave type, dates, and provide a brief reason.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {canSelectEmployee && employees.length > 0 && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Employee (Leave blank to apply for yourself)
                            </Label>
                            <Select
                                value={employeeId || "self"}
                                onValueChange={(val) =>
                                    setEmployeeId(val === "self" ? "" : val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="self">
                                        Myself (My Profile)
                                    </SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name}{" "}
                                            {emp.designation
                                                ? `(${emp.designation})`
                                                : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Leave Type
                        </Label>
                        <Select
                            value={leaveType}
                            onValueChange={(v) => setLeaveType(v as LeaveType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="casual">
                                    Casual Leave (CL - Paid)
                                </SelectItem>
                                <SelectItem value="sick">
                                    Sick / Medical Leave (SL - Paid)
                                </SelectItem>
                                <SelectItem value="paid">
                                    Earned / Paid Leave (PL/EL - Paid)
                                </SelectItem>
                                <SelectItem value="unpaid">
                                    Loss of Pay / Unpaid Leave (LOP)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <div>
                            <div className="text-xs font-semibold">
                                Half-Day Leave (0.5 Day)
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                Enable if taking only a morning or afternoon half-day.
                            </div>
                        </div>
                        <Switch
                            checked={isHalfDay}
                            onCheckedChange={setIsHalfDay}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                {isHalfDay ? "Leave Date" : "Start Date"}
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (endDate < e.target.value) {
                                        setEndDate(e.target.value);
                                    }
                                }}
                                required
                            />
                        </div>
                        {!isHalfDay && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    End Date
                                </Label>
                                <Input
                                    type="date"
                                    min={startDate}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Reason for Leave
                        </Label>
                        <Textarea
                            rows={3}
                            placeholder="Describe the reason for leave..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    {canSelectEmployee && (
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/40 dark:bg-emerald-950/20">
                            <div>
                                <div className="text-xs font-semibold">
                                    Mark as Immediately Approved
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    Directly approve this leave record without pending review.
                                </div>
                            </div>
                            <Switch
                                checked={autoApprove}
                                onCheckedChange={setAutoApprove}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="cursor-pointer"
                        >
                            {submitting && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Submit Leave
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

