import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeaveService } from "@/services/leave.service";
import type { IEmployeeLeave, LeaveStatus } from "@/types/leave.types";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewLeaveDialogProps {
    leave: IEmployeeLeave | null;
    action: "approved" | "rejected" | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ReviewLeaveDialog({
    leave,
    action,
    open,
    onOpenChange,
    onSuccess,
}: ReviewLeaveDialogProps) {
    const [reviewNote, setReviewNote] = useState("");
    const [loading, setLoading] = useState(false);

    if (!leave || !action) return null;

    const isApprove = action === "approved";

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await LeaveService.updateLeaveStatus(leave.id, {
                status: action as LeaveStatus,
                reviewNote: reviewNote.trim() || undefined,
            });
            toast.success(
                `Leave request ${leave.leaveNumber} ${isApprove ? "approved" : "rejected"}`
            );
            setReviewNote("");
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to update leave status"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isApprove ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                        {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
                    </DialogTitle>
                    <DialogDescription>
                        {leave.employee?.name} •{" "}
                        <span className="font-mono">{leave.leaveNumber}</span> (
                        {leave.totalDays} {Number(leave.totalDays) === 1 ? "day" : "days"})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                        <div className="font-semibold capitalize">
                            {leave.leaveType} Leave
                        </div>
                        <div className="text-muted-foreground">
                            Reason: "{leave.reason}"
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Reviewer Note (Optional)
                        </Label>
                        <Textarea
                            rows={3}
                            placeholder={
                                isApprove
                                    ? "Add an approval note..."
                                    : "Provide a reason for rejection..."
                            }
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={isApprove ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        {loading && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {isApprove ? "Confirm Approval" : "Confirm Rejection"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

