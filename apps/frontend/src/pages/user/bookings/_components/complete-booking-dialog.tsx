import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import BookingService from "@/services/booking.service";
import type { IBooking } from "@/types/booking.types";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface CompleteBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: IBooking;
    onSuccess?: () => void;
}

export function CompleteBookingDialog({
    open,
    onOpenChange,
    booking,
    onSuccess,
}: CompleteBookingDialogProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setAcknowledged(false);
            setReason("");
        }
    }, [open, booking.id]);

    const totalAmount = Number(booking.totalAmount || 0);
    const advancePaid = Number(booking.advancePaid || 0);
    const balanceAmount = Number(booking.balanceAmount || 0);
    const isPaidInFull = balanceAmount <= 0.01;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPaidInFull && !acknowledged) {
            toast.error("Please acknowledge the outstanding balance before continuing");
            return;
        }

        try {
            setLoading(true);

            await BookingService.updateBooking(booking.id, {
                status: "completed",
                additionalDetails: {
                    ...((booking as any).additionalDetails || {}),
                    completedAt: new Date().toISOString(),
                    completionReason: reason.trim() || (isPaidInFull ? "Full payment received" : "Manually marked completed with outstanding balance"),
                    acknowledgedIncompletePayment: !isPaidInFull,
                    unpaidBalanceAtCompletion: balanceAmount,
                },
            });

            toast.success(`Booking #${booking.bookingNumber} marked as completed`);
            onSuccess?.();
            onOpenChange(false);
        } catch (err: any) {
            console.error("Error completing booking:", err);
            toast.error(
                err?.response?.data?.message || "Failed to mark booking as completed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    {/* Header Accent Bar */}
                    <div
                        className={`h-1.5 w-full ${
                            isPaidInFull ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                    />

                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {isPaidInFull ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                            )}
                            Mark Booking as Completed
                        </DialogTitle>
                        <DialogDescription>
                            Confirm finalization for Booking #{booking.bookingNumber} ({booking.primaryCustomer?.firstName} {booking.primaryCustomer?.lastName}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 space-y-4">
                        {/* Financial Metric Strip */}
                        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/40 border text-center">
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                    Total Amount
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                    {BookingService.formatCurrency(totalAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                    Paid So Far
                                </p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {BookingService.formatCurrency(advancePaid)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                    Balance Due
                                </p>
                                <p
                                    className={`text-sm font-bold ${
                                        isPaidInFull
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-amber-600 dark:text-amber-400"
                                    }`}
                                >
                                    {BookingService.formatCurrency(Math.max(0, balanceAmount))}
                                </p>
                            </div>
                        </div>

                        {/* State-specific Alert */}
                        {isPaidInFull ? (
                            <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <AlertTitle className="font-semibold text-xs">
                                    Full Payment Verified
                                </AlertTitle>
                                <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                                    All payments for this booking have been received in full. Marking as completed will finalize the reservation status.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-3">
                                <Alert className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <AlertTitle className="font-semibold text-xs">
                                        Warning: Payment Not Fully Settled
                                    </AlertTitle>
                                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                                        This booking has an outstanding unpaid balance of{" "}
                                        <span className="font-bold text-amber-950 dark:text-amber-100">
                                            {BookingService.formatCurrency(balanceAmount)}
                                        </span>
                                        . Marking it as completed before receiving full payment may require supervisor or finance sign-off.
                                    </AlertDescription>
                                </Alert>

                                {/* Acknowledgment Checkbox */}
                                <div className="flex items-start space-x-3 p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
                                    <Checkbox
                                        id="acknowledge-unpaid"
                                        checked={acknowledged}
                                        onCheckedChange={(checked) => setAcknowledged(Boolean(checked))}
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-1 leading-none">
                                        <Label
                                            htmlFor="acknowledge-unpaid"
                                            className="text-xs font-semibold text-foreground cursor-pointer"
                                        >
                                            I acknowledge the unpaid balance
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Confirm that you authorize marking this booking as completed despite the pending balance of {BookingService.formatCurrency(balanceAmount)}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Optional Reason or Authorization Note */}
                        <div className="space-y-1.5 pt-1">
                            <Label htmlFor="completion-reason" className="text-xs font-medium text-foreground">
                                Completion Note / Authorization <span className="text-muted-foreground font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="completion-reason"
                                placeholder={
                                    isPaidInFull
                                        ? "e.g., Tour finished, passenger satisfied"
                                        : "e.g., Approved by Finance Director, Payment to be settled via bank transfer later"
                                }
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                className="text-xs resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-muted/20 border-t flex flex-row items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || (!isPaidInFull && !acknowledged)}
                            className={
                                isPaidInFull
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                            }
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    Confirm & Mark as Completed
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
