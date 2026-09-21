import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import BookingService from "@/services/booking.service";
import type { IBooking } from "@/types/booking.types";
import type { IWorkflow } from "@/types/workflow.types";
import {
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    MapPin,
    Package,
    Receipt,
    Tickets,
    User,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface BookingHoverCardProps {
    workflow?: IWorkflow;
}

// Memory cache for fetched booking previews to prevent repeated network requests
const bookingCache = new Map<string, IBooking>();

export function BookingHoverCard({ workflow }: BookingHoverCardProps) {
    const [booking, setBooking] = useState<IBooking | null>(() => {
        if (workflow?.referenceId && bookingCache.has(workflow.referenceId)) {
            return bookingCache.get(workflow.referenceId) || null;
        }
        return null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    if (!workflow) {
        return (
            <span className="text-xs text-muted-foreground">General</span>
        );
    }

    // Clean up workflow name by removing "Booking" and "Flow"
    const rawName = workflow.name || "";
    const cleanId = rawName
        .replace(/^booking\s*[:-]?\s*/i, "")
        .replace(/\s*flow$/i, "")
        .trim();
    const displayName = cleanId || rawName || "Workflow";

    const isBookingWorkflow =
        workflow.type === "booking" ||
        rawName.toLowerCase().includes("booking") ||
        cleanId.startsWith("BK-");

    const referenceId = workflow.referenceId;

    const handleOpenChange = async (open: boolean) => {
        if (!open || !referenceId || booking || loading) return;

        if (bookingCache.has(referenceId)) {
            setBooking(bookingCache.get(referenceId) || null);
            return;
        }

        try {
            setLoading(true);
            setError(false);
            const data = await BookingService.getBookingById(referenceId);
            bookingCache.set(referenceId, data);
            setBooking(data);
        } catch (err) {
            console.error("Failed to load booking preview:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge
                        variant="outline"
                        className="h-4.5 text-[10px] font-semibold border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    >
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                        Confirmed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="h-4.5 text-[10px] font-semibold border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    >
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        Pending
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="h-4.5 text-[10px] font-semibold border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                    >
                        <XCircle className="h-2.5 w-2.5 mr-1" />
                        Cancelled
                    </Badge>
                );
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="h-4.5 text-[10px] font-semibold border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                    >
                        Completed
                    </Badge>
                );
            default:
                return status ? (
                    <Badge variant="secondary" className="h-4.5 text-[10px] capitalize">
                        {status}
                    </Badge>
                ) : null;
        }
    };

    // If not a booking workflow or has no reference ID, render clean pill
    if (!isBookingWorkflow || !referenceId) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 text-foreground/80 font-medium text-xs max-w-[170px] truncate">
                <Tickets className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{displayName}</span>
            </div>
        );
    }

    return (
        <HoverCard openDelay={200} closeDelay={150} onOpenChange={handleOpenChange}>
            <HoverCardTrigger asChild>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 text-foreground/80 hover:text-primary transition-colors font-mono font-medium text-xs max-w-[170px] truncate cursor-pointer group">
                    {/* Tickets icon from sidebar */}
                    <Tickets className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{displayName}</span>
                </div>
            </HoverCardTrigger>

            <HoverCardContent
                align="start"
                side="top"
                className="w-80 p-4 space-y-3 shadow-lg border-border/80"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Tickets className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">
                                {booking?.bookingNumber || displayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                Booking Reference
                            </span>
                        </div>
                    </div>
                    {booking && getStatusBadge(booking.status)}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-2 py-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : booking ? (
                    <div className="space-y-2 text-xs">
                        {/* Primary Customer */}
                        {booking.primaryCustomer && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                                <span className="text-foreground font-medium truncate">
                                    {booking.primaryCustomer.firstName}{" "}
                                    {booking.primaryCustomer.lastName || ""}
                                </span>
                                {booking.primaryCustomer.phone && (
                                    <span className="text-[11px] text-muted-foreground ml-auto">
                                        {booking.primaryCustomer.phone}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Package */}
                        {booking.package && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                                <span className="text-foreground truncate font-medium">
                                    {booking.package.name}
                                </span>
                                {booking.package.destination && (
                                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-0.5">
                                        <MapPin className="h-2.5 w-2.5" />
                                        {booking.package.destination}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Batch Dates */}
                        {booking.batch && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 text-foreground/70 shrink-0" />
                                <span>
                                    {new Date(
                                        booking.batch.startDate,
                                    ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {new Date(
                                        booking.batch.endDate,
                                    ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Financial snapshot */}
                        <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                Total:{" "}
                                <strong className="text-foreground font-mono">
                                    {BookingService.formatCurrency(
                                        booking.totalAmount,
                                    )}
                                </strong>
                            </span>
                            {booking.balanceAmount > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                                    Bal:{" "}
                                    {BookingService.formatCurrency(
                                        booking.balanceAmount,
                                    )}
                                </span>
                            ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    Fully Paid
                                </span>
                            )}
                        </div>
                    </div>
                ) : error ? (
                    <p className="text-xs text-muted-foreground italic py-1">
                        Unable to fetch booking details.
                    </p>
                ) : (
                    <div className="py-1">
                        <p className="text-xs text-muted-foreground">
                            Hover to inspect booking data.
                        </p>
                    </div>
                )}

                {/* Button to view booking details */}
                <div className="pt-1">
                    <Button
                        asChild
                        size="sm"
                        className="w-full text-xs h-8 gap-1.5"
                    >
                        <Link to={`/bookings/${referenceId}`}>
                            View Booking Details
                            <ExternalLink className="h-3 w-3 ml-0.5" />
                        </Link>
                    </Button>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
