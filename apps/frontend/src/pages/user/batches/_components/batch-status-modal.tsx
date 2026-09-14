import { Badge } from "@/components/ui/badge";
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
import BatchService from "@/services/batch.service";
import type { IBatches } from "@/types/batches.types";
import { differenceInDays, format } from "date-fns";
import {
    AlertCircle,
    Archive,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    Info,
    Loader2,
    PlayCircle,
    RefreshCw,
    ShieldAlert,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BatchStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: IBatches;
    onStatusUpdated?: () => void;
}

interface StatusOption {
    id: "upcoming" | "active" | "completed" | "archived";
    label: string;
    description: string;
    icon: typeof Clock;
    badgeClass: string;
    dotClass: string;
    borderAccent: string;
    ringClass: string;
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        id: "upcoming",
        label: "Upcoming",
        description: "Open for bookings and allocations.",
        icon: Clock,
        badgeClass:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        dotClass: "bg-blue-500",
        borderAccent: "border-blue-500/30 bg-blue-500/5",
        ringClass: "ring-blue-500",
    },
    {
        id: "active",
        label: "Active",
        description: "Trip is underway and operations live.",
        icon: PlayCircle,
        badgeClass:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        dotClass: "bg-emerald-500 animate-pulse",
        borderAccent: "border-emerald-500/30 bg-emerald-500/5",
        ringClass: "ring-emerald-500",
    },
    {
        id: "completed",
        label: "Completed",
        description: "Tour concluded and ready to settle.",
        icon: CheckCircle2,
        badgeClass:
            "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        dotClass: "bg-gray-400",
        borderAccent: "border-gray-400/30 bg-gray-500/5",
        ringClass: "ring-gray-500",
    },
    {
        id: "archived",
        label: "Archived",
        description: "Delisted from active schedules.",
        icon: Archive,
        badgeClass:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        dotClass: "bg-purple-500",
        borderAccent: "border-purple-500/30 bg-purple-500/5",
        ringClass: "ring-purple-500",
    },
];

