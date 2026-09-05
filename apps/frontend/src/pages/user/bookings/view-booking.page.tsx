import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { WorkflowManager } from "@/components/workflow/workflow-manager";
import { useAuth } from "@/context/authContext";
import BookingService from "@/services/booking.service";
import { InvoiceService } from "@/services/invoice.service";
import PaymentService from "@/services/payment.service";
import { AgentPayoutStatus } from "@/types/agent.types";
import type { IBatches } from "@/types/batches.types";
import type {
    BookingStatus,
    IBooking,
    IBookingLog,
} from "@/types/booking.types";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRightLeft,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    ExternalLink,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plus,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    Users,
    UserX,
    XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PayoutDialog } from "../agents/_components/payout-dialog";
import { BookingLogsCard } from "./_components/booking-logs-card";
import { CompleteBookingDialog } from "./_components/complete-booking-dialog";
import { CancelBookingDialog } from "./_components/cancel-booking-dialog";

export default function BookingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [bookingLogs, setBookingLogs] = useState<IBookingLog[]>([]);
    const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelInitialCustomerId, setCancelInitialCustomerId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const [payoutModal, setPayoutModal] = useState<{
        open: boolean;
        bookingId: string;
        bookingNumber: string;
        currentStatus: AgentPayoutStatus;
        commissionAmount: number;
    }>({
        open: false,
        bookingId: "",
        bookingNumber: "",
        currentStatus: AgentPayoutStatus.PENDING,
        commissionAmount: 0,
    });

    const fetchBookingLogs = useCallback(async () => {
        if (!id) return;
        try {
            const logs = await BookingService.getBookingLogs(id);
            setBookingLogs(logs);
        } catch (err) {
            console.error("Error fetching booking logs:", err);
        }
    }, [id]);

    const fetchAvailableBatches = useCallback(async (packageId: string) => {
        try {
            const batches = await BookingService.getAvailableBatches(packageId);
            setAvailableBatches(batches);
        } catch (err) {
            console.error("Error fetching batches:", err);
        }
    }, []);

    const fetchBookingDetails = useCallback(async (showLoading = true) => {
        if (!id) return;

        try {
            if (showLoading) setLoading(true);
            setError(null);
            const bookingData = await BookingService.getBookingById(id);
            setBooking(bookingData);
            fetchBookingLogs();
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError(
                (err as Error)?.message || "Failed to load booking details.",
            );
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [id, fetchBookingLogs]);

    useEffect(() => {
        if (id) {
            fetchBookingDetails();
        }
    }, [id, fetchBookingDetails]);

    useEffect(() => {
        if (booking?.package?.id) {
            fetchAvailableBatches(booking.package.id);
        }
    }, [booking?.package?.id, fetchAvailableBatches]);

    const handleCopy = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success(`Copied "${text}" to clipboard`);
    };

    const handleMoveBooking = async () => {
        if (!selectedBatchId) {
            toast.error("Please select a target batch");
            return;
        }
        if (
            !confirm(
                "Are you sure you want to move this booking to another batch?",
            )
        )
            return;

        setIsMoving(true);
        try {
            await BookingService.moveBooking(id!, selectedBatchId);
            toast.success("Booking moved successfully");
            fetchBookingDetails();
            setSelectedBatchId("");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to move booking",
            );
        } finally {
            setIsMoving(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!booking) return;

        try {
            setIsGeneratingInvoice(true);
            await InvoiceService.generateAndDownloadInvoice(booking, user?.organization);
            toast.success("Invoice downloaded successfully");
        } catch (err) {
            console.error("Error generating invoice:", err);
            toast.error((err as Error).message || "Failed to generate invoice");
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const handleVerifyPaymentInline = async (paymentId: string) => {
        try {
            setActionLoading((prev) => ({ ...prev, [paymentId]: true }));
            await PaymentService.markPaymentCompleted(paymentId);
            toast.success("Payment verified and completed successfully");
            fetchBookingDetails();
        } catch (err: any) {
            console.error("Error verifying payment:", err);
            toast.error(err?.response?.data?.message || "Failed to verify payment");
        } finally {
            setActionLoading((prev) => ({ ...prev, [paymentId]: false }));
        }
    };

    const getStatusConfig = (status: BookingStatus) => {
        switch (status) {
            case "completed":
                return {
                    label: "Completed",
                    icon: CheckCircle2,
                    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
                    dotClass: "bg-emerald-500",
                    borderAccent: "bg-emerald-500",
                    pulseClass: "bg-emerald-500/20",
                };
            case "pending":
                return {
                    label: "Pending",
                    icon: Clock,
                    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
                    dotClass: "bg-amber-500",
                    borderAccent: "bg-amber-500",
                    pulseClass: "bg-amber-500/20",
                };
            case "confirmed":
                return {
                    label: "Confirmed",
                    icon: CheckCircle2,
                    badgeClass: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
                    dotClass: "bg-blue-500",
                    borderAccent: "bg-blue-500",
                    pulseClass: "bg-blue-500/20",
                };
            case "cancelled":
                return {
                    label: "Cancelled",
                    icon: XCircle,
                    badgeClass: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                    dotClass: "bg-rose-500",
                    borderAccent: "bg-rose-500",
                    pulseClass: "bg-rose-500/20",
                };
            case "on_hold":
                return {
                    label: "On Hold",
                    icon: Clock,
                    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
                    dotClass: "bg-yellow-500",
                    borderAccent: "bg-yellow-500",
                    pulseClass: "bg-yellow-500/20",
                };
            default:
                return {
                    label: status,
                    icon: HelpCircleIcon,
                    badgeClass: "bg-muted text-muted-foreground border-border",
                    dotClass: "bg-muted-foreground",
                    borderAccent: "bg-muted-foreground",
                    pulseClass: "bg-muted-foreground/20",
                };
        }
    };

    const renderTravelerContactInfo = (email?: string | null, phone?: string | null) => {
        const hasEmail = Boolean(email && email.trim());
        const hasPhone = Boolean(phone && phone.trim());

        if (!hasEmail && !hasPhone) {
            return <span className="text-xs text-muted-foreground italic">N/A</span>;
        }

        return (
            <div className="space-y-0.5 text-xs text-muted-foreground">
                {hasEmail && (
                    <p className="flex items-center gap-1.5 truncate max-w-[220px]">
                        <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                        <a href={`mailto:${email}`} className="hover:text-foreground truncate">
                            {email}
                        </a>
                    </p>
                )}
                {hasPhone && (
                    <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                        <a href={`tel:${phone}`} className="hover:text-foreground">
                            {phone}
                        </a>
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-30" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading booking details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Alert variant="destructive" className="border shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="text-base font-medium ml-2">
                        {error || "Booking record could not be found."}
                    </AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => navigate("/bookings")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Bookings
                </Button>
            </div>
        );
    }

    const otherBatches = availableBatches.filter(
        (b: IBatches) => b.id !== booking.batch?.id,
    );

    const statusConfig = getStatusConfig(booking.status);
    const StatusIcon = statusConfig.icon;

    // Financial progress calculations
    const totalAmount = Number(booking.totalAmount) || 0;
    const advancePaid = Number(booking.advancePaid) || 0;
    const balanceAmount = Number(booking.balanceAmount) || 0;
    const percentPaid = totalAmount > 0 ? Math.min(Math.round((advancePaid / totalAmount) * 100), 100) : 0;
    const isPaidInFull = balanceAmount <= 0.01;

    return (
        <div className="w-full p-4 sm:p-6 space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <NavLink
                                    to="/bookings"
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Bookings
                                </NavLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-mono font-medium">
                                #{booking.bookingNumber}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Download Invoice button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadInvoice}
                        disabled={
                            !InvoiceService.hasCompletedPayments(booking) ||
                            isGeneratingInvoice
                        }
                        title={
                            !InvoiceService.hasCompletedPayments(booking)
                                ? "Requires at least one completed payment to generate invoice"
                                : "Download official booking invoice"
                        }
                    >
                        {isGeneratingInvoice ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Invoice
                    </Button>
                </div>
            </div>

            {/* Hero Booking Banner */}
            <Card className="border-border/80 shadow-xs overflow-hidden relative">
                {/* Status glow border accent */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${statusConfig.borderAccent}`}
                />

                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Primary Amount & Identifiers */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border">
                                    #{booking.bookingNumber}
                                </span>

                                <button
                                    onClick={() => handleCopy(booking.bookingNumber, "bookingNumber")}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                                    title="Copy booking number"
                                >
                                    {copiedField === "bookingNumber" ? (
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

                                {/* Package Destination Badge */}
                                {booking.package?.destination && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                        <MapPin className="w-3 h-3 mr-1 text-primary" />
                                        {booking.package.destination}
                                    </Badge>
                                )}
                            </div>

                            {/* Total Amount Display */}
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                                    {BookingService.formatCurrency(totalAmount)}
                                </h2>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    Total Value
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>Package: <strong className="text-foreground">{booking.package?.name}</strong></span>
                                <span>•</span>
                                <span>{booking.numberOfCustomers} Traveler{booking.numberOfCustomers > 1 ? "s" : ""}</span>
                                <span>•</span>
                                <span>Created on {format(new Date(booking.createdAt), "MMMM d, yyyy")}</span>
                            </p>
                        </div>

                        {/* Banner Right Quick State Visual */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 shrink-0">
                            {booking.status === "completed" ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Booking Confirmed & Fully Completed
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span>Status: <strong className="capitalize">{booking.status}</strong></span>
                                    {balanceAmount > 0 ? (
                                        <span className="text-[11px] opacity-80">
                                            ({BookingService.formatCurrency(balanceAmount)} due)
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-emerald-700 font-semibold">
                                            (Paid in full)
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Layout: 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Primary Content (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Progress Metric Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    Financial Progress & Settlement
                                </CardTitle>
                                <span className="text-xs font-mono font-bold text-foreground">
                                    {percentPaid}% Settled
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Progress bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>Advance Paid: {BookingService.formatCurrency(advancePaid)}</span>
                                    <span>
                                        {isPaidInFull ? (
                                            <span className="text-emerald-600 font-bold">Settled in Full</span>
                                        ) : (
                                            <span className="text-amber-600 font-bold">
                                                Remaining Balance: {BookingService.formatCurrency(balanceAmount)}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <Progress
                                    value={percentPaid}
                                    className="h-2.5 bg-muted"
                                />
                            </div>

                            {/* 4-Column Metric Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 rounded-lg bg-muted/40 border text-left">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                        Total Booking
                                    </p>
                                    <p className="text-sm font-bold text-foreground font-mono mt-0.5">
                                        {BookingService.formatCurrency(totalAmount)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-left">
                                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-semibold">
                                        Total Paid
                                    </p>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                        {BookingService.formatCurrency(advancePaid)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-left">
                                    <p className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-semibold">
                                        Remaining Due
                                    </p>
                                    <p
                                        className={`text-sm font-bold font-mono mt-0.5 ${
                                            isPaidInFull
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-amber-600 dark:text-amber-400"
                                        }`}
                                    >
                                        {BookingService.formatCurrency(Math.max(0, balanceAmount))}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/40 border text-left">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                        Discounts / Offers
                                    </p>
                                    <p className="text-sm font-bold text-foreground font-mono mt-0.5">
                                        {BookingService.formatCurrency(
                                            (booking.specialOfferDiscount || 0) +
                                            (booking.discountAmount || 0)
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Offer breakdowns if present */}
                            {((booking.specialOfferDiscount || 0) > 0 || (booking.discountAmount || 0) > 0 || (booking.adjustmentAmount || 0) > 0) && (
                                <div className="flex flex-wrap gap-2 pt-1 border-t text-xs text-muted-foreground">
                                    {(booking.specialOfferDiscount || 0) > 0 && (
                                        <Badge variant="outline" className="text-[10px] gap-1 border-amber-300 text-amber-800 dark:text-amber-300">
                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                            Special Offer: -{BookingService.formatCurrency(booking.specialOfferDiscount || 0)}
                                        </Badge>
                                    )}
                                    {(booking.discountAmount || 0) > 0 && (
                                        <Badge variant="outline" className="text-[10px] gap-1 border-emerald-300 text-emerald-800 dark:text-emerald-300">
                                            Discount: -{BookingService.formatCurrency(booking.discountAmount || 0)}
                                        </Badge>
                                    )}
                                    {(booking.adjustmentAmount || 0) > 0 && (
                                        <Badge variant="outline" className="text-[10px] gap-1">
                                            Adjustment: +{BookingService.formatCurrency(booking.adjustmentAmount || 0)}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Overview & Batch Information Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    Package & Batch Assignment
                                </CardTitle>
                                {booking.package?.id && (
                                    <NavLink
                                        to={`/packages/${booking.package.id}`}
                                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                    >
                                        View Package <ExternalLink className="w-3 h-3" />
                                    </NavLink>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                        Assigned Package
                                    </p>
                                    <p className="font-semibold text-sm text-foreground">
                                        {booking.package?.name}
                                    </p>
                                    {booking.package?.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {booking.package.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                        Batch Schedule & Dates
                                    </p>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                        {booking.batch ? (
                                            <span>
                                                {format(new Date(booking.batch.startDate), "MMM d, yyyy")} - {format(new Date(booking.batch.endDate), "MMM d, yyyy")}
                                            </span>
                                        ) : (
                                            <span className="italic text-muted-foreground">No batch assigned</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Group Size: <strong className="text-foreground">{booking.numberOfCustomers} guests</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Batch Transfer / Mover tool */}
                            {booking.status !== "cancelled" && otherBatches.length > 0 && (
                                <div className="pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                                            Transfer Booking to Another Batch
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Select another open departure date with available capacity.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Select
                                            value={selectedBatchId}
                                            onValueChange={setSelectedBatchId}
                                            disabled={isMoving}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full sm:w-48">
                                                <SelectValue placeholder="Select target batch..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {otherBatches.map((b: IBatches) => (
                                                    <SelectItem key={b.id} value={b.id} className="text-xs">
                                                        {format(new Date(b.startDate), "MMM d")} ({b.totalSeats - b.bookedSeats} seats left)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs shrink-0"
                                            onClick={handleMoveBooking}
                                            disabled={!selectedBatchId || isMoving}
                                        >
                                            {isMoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Transfer"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Package Tiers Breakdown */}
                            {booking.package?.packageTiers && booking.package.packageTiers.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                                        Package Tier Cost Architecture
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {booking.package.packageTiers.map((tier) => (
                                            <div
                                                key={tier.id || tier.name}
                                                className="p-2.5 rounded-md bg-muted/30 border text-xs flex justify-between items-center"
                                            >
                                                <span className="font-semibold text-foreground">{tier.name}</span>
                                                <span className="font-mono text-muted-foreground text-[11px]">
                                                    Adult: {BookingService.formatCurrency(Number(tier.adultCost || 0))}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Primary Contact & Referring Agent */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Primary Booker Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Primary Booker Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border shadow-xs">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {booking.primaryCustomer ? (
                                                `${booking.primaryCustomer.firstName?.[0] || ""}${booking.primaryCustomer.lastName?.[0] || ""}`
                                            ) : (
                                                "C"
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">
                                            {booking.primaryCustomer?.firstName} {booking.primaryCustomer?.lastName}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">Primary Contact Person</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2 text-xs">
                                    {booking.primaryCustomer?.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <a
                                                href={`mailto:${booking.primaryCustomer.email}`}
                                                className="font-medium text-primary hover:underline truncate max-w-[200px]"
                                            >
                                                {booking.primaryCustomer.email}
                                            </a>
                                        </div>
                                    )}
                                    {booking.primaryCustomer?.phone && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <a
                                                href={`tel:${booking.primaryCustomer.phone}`}
                                                className="font-mono font-medium hover:underline text-foreground"
                                            >
                                                {booking.primaryCustomer.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Referring Agent Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-blue-600" />
                                        Referring Partner / Agent
                                    </CardTitle>
                                    {booking.agent?.id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] px-1.5"
                                            onClick={() => navigate(`/agents/${booking.agent?.id}`)}
                                        >
                                            Profile <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {booking.agent ? (
                                    <div className="space-y-3 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-foreground">{booking.agent.name}</p>
                                                {booking.agent.agencyName && (
                                                    <p className="text-[11px] text-muted-foreground">{booking.agent.agencyName}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                                                    {BookingService.formatCurrency(booking.agentCommissionAmount || 0)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    ({booking.agentCommissionType === "percentage" ? `${booking.agentCommissionValue}%` : `₹${booking.agentCommissionValue} flat`})
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-muted-foreground">Payout Status:</span>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={booking.agentPayoutStatus === "paid" ? "default" : "outline"}
                                                    className={booking.agentPayoutStatus === "paid" ? "bg-emerald-600 text-white" : "text-amber-600 border-amber-400"}
                                                >
                                                    {booking.agentPayoutStatus || "Pending"}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-1.5 underline"
                                                    onClick={() =>
                                                        setPayoutModal({
                                                            open: true,
                                                            bookingId: booking.id,
                                                            bookingNumber: booking.bookingNumber,
                                                            currentStatus: (booking.agentPayoutStatus as AgentPayoutStatus) || AgentPayoutStatus.PENDING,
                                                            commissionAmount: booking.agentCommissionAmount || 0,
                                                        })
                                                    }
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-muted-foreground text-xs">
                                        Direct booking (No referring partner linked)
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Travelers / Guests Table Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    Registered Travelers ({booking.customers?.length || 0})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Guest Name</TableHead>
                                        <TableHead>Tier & Category</TableHead>
                                        <TableHead>Financial Breakdown</TableHead>
                                        <TableHead>Contact Information</TableHead>
                                        <TableHead className="text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.customers && booking.customers.length > 0 ? (
                                        booking.customers.map((customer) => {
                                            const isCancelled = customer.status === "cancelled";
                                            return (
                                                <TableRow key={customer.id} className={`hover:bg-muted/40 ${isCancelled ? "opacity-60 bg-muted/20" : ""}`}>
                                                    <TableCell className="pl-6 py-3.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <div className={`font-semibold text-xs ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                                {customer.firstName} {customer.lastName}
                                                            </div>
                                                            {isCancelled && (
                                                                <Badge variant="outline" className="text-[9px] py-0 px-1 border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40">
                                                                    Cancelled
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground capitalize mt-0.5">
                                                            {customer.gender || "N/A"} • {customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "MMM d, yyyy") : "N/A"}
                                                        </div>
                                                        {isCancelled && customer.cancellationReason && (
                                                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 italic">
                                                                Reason: {customer.cancellationReason}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-0.5">
                                                            <p className="text-xs font-medium text-foreground">
                                                                {customer.packageTierName || "Standard Tier"}
                                                            </p>
                                                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize font-normal">
                                                                {customer.ageCategory || "adult"}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {!isCancelled ? (
                                                                <>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-xs font-bold text-foreground font-mono">
                                                                            {BookingService.formatCurrency(customer.calculatedShare || 0)}
                                                                        </span>
                                                                        {customer.paymentStatus === "paid" ? (
                                                                            <Badge className="text-[9px] py-0 px-1.5 bg-emerald-500/10 text-emerald-700 border-emerald-200">
                                                                                Paid
                                                                            </Badge>
                                                                        ) : customer.paymentStatus === "partial" ? (
                                                                            <Badge className="text-[9px] py-0 px-1.5 bg-amber-500/10 text-amber-700 border-amber-200">
                                                                                Partial
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 text-muted-foreground">
                                                                                Unpaid
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        Paid: <span className="font-medium text-foreground">{BookingService.formatCurrency(customer.paidAmount || 0)}</span> • Bal: <span className="font-medium text-primary">{BookingService.formatCurrency(customer.balanceAmount || 0)}</span>
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Paid Share: <span className="font-medium text-foreground">{BookingService.formatCurrency(customer.paidAmount || 0)}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderTravelerContactInfo(customer.email, customer.phone)}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {isCancelled ? (
                                                            <span className="text-[11px] text-muted-foreground italic">Cancelled</span>
                                                        ) : (
                                                            booking.status !== "cancelled" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-red-600 rounded-md"
                                                                    title="Cancel traveler"
                                                                    onClick={() => {
                                                                        setCancelInitialCustomerId(customer.id || null);
                                                                        setCancelModalOpen(true);
                                                                    }}
                                                                >
                                                                    <UserX className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-6 text-center text-muted-foreground text-xs">
                                                No registered guests found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Payment Ledger Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    Payment Transactions Ledger
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    History of advance deposits and settlements recorded for this booking.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {booking.balanceAmount > 0 && (
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => navigate(`/payments?addNew=true&bookingId=${booking.id}`)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Record Payment
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {booking.payments && booking.payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Payment ID / Ref</TableHead>
                                            <TableHead>Payer / Split Allocations</TableHead>
                                            <TableHead className="text-center">Date</TableHead>
                                            <TableHead className="text-center">Method</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right pr-6">Amount & Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.payments.map((payment) => (
                                            <TableRow key={payment.id} className="hover:bg-muted/40">
                                                <TableCell className="pl-6 py-3.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {payment.id ? (
                                                            <NavLink
                                                                to={`/payments/${payment.id}`}
                                                                className="font-mono font-semibold text-xs text-primary hover:underline"
                                                            >
                                                                #{payment.paymentNumber || payment.id.slice(0, 8)}
                                                            </NavLink>
                                                        ) : (
                                                            <span className="font-mono font-semibold text-xs">
                                                                #{payment.paymentNumber || "N/A"}
                                                            </span>
                                                        )}
                                                        {payment.paymentType === "refund" && (
                                                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/40">
                                                                Refund
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {payment.paymentReference && (
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                            Ref: {payment.paymentReference}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {payment.payerName ? (
                                                            <p className="text-xs font-semibold text-foreground">
                                                                Paid by: <span className="text-primary font-bold">{payment.payerName}</span>
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">General Booking Payment</p>
                                                        )}
                                                        {payment.isPassengerSplit && payment.allocations && payment.allocations.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {payment.allocations.map((a) => (
                                                                    <Badge key={a.id || a.bookingCustomerId} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                                                        {a.customerName}: {BookingService.formatCurrency(a.amount)}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center text-xs text-muted-foreground">
                                                    {payment.paymentDate ? format(new Date(payment.paymentDate), "MMM d, yyyy") : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="capitalize text-[10px]">
                                                        {payment.paymentMethod?.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center gap-1.5 text-xs font-semibold">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${
                                                                payment.status === "completed"
                                                                    ? "bg-emerald-500"
                                                                    : payment.status === "failed"
                                                                    ? "bg-rose-500"
                                                                    : "bg-amber-500 animate-pulse"
                                                            }`}
                                                        />
                                                        <span className="capitalize">{payment.status}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`font-mono font-bold text-xs ${payment.paymentType === "refund" ? "text-purple-700 dark:text-purple-400" : "text-foreground"}`}>
                                                            {payment.paymentType === "refund" ? "-" : "+"}
                                                            {BookingService.formatCurrency(payment.amount)}
                                                        </span>
                                                        {/* Inline Verify & Complete button for Pending payments */}
                                                        {payment.status === "pending" && payment.id && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 text-[10px] px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                                onClick={() => handleVerifyPaymentInline(payment.id!)}
                                                                disabled={actionLoading[payment.id!]}
                                                            >
                                                                {actionLoading[payment.id!] ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                                ) : (
                                                                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                                                )}
                                                                {payment.paymentType === "refund" ? "Complete Refund" : "Verify"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-xs">
                                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="font-medium text-foreground">No payments recorded yet</p>
                                    <p className="text-[11px] mt-0.5">Click &quot;Record Payment&quot; to log guest deposits or full settlements.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Files & Attached Documents */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Attached Documents & Files ({booking.documents?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {(booking.documents?.length ?? 0) > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {booking.documents?.map((doc: any) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group text-xs"
                                            onClick={() => setSelectedDocument(doc)}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                                <span className="truncate font-medium text-foreground">
                                                    {doc.originalName || doc.name}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-70 group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(
                                                        `${import.meta.env.VITE_API_URL || ""}${doc.filePath}`,
                                                        "_blank"
                                                    );
                                                }}
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground text-xs border border-dashed rounded-lg">
                                    No documents attached to this booking.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workflow Progress Tracker */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Tour & Booking Workflow Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <WorkflowManager
                                workflowId={booking.currentWorkflowId || ""}
                                onUpdate={fetchBookingDetails}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sidebar Actions & Audit Trail (Span 1) */}
                <div className="space-y-6">
                    {/* Actionable Status & Next Steps Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Booking Status & Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Prominent Mark as Completed Button */}
                            {(booking.status === "pending" || booking.status === "on_hold") && (
                                <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            Ready for Completion
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                                        {isPaidInFull
                                            ? "All payments have been settled in full. Complete this booking to finalize all arrangements."
                                            : `This booking has an outstanding balance of ${BookingService.formatCurrency(balanceAmount)}. You can still mark as completed with acknowledgement.`}
                                    </p>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 shadow-xs"
                                        onClick={() => setCompleteModalOpen(true)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        Mark as Completed
                                    </Button>
                                </div>
                            )}

                            {/* Booking Quick Action Links */}
                            <div className="space-y-2 text-xs">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Quick Actions
                                </p>

                                {booking.balanceAmount > 0 && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-xs h-8"
                                        onClick={() => navigate(`/payments?addNew=true&bookingId=${booking.id}`)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2 text-primary" />
                                        Record Payment Deposit
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-xs h-8"
                                    onClick={handleDownloadInvoice}
                                    disabled={!InvoiceService.hasCompletedPayments(booking) || isGeneratingInvoice}
                                >
                                    <Download className="w-3.5 h-3.5 mr-2" />
                                    Download Booking Invoice
                                </Button>

                                {booking.status !== "cancelled" && (
                                    <NavLink to={`/bookings/${booking.id}/edit`} className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-xs h-8"
                                        >
                                            <Edit className="w-3.5 h-3.5 mr-2" />
                                            Edit Guest & Package Details
                                        </Button>
                                    </NavLink>
                                )}

                                {booking.status !== "cancelled" && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            setCancelInitialCustomerId(null);
                                            setCancelModalOpen(true);
                                        }}
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-2" />
                                        Cancel Booking / Travelers
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Audit Logs & Activity Timeline */}
                    <BookingLogsCard logs={bookingLogs} loading={loading} />
                </div>
            </div>

            {/* Document Viewer Dialog */}
            <Dialog
                open={!!selectedDocument}
                onOpenChange={() => setSelectedDocument(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden text-card-foreground">
                    <DialogHeader className="p-6 pb-0 flex flex-row justify-between items-center">
                        <DialogTitle className="text-xl font-bold">
                            {selectedDocument?.originalName || "Document Preview"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/10 max-h-[70vh] overflow-auto">
                        {selectedDocument &&
                        (selectedDocument as any).mimeType?.startsWith("image/") ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL || ""}${(selectedDocument as any).filePath}`}
                                alt={(selectedDocument as any).originalName}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border"
                            />
                        ) : (
                            <div className="flex flex-col items-center py-12">
                                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
                                <h3 className="text-lg font-semibold mb-1">
                                    {selectedDocument?.originalName || "Preview Unavailable"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs text-center">
                                    Preview is not available for this file type. Please download to view locally.
                                </p>
                            </div>
                        )}
                        <Button
                            className="mt-6"
                            onClick={() => {
                                if (selectedDocument) {
                                    window.open(
                                        `${import.meta.env.VITE_API_URL || ""}${(selectedDocument as any).filePath}`,
                                        "_blank"
                                    );
                                }
                            }}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Original
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking / Travelers Dialog */}
            {booking && (
                <CancelBookingDialog
                    open={cancelModalOpen}
                    onOpenChange={setCancelModalOpen}
                    booking={booking}
                    initialCustomerId={cancelInitialCustomerId}
                    onSuccess={fetchBookingDetails}
                />
            )}

            {/* Complete Booking Modal */}
            <CompleteBookingDialog
                open={completeModalOpen}
                onOpenChange={setCompleteModalOpen}
                booking={booking}
                onSuccess={fetchBookingDetails}
            />

            {/* Agent Payout Update Dialog */}
            <PayoutDialog
                open={payoutModal.open}
                onOpenChange={(open) => setPayoutModal((prev) => ({ ...prev, open }))}
                bookingId={payoutModal.bookingId}
                bookingNumber={payoutModal.bookingNumber}
                currentStatus={payoutModal.currentStatus}
                commissionAmount={payoutModal.commissionAmount}
                onUpdated={fetchBookingDetails}
            />
        </div>
    );
}

function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
        </svg>
    );
}
