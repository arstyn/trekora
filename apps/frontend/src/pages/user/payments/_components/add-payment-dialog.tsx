import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import PaymentService from "@/services/payment.service";
import type {
    BookingForPayment,
    CreatePaymentDto,
} from "@/types/payment.types";
import { PaymentMethod, PaymentType } from "@/types/payment.types";
import { AlertTriangle, ArrowLeft, Loader2, Plus, Search, Upload } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface AddPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPaymentAdded?: () => void;
}

export function AddPaymentDialog({
    open,
    onOpenChange,
    onPaymentAdded,
}: AddPaymentDialogProps) {
    const [formData, setFormData] = useState({
        bookingId: "",
        amount: "",
        paymentType: "",
        paymentMethod: "",
        paymentReference: "",
        transactionId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentScreenshot: null as File | null,
        notes: "",
    });

    const [bookingSearch, setBookingSearch] = useState("");
    const [bookings, setBookings] = useState<BookingForPayment[]>([]);
    const [loading, setLoading] = useState({
        bookings: false,
        submit: false,
        upload: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const { toast } = useToast();
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const selectedBooking = bookings.find(
        (booking) => booking.id === formData.bookingId
    );

    // Debounced search function
    const fetchBookings = async (pageNum: number, search?: string) => {
        try {
            setLoading((prev) => ({ ...prev, bookings: true }));
            setError(null);
            const response = await PaymentService.searchBookings({
                search: search && search.trim().length >= 2 ? search : undefined,
                page: pageNum,
                limit: 10,
            });
            setBookings(response.data);
            setTotalPages(Math.ceil(response.total / 10));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError("Failed to load bookings. Please try again.");
            setBookings([]);
        } finally {
            setLoading((prev) => ({ ...prev, bookings: false }));
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (searchTerm: string) => {
            // Reset to first page on new search
            setPage(1);
            await fetchBookings(1, searchTerm);
        }, 500),
        []
    );

    // Handle booking search and pagination
    useEffect(() => {
        debouncedSearch(bookingSearch);
    }, [bookingSearch, debouncedSearch]);

    // Refetch when page changes
    useEffect(() => {
        fetchBookings(page, bookingSearch);
    }, [page]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.bookingId) {
            errors.bookingId = "Please select a booking";
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            errors.amount = "Please enter a valid amount";
        }

        if (
            selectedBooking &&
            Number(formData.amount) > selectedBooking.balanceAmount
        ) {
            errors.amount = `Amount cannot exceed balance of ${formatCurrency(
                selectedBooking.balanceAmount
            )}`;
        }

        if (!formData.paymentType) {
            errors.paymentType = "Please select a payment type";
        }

        if (!formData.paymentMethod) {
            errors.paymentMethod = "Please select a payment method";
        }

        if (!formData.paymentDate) {
            errors.paymentDate = "Please select a payment date";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type and size
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "application/pdf",
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a JPEG, PNG, or PDF file.",
                    variant: "destructive",
                });
                return;
            }

            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: "Please upload a file smaller than 5MB.",
                    variant: "destructive",
                });
                return;
            }

            setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading((prev) => ({ ...prev, submit: true }));
            setError(null);

            // Create payment DTO
            const paymentData: CreatePaymentDto = {
                bookingId: formData.bookingId,
                amount: Number(formData.amount),
                paymentType: formData.paymentType as PaymentType,
                paymentMethod: formData.paymentMethod as PaymentMethod,
                paymentReference: formData.paymentReference || undefined,
                transactionId: formData.transactionId || undefined,
                paymentDate: formData.paymentDate,
                notes: formData.notes || undefined,
            };

            // Create the payment
            const newPayment = await PaymentService.createPayment(paymentData);

            // Upload receipt if provided
            if (formData.paymentScreenshot) {
                try {
                    setLoading((prev) => ({ ...prev, upload: true }));
                    await PaymentService.uploadReceipt(
                        newPayment.id,
                        formData.paymentScreenshot
                    );
                } catch (uploadError) {
                    console.error("Error uploading receipt:", uploadError);
                    // Don't fail the whole process if upload fails
                    toast({
                        title: "Payment created",
                        description:
                            "Payment created successfully, but receipt upload failed. You can upload it later.",
                        variant: "default",
                    });
                } finally {
                    setLoading((prev) => ({ ...prev, upload: false }));
                }
            }

            toast({
                title: "Success",
                description: "Payment added successfully.",
            });

            // Reset form and close dialog
            resetForm();
            onOpenChange(false);
            onPaymentAdded?.();
        } catch (error) {
            console.error("Error creating payment:", error);
            const errorMessage =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error as any)?.response?.data?.message ||
                "Failed to create payment. Please try again.";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading((prev) => ({ ...prev, submit: false }));
        }
    };

    const resetForm = () => {
        setFormData({
            bookingId: "",
            amount: "",
            paymentType: "",
            paymentMethod: "",
            paymentReference: "",
            transactionId: "",
            paymentDate: new Date().toISOString().split("T")[0],
            paymentScreenshot: null,
            notes: "",
        });
        setBookingSearch("");
        setBookings([]);
        setPage(1);
        setError(null);
        setValidationErrors({});
    };

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    // Live calculation for balance updates
    const currentPaymentAmount = Number(formData.amount) || 0;
    const balanceAfterPayment = selectedBooking
        ? Math.max(0, selectedBooking.balanceAmount - currentPaymentAmount)
        : 0;

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
            <DialogContent className="responsive-dialog sm:max-w-6xl w-[95vw] h-[85vh] max-lg:h-auto max-lg:max-h-[90vh] overflow-hidden max-lg:overflow-y-auto p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
                <style>{`
                    @media (max-height: 800px) {
                        .responsive-dialog {
                            height: auto !important;
                            max-height: 90vh !important;
                            overflow-y: auto !important;
                        }
                        .responsive-layout, .responsive-left {
                            overflow: visible !important;
                            height: auto !important;
                        }
                        .responsive-scroll {
                            height: auto !important;
                            overflow: visible !important;
                        }
                    }
                `}</style>
                {/* Header */}
                <div className="pl-6 pr-12 py-4 border-b bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Plus className="h-5 w-5 text-primary" />
                            Add New Payment
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Search for a booking and record the transaction details to apply a payment.
                        </DialogDescription>
                    </div>
                </div>

                <div className="responsive-layout flex-1 flex overflow-hidden max-lg:overflow-visible min-h-0 p-0 m-0">
                    {/* Left Side: Form Area */}
                    <div className="responsive-left flex-1 flex flex-col overflow-hidden max-lg:overflow-visible min-h-0 bg-background">
                        {error && (
                            <div className="px-6 pt-4 flex-shrink-0">
                                <Alert variant="destructive" className="py-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div className="responsive-scroll flex-1 overflow-y-auto px-6 py-4 max-lg:h-auto max-lg:overflow-visible">
                            <div className="max-w-3xl mx-auto space-y-6 pb-6">
                                {/* Booking Selection Phase */}
                                {!formData.bookingId ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bookingSearch" className="text-sm font-semibold">1. Search and Select Booking</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="bookingSearch"
                                                    placeholder="Search by booking number, customer name, or package..."
                                                    value={bookingSearch}
                                                    onChange={(e) => setBookingSearch(e.target.value)}
                                                    className="pl-10 h-10 border-input bg-background"
                                                />
                                            </div>
                                            {validationErrors.bookingId && (
                                                <p className="text-xs text-destructive font-medium">
                                                    {validationErrors.bookingId}
                                                </p>
                                            )}
                                        </div>

                                        {/* Loading Skeletons */}
                                        {loading.bookings && (
                                            <div className="space-y-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="p-4 border rounded-xl bg-card/50">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-40" />
                                                                <Skeleton className="h-3.5 w-64" />
                                                            </div>
                                                            <div className="space-y-1.5 text-right flex flex-col items-end">
                                                                <Skeleton className="h-4 w-24" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Booking list */}
                                        {!loading.bookings && bookings.length > 0 && (
                                            <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                                                {bookings.map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between hover:border-primary/50 hover:shadow-xs ${formData.bookingId === booking.id
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                            : "bg-card border-border"
                                                            }`}
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                bookingId: booking.id,
                                                            }));
                                                            if (validationErrors.bookingId) {
                                                                setValidationErrors((prev) => ({ ...prev, bookingId: "" }));
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1 min-w-0 pr-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-sm text-foreground">
                                                                        {booking.bookingNumber || "N/A"}
                                                                    </span>
                                                                    <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 capitalize">
                                                                        {booking.customer.name}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {booking.package.name}
                                                                </p>
                                                            </div>
                                                            <div className="text-right text-xs space-y-0.5 flex-shrink-0">
                                                                <p className="text-muted-foreground">
                                                                    Total: <span className="font-medium text-foreground">{formatCurrency(booking.totalAmount)}</span>
                                                                </p>
                                                                <p className="font-semibold text-primary">
                                                                    Balance: {formatCurrency(booking.balanceAmount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Pagination Controls */}
                                                {bookings.length > 0 && !loading.bookings && (
                                                    <div className="flex justify-between items-center mt-2">
                                                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                                                            Previous
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                                                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                                                            Next
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* No results */}
                                        {!loading.bookings && bookingSearch.length >= 2 && bookings.length === 0 && (
                                            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 text-center">
                                                <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                                <p className="text-sm font-semibold text-muted-foreground">No bookings found</p>
                                                <p className="text-xs text-muted-foreground/80 mt-1">
                                                    No results matched "{bookingSearch}". Please try a different query.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Selected Booking Details & Form Inputs */
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h4 className="text-sm font-semibold text-foreground">1. Selected Booking Details</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, bookingId: "" }));
                                                }}
                                                className="text-xs h-8 border-dashed hover:border-destructive hover:text-destructive"
                                            >
                                                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                                Change Booking
                                            </Button>
                                        </div>

                                        <Card className="border border-muted/80 bg-muted/10 shadow-none">
                                            <CardContent className="p-4 grid sm:grid-cols-2 gap-4 text-xs">
                                                <div className="space-y-1.5">
                                                    <p>
                                                        <span className="font-semibold text-muted-foreground">Booking Number:</span>{" "}
                                                        <span className="font-bold text-foreground">{selectedBooking?.bookingNumber || "N/A"}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-muted-foreground">Customer:</span>{" "}
                                                        <span className="font-medium text-foreground">{selectedBooking?.customer.name}</span>
                                                    </p>
                                                    <p className="line-clamp-1">
                                                        <span className="font-semibold text-muted-foreground">Tour Package:</span>{" "}
                                                        <span className="font-medium text-foreground">{selectedBooking?.package.name}</span>
                                                    </p>
                                                </div>
                                                <div className="space-y-1.5 sm:text-right">
                                                    <p>
                                                        <span className="font-semibold text-muted-foreground">Total Price:</span>{" "}
                                                        <span className="font-semibold text-foreground">{formatCurrency(selectedBooking?.totalAmount || 0)}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-muted-foreground">Paid So Far:</span>{" "}
                                                        <span className="font-semibold text-foreground">{formatCurrency(selectedBooking?.advancePaid || 0)}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-muted-foreground">Remaining Balance:</span>{" "}
                                                        <span className="font-bold text-primary">{formatCurrency(selectedBooking?.balanceAmount || 0)}</span>
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-4 pt-2">
                                            <h4 className="text-sm font-semibold text-foreground border-b pb-2">2. Enter Payment Details</h4>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground">Payment Amount *</Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        min="0"
                                                        max={selectedBooking?.balanceAmount}
                                                        step="0.01"
                                                        value={formData.amount}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                amount: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Enter payment amount"
                                                        className="h-10"
                                                        required
                                                    />
                                                    {validationErrors.amount && (
                                                        <p className="text-[11px] text-destructive font-medium">{validationErrors.amount}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentType" className="text-xs font-bold text-muted-foreground">Payment Type *</Label>
                                                    <Select
                                                        value={formData.paymentType}
                                                        onValueChange={(value) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentType: value,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-10 bg-background">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={PaymentType.ADVANCE}>Advance Payment</SelectItem>
                                                            <SelectItem value={PaymentType.BALANCE}>Balance Payment</SelectItem>
                                                            <SelectItem value={PaymentType.PARTIAL}>Partial Payment</SelectItem>
                                                            <SelectItem value={PaymentType.REFUND}>Refund</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {validationErrors.paymentType && (
                                                        <p className="text-[11px] text-destructive font-medium">{validationErrors.paymentType}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentMethod" className="text-xs font-bold text-muted-foreground">Payment Method *</Label>
                                                    <Select
                                                        value={formData.paymentMethod}
                                                        onValueChange={(value) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentMethod: value,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-10 bg-background">
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                                                            <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                                                            <SelectItem value={PaymentMethod.DEBIT_CARD}>Debit Card</SelectItem>
                                                            <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                                                            <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                                                            <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {validationErrors.paymentMethod && (
                                                        <p className="text-[11px] text-destructive font-medium">{validationErrors.paymentMethod}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentDate" className="text-xs font-bold text-muted-foreground">Payment Date *</Label>
                                                    <Input
                                                        id="paymentDate"
                                                        type="date"
                                                        value={formData.paymentDate}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentDate: e.target.value,
                                                            }))
                                                        }
                                                        className="h-10"
                                                        required
                                                    />
                                                    {validationErrors.paymentDate && (
                                                        <p className="text-[11px] text-destructive font-medium">{validationErrors.paymentDate}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentReference" className="text-xs font-bold text-muted-foreground">Payment Reference</Label>
                                                    <Input
                                                        id="paymentReference"
                                                        value={formData.paymentReference}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentReference: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Check #, transfer notes..."
                                                        className="h-10 bg-background"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="transactionId" className="text-xs font-bold text-muted-foreground">Transaction ID / UTR</Label>
                                                    <Input
                                                        id="transactionId"
                                                        value={formData.transactionId}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                transactionId: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="UTR number"
                                                        className="h-10 bg-background"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-muted-foreground">Upload Receipt / Screenshot</Label>
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-all bg-background">
                                                    <div className="text-center p-3">
                                                        {loading.upload ? (
                                                            <>
                                                                <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin text-primary" />
                                                                <p className="text-xs font-medium text-muted-foreground">Uploading receipt...</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground/80" />
                                                                <p className="text-xs font-medium text-muted-foreground">
                                                                    {formData.paymentScreenshot ? (
                                                                        <span className="text-primary font-semibold truncate max-w-[220px] inline-block">{formData.paymentScreenshot.name}</span>
                                                                    ) : (
                                                                        "Drop image or pdf (Max 5MB)"
                                                                    )}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                        onChange={handleFileUpload}
                                                        disabled={loading.upload}
                                                    />
                                                </label>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="notes" className="text-xs font-bold text-muted-foreground">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={formData.notes}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            notes: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Additional notes about this transaction..."
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="px-6 py-4 border-t bg-card flex items-center justify-between flex-shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    onOpenChange(false);
                                }}
                                disabled={loading.submit}
                            >
                                Cancel
                            </Button>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={
                                        !formData.bookingId ||
                                        !formData.amount ||
                                        loading.submit ||
                                        loading.upload
                                    }
                                    className="min-w-[120px]"
                                >
                                    {loading.submit ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Payment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Real-Time Summary Sidebar Panel */}
                    <div className="w-80 border-l bg-card/40 hidden lg:flex flex-col flex-shrink-0">
                        <div className="p-5 border-b bg-card">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Payment Summary</h3>
                        </div>
                        <ScrollArea className="flex-1 p-5">
                            <div className="space-y-6">
                                {/* Selected Booking Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Booking Info</h4>
                                    {selectedBooking ? (
                                        <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                            <p className="font-bold text-foreground">{selectedBooking.bookingNumber}</p>
                                            <p className="font-medium text-muted-foreground truncate">{selectedBooking.customer.name}</p>
                                            <p className="text-muted-foreground line-clamp-2 mt-0.5">{selectedBooking.package.name}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No booking selected yet</p>
                                    )}
                                </div>

                                {/* Live Calculations */}
                                <div className="space-y-2 pt-2 border-t">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Calculations</h4>
                                    <div className="space-y-2 p-3 rounded-xl border bg-background">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Current Balance:</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedBooking ? formatCurrency(selectedBooking.balanceAmount) : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>This Payment:</span>
                                            <span className="font-semibold text-foreground">
                                                {currentPaymentAmount > 0 ? formatCurrency(currentPaymentAmount) : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t pt-2 font-bold text-foreground">
                                            <span>Balance After:</span>
                                            <span className="text-primary">
                                                {selectedBooking ? formatCurrency(balanceAfterPayment) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