export function BatchStatusModal({
    open,
    onOpenChange,
    batch,
    onStatusUpdated,
}: BatchStatusModalProps) {
    const currentStatus = (batch.status || "upcoming") as StatusOption["id"];
    const [selectedStatus, setSelectedStatus] = useState<StatusOption["id"]>(currentStatus);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelectedStatus((batch.status || "upcoming") as StatusOption["id"]);
            setReason("");
        }
    }, [open, batch.status]);

    const currentOption =
        STATUS_OPTIONS.find((opt) => opt.id === currentStatus) || STATUS_OPTIONS[0];
    const targetOption =
        STATUS_OPTIONS.find((opt) => opt.id === selectedStatus) || STATUS_OPTIONS[0];

    const isStatusChanged = selectedStatus !== currentStatus;

    // Dates calculation
    const startDate = batch.startDate ? new Date(batch.startDate) : null;
    const daysUntilDeparture = startDate ? differenceInDays(startDate, new Date()) : null;

    const activeBookingsCount =
        batch.bookings?.filter((b) => b.status !== "cancelled").length || 0;

    const handleSubmit = async () => {
        if (!isStatusChanged) {
            onOpenChange(false);
            return;
        }

        setIsSubmitting(true);
        try {
            await BatchService.updateBatchStatus(batch.id, selectedStatus, reason.trim() || undefined);
            toast.success(`Batch status successfully updated to "${targetOption.label}"`);
            onOpenChange(false);
            onStatusUpdated?.();
        } catch (error: any) {
            console.error("Failed to update batch status:", error);
            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to update batch status. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentIcon = currentOption.icon;
    const TargetIcon = targetOption.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
                {/* Header */}
                <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-gradient-to-r from-muted/50 via-muted/20 to-background text-left space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                                Update Batch Status
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {batch.package?.name ? `${batch.package.name} • ` : ""}
                                Batch #{batch.id?.slice(0, 8)}
                                {startDate && (
                                    <span>
                                        {" "}• Departure: {format(startDate, "dd MMM yyyy")}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Transition Preview Pill */}
                    <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-background/80 border border-border/70 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                            <span>Current:</span>
                            <Badge
                                variant="outline"
                                className={`text-[11px] font-semibold gap-1 py-0.5 px-2 ${currentOption.badgeClass}`}
                            >
                                <CurrentIcon className="w-3 h-3" />
                                {currentOption.label}
                            </Badge>
                        </div>

                        {isStatusChanged ? (
                            <>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="text-primary font-semibold">New:</span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[11px] font-bold gap-1 py-0.5 px-2.5 shadow-xs ${targetOption.badgeClass}`}
                                    >
                                        <TargetIcon className="w-3 h-3" />
                                        {targetOption.label}
                                    </Badge>
                                </div>
                            </>
                        ) : (
                            <span className="text-muted-foreground italic text-[11px] ml-auto">
                                Select a new status below
                            </span>
                        )}
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-5">
                    {/* Status Options Grid */}
                    <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Operational Status
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {STATUS_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = selectedStatus === opt.id;
                                const isCurrent = currentStatus === opt.id;

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setSelectedStatus(opt.id)}
                                        className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                                            isSelected
                                                ? `${opt.borderAccent} border-primary/60 ring-2 ${opt.ringClass}/20 shadow-xs`
                                                : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`p-1.5 rounded-lg border ${opt.badgeClass}`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                        <span>{opt.label}</span>
                                                        {isCurrent && (
                                                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-normal border">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Radio circle */}
                                            <div
                                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                                                    isSelected
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-muted-foreground/30 group-hover:border-muted-foreground"
                                                }`}
                                            >
                                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
                                            {opt.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contextual Impact Note */}
                    {isStatusChanged && (
                        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                                <Info className="w-4 h-4 text-primary" />
                                <span>Transition Impact: {targetOption.label}</span>
                            </div>

                            {selectedStatus === "active" && (
                                <div className="space-y-1.5 text-muted-foreground pl-6">
                                    <p>
                                        • Seat occupancy:{" "}
                                        <strong className="text-foreground">
                                            {batch.bookedSeats || 0} / {batch.totalSeats || 0} seats
                                        </strong>{" "}
                                        booked ({activeBookingsCount} active booking groups).
                                    </p>
                                    {activeBookingsCount === 0 && (
                                        <p className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            Warning: This batch has 0 bookings. Activating will mark it as on-trip.
                                        </p>
                                    )}
                                    {daysUntilDeparture !== null && daysUntilDeparture > 3 && (
                                        <p className="text-blue-600 dark:text-blue-400">
                                            ℹ️ Scheduled departure is in {daysUntilDeparture} days.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedStatus === "completed" && (
                                <div className="space-y-1 text-muted-foreground pl-6">
                                    <p>
                                        • Concludes trip execution for all {activeBookingsCount} booking records.
                                    </p>
                                    <p className="text-amber-600 dark:text-amber-400">
                                        ⚠️ Ensure all passenger final reconciliations and coordinator reports are ready.
                                    </p>
                                </div>
                            )}

                            {selectedStatus === "upcoming" && (
                                <div className="space-y-1 text-muted-foreground pl-6">
                                    <p>
                                        • Reopens or keeps the batch available for upcoming departures and bookings.
                                    </p>
                                </div>
                            )}

                            {selectedStatus === "archived" && (
                                <div className="space-y-1 text-muted-foreground pl-6">
                                    <p className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                        This batch will be delisted from active sales and booking scheduling.
                                    </p>
                                    <p>• Historical logs, invoices, and payments remain preserved.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reason / Operational Note */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="status-reason"
                                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                            >
                                Operational Note / Reason
                                <span className="text-[11px] font-normal text-muted-foreground">
                                    (Optional)
                                </span>
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                Saved to Batch Audit Log
                            </span>
                        </div>
                        <Textarea
                            id="status-reason"
                            placeholder="e.g., Early departure confirmed, Weather delay, Post-trip debrief completed..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="text-xs resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <DialogFooter className="p-4 sm:p-5 border-t bg-muted/20 gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="text-xs font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!isStatusChanged || isSubmitting}
                        className="text-xs font-semibold gap-1.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Updating Status...
                            </>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                {isStatusChanged ? `Set Status to ${targetOption.label}` : "No Changes"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default BatchStatusModal;
