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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";
import { BatchOffersService } from "@/services/batch-offers.service";
import BookingService from "@/services/booking.service";
import type { IBatchOffer } from "@/types/batch-offers.types";
import type { IBatches, IBatchLog } from "@/types/batches.types";
import type { IBooking } from "@/types/booking.types";
import type { IEmployee } from "@/types/employee.types";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock,
    Copy,
    DollarSign,
    Download,
    Edit,
    ExternalLink,
    Layers,
    Mail,
    MapPin,
    Phone,
    Plus,
    Receipt,
    ShieldCheck,
    Sparkles,
    Tag,
    Timer,
    Trash2,
    UserCheck,
    Users,
    UserX,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CancelBookingDialog } from "../bookings/_components/cancel-booking-dialog";
import { CreateBookingDialog } from "../bookings/_components/create-booking-dialog";
import { BatchBookingsCard } from "./_components/batch-bookings-card";
import { BatchCostBreakdownModal } from "./_components/batch-cost-breakdown-modal";
import { BatchLogsCard } from "./_components/batch-logs-card";
import { BatchOfferDialog } from "./_components/batch-offer-dialog";
import { BatchReportModal } from "./_components/batch-report-modal";
import { BookingModal } from "./_components/booking-modal";
import { CoordinatorModal } from "./_components/coordinator-modal";

