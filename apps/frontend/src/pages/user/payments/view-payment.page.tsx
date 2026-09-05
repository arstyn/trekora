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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { getFileUrl } from "@/lib/utils";
import BookingService from "@/services/booking.service";
import { InvoiceService } from "@/services/invoice.service";
import PaymentService from "@/services/payment.service";
import type { FileManager, Payment, PaymentLog } from "@/types/payment.types";
import { format } from "date-fns";
import {
    AlertCircle,
    AlertTriangle,
    Archive,
    ArrowLeft,
    Banknote,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    Download,
    Edit,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    Loader2,
    Mail,
    MapPin,
    MoreVertical,
    Paperclip,
    Phone,
    QrCode,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Upload,
    Users,
    Wallet,
    XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { PaymentLogsCard } from "./_components/payment-logs-card";

export default function PaymentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const [paymentData, setPaymentData] = useState<Payment | null>(null);
    const [receiptFiles, setReceiptFiles] = useState<FileManager[]>([]);
    const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [selectedDocument, setSelectedDocument] = useState<FileManager | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPaymentDetails();
        }
    }, [id]);

    const loadPaymentDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const [payment, receipts, logs] = await Promise.all([
                PaymentService.getPaymentById(id, true),
                PaymentService.getPaymentReceipts(id).catch(() => []),
                PaymentService.getPaymentLogs(id).catch(() => []),
            ]);

            setPaymentData(payment);
            setReceiptFiles(receipts);
            setPaymentLogs(logs);
        } catch (err: any) {
            console.error("Error loading payment details:", err);
            const errorMessage =
                err?.response?.status === 404
                    ? "Payment record could not be found."
                    : "Failed to load payment details. Please try again.";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
        toast({
            title: "Copied to clipboard",
            description: text,
        });
    };

    const handleAction = async (action: string) => {
        if (!id || !paymentData) return;

        try {
            setActionLoading((prev) => ({ ...prev, [action]: true }));

            switch (action) {
                case "complete":
                    await PaymentService.markPaymentCompleted(id);
                    toast({
                        title: "Payment Verified",
                        description: "Payment has been verified and marked as completed.",
                    });
                    break;
                case "fail":
                    await PaymentService.markPaymentFailed(id);
                    toast({
                        title: "Payment Failed",
                        description: "Payment has been marked as failed.",
                    });
                    break;
                case "retry":
                    await PaymentService.retryPayment(id);
                    toast({
                        title: "Payment Retried",
                        description: "Payment status reset to pending for re-verification.",
                    });
                    break;
                case "archive":
                    await PaymentService.archivePayment(id);
                    toast({
                        title: "Payment Archived",
                        description: "Payment has been archived successfully.",
                    });
                    break;
                default:
                    break;
            }

            await loadPaymentDetails();
        } catch (err: any) {
            console.error("Error performing action:", err);
            const errorMessage =
                err?.response?.data?.message ||
                "Failed to update payment status. Please try again.";
            toast({
                title: "Action Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, [action]: false }));
        }
    };

    const handleDownloadInvoice = async () => {
        if (!paymentData?.booking?.id) return;

        try {
            setIsGeneratingInvoice(true);
            const fullBooking = await BookingService.getBookingById(
                paymentData.booking.id,
            );
            await InvoiceService.generateAndDownloadInvoice(
                fullBooking,
                user?.organization,
            );
            toast({
                title: "Invoice Downloaded",
                description: "Invoice generated successfully.",
            });
        } catch (err: any) {
            console.error("Error generating invoice:", err);
            toast({
                title: "Error",
                description: err?.message || "Failed to generate invoice",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const handleDeleteReceiptFile = async (fileId: string) => {
        if (!id) return;

        try {
            setActionLoading((prev) => ({
                ...prev,
                [`deleteFile_${fileId}`]: true,
            }));

            await PaymentService.deleteReceiptFile(id, fileId);
            setReceiptFiles((prev) => prev.filter((f) => f.id !== fileId));

            toast({
                title: "Receipt Deleted",
                description: "Receipt document has been removed.",
            });
            loadPaymentDetails();
        } catch (err: any) {
            console.error("Error deleting receipt file:", err);
            toast({
                title: "Delete Failed",
                description: "Could not delete receipt file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({
                ...prev,
                [`deleteFile_${fileId}`]: false,
            }));
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !id) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of Array.from(files)) {
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload only JPG, PNG, or PDF documents.",
                    variant: "destructive",
                });
                return;
            }

            if (file.size > maxSize) {
                toast({
                    title: "File Too Large",
                    description: "Please upload files smaller than 5MB.",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            setActionLoading((prev) => ({ ...prev, upload: true }));

            let newFiles: FileManager[];
            if (files.length === 1) {
                const newFile = await PaymentService.uploadReceipt(id, files[0]);
                newFiles = [newFile];
            } else {
                newFiles = await PaymentService.uploadReceipts(id, Array.from(files));
            }

            setReceiptFiles((prev) => [...prev, ...newFiles]);
            toast({
                title: "Upload Successful",
                description: `${files.length} receipt document(s) uploaded.`,
            });
            loadPaymentDetails();
        } catch (err) {
            console.error("Error uploading receipt files:", err);
            toast({
                title: "Upload Failed",
                description: "Failed to upload receipt files. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, upload: false }));
            event.target.value = "";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return {
                    label: "Completed",
                    dotClass: "bg-emerald-500",
                    badgeClass:
                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                    icon: CheckCircle2,
                };
            case "pending":
                return {
                    label: "Pending Verification",
                    dotClass: "bg-amber-500 animate-pulse",
                    badgeClass:
                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                    icon: Clock,
                };
            case "failed":
                return {
                    label: "Failed",
                    dotClass: "bg-rose-500",
                    badgeClass:
                        "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
                    icon: XCircle,
                };

            case "archived":
                return {
                    label: "Archived",
                    dotClass: "bg-gray-500",
                    badgeClass:
                        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                    icon: Archive,
                };
            default:
                return {
                    label: status,
                    dotClass: "bg-primary",
                    badgeClass: "bg-primary/10 text-primary border-primary/20",
                    icon: AlertCircle,
                };
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        const m = method.toLowerCase();
        if (m.includes("upi") || m.includes("qr")) return QrCode;
        if (m.includes("bank") || m.includes("transfer") || m.includes("neft") || m.includes("rtgs")) return Building2;
        if (m.includes("card") || m.includes("credit") || m.includes("debit")) return CreditCard;
        if (m.includes("wallet")) return Wallet;
        return Banknote;
    };

    if (loading) {
        return (
            <div className="w-full p-4 sm:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-40" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-lg" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-52 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-44 w-full rounded-xl" />
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !paymentData) {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center space-y-6 pt-16">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto text-rose-600">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Payment Not Found</h2>
                    <p className="text-muted-foreground mt-2">{error || "Could not load the requested payment."}</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => navigate("/payments")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Payments
                    </Button>
                    <Button onClick={loadPaymentDetails}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(paymentData.status);
    const StatusIcon = statusConfig.icon;
    const MethodIcon = getPaymentMethodIcon(paymentData.paymentMethod);

    // Financial progress calculation
    const totalBookingAmount = Number(paymentData.booking.totalAmount) || 1;
    const advancePaid = Number(paymentData.booking.advancePaid) || 0;
    const balanceAmount = Number(paymentData.booking.balanceAmount) || 0;
    const percentPaid = Math.min(Math.round((advancePaid / totalBookingAmount) * 100), 100);

    return (
        <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <NavLink to="/payments" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Payments
                                </NavLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-mono font-medium">{paymentData.paymentNumber}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Invoice button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadInvoice}
                        disabled={isGeneratingInvoice}
                    >
                        {isGeneratingInvoice ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Invoice
                    </Button>

                    {/* Edit button */}
                    {paymentData.status !== "completed" && (
                        <NavLink to={`/payments/${id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </NavLink>
                    )}

                    {/* Secondary Dropdown Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {paymentData.status === "pending" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleAction("complete")}
                                        disabled={actionLoading.complete}
                                        className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Verify & Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleAction("fail")}
                                        disabled={actionLoading.fail}
                                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Mark as Failed
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {paymentData.status === "failed" && (
                                <DropdownMenuItem
                                    onClick={() => handleAction("retry")}
                                    disabled={actionLoading.retry}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry Payment
                                </DropdownMenuItem>
                            )}
                            {paymentData.status !== "archived" && (
                                <DropdownMenuItem
                                    onClick={() => handleAction("archive")}
                                    disabled={actionLoading.archive}
                                    className="text-muted-foreground"
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive Payment
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Hero Payment Banner */}
            <Card className="border-border/80 shadow-xs overflow-hidden relative">
                {/* Status glow border accent */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                        paymentData.status === "completed"
                            ? "bg-emerald-500"
                            : paymentData.status === "pending"
                            ? "bg-amber-500"
                            : paymentData.status === "failed"
                            ? "bg-rose-500"
                            : "bg-primary"
                    }`}
                />

                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Primary Amount & Identifiers */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border">
                                    {paymentData.paymentNumber}
                                </span>

                                <button
                                    onClick={() => handleCopy(paymentData.paymentNumber, "paymentNumber")}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                                    title="Copy payment number"
                                >
                                    {copiedField === "paymentNumber" ? (
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

                                {/* Payment Type Badge */}
                                <Badge variant="secondary" className="capitalize text-xs font-medium">
                                    {paymentData.paymentType} Payment
                                </Badge>
                            </div>

                            {/* Large Hero Amount */}
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                                    {formatCurrency(paymentData.amount)}
                                </h1>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    INR
                                </span>
                            </div>

                            {/* Method and Date Context */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                    <MethodIcon className="w-4 h-4 text-primary" />
                                    <span className="capitalize">{paymentData.paymentMethod.replace(/_/g, " ")}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(new Date(paymentData.paymentDate), "MMMM d, yyyy")}
                                </span>
                                <span>•</span>
                                <span>
                                    Recorded by <strong className="text-foreground">{paymentData.recordedBy.firstName} {paymentData.recordedBy.lastName}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Quick Hero Verification CTA */}
                        {paymentData.status === "pending" && (
                            <div className="lg:max-w-sm w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                                            Awaiting Finance Verification
                                        </h4>
                                        <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                                            Verify this transaction to credit the customer's advance balance on their booking.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                    onClick={() => handleAction("complete")}
                                    disabled={actionLoading.complete}
                                >
                                    {actionLoading.complete ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Verify & Mark Completed
                                </Button>
                            </div>
                        )}

                        {paymentData.status === "completed" && (
                            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-5 py-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5 text-xs">
                                    <div className="font-semibold text-emerald-950 dark:text-emerald-200 text-sm">
                                        Verified & Completed
                                    </div>
                                    <div className="text-muted-foreground">
                                        {paymentData.verifiedBy ? (
                                            <>Verified by <strong>{paymentData.verifiedBy.firstName} {paymentData.verifiedBy.lastName}</strong></>
                                        ) : (
                                            <>Verified & locked in ledger</>
                                        )}
                                        {paymentData.verifiedAt && (
                                            <> • {format(new Date(paymentData.verifiedAt), "MMM d, yyyy")}</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="my-6" />

                    {/* Booking Financial Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-primary" />
                                Booking Financial Progress
                            </span>
                            <span className="text-muted-foreground">
                                <strong className="text-foreground">{percentPaid}%</strong> of Total Booking Paid
                            </span>
                        </div>

                        <Progress value={percentPaid} className="h-2.5 bg-muted" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                            <div className="p-3 bg-muted/40 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">This Payment</span>
                                <span className="text-base font-bold text-foreground">
                                    {formatCurrency(paymentData.amount)}
                                </span>
                            </div>
                            <div className="p-3 bg-muted/40 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Total Booking Amount</span>
                                <span className="text-base font-bold text-foreground">
                                    {formatCurrency(paymentData.booking.totalAmount)}
                                </span>
                            </div>
                            <div className="p-3 bg-muted/40 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Total Advance Paid</span>
                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(paymentData.booking.advancePaid)}
                                </span>
                            </div>
                            <div className="p-3 bg-muted/40 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Remaining Balance</span>
                                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                                    {formatCurrency(balanceAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content: 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Primary Details): 2 Columns Span */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Transaction Details & Payer Allocations */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Transaction Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Grid of Key Properties */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Payment Method</span>
                                    <div className="flex items-center gap-2 font-medium text-sm text-foreground capitalize">
                                        <MethodIcon className="w-4 h-4 text-muted-foreground" />
                                        {paymentData.paymentMethod.replace(/_/g, " ")}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Payment Type</span>
                                    <div className="text-sm font-medium capitalize text-foreground">
                                        {paymentData.paymentType}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Payment Date</span>
                                    <div className="text-sm font-medium text-foreground">
                                        {format(new Date(paymentData.paymentDate), "PPP")}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Payment Number</span>
                                    <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                                        {paymentData.paymentNumber}
                                        <button
                                            onClick={() => handleCopy(paymentData.paymentNumber, "paymentNumberInner")}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {copiedField === "paymentNumberInner" ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {paymentData.paymentReference && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Payment Reference</span>
                                        <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                                            {paymentData.paymentReference}
                                            <button
                                                onClick={() => handleCopy(paymentData.paymentReference!, "ref")}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                {copiedField === "ref" ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {paymentData.transactionId && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Transaction ID / UTR</span>
                                        <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                                            {paymentData.transactionId}
                                            <button
                                                onClick={() => handleCopy(paymentData.transactionId!, "txId")}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                {copiedField === "txId" ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Notes / Remarks */}
                            {paymentData.notes && (
                                <div className="bg-muted/40 p-3.5 rounded-lg border border-border/70 space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Notes / Remarks
                                    </span>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{paymentData.notes}</p>
                                </div>
                            )}

                            {/* Payer & Passenger Allocations */}
                            {(paymentData.isPassengerSplit || paymentData.payerName) && (
                                <div className="space-y-3 pt-2">
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            Traveler Allocations & Payer
                                        </span>
                                        {paymentData.payerName && (
                                            <Badge variant="outline" className="text-xs">
                                                Paid by: <strong className="ml-1 text-foreground">{paymentData.payerName}</strong>
                                            </Badge>
                                        )}
                                    </div>

                                    {paymentData.allocations && paymentData.allocations.length > 0 && (
                                        <div className="rounded-lg border divide-y bg-background">
                                            {paymentData.allocations.map((alloc) => (
                                                <div
                                                    key={alloc.id || alloc.bookingCustomerId}
                                                    className="p-3 flex items-center justify-between text-sm"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="w-7 h-7 text-xs">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {(alloc.customerName || "P").charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="font-medium text-foreground block">
                                                                {alloc.customerName || "Passenger"}
                                                            </span>
                                                            {alloc.notes && (
                                                                <span className="text-xs text-muted-foreground">{alloc.notes}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-primary">
                                                        {formatCurrency(alloc.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Linked Booking & Customer Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-primary" />
                                Linked Booking Context
                            </CardTitle>
                            <NavLink
                                to={`/bookings/${paymentData.booking.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                View Booking Details
                                <ExternalLink className="w-3.5 h-3.5" />
                            </NavLink>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Package & Batch summary */}
                            <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="font-mono text-xs text-muted-foreground block">
                                            Booking Reference
                                        </span>
                                        <NavLink
                                            to={`/bookings/${paymentData.booking.id}`}
                                            className="text-base font-bold text-primary hover:underline font-mono"
                                        >
                                            #{paymentData.booking.bookingNumber}
                                        </NavLink>
                                    </div>
                                    {paymentData.booking.package.destination && (
                                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            {paymentData.booking.package.destination}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Package</span>
                                        <span className="font-medium text-foreground">
                                            {paymentData.booking.package.name}
                                        </span>
                                    </div>

                                    {paymentData.booking.package.duration && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Duration</span>
                                            <span className="font-medium text-foreground">
                                                {paymentData.booking.package.duration}
                                            </span>
                                        </div>
                                    )}

                                    {paymentData.booking.batch?.startDate && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Batch Dates</span>
                                            <span className="font-medium text-foreground">
                                                {format(new Date(paymentData.booking.batch.startDate), "MMM d")}
                                                {paymentData.booking.batch.endDate && (
                                                    <> - {format(new Date(paymentData.booking.batch.endDate), "MMM d, yyyy")}</>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Profile Strip */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Primary Customer
                                </span>
                                <div className="flex flex-wrap items-center justify-between p-3.5 rounded-lg border bg-background gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {paymentData.booking.customer.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">
                                                {paymentData.booking.customer.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Primary Bookmaker
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {paymentData.booking.customer.email && (
                                            <a
                                                href={`mailto:${paymentData.booking.customer.email}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
                                                title={paymentData.booking.customer.email}
                                            >
                                                <Mail className="w-3.5 h-3.5 text-primary" />
                                                <span className="hidden sm:inline">{paymentData.booking.customer.email}</span>
                                                <span className="sm:hidden">Email</span>
                                            </a>
                                        )}

                                        {paymentData.booking.customer.phone && (
                                            <a
                                                href={`tel:${paymentData.booking.customer.phone}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
                                                title={paymentData.booking.customer.phone}
                                            >
                                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{paymentData.booking.customer.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Receipts & Document Attachments Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-primary" />
                                    Receipts & Documents
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Uploaded bank slips, payment confirmations, and invoices
                                </CardDescription>
                            </div>

                            <label>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    onChange={handleFileUpload}
                                    disabled={actionLoading.upload}
                                />
                                <Button size="sm" variant="outline" asChild disabled={actionLoading.upload} className="cursor-pointer">
                                    <span>
                                        {actionLoading.upload ? (
                                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4 mr-1.5" />
                                        )}
                                        Upload Receipt
                                    </span>
                                </Button>
                            </label>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {receiptFiles.length === 0 ? (
                                <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                        <Paperclip className="w-6 h-6 opacity-60" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">No receipt documents attached</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Upload transaction screenshots, bank receipts, or payment slips for audit purposes.
                                        </p>
                                    </div>
                                    <label className="inline-block">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                            onChange={handleFileUpload}
                                            disabled={actionLoading.upload}
                                        />
                                        <Button size="sm" variant="secondary" asChild className="cursor-pointer">
                                            <span>
                                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                Choose File
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {receiptFiles.map((file) => {
                                        const isPdf = file.filename?.toLowerCase().endsWith(".pdf");
                                        const fileUrl = getFileUrl(file.url || "");

                                        return (
                                            <div
                                                key={file.id}
                                                className="group relative flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors"
                                            >
                                                <div
                                                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                                                    onClick={() => setSelectedDocument(file)}
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                        {isPdf ? <FileText className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-foreground truncate" title={file.filename}>
                                                            {file.filename}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                                            {file.createdAt && (
                                                                <span>Uploaded {format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setSelectedDocument(file)}
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    <a
                                                        href={fileUrl}
                                                        download={file.filename}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                        onClick={() => handleDeleteReceiptFile(file.id)}
                                                        disabled={actionLoading[`deleteFile_${file.id}`]}
                                                        title="Delete"
                                                    >
                                                        {actionLoading[`deleteFile_${file.id}`] ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Sidebar): Verification & Audit Logs */}
                <div className="space-y-6">
                    {/* Finance Verification & Actions Card */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Finance Verification & Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {paymentData.status === "pending" && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs space-y-1">
                                        <span className="font-semibold text-amber-900 dark:text-amber-200 block">
                                            Status: Pending Verification
                                        </span>
                                        <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                                            Marking this payment as completed will verify the funds and automatically credit the booking's advance amount.
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
                                        onClick={() => handleAction("complete")}
                                        disabled={actionLoading.complete}
                                    >
                                        {actionLoading.complete ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        )}
                                        Verify & Mark Completed
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        onClick={() => handleAction("fail")}
                                        disabled={actionLoading.fail}
                                    >
                                        {actionLoading.fail ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Mark as Failed
                                    </Button>
                                </div>
                            )}

                            {paymentData.status === "completed" && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1.5">
                                        <span className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            Verification Complete
                                        </span>
                                        {paymentData.verifiedBy && (
                                            <p className="text-emerald-800/80 dark:text-emerald-300/80">
                                                Verified by <strong>{paymentData.verifiedBy.firstName} {paymentData.verifiedBy.lastName}</strong>
                                                {paymentData.verifiedAt && (
                                                    <> on {format(new Date(paymentData.verifiedAt), "MMM d, yyyy • HH:mm")}</>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleDownloadInvoice}
                                        disabled={isGeneratingInvoice}
                                    >
                                        {isGeneratingInvoice ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4 mr-2" />
                                        )}
                                        Download Official Invoice
                                    </Button>
                                </div>
                            )}

                            {paymentData.status === "failed" && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs space-y-1">
                                        <span className="font-semibold text-rose-900 dark:text-rose-200 block">
                                            Transaction Marked as Failed
                                        </span>
                                        <p className="text-rose-800/80 dark:text-rose-300/80">
                                            You can retry this payment to move it back to the pending state for re-verification.
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={() => handleAction("retry")}
                                        disabled={actionLoading.retry}
                                    >
                                        {actionLoading.retry ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        Retry Payment
                                    </Button>
                                </div>
                            )}

                            {paymentData.status !== "archived" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-muted-foreground hover:text-foreground text-xs"
                                    onClick={() => handleAction("archive")}
                                    disabled={actionLoading.archive}
                                >
                                    {actionLoading.archive ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    ) : (
                                        <Archive className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    Archive Payment Record
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Centered Audit & Activity Logs */}
                    <PaymentLogsCard logs={paymentLogs} loading={loading} />
                </div>
            </div>

            {/* Document Preview Modal */}
            <Dialog
                open={!!selectedDocument}
                onOpenChange={() => setSelectedDocument(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base truncate">
                            <FileText className="w-5 h-5 text-primary shrink-0" />
                            <span className="truncate">{selectedDocument?.filename}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20 rounded-lg min-h-[400px]">
                        {selectedDocument && (
                            <>
                                {selectedDocument.filename?.toLowerCase().endsWith(".pdf") ? (
                                    <iframe
                                        src={getFileUrl(selectedDocument.url || "")}
                                        className="w-full h-[65vh] rounded border"
                                        title={selectedDocument.filename}
                                    />
                                ) : (
                                    <img
                                        src={getFileUrl(selectedDocument.url || "")}
                                        alt={selectedDocument.filename}
                                        className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-end items-center pt-4 border-t text-xs text-muted-foreground">
                        <div className="flex gap-2">
                            {selectedDocument && (
                                <a
                                    href={getFileUrl(selectedDocument.url || "")}
                                    download={selectedDocument.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-1.5" />
                                        Download
                                    </Button>
                                </a>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => setSelectedDocument(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
