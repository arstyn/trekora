import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteLogs } from "@/hooks/use-infinite-logs";
import { getFileUrl } from "@/lib/utils";
import BookingService from "@/services/booking.service";
import type { IBooking, IBookingLog, IEntityMeta } from "@/types/booking.types";
import { format } from "date-fns";
import {
    Activity,
    ArrowRightLeft,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    CreditCard,
    Edit3,
    ExternalLink,
    FileText,
    History,
    Loader2,
    Mail,
    Phone,
    RotateCcw,
    Trash2,
    User,
    UserCheck,
    XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const INTERNAL_FIELDS = new Set([
    "id",
    "bookingId",
    "organizationId",
    "createdAt",
    "updatedAt",
    "packageTierId",
    "paymentStructureId",
    "currentWorkflowId",
    "batchOfferId",
    "batchBlockId",
    "createdById",
    "updatedById",
    "status",
    "cancelledCustomerIds",
    "refundAmount",
    "refundIssued",
    "refundPaymentId",
]);

interface EntityReferencePillProps {
    id: string;
    entityType?: "customer" | "payment" | "batch" | "package" | "agent" | "user" | string;
    meta?: IEntityMeta;
}

const EntityReferencePill: React.FC<EntityReferencePillProps> = ({ id, entityType, meta }) => {
    const type = meta?.type || entityType || "reference";
    const displayId = meta?.displayId;
    const shortFallback = id.slice(-4).toUpperCase();
    const title = meta?.title || (displayId ? `#${displayId.replace(/^#/, "")}` : `Ref #${shortFallback}`);

    const getBadgeStyle = () => {
        switch (type) {
            case "customer":
                return "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
            case "payment":
                return "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
            case "batch":
                return "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
            case "package":
                return "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
            case "agent":
                return "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
            case "user":
                return "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700";
            default:
                return "bg-muted hover:bg-muted/80 text-foreground border-border";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "customer":
                return <User className="w-3 h-3 shrink-0" />;
            case "payment":
                return <CreditCard className="w-3 h-3 shrink-0" />;
            case "batch":
                return <Calendar className="w-3 h-3 shrink-0" />;
            case "package":
                return <Compass className="w-3 h-3 shrink-0" />;
            case "agent":
                return <Briefcase className="w-3 h-3 shrink-0" />;
            default:
                return <FileText className="w-3 h-3 shrink-0" />;
        }
    };

    const pillLabel = displayId ? `#${displayId.replace(/^#/, "")}` : title;

    return (
        <HoverCard openDelay={150} closeDelay={150}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer focus:outline-none ${getBadgeStyle()}`}
                >
                    {getIcon()}
                    <span className="font-mono">{pillLabel}</span>
                    {displayId && meta?.title && meta.title !== displayId && (
                        <span className="text-[10px] opacity-80 truncate max-w-[120px]">
                            ({meta.title})
                        </span>
                    )}
                </button>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80 p-4 shadow-xl z-50">
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${getBadgeStyle()}`}>
                            {getIcon()}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {displayId && (
                                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                                        #{displayId.replace(/^#/, "")}
                                    </Badge>
                                )}
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                    {type}
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold truncate text-foreground">
                                {meta?.title || title}
                            </h4>
                            {meta?.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                    {meta.subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {meta?.details && Object.keys(meta.details).length > 0 && (
                        <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                            {meta.details.email && (
                                <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground truncate">
                                    <Mail className="w-3 h-3 shrink-0 opacity-70" />
                                    <span className="truncate">{meta.details.email}</span>
                                </div>
                            )}
                            {meta.details.phone && (
                                <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground truncate">
                                    <Phone className="w-3 h-3 shrink-0 opacity-70" />
                                    <span className="truncate">{meta.details.phone}</span>
                                </div>
                            )}
                            {meta.details.amount !== undefined && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Amount</span>
                                    <p className="font-medium text-foreground">
                                        ₹{Number(meta.details.amount).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                            {meta.details.paymentMethod && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Method</span>
                                    <p className="font-medium uppercase text-foreground">
                                        {String(meta.details.paymentMethod).replace(/_/g, " ")}
                                    </p>
                                </div>
                            )}
                            {meta.details.paymentType && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Type</span>
                                    <p className="font-medium capitalize text-foreground">
                                        {String(meta.details.paymentType).replace(/_/g, " ")}
                                    </p>
                                </div>
                            )}
                            {meta.details.status && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Status</span>
                                    <p className="font-medium capitalize text-foreground">
                                        {String(meta.details.status).replace(/_/g, " ")}
                                    </p>
                                </div>
                            )}
                            {meta.details.totalSeats !== undefined && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Seats</span>
                                    <p className="font-medium text-foreground">
                                        {meta.details.bookedSeats ?? 0} / {meta.details.totalSeats}
                                    </p>
                                </div>
                            )}
                            {meta.details.destination && (
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground uppercase">Destination</span>
                                    <p className="font-medium text-foreground truncate">
                                        {meta.details.destination}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {meta?.link && (
                        <div className="pt-2 border-t border-border/60 flex justify-end">
                            <NavLink to={meta.link}>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                                    View Details
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            </NavLink>
                        </div>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

interface BookingLogsCardProps {
    logs: IBookingLog[];
    loading?: boolean;
    entityId?: string;
    totalCount?: number;
    initialEntityMeta?: Record<string, IEntityMeta>;
    booking?: IBooking;
}

export const BookingLogsCard: React.FC<BookingLogsCardProps> = ({
    logs,
    loading = false,
    entityId,
    totalCount,
    initialEntityMeta,
    booking,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [metaMap, setMetaMap] = useState<Record<string, IEntityMeta>>(
        initialEntityMeta || {},
    );
    const total = totalCount ?? logs.length;

    // Sync when initialEntityMeta changes
    useEffect(() => {
        if (initialEntityMeta && Object.keys(initialEntityMeta).length > 0) {
            setMetaMap((prev) => ({ ...prev, ...initialEntityMeta }));
        }
    }, [initialEntityMeta]);

    // Initial enrichment fetch if metaMap is empty
    useEffect(() => {
        if (entityId && Object.keys(metaMap).length === 0 && logs.length > 0) {
            BookingService.getBookingLogs(entityId, 1, 5)
                .then((res) => {
                    if (res.entityMeta && Object.keys(res.entityMeta).length > 0) {
                        setMetaMap((prev) => ({ ...prev, ...res.entityMeta }));
                    }
                })
                .catch(() => {});
        }
    }, [entityId, logs.length]);

    const {
        modalLogs,
        loadingMore,
        hasMore,
        scrollContainerRef,
        sentinelRef,
        handleScroll,
        loadMore,
    } = useInfiniteLogs<IBookingLog>({
        initialLogs: logs,
        totalCount: total,
        isOpen: isModalOpen,
        pageSize: 15,
        fetchPage: async ({ page, limit, offset }) => {
            if (!entityId) return { data: [], total };
            const res = await BookingService.getBookingLogs(entityId, page, limit, offset);
            if (res.entityMeta && Object.keys(res.entityMeta).length > 0) {
                setMetaMap((prev) => ({ ...prev, ...res.entityMeta }));
            }
            return { data: res.data, total: res.total };
        },
    });

    const formatCurrency = (amount: number) => {
        return BookingService.formatCurrency(amount);
    };

    const resolveMeta = (id: string, hintKey?: string): IEntityMeta => {
        // 1. Backend entity meta
        if (metaMap[id]) {
            return metaMap[id];
        }

        // 2. Booking local context fallback
        if (booking) {
            const foundCust =
                (booking.primaryCustomer?.id === id ? booking.primaryCustomer : undefined) ||
                (booking.customers ? booking.customers.find((c) => c.id === id) : undefined);
            if (foundCust && foundCust.id) {
                const fullName = `${foundCust.firstName || ""} ${foundCust.lastName || ""}`.trim() || "Customer";
                return {
                    id: foundCust.id,
                    type: "customer",
                    displayId: foundCust.customerNumber,
                    title: fullName,
                    subtitle: foundCust.email || foundCust.phone || "Customer",
                    link: `/customers/${foundCust.id}`,
                    details: {
                        name: fullName,
                        email: foundCust.email,
                        phone: foundCust.phone,
                        customerNumber: foundCust.customerNumber,
                    },
                };
            }

            if (booking.payments) {
                const p = booking.payments.find((pay) => pay.id === id);
                if (p && p.id) {
                    return {
                        id: p.id,
                        type: "payment",
                        displayId: p.paymentNumber,
                        title: formatCurrency(Number(p.amount || 0)),
                        subtitle: `${p.paymentType || "Payment"} • ${p.paymentMethod || "N/A"}`,
                        link: `/payments/${p.id}`,
                        details: {
                            paymentNumber: p.paymentNumber,
                            amount: p.amount,
                            paymentType: p.paymentType,
                            paymentMethod: p.paymentMethod,
                            status: p.status,
                        },
                    };
                }
            }

            if (booking.batch && booking.batch.id === id) {
                return {
                    id: booking.batch.id,
                    type: "batch",
                    title: booking.package?.name ? `${booking.package.name} Batch` : "Trip Batch",
                    subtitle: booking.batch.startDate
                        ? `${new Date(booking.batch.startDate).toLocaleDateString()} - ${new Date(booking.batch.endDate).toLocaleDateString()}`
                        : undefined,
                    details: {
                        totalSeats: booking.batch.totalSeats,
                    },
                };
            }

            if (booking.package && booking.package.id === id) {
                return {
                    id: booking.package.id,
                    type: "package",
                    title: booking.package.name,
                    subtitle: booking.package.destination || "Package",
                    link: `/packages/${booking.package.id}`,
                    details: {
                        name: booking.package.name,
                        destination: booking.package.destination,
                    },
                };
            }
        }

        // 3. Fallback safe entity meta (NEVER display raw 36-char UUID)
        const shortId = id.slice(-4).toUpperCase();
        let guessedType: IEntityMeta["type"] = "user";
        if (hintKey?.toLowerCase().includes("customer")) guessedType = "customer";
        else if (hintKey?.toLowerCase().includes("payment")) guessedType = "payment";
        else if (hintKey?.toLowerCase().includes("batch")) guessedType = "batch";
        else if (hintKey?.toLowerCase().includes("package")) guessedType = "package";
        else if (hintKey?.toLowerCase().includes("agent")) guessedType = "agent";

        const prefix = guessedType.slice(0, 4).toUpperCase();
        return {
            id,
            type: guessedType,
            displayId: `${prefix}-${shortId}`,
            title: `${guessedType.charAt(0).toUpperCase() + guessedType.slice(1)} (#...${shortId})`,
            subtitle: `Ref ID: ...${shortId}`,
            details: {
                reference: `...${shortId}`,
            },
        };
    };

    const getActionMeta = (log: IBookingLog) => {
        const action = log.action.toLowerCase();

        if (action === "status_change" || action === "status") {
            const nextStatus =
                typeof log.newData === "object"
                    ? log.newData?.status?.toLowerCase()
                    : typeof log.newData === "string"
                    ? log.newData.toLowerCase()
                    : "";

            if (nextStatus === "completed") {
                return {
                    label: "Booking Completed",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            }
            if (nextStatus === "cancelled") {
                return {
                    label: "Booking Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            }
            if (nextStatus === "on_hold") {
                return {
                    label: "Booking On Hold",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            }
            return {
                label: "Status Changed",
                icon: Activity,
                dotColor: "bg-blue-500",
                badgeColor:
                    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
            };
        }

        switch (action) {
            case "passenger_cancellation":
                return {
                    label: "Traveler Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "approval_requested":
                return {
                    label: "Approval Requested",
                    icon: Clock,
                    dotColor: "bg-amber-500",
                    badgeColor:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                };
            case "approval_approved":
                return {
                    label: "Approval Granted",
                    icon: CheckCircle2,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "approval_rejected":
                return {
                    label: "Approval Rejected",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "create":
            case "created":
                return {
                    label: "Booking Created",
                    icon: UserCheck,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "cancel":
            case "cancelled":
                return {
                    label: "Booking Cancelled",
                    icon: XCircle,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            case "batch_change":
            case "move":
                return {
                    label: "Batch Transferred",
                    icon: ArrowRightLeft,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "payment":
            case "payment_add":
                return {
                    label: "Payment Recorded",
                    icon: CreditCard,
                    dotColor: "bg-emerald-500",
                    badgeColor:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                };
            case "refund":
                return {
                    label: "Payment Refunded",
                    icon: RotateCcw,
                    dotColor: "bg-purple-500",
                    badgeColor:
                        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
                };
            case "update":
            case "updated":
                return {
                    label: "Booking Updated",
                    icon: Edit3,
                    dotColor: "bg-indigo-500",
                    badgeColor:
                        "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
                };
            case "coordinator_add":
                return {
                    label: "Coordinator Added",
                    icon: UserCheck,
                    dotColor: "bg-blue-500",
                    badgeColor:
                        "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
                };
            case "coordinator_remove":
                return {
                    label: "Coordinator Removed",
                    icon: Trash2,
                    dotColor: "bg-rose-500",
                    badgeColor:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                };
            default:
                return {
                    label: action.replace(/_/g, " "),
                    icon: Activity,
                    dotColor: "bg-primary",
                    badgeColor: "bg-primary/10 text-primary border-primary/20",
                };
        }
    };

    const renderLogItem = (log: IBookingLog) => {
        const meta = getActionMeta(log);
        const Icon = meta.icon;
        const authorName = log.changedBy?.name || "System User";
        const authorInitials = authorName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
        const avatarUrl = (log.changedBy as any)?.profilePhoto
            ? getFileUrl((log.changedBy as any).profilePhoto)
            : undefined;

        return (
            <div key={log.id} className="relative flex items-start gap-3 group">
                {/* Centered Timeline Marker */}
                <div
                    className={`h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5 ${meta.dotColor}`}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content Card */}
                <div className="flex-1 min-w-0 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2">
                    {/* Action Badge & Timestamp (12-hour format strictly applied) */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <Badge
                            variant="outline"
                            className={`font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeColor}`}
                        >
                            {meta.label}
                        </Badge>

                        <span className="text-[11px] text-muted-foreground font-mono">
                            {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                        </span>
                    </div>

                    {/* Performer with Popover Profile Preview */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">By</span>
                        <HoverCard openDelay={150} closeDelay={150}>
                            <HoverCardTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer group/user focus:outline-none"
                                >
                                    <Avatar className="w-5 h-5 ring-1 ring-border shrink-0">
                                        {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                            {authorInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground group-hover/user:text-primary transition-colors underline-offset-2 hover:underline">
                                        {authorName}
                                    </span>
                                </button>
                            </HoverCardTrigger>
                            <HoverCardContent align="start" className="w-72 p-4 shadow-lg">
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-12 h-12 border shrink-0">
                                        {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                                        <AvatarFallback className="text-base bg-primary/10 text-primary font-bold">
                                            {authorInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold truncate text-foreground">
                                            {authorName}
                                        </h4>
                                        {log.changedBy?.email && (
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3 shrink-0 opacity-70" />
                                                {log.changedBy.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {log.changedBy?.id && (
                                    <div className="pt-3 mt-3 border-t flex justify-end">
                                        <NavLink to={`/employees/${log.changedBy.id}`}>
                                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                                                See Full Details
                                                <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </NavLink>
                                    </div>
                                )}
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    {/* Status transition diff */}
                    {(log.action === "status_change" || log.action === "status") && (
                        <div className="space-y-1 pt-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>Status:</span>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] uppercase font-mono px-1.5 py-0 bg-background"
                                >
                                    {typeof log.previousData === "object"
                                        ? log.previousData?.status || "pending"
                                        : String(log.previousData || "pending")}
                                </Badge>
                                <span>→</span>
                                <Badge
                                    className={`text-[10px] uppercase font-mono px-1.5 py-0 text-white ${
                                        (typeof log.newData === "object"
                                            ? log.newData?.status
                                            : log.newData) === "completed"
                                            ? "bg-emerald-600 hover:bg-emerald-600"
                                            : (typeof log.newData === "object"
                                                  ? log.newData?.status
                                                  : log.newData) === "cancelled"
                                            ? "bg-rose-600 hover:bg-rose-600"
                                            : (typeof log.newData === "object"
                                                  ? log.newData?.status
                                                  : log.newData) === "on_hold"
                                            ? "bg-amber-600 hover:bg-amber-600"
                                            : "bg-primary hover:bg-primary"
                                    }`}
                                >
                                    {typeof log.newData === "object"
                                        ? log.newData?.status || "completed"
                                        : String(log.newData || "completed")}
                                </Badge>
                            </div>
                            {typeof log.newData === "object" && log.newData?.reason && (
                                <p className="text-[11px] text-muted-foreground italic">
                                    Note: &quot;{log.newData.reason}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Booking Creation summary */}
                    {(log.action === "create" || log.action === "created") && (
                        <div className="text-xs text-muted-foreground pt-0.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Booking record created</span>
                        </div>
                    )}

                    {/* Payment recorded summary */}
                    {(log.action === "payment" || log.action === "payment_add") &&
                        log.newData && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-0.5">
                                {log.newData.amount && (
                                    <span>
                                        Amount:{" "}
                                        <strong className="text-foreground">
                                            {formatCurrency(Number(log.newData.amount))}
                                        </strong>
                                    </span>
                                )}
                                {log.newData.paymentMethod && (
                                    <span>
                                        Method:{" "}
                                        <strong className="text-foreground uppercase">
                                            {String(log.newData.paymentMethod).replace(/_/g, " ")}
                                        </strong>
                                    </span>
                                )}
                                {log.newData.paymentId && (
                                    <EntityReferencePill
                                        id={log.newData.paymentId}
                                        entityType="payment"
                                        meta={resolveMeta(log.newData.paymentId, "payment")}
                                    />
                                )}
                            </div>
                        )}

                    {/* Batch Transfer summary */}
                    {(log.action === "batch_change" || log.action === "move") && (
                        <div className="space-y-1.5 pt-0.5">
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-500" />
                                <span>Batch assignment transferred</span>
                            </div>
                            {log.newData?.targetBatchId && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-muted-foreground">New Batch:</span>
                                    <EntityReferencePill
                                        id={log.newData.targetBatchId}
                                        entityType="batch"
                                        meta={resolveMeta(log.newData.targetBatchId, "batch")}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cancellation & Passenger Cancellation details */}
                    {(log.action === "cancel" ||
                        log.action === "cancelled" ||
                        log.action === "passenger_cancellation") && (
                        <div className="space-y-2 pt-1 border-t border-border/40 mt-1">
                            {log.newData?.cancelledCustomerIds &&
                                Array.isArray(log.newData.cancelledCustomerIds) &&
                                log.newData.cancelledCustomerIds.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            Cancelled Traveler{log.newData.cancelledCustomerIds.length > 1 ? "s" : ""}:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                            {log.newData.cancelledCustomerIds.map((custId: string) => (
                                                <EntityReferencePill
                                                    key={custId}
                                                    id={custId}
                                                    entityType="customer"
                                                    meta={resolveMeta(custId, "customer")}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {log.newData?.refundAmount !== undefined &&
                                Number(log.newData.refundAmount) > 0 && (
                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                        <span className="text-muted-foreground font-medium">Refund Amount:</span>
                                        <strong className="text-foreground">
                                            {formatCurrency(Number(log.newData.refundAmount))}
                                        </strong>
                                        {log.newData?.refundPaymentId && (
                                            <EntityReferencePill
                                                id={log.newData.refundPaymentId}
                                                entityType="payment"
                                                meta={resolveMeta(log.newData.refundPaymentId, "payment")}
                                            />
                                        )}
                                    </div>
                                )}

                            {log.newData?.reason && (
                                <p className="text-[11px] text-muted-foreground italic">
                                    Reason: &quot;{log.newData.reason}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    {/* General updates summary with UUID masking and internal ID suppression */}
                    {log.action !== "status_change" &&
                        log.action !== "status" &&
                        log.action !== "create" &&
                        log.action !== "created" &&
                        log.action !== "payment" &&
                        log.action !== "payment_add" &&
                        log.action !== "batch_change" &&
                        log.action !== "move" &&
                        log.action !== "cancel" &&
                        log.action !== "cancelled" &&
                        log.action !== "passenger_cancellation" &&
                        log.newData &&
                        typeof log.newData === "object" && (
                            <div className="space-y-1.5 text-xs text-muted-foreground pt-0.5">
                                {Object.entries(log.newData).map(([key, value]) => {
                                    if (INTERNAL_FIELDS.has(key)) return null;

                                    const label = key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase());

                                    // Check if single UUID string
                                    if (typeof value === "string" && UUID_REGEX.test(value)) {
                                        return (
                                            <div key={key} className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-muted-foreground font-medium min-w-[70px]">
                                                    {label}:
                                                </span>
                                                <EntityReferencePill
                                                    id={value}
                                                    meta={resolveMeta(value, key)}
                                                />
                                            </div>
                                        );
                                    }

                                    // Check if array of UUID strings
                                    if (
                                        Array.isArray(value) &&
                                        value.length > 0 &&
                                        value.every((v) => typeof v === "string" && UUID_REGEX.test(v))
                                    ) {
                                        return (
                                            <div key={key} className="flex items-start gap-1.5 flex-wrap">
                                                <span className="text-muted-foreground font-medium min-w-[70px] pt-0.5">
                                                    {label}:
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {value.map((v: string) => (
                                                        <EntityReferencePill
                                                            key={v}
                                                            id={v}
                                                            meta={resolveMeta(v, key)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Currency amounts
                                    if (
                                        (key.toLowerCase().includes("amount") ||
                                            key.toLowerCase().includes("price") ||
                                            key.toLowerCase().includes("cost") ||
                                            key.toLowerCase().includes("discount")) &&
                                        typeof value === "number"
                                    ) {
                                        return (
                                            <div key={key} className="flex items-center gap-1.5">
                                                <span className="text-muted-foreground font-medium min-w-[70px]">
                                                    {label}:
                                                </span>
                                                <span className="text-foreground font-semibold">
                                                    {formatCurrency(Number(value))}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={key} className="flex items-center gap-1.5">
                                            <span className="text-muted-foreground font-medium min-w-[70px]">
                                                {label}:
                                            </span>
                                            <span className="truncate text-foreground font-medium">
                                                {typeof value === "object"
                                                    ? JSON.stringify(value)
                                                    : typeof value === "boolean"
                                                    ? value
                                                        ? "Yes"
                                                        : "No"
                                                    : String(value)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>
            </div>
        );
    };

    const displayedLogs = logs.slice(0, 5);

    return (
        <>
            <Card className="shadow-xs border border-border/80">
                <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <div>
                                <CardTitle className="text-base font-bold tracking-tight">
                                    Activity & Audit Logs
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Complete timeline of booking updates and financial events.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            {total} {total === 1 ? "entry" : "entries"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                            <FileText className="w-8 h-8 mb-2 opacity-40" />
                            <p className="font-medium text-xs">No activity logs recorded</p>
                        </div>
                    ) : (
                        <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                            {displayedLogs.map(renderLogItem)}
                        </div>
                    )}

                    {total > 5 && (
                        <div className="pt-4 flex justify-center border-t border-border/40 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs text-primary font-medium hover:text-primary/80 hover:bg-primary/5 transition-colors gap-1.5"
                            >
                                <History className="w-3.5 h-3.5" />
                                Show All ({total} events)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Audit Logs Modal with Infinite Scroll */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl sm:max-w-2xl w-[95vw] h-[80vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 sm:p-5 border-b shrink-0">
                        <div className="flex items-center justify-between pr-6">
                            <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Activity & Audit Logs
                            </DialogTitle>
                            <Badge variant="secondary" className="font-normal text-xs font-mono">
                                {total} {total === 1 ? "entry" : "entries"}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Complete timeline of booking updates, status transitions, and payments.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-5"
                    >
                        <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80">
                            {modalLogs.map(renderLogItem)}
                        </div>

                        {hasMore && !loadingMore && (
                            <div className="flex justify-center pt-2 pb-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadMore()}
                                    className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
                                >
                                    <History className="w-3.5 h-3.5" />
                                    Load More Logs
                                </Button>
                            </div>
                        )}

                        {loadingMore && (
                            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span>Loading older logs...</span>
                            </div>
                        )}

                        {!hasMore && (
                            <p className="text-center text-xs text-muted-foreground/60 py-3">
                                All {total} events loaded
                            </p>
                        )}

                        <div ref={sentinelRef} className="h-4 w-full shrink-0" />
                    </div>

                    <div className="p-3 px-5 border-t bg-muted/10 flex justify-end shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsModalOpen(false)}
                            className="text-xs"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BookingLogsCard;