export default function BatchDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<IBatches>();
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
    const [viewMode, setViewMode] = useState<"detailed" | "table" | "workflow">("table");
    const [cancelledViewMode, setCancelledViewMode] = useState<"detailed" | "table" | "workflow">("table");
    const [selectedCoordinator, setSelectedCoordinator] = useState<IEmployee | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [batchLogs, setBatchLogs] = useState<IBatchLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [costBreakdownOpen, setCostBreakdownOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const [blocks, setBlocks] = useState<any[]>([]);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [blockSlotsCount, setBlockSlotsCount] = useState(1);
    const [blockReason, setBlockReason] = useState("");
    const [isBlocking, setIsBlocking] = useState(false);
    const [bookingBlockOpen, setBookingBlockOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState<string>("");
    const [selectedBlockSlots, setSelectedBlockSlots] = useState<number>(0);

    // Special Offers state & permissions
    const [offers, setOffers] = useState<IBatchOffer[]>([]);
    const [offerDialogOpen, setOfferDialogOpen] = useState(false);
    const [selectedOfferToEdit, setSelectedOfferToEdit] = useState<IBatchOffer | null>(null);

    const { hasPermission: canCreateOffer } = useHasPermission("batch-offer", "create");
    const { hasPermission: canUpdateOffer } = useHasPermission("batch-offer", "update");
    const { hasPermission: canDeleteOffer } = useHasPermission("batch-offer", "delete");

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const res = await axiosInstance.get<IBatchLog[]>(`/batches/${id}/logs`);
            setBatchLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoadingLogs(false);
        }
    }, [id]);

    const fetchBlocks = useCallback(async () => {
        try {
            const res = await axiosInstance.get<any[]>(`/batches/${id}/blocks`);
            setBlocks(res.data);
        } catch (error) {
            console.error("Failed to fetch blocks", error);
        }
    }, [id]);

    const fetchOffers = useCallback(async () => {
        if (!id) return;
        try {
            const data = await BatchOffersService.getBatchOffers(id);
            setOffers(data);
        } catch (error) {
            console.error("Failed to fetch special offers", error);
        }
    }, [id]);

    const handleToggleOffer = async (offerId: string) => {
        if (!id) return;
        try {
            await BatchOffersService.toggleBatchOfferStatus(id, offerId);
            toast.success("Offer status updated");
            fetchOffers();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update offer status");
        }
    };

    const handleDeleteOffer = async (offerId: string) => {
        if (!id) return;
        try {
            await BatchOffersService.deleteBatchOffer(id, offerId);
            toast.success("Offer deleted successfully");
            fetchOffers();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete offer");
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getBranch = useCallback(async () => {
        try {
            const res = await axiosInstance.get<IBatches>(`/batches/${id}`);
            setBatch(res.data);
        } catch (error) {
            console.error("Failed to fetch batch details", error);
            toast.error("Failed to fetch batch details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getBranch();
        fetchLogs();
        fetchBlocks();
        fetchOffers();
    }, [getBranch, fetchLogs, fetchBlocks, fetchOffers]);

    const handleStatusUpdate = (newStatus: string) => {
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusUpdate = async () => {
        if (!pendingStatus) return;
        setIsUpdatingStatus(true);
        setShowStatusConfirm(false);

        try {
            await axiosInstance.patch(`/batches/${id}/status`, {
                status: pendingStatus,
            });
            toast.success(`Batch status updated to ${pendingStatus}`);
            getBranch();
            fetchLogs();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update status"
            );
        } finally {
            setIsUpdatingStatus(false);
            setPendingStatus(null);
        }
    };

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellingBooking, setCancellingBooking] = useState<IBooking | null>(null);
    const [cancellingCustomerId, setCancellingCustomerId] = useState<string | null>(null);

    const handleOpenCancelDialog = async (bookingItem: IBooking, customerId?: string) => {
        try {
            const detailedBooking = await BookingService.getBookingById(bookingItem.id);
            setCancellingBooking(detailedBooking);
        } catch {
            setCancellingBooking(bookingItem);
        }
        setCancellingCustomerId(customerId || null);
        setCancelDialogOpen(true);
    };

    const activeBookings =
        batch?.bookings?.filter((b) => b.status !== "cancelled") || [];
    const cancelledBookings =
        batch?.bookings?.filter((b) => b.status === "cancelled") || [];

    const totalBatchExpected = activeBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const totalBatchPaid = activeBookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);
    const totalBatchRemaining = activeBookings.reduce((sum, b) => sum + (Number(b.balanceAmount) || 0), 0);

    const getBatchDueInfo = (batchObj: IBatches) => {
        if (batchObj.status !== "upcoming") return null;

        const startDate = new Date(batchObj.startDate);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                label: "Date Passed",
                highlightClass: "text-red-600 dark:text-red-400 font-semibold",
                iconClass: "text-red-600 dark:text-red-400",
                tooltipText: "Batch start date has passed. Please mark this as active, completed or archived.",
            };
        } else if (diffDays === 0) {
            return {
                label: "Starts Today",
                highlightClass: "text-orange-500 dark:text-orange-400 font-semibold",
                iconClass: "text-orange-500 dark:text-orange-400",
                tooltipText: "Batch starts today!",
            };
        } else if (diffDays <= 3) {
            return {
                label: `Starts in ${diffDays}d`,
                highlightClass: "text-orange-500 dark:text-orange-400 font-semibold",
                iconClass: "text-orange-500 dark:text-orange-400",
                tooltipText: `Batch is starting soon (due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}).`,
            };
        } else if (diffDays <= 7) {
            return {
                label: `Due in ${diffDays}d`,
                highlightClass: "text-yellow-500 dark:text-yellow-400 font-semibold",
                iconClass: "text-yellow-500 dark:text-yellow-400",
                tooltipText: `Batch is approaching start date (due in ${diffDays} days).`,
            };
        }
        return null;
    };

    const getStatusConfig = (status?: string) => {
        switch (status) {
            case "active":
                return {
                    label: "Active",
                    borderAccent: "bg-emerald-500",
                    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                    dotClass: "bg-emerald-500 animate-pulse",
                    icon: CheckCircle2,
                };
            case "upcoming":
                return {
                    label: "Upcoming",
                    borderAccent: "bg-blue-500",
                    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                    dotClass: "bg-blue-500",
                    icon: Clock,
                };
            case "completed":
                return {
                    label: "Completed",
                    borderAccent: "bg-muted-foreground",
                    badgeClass: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300",
                    dotClass: "bg-gray-400",
                    icon: Check,
                };
            case "on_hold":
                return {
                    label: "On Hold",
                    borderAccent: "bg-amber-500",
                    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                    dotClass: "bg-amber-500",
                    icon: AlertCircle,
                };
            case "archived":
                return {
                    label: "Archived",
                    borderAccent: "bg-purple-500",
                    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
                    dotClass: "bg-purple-500",
                    icon: XCircle,
                };
            default:
                return {
                    label: status || "Unknown",
                    borderAccent: "bg-primary",
                    badgeClass: "bg-muted text-foreground border-border",
                    dotClass: "bg-primary",
                    icon: Clock,
                };
        }
    };

    if (loading || !batch) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/batches")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Batches
                    </Button>
                </div>
                <Card className="p-8">
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 w-1/3 bg-muted rounded" />
                        <div className="h-4 w-1/4 bg-muted rounded" />
                        <div className="grid grid-cols-3 gap-6 pt-4">
                            <div className="h-24 bg-muted rounded" />
                            <div className="h-24 bg-muted rounded" />
                            <div className="h-24 bg-muted rounded" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const statusConfig = getStatusConfig(batch.status);
    const StatusIcon = statusConfig.icon;
    const dueInfo = getBatchDueInfo(batch);

    // Capacity numbers
    const totalSeats = batch.totalSeats || 0;
    const bookedSeats = batch.bookedSeats || 0;
    const blockedSeats = batch.blockedSeats || 0;
    const availableSeats = Math.max(0, totalSeats - bookedSeats - blockedSeats);
    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    // Resolve adult floor price from costSheet or fallback
    const defaultTier =
        batch.costSheet?.tiers?.find((t: any) => t.isDefault) ||
        batch.costSheet?.tiers?.[0];
    const adultCat =
        defaultTier?.ageCategories?.find(
            (c: any) =>
                c.categoryKey === "adult" ||
                (c.name && c.name.toLowerCase().includes("adult"))
        ) || defaultTier?.ageCategories?.[0];

    const adultFloorPrice = adultCat
        ? adultCat.items.reduce((s: number, i: any) => s + (Number(i.cost) || 0), 0)
        : Number(batch.package?.packageTiers?.[0]?.adultCost) || 0;

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
            {/* Top Navigation & Breadcrumb Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <NavLink to="/batches" className="flex items-center gap-1">
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                    Batches
                                </NavLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-semibold text-foreground">
                                {batch.package?.name || "Batch Details"}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Status Dropdown */}
                    <div className="flex items-center">
                        <Select
                            value={batch.status}
                            onValueChange={handleStatusUpdate}
                            disabled={isUpdatingStatus}
                        >
                            <SelectTrigger className="h-9 w-32 font-semibold text-xs border-border/80">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Download Report button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDownloadModal(true)}
                        className="h-9 text-xs font-semibold"
                    >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Report
                    </Button>

                    {/* Edit Batch CTA */}
                    <NavLink to={`/batches/edit/${id}`}>
                        <Button size="sm" className="h-9 text-xs font-semibold">
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Edit Batch
                        </Button>
                    </NavLink>

                    {/* New Booking CTA */}
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setBookingBlockOpen(true)}
                        className="h-9 text-xs font-semibold"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Hero Summary Card */}
            <Card className="border-border/80 shadow-xs overflow-hidden relative">
                {/* Status glow border accent */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${statusConfig.borderAccent}`}
                />

                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Primary Identifiers & Metrics */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border">
                                    #{batch.id.slice(0, 8)}
                                </span>

                                <button
                                    onClick={() => handleCopy(batch.id, "batchId")}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                                    title="Copy Batch ID"
                                >
                                    {copiedField === "batchId" ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>

                                {/* Status Pill */}
                                <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {statusConfig.label}
                                </div>

                                {/* Due / Start countdown pill */}
                                {dueInfo && (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs font-semibold flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300`}
                                        title={dueInfo.tooltipText}
                                    >
                                        <Timer className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                        {dueInfo.label}
                                    </Badge>
                                )}

                                {/* Package Destination Badge */}
                                {batch.package?.destination && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                        <MapPin className="w-3 h-3 mr-1 text-primary" />
                                        {batch.package.destination}
                                    </Badge>
                                )}

                                {/* Duration Badge */}
                                {batch.package?.days && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                        {batch.package.days} Days / {batch.package.nights} Nights
                                    </Badge>
                                )}
                            </div>

                            {/* Primary Metric: Floor Rate or Expected Revenue */}
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                                    {BookingService.formatCurrency(adultFloorPrice)}
                                </h2>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    Starting Adult Rate
                                </span>
                            </div>

                            {/* Subtitle Details Line */}
                            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>
                                    Tour:{" "}
                                    <NavLink
                                        to={`/packages/${batch.packageId}`}
                                        className="font-bold text-foreground hover:underline inline-flex items-center gap-0.5"
                                    >
                                        {batch.package?.name}
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </NavLink>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    {format(new Date(batch.startDate), "MMM d, yyyy")} -{" "}
                                    {format(new Date(batch.endDate), "MMM d, yyyy")}
                                </span>
                                <span>•</span>
                                <span>
                                    <strong>{bookedSeats}</strong> of {totalSeats} Seats Booked
                                </span>
                            </p>
                        </div>

                        {/* Right Quick Occupancy Indicator */}
                        <div className="flex flex-col items-start lg:items-end justify-center gap-3 shrink-0 p-4 rounded-xl bg-muted/30 border min-w-[260px]">
                            <div className="w-full flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    Seat Occupancy
                                </span>
                                <span className="font-bold font-mono text-foreground">
                                    {occupancyRate}% Full
                                </span>
                            </div>

                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        occupancyRate >= 90
                                            ? "bg-red-500"
                                            : occupancyRate >= 60
                                                ? "bg-amber-500"
                                                : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${Math.min(100, occupancyRate)}%` }}
                                />
                            </div>

                            <div className="w-full flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>
                                    {availableSeats > 0 ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                            {availableSeats} seats available
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">
                                            Fully Booked
                                        </span>
                                    )}
                                </span>
                                {blockedSeats > 0 && (
                                    <span className="text-amber-600 font-medium">
                                        ({blockedSeats} reserved)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2-Column Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Column (Left 2-Cols) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Capacity & Financial Progress Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                        Capacity & Financial Progress
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Occupancy load and revenue collection pipeline for this batch
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Seat Allocation Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                    <span>Seat Allocations</span>
                                    <span>
                                        {bookedSeats} booked • {blockedSeats} blocked • {availableSeats} remaining
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-xl bg-muted/30 border text-center">
                                        <span className="text-[11px] text-muted-foreground block font-medium">
                                            Booked
                                        </span>
                                        <span className="text-xl font-extrabold text-foreground font-mono">
                                            {bookedSeats}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                        <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-medium">
                                            Blocked
                                        </span>
                                        <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                                            {blockedSeats}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
                                            Available
                                        </span>
                                        <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                                            {availableSeats}
                                        </span>
                                    </div>
                                </div>
                                {batch.seatChangeReason && (
                                    <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground flex items-start gap-2 mt-2">
                                        <ClipboardList className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-foreground">Capacity Adjustment Reason: </span>
                                            {batch.seatChangeReason}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Financial Progress */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                    <span>Revenue Pipeline</span>
                                    <span>
                                        Collection:{" "}
                                        <strong className="text-foreground">
                                            {totalBatchExpected > 0
                                                ? Math.round((totalBatchPaid / totalBatchExpected) * 100)
                                                : 0}
                                            %
                                        </strong>
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-1">
                                            Total Expected
                                        </p>
                                        <p className="text-xl font-extrabold font-mono text-foreground">
                                            {BookingService.formatCurrency(totalBatchExpected)}
                                        </p>
                                    </div>
                                    <div className="border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-border">
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                                            Total Collected
                                        </p>
                                        <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                                            {BookingService.formatCurrency(totalBatchPaid)}
                                        </p>
                                    </div>
                                    <div className="border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-border">
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                            Balance Pending
                                        </p>
                                        <p className="text-xl font-extrabold font-mono text-red-600 dark:text-red-400">
                                            {BookingService.formatCurrency(totalBatchRemaining)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{
                                                width: `${
                                                    totalBatchExpected > 0
                                                        ? Math.min(
                                                              100,
                                                              Math.round(
                                                                  (totalBatchPaid / totalBatchExpected) * 100
                                                              )
                                                          )
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Batch Cost Sheet & Dynamic Pricing Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-primary" />
                                        Batch Cost Sheet & Dynamic Pricing
                                        {batch.costSheet?.hasTiers && (
                                            <Badge
                                                variant="outline"
                                                className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 ml-1.5"
                                            >
                                                <Layers className="w-3 h-3 mr-1" />
                                                Multi-Tier ({batch.costSheet.tiers.length})
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Itemized expense schedule, operator margin, and traveler age rates
                                    </CardDescription>
                                </div>

                                {/* Prominent "View Cost Breakdown" CTA Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCostBreakdownOpen(true)}
                                    className="border-primary/30 text-primary hover:bg-primary/10 font-semibold text-xs h-8.5 shrink-0"
                                >
                                    <Receipt className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                    View Cost Breakdown
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Max Discount Policy Banner if enabled */}
                            {batch.costSheet?.maxDiscountEnabled && (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        Active Maximum Discount Cap:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs bg-amber-500/20 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold"
                                    >
                                        {batch.costSheet.maxDiscountType === "percentage"
                                            ? `${batch.costSheet.maxDiscountPercentage ?? batch.costSheet.maxDiscountValue}% Off`
                                            : `₹${(batch.costSheet.maxDiscountValue || 0).toLocaleString("en-IN")} Off`}
                                        {" "}
                                        {batch.costSheet.maxDiscountScope === "passenger"
                                            ? "/ Passenger"
                                            : "Total Booking"}
                                    </Badge>
                                </div>
                            )}

                            {/* Tiers & Age Categories Grid */}
                            {batch.costSheet?.tiers && batch.costSheet.tiers.length > 0 ? (
                                <div className="space-y-4">
                                    {batch.costSheet.tiers.map((tier: any) => (
                                        <div
                                            key={tier.id}
                                            className="p-4 rounded-xl border border-border/80 bg-card space-y-3"
                                        >
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {tier.name}
                                                    </span>
                                                    {tier.isDefault && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            Default Tier
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {tier.ageCategories?.length || 0} Rate Categories
                                                </span>
                                            </div>

                                            {/* Age Categories Cards */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                                {tier.ageCategories?.map((cat: any) => {
                                                    const catTotal = cat.items.reduce(
                                                        (sum: number, item: any) =>
                                                            sum + (Number(item.cost) || 0),
                                                        0
                                                    );
                                                    const marginItem = cat.items.find(
                                                        (i: any) => i.isMargin
                                                    );

                                                    return (
                                                        <div
                                                            key={cat.id || cat.categoryKey || cat.name}
                                                            className="p-3 rounded-lg border bg-muted/20 space-y-1"
                                                        >
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="font-semibold text-foreground">
                                                                    {cat.label || cat.name}
                                                                </span>
                                                                {marginItem && (
                                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                                        +₹{Number(marginItem.cost).toLocaleString()} margin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-lg font-extrabold font-mono text-foreground">
                                                                {BookingService.formatCurrency(catTotal)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : batch.package?.packageTiers && batch.package.packageTiers.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="text-xs text-muted-foreground">
                                        This batch uses legacy package pricing tiers:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {batch.package.packageTiers.map((tier: any) => (
                                            <div
                                                key={tier.id || tier.name}
                                                className="p-3 rounded-xl border bg-muted/20 space-y-1"
                                            >
                                                <div className="font-bold text-xs">{tier.name}</div>
                                                <div className="text-sm font-mono font-extrabold text-foreground">
                                                    Adult: {BookingService.formatCurrency(Number(tier.adultCost) || 0)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-muted-foreground text-xs space-y-2">
                                    <p>No dynamic cost sheet configured for this batch.</p>
                                    <NavLink to={`/batches/edit/${id}`}>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            Configure Cost Sheet in Edit Batch
                                        </Button>
                                    </NavLink>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bookings & Passenger Roster Section */}
                    <div className="space-y-4">
                        <BatchBookingsCard
                            title="Active Batch Bookings"
                            count={activeBookings.length}
                            icon={<Users className="w-5 h-5 text-primary" />}
                            bookings={activeBookings}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            onSelectBooking={setSelectedBooking}
                            onCancelBooking={handleOpenCancelDialog}
                        />

                        {cancelledBookings.length > 0 && (
                            <BatchBookingsCard
                                title="Cancelled Bookings Archive"
                                count={cancelledBookings.length}
                                icon={<UserX className="w-5 h-5 text-red-500" />}
                                bookings={cancelledBookings}
                                viewMode={cancelledViewMode}
                                onViewModeChange={setCancelledViewMode}
                                onSelectBooking={setSelectedBooking}
                                onCancelBooking={handleOpenCancelDialog}
                                isCancelled={true}
                                emptyText="No cancelled bookings found"
                            />
                        )}
                    </div>

                    {/* Seat Blocks & Special Offers Tabs */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Seat Reservations & Special Offers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Tabs defaultValue="blocks" className="space-y-4">
                                <TabsList className="grid grid-cols-2 max-w-sm">
                                    <TabsTrigger value="blocks" className="text-xs font-semibold">
                                        Seat Blocks ({blocks.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="offers" className="text-xs font-semibold">
                                        Special Offers ({offers.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Seat Blocks Tab */}
                                <TabsContent value="blocks" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Temporarily reserve slots for high-priority inquiries or groups.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setBlockDialogOpen(true)}
                                            className="text-xs h-8"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Block Slots
                                        </Button>
                                    </div>

                                    {blocks.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs border rounded-xl border-dashed">
                                            No active seat reservations.
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {blocks.map((block) => (
                                                <div
                                                    key={block.id}
                                                    className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs">
                                                                {block.slots} Slot{block.slots > 1 ? "s" : ""} Reserved
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {block.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {block.reason || "No details provided"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setSelectedBlockId(block.id);
                                                                setSelectedBlockSlots(block.slots);
                                                                setBookingBlockOpen(true);
                                                            }}
                                                            className="text-xs h-8"
                                                        >
                                                            Book These Slots
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                try {
                                                                    await axiosInstance.delete(
                                                                        `/batches/${id}/block/${block.id}`
                                                                    );
                                                                    toast.success("Block released");
                                                                    fetchBlocks();
                                                                    getBranch();
                                                                } catch (error) {
                                                                    toast.error("Failed to release block");
                                                                }
                                                            }}
                                                            className="text-xs text-red-600 hover:text-red-700 h-8"
                                                        >
                                                            Release
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Special Offers Tab */}
                                <TabsContent value="offers" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Promotional discounts and targeted batch incentives.
                                        </p>
                                        {canCreateOffer && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedOfferToEdit(null);
                                                    setOfferDialogOpen(true);
                                                }}
                                                className="text-xs h-8"
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" />
                                                Add Offer
                                            </Button>
                                        )}
                                    </div>

                                    {offers.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs border rounded-xl border-dashed">
                                            No special promotional offers active for this batch.
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {offers.map((offer) => (
                                                <div
                                                    key={offer.id}
                                                    className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs">
                                                                {offer.name}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] font-mono text-emerald-600 border-emerald-300"
                                                            >
                                                                {offer.discountType === "percentage"
                                                                    ? `${offer.discountValue}% OFF`
                                                                    : `₹${Number(offer.discountValue).toLocaleString("en-IN")} OFF`}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Min {offer.minTravelers} traveler{offer.minTravelers > 1 ? "s" : ""}
                                                            {offer.validUntil
                                                                ? ` • Valid until ${format(new Date(offer.validUntil), "MMM d, yyyy")}`
                                                                : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                                        <Switch
                                                            checked={offer.isActive}
                                                            onCheckedChange={() => handleToggleOffer(offer.id)}
                                                            title={offer.isActive ? "Deactivate offer" : "Activate offer"}
                                                        />
                                                        {canUpdateOffer && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setSelectedOfferToEdit(offer);
                                                                    setOfferDialogOpen(true);
                                                                }}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                        {canDeleteOffer && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteOffer(offer.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Tour Package Reference Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Tour Package Overview
                                </CardTitle>
                                <NavLink to={`/packages/${batch.packageId}`}>
                                    <Button variant="ghost" size="sm" className="text-xs h-8">
                                        View Full Package
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                </NavLink>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-sm text-foreground">
                                    {batch.package?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {batch.package?.description || "No package description provided."}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge variant="outline" className="text-xs">
                                    <MapPin className="w-3 h-3 mr-1 text-primary" />
                                    {batch.package?.destination || "Destination N/A"}
                                </Badge>
                                {batch.package?.days && (
                                    <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                        {batch.package.days} Days / {batch.package.nights} Nights
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Right 1-Col) */}
                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Quick Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Button
                                className="w-full justify-start text-xs font-semibold"
                                onClick={() => setBookingBlockOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Booking for this Batch
                            </Button>
                            <NavLink to={`/batches/edit/${id}`} className="block">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-xs font-semibold"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Batch Configuration
                                </Button>
                            </NavLink>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-xs font-semibold"
                                onClick={() => setCostBreakdownOpen(true)}
                            >
                                <Receipt className="w-4 h-4 mr-2 text-primary" />
                                View Full Cost Breakdown
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-xs font-semibold"
                                onClick={() => setBlockDialogOpen(true)}
                            >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Temporarily Reserve Seats
                            </Button>
                            {canCreateOffer && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-xs font-semibold"
                                    onClick={() => {
                                        setSelectedOfferToEdit(null);
                                        setOfferDialogOpen(true);
                                    }}
                                >
                                    <Tag className="w-4 h-4 mr-2" />
                                    Create Special Offer
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full justify-start text-xs font-semibold"
                                onClick={() => setShowDownloadModal(true)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Batch Report
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Batch Coordinators Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    Assigned Coordinators
                                </CardTitle>
                                <Badge variant="outline" className="text-xs font-mono">
                                    {batch.coordinators?.length || 0}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {!batch.coordinators || batch.coordinators.length === 0 ? (
                                <div className="py-6 text-center text-muted-foreground text-xs">
                                    No coordinators assigned yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {batch.coordinators.map((coordinator) => (
                                        <div
                                            key={coordinator.id}
                                            className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                                        >
                                            <div
                                                className="flex items-center gap-3 cursor-pointer min-w-0"
                                                onClick={() => setSelectedCoordinator(coordinator)}
                                            >
                                                <Avatar className="w-9 h-9 border shrink-0">
                                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                        {coordinator.name
                                                            ? coordinator.name
                                                                  .split(" ")
                                                                  .map((n) => n[0])
                                                                  .join("")
                                                                  .slice(0, 2)
                                                                  .toUpperCase()
                                                            : "CO"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-foreground truncate">
                                                        {coordinator.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {coordinator.phone || coordinator.email || "Lead Coordinator"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {coordinator.phone && (
                                                    <a
                                                        href={`tel:${coordinator.phone}`}
                                                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                                                        title="Call Coordinator"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                {coordinator.email && (
                                                    <a
                                                        href={`mailto:${coordinator.email}`}
                                                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                                                        title="Email Coordinator"
                                                    >
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Batch Activity & Audit Logs Card */}
                    <div>
                        <BatchLogsCard logs={batchLogs} loading={loadingLogs} />
                    </div>
                </div>
            </div>

            {/* Itemized Cost Breakdown Modal */}
            <BatchCostBreakdownModal
                open={costBreakdownOpen}
                onOpenChange={setCostBreakdownOpen}
                costSheet={batch.costSheet}
                packageName={batch.package?.name}
            />

            {/* Modals & Dialogs */}
            {selectedBooking && batch && (
                <BookingModal
                    booking={selectedBooking}
                    open={!!selectedBooking}
                    onOpenChange={(open) => !open && setSelectedBooking(null)}
                    onUpdate={getBranch}
                />
            )}

            {batch && (
                <BatchReportModal
                    open={showDownloadModal}
                    onOpenChange={setShowDownloadModal}
                    batch={batch}
                />
            )}

            <AlertDialog
                open={showStatusConfirm}
                onOpenChange={setShowStatusConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Batch Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="block mb-2">
                                Are you sure you want to change the batch status to{" "}
                                <span className="font-bold underline capitalize">
                                    {pendingStatus}
                                </span>?
                            </span>
                            {batch && activeBookings.length === 0 && (
                                <span className="block text-amber-600 font-medium mb-1 italic">
                                    ⚠️ This batch has no active bookings.
                                </span>
                            )}
                            {batch &&
                                batch.bookedSeats < batch.totalSeats &&
                                activeBookings.length > 0 && (
                                    <span className="block text-amber-600 font-medium mb-1 italic">
                                        ⚠️ This batch is not full yet ({batch.bookedSeats}/
                                        {batch.totalSeats} seats booked).
                                    </span>
                                )}
                            <span className="block mt-2">
                                This action may affect the visibility and workflow of
                                related bookings.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowStatusConfirm(false);
                                setPendingStatus(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusUpdate}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? "Updating..." : "Confirm Change"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {selectedCoordinator && (
                <CoordinatorModal
                    coordinator={selectedCoordinator}
                    open={!!selectedCoordinator}
                    onOpenChange={(open) =>
                        !open && setSelectedCoordinator(null)
                    }
                />
            )}

            {/* Block Slots Dialog */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Temporarily Block Slots</DialogTitle>
                        <DialogDescription>
                            Enter the number of slots to reserve and the sales inquiry detail. Capacity of the batch will be increased automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="slots">Number of Slots</Label>
                            <Input
                                id="slots"
                                type="number"
                                min={1}
                                value={blockSlotsCount}
                                onChange={(e) => setBlockSlotsCount(parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason / Inquiry Details</Label>
                            <Input
                                id="reason"
                                placeholder="e.g. Enquiry from John Doe (sure to pay in 2 days)"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (blockSlotsCount < 1) {
                                    toast.error("Please enter a valid number of slots");
                                    return;
                                }
                                setIsBlocking(true);
                                try {
                                    await axiosInstance.post(`/batches/${id}/block`, {
                                        slots: blockSlotsCount,
                                        reason: blockReason,
                                    });
                                    toast.success("Slots blocked successfully");
                                    setBlockDialogOpen(false);
                                    getBranch();
                                } catch (error) {
                                    toast.error("Failed to block slots");
                                } finally {
                                    setIsBlocking(false);
                                }
                            }}
                            disabled={isBlocking}
                            className="bg-primary"
                        >
                            {isBlocking ? "Blocking..." : "Confirm Block"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Special Offer Dialog */}
            {offerDialogOpen && id && (
                <BatchOfferDialog
                    open={offerDialogOpen}
                    onOpenChange={setOfferDialogOpen}
                    batchId={id}
                    offerToEdit={selectedOfferToEdit}
                    onSaved={fetchOffers}
                />
            )}

            {/* Create Booking Dialog */}
            {bookingBlockOpen && batch && (
                <CreateBookingDialog
                    open={bookingBlockOpen}
                    onOpenChange={setBookingBlockOpen}
                    onBookingCreated={() => {
                        setBookingBlockOpen(false);
                        getBranch();
                    }}
                    preselectedBatchId={batch.id}
                    preselectedPackageId={batch.packageId}
                    preselectedBlockId={selectedBlockId}
                    preselectedBlockSlots={selectedBlockSlots}
                />
            )}

            {/* Cancel Booking & Partial Cancellation Dialog */}
            {cancellingBooking && (
                <CancelBookingDialog
                    open={cancelDialogOpen}
                    onOpenChange={(open) => {
                        setCancelDialogOpen(open);
                        if (!open) {
                            setCancellingBooking(null);
                            setCancellingCustomerId(null);
                        }
                    }}
                    booking={cancellingBooking}
                    initialCustomerId={cancellingCustomerId}
                    onSuccess={() => {
                        getBranch();
                    }}
                />
            )}
        </div>
    );
}
