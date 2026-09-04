import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookingService } from "@/services/booking.service";
import type {
    IBooking,
    PaymentMethod,
} from "@/types/booking.types";
import {
    AlertCircle,
    DollarSign,
    Loader2,
    UserX,
    Users,
    XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface CancelBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: IBooking;
    initialCustomerId?: string | null;
    onSuccess?: () => void;
}

export function CancelBookingDialog({
    open,
    onOpenChange,
    booking,
    initialCustomerId,
    onSuccess,
}: CancelBookingDialogProps) {
    // Active customers (not previously cancelled)
    const activeCustomers = useMemo(() => {
        return (booking.customers || []).filter(
            (c) => c.status !== "cancelled"
        );
    }, [booking.customers]);

    const isSingleTraveler = activeCustomers.length <= 1;

    // Scope: 'entire' or 'partial'
    const [scope, setScope] = useState<"entire" | "partial">("entire");
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [issueRefund, setIssueRefund] = useState(true);
    const [refundAmount, setRefundAmount] = useState<string>("0");
    const [refundMethod, setRefundMethod] = useState<PaymentMethod>("bank_transfer");
    const [reason, setReason] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Initialize state on open
    useEffect(() => {
        if (open) {
            if (initialCustomerId && !isSingleTraveler) {
                setScope("partial");
                setSelectedCustomerIds([initialCustomerId]);
            } else {
                setScope("entire");
                setSelectedCustomerIds(activeCustomers.map((c) => c.id || "").filter(Boolean));
            }
            setIssueRefund(Number(booking.advancePaid || 0) > 0);
            setRefundMethod("bank_transfer");
            setReason("");
            setNotes("");
        }
    }, [open, initialCustomerId, booking.id, activeCustomers.length, isSingleTraveler]);

    // Calculate sum of paid amount for selected customers
    const selectedCustomers = useMemo(() => {
        if (scope === "entire") {
            return activeCustomers;
        }
        return activeCustomers.filter(
            (c) => c.id && selectedCustomerIds.includes(c.id)
        );
    }, [scope, activeCustomers, selectedCustomerIds]);

    const totalPaidForSelected = useMemo(() => {
        if (scope === "entire") {
            return Number(booking.advancePaid || 0);
        }
        return selectedCustomers.reduce(
            (sum, c) => sum + Number(c.paidAmount || 0),
            0
        );
    }, [scope, booking.advancePaid, selectedCustomers]);

    // Auto-populate refund amount when selected customers change
    useEffect(() => {
        if (open) {
            setRefundAmount(totalPaidForSelected.toString());
        }
    }, [open, totalPaidForSelected]);

    const parsedRefundAmount = Number(refundAmount) || 0;
    const cancellationFee = Math.max(0, totalPaidForSelected - parsedRefundAmount);

    const handleCustomerToggle = (customerId: string) => {
        setSelectedCustomerIds((prev) => {
            if (prev.includes(customerId)) {
                return prev.filter((id) => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
    };

    const handleSelectAllCustomers = () => {
        if (selectedCustomerIds.length === activeCustomers.length) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(activeCustomers.map((c) => c.id || "").filter(Boolean));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (scope === "partial" && selectedCustomerIds.length === 0) {
            toast.error("Please select at least one traveler to cancel");
            return;
        }

        if (issueRefund && parsedRefundAmount < 0) {
            toast.error("Refund amount cannot be negative");
            return;
        }

        if (issueRefund && parsedRefundAmount > totalPaidForSelected && totalPaidForSelected > 0) {
            if (
                !confirm(
                    `Refund amount (${BookingService.formatCurrency(parsedRefundAmount)}) exceeds the total recorded payments (${BookingService.formatCurrency(totalPaidForSelected)}). Do you wish to continue?`
                )
            ) {
                return;
            }
        }

        setLoading(true);
        try {
            const customerIdsToCancel =
                scope === "entire"
                    ? activeCustomers.map((c) => c.id || "").filter(Boolean)
                    : selectedCustomerIds;

            await BookingService.cancelBooking(booking.id, {
                customerIds: customerIdsToCancel,
                issueRefund: issueRefund && parsedRefundAmount > 0,
                refundAmount: parsedRefundAmount,
                refundMethod,
                reason: reason.trim() || undefined,
                notes: notes.trim() || undefined,
            });

            const countCancelled = customerIdsToCancel.length;
            if (scope === "entire" || countCancelled >= activeCustomers.length) {
                toast.success(`Booking #${booking.bookingNumber} has been cancelled successfully`);
            } else {
                toast.success(
                    `${countCancelled} traveler${countCancelled > 1 ? "s" : ""} cancelled successfully`
                );
            }

            if (issueRefund && parsedRefundAmount > 0) {
                toast.info(
                    `Pending refund of ${BookingService.formatCurrency(parsedRefundAmount)} created under Payments for processing`
                );
            }

            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Cancellation error:", error);
            toast.error(
                error.response?.data?.message || "Failed to cancel booking. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header Top Accent Bar */}
                <div className="h-1.5 w-full bg-linear-to-r from-rose-500 to-amber-500" />

                <DialogHeader className="px-6 pt-5 pb-3">
                    <DialogTitle className="flex items-center gap-2 text-destructive text-lg font-bold">
                        <XCircle className="w-5 h-5 text-destructive" />
                        {scope === "entire" || isSingleTraveler
                            ? "Cancel Booking"
                            : "Cancel Selected Travelers"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Booking <span className="font-mono font-semibold text-foreground">#{booking.bookingNumber}</span> • Batch seats will be freed up and refundable payments scheduled.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                    {/* Cancellation Scope Selector (only if multiple travelers) */}
                    {!isSingleTraveler && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Cancellation Scope
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setScope("entire")}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                                        scope === "entire"
                                            ? "border-destructive/60 bg-destructive/10 text-destructive font-semibold shadow-xs"
                                            : "border-border hover:bg-muted/50 text-muted-foreground"
                                    }`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Entire Booking ({activeCustomers.length} Guests)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScope("partial")}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                                        scope === "partial"
                                            ? "border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold shadow-xs"
                                            : "border-border hover:bg-muted/50 text-muted-foreground"
                                    }`}
                                >
                                    <UserX className="w-4 h-4" />
                                    Specific Traveler(s)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Traveler Selection List (if Partial Scope) */}
                    {scope === "partial" && !isSingleTraveler && (
                        <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    Select Travelers to Cancel ({selectedCustomerIds.length}/{activeCustomers.length})
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[11px] px-2 text-muted-foreground"
                                    onClick={handleSelectAllCustomers}
                                >
                                    {selectedCustomerIds.length === activeCustomers.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>

                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {activeCustomers.map((customer) => {
                                    const isSelected = customer.id
                                        ? selectedCustomerIds.includes(customer.id)
                                        : false;
                                    return (
                                        <div
                                            key={customer.id}
                                            onClick={() => customer.id && handleCustomerToggle(customer.id)}
                                            className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                                                    : "bg-background border-border hover:bg-muted/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        customer.id && handleCustomerToggle(customer.id)
                                                    }
                                                />
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {customer.packageTierName || "Standard Tier"} • {customer.ageCategory || "adult"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="text-[10px]">
                                                    Paid: {BookingService.formatCurrency(customer.paidAmount || 0)}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Refund & Financial Configuration Section */}
                    <div className="space-y-3 rounded-lg border p-3.5 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                    Issue Refund
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Create a pending refund payment record for accounts settlement
                                </p>
                            </div>
                            <Checkbox
                                checked={issueRefund}
                                onCheckedChange={(checked) => setIssueRefund(Boolean(checked))}
                            />
                        </div>

                        {issueRefund && (
                            <div className="space-y-3 pt-2 border-t border-border/60">
                                {/* Total Paid vs Refund Breakdown */}
                                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-md bg-background border">
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Recorded Payments</p>
                                        <p className="font-bold text-foreground font-mono">
                                            {BookingService.formatCurrency(totalPaidForSelected)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] text-muted-foreground">Cancellation Penalty</p>
                                        <p className={`font-bold font-mono ${cancellationFee > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                                            {BookingService.formatCurrency(cancellationFee)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Refund Amount</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={refundAmount}
                                                onChange={(e) => setRefundAmount(e.target.value)}
                                                className="h-8 text-xs font-mono pr-8"
                                                placeholder="0.00"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1 h-6 text-[10px] px-1 text-primary hover:bg-transparent"
                                                onClick={() => setRefundAmount(totalPaidForSelected.toString())}
                                                title="Reset to 100% of recorded payment"
                                            >
                                                Max
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Refund Method</Label>
                                        <Select
                                            value={refundMethod}
                                            onValueChange={(val) => setRefundMethod(val as PaymentMethod)}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="upi">UPI</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="debit_card">Debit Card</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reason & Notes */}
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Cancellation Reason</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Customer medical emergency, change of plans"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Additional Notes (Optional)</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any operational notes or bank details for the refund..."
                                rows={2}
                                className="text-xs resize-none"
                            />
                        </div>
                    </div>

                    {/* Action Summary Notice */}
                    <Alert className="border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 py-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <AlertDescription className="text-[11px] text-rose-900 dark:text-rose-200">
                            {scope === "entire" || isSingleTraveler ? (
                                <>
                                    This will cancel the <strong>entire booking</strong> and release{" "}
                                    <strong>{activeCustomers.length} seat(s)</strong> on batch.
                                </>
                            ) : (
                                <>
                                    This will cancel <strong>{selectedCustomerIds.length} traveler(s)</strong>, release{" "}
                                    <strong>{selectedCustomerIds.length} seat(s)</strong>, and recalculate the remaining package balance.
                                </>
                            )}
                            {issueRefund && parsedRefundAmount > 0 && (
                                <> A pending refund of <strong>{BookingService.formatCurrency(parsedRefundAmount)}</strong> will be created.</>
                            )}
                        </AlertDescription>
                    </Alert>

                    <DialogFooter className="pt-2 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                            className="text-xs"
                        >
                            Keep Booking
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || (scope === "partial" && selectedCustomerIds.length === 0)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs shadow-xs"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Confirm Cancellation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
