import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MONTH_NAMES } from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DisperseSalaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    month: number;
    year: number;
    eligibleCount: number;
    onSuccess: () => void;
}

export function DisperseSalaryDialog({
    open,
    onOpenChange,
    month,
    year,
    eligibleCount,
    onSuccess,
}: DisperseSalaryDialogProps) {
    const [sending, setSending] = useState(false);
    const monthName = MONTH_NAMES[(month || 1) - 1] || "Month";

    const handleBulkDisperse = async () => {
        setSending(true);
        try {
            const res = await SalaryService.bulkSendSalarySlipEmails({
                month,
                year,
            });
            if (res.sentCount > 0) {
                toast.success(
                    `Dispersed ${res.sentCount} salary slip email(s) for ${monthName} ${year}`
                );
            }
            if (res.failedCount > 0) {
                toast.error(
                    `${res.failedCount} email(s) failed: ${res.errors
                        .map((e) => `${e.employeeName} (${e.reason})`)
                        .join(", ")}`
                );
            }
            onOpenChange(false);
            onSuccess();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to disperse salary slip emails"
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Disperse Salary Slip Emails — {monthName} {year}
                    </DialogTitle>
                    <DialogDescription>
                        Manually trigger salary dispersion emails to all employees with Processed or Paid salary slips for {monthName} {year}.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 rounded-lg bg-muted/40 border space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Payroll Period:
                        </span>
                        <span className="font-semibold">
                            {monthName} {year}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Eligible Processed / Paid Slips:
                        </span>
                        <span className="font-mono font-bold text-primary">
                            {eligibleCount} employee(s)
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1">
                        Each employee will receive a formatted HTML Salary Slip at their registered email address with their full earnings, additional incentives, leave summary, and deductions.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={sending}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBulkDisperse}
                        disabled={sending || eligibleCount === 0}
                        className="gap-2 cursor-pointer"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Send {eligibleCount} Salary Slip Mail(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

