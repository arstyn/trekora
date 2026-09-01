import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TypableDatePicker } from "@/components/ui/typable-date-picker";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import BookingService from "@/services/booking.service";
import PaymentService from "@/services/payment.service";
import type {
    BookingCustomerPaymentSummary,
    BookingForPayment,
    CreatePaymentDto,
    PassengerPaymentAllocation,
} from "@/types/payment.types";
import { PaymentMethod, PaymentType } from "@/types/payment.types";
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Plus,
    Search,
    Sparkles,
    Split,
    Upload,
    UserCheck,
    Users
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface AddPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPaymentAdded?: () => void;
    initialBookingId?: string;
}

export function AddPaymentDialog({
    open,
    onOpenChange,
    onPaymentAdded,
    initialBookingId,
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
        isPassengerSplit: false,
        payerType: "primary", // 'primary' | 'passenger' | 'custom'
        payerCustomerId: "",
        payerName: "",
        allocations: {} as Record<string, string>, // bookingCustomerId -> allocated amount
    });

    const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>([]);
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookings, setBookings] = useState<BookingForPayment[]>([]);
    const [loading, setLoading] = useState({
        bookings: false,
        submit: false,
        upload: false,
        details: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();
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
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Failed to load bookings. Please try again.");
            setBookings([]);
        } finally {
            setLoading((prev) => ({ ...prev, bookings: false }));
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (searchTerm: string) => {
            setPage(1);
            await fetchBookings(1, searchTerm);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(bookingSearch);
    }, [bookingSearch, debouncedSearch]);

    useEffect(() => {
        fetchBookings(page, bookingSearch);
    }, [page]);

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // When booking is selected, ensure customers are loaded
    const handleSelectBooking = async (booking: BookingForPayment) => {
        setFormData((prev) => ({
            ...prev,
            bookingId: booking.id,
            amount:
                booking.balanceAmount > 0
                    ? String(booking.balanceAmount)
                    : prev.amount,
            paymentType:
                booking.advancePaid === 0
                    ? PaymentType.ADVANCE
                    : booking.balanceAmount > 0
                        ? PaymentType.BALANCE
                        : prev.paymentType,
        }));

        if (validationErrors.bookingId) {
            setValidationErrors((prev) => ({ ...prev, bookingId: "" }));
        }

        // If booking doesn't have customers details loaded, fetch full booking
        if (!booking.customers || booking.customers.length === 0) {
            try {
                setLoading((prev) => ({ ...prev, details: true }));
                const fullBooking = await BookingService.getBookingById(booking.id);
                if (fullBooking && fullBooking.customers) {
                    const mappedCustomers: BookingCustomerPaymentSummary[] =
                        fullBooking.customers.map((c) => ({
                            id: c.bookingCustomerId || c.id || "",
                            customerId: c.id || "",
                            name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Passenger",
                            email: c.email || "",
                            phone: c.phone || "",
                            ageCategory: c.ageCategory || "adult",
                            tierName: c.packageTierName,
                            calculatedShare: Number(c.calculatedShare || 0),
                            paidAmount: Number(c.paidAmount || 0),
                            balanceAmount: Number(c.balanceAmount || 0),
                            status: c.paymentStatus || "unpaid",
                        }));

                    setBookings((prev) =>
                        prev.map((b) =>
                            b.id === booking.id ? { ...b, customers: mappedCustomers } : b
                        )
                    );

                    setSelectedPassengerIds(mappedCustomers.map((c) => c.id));
                }
            } catch (err) {
                console.error("Failed to load booking customers:", err);
            } finally {
                setLoading((prev) => ({ ...prev, details: false }));
            }
        } else {
            setSelectedPassengerIds(booking.customers.map((c) => c.id));
        }
    };

    // Load initial booking when dialog opens with initialBookingId
    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }

        if (initialBookingId) {
            const loadInitialBooking = async () => {
                try {
                    setLoading((prev) => ({ ...prev, bookings: true }));
                    const booking = await BookingService.getBookingById(initialBookingId);
                    if (booking) {
                        const primaryCust = booking.primaryCustomer || booking.customers?.[0];
                        const customerName = primaryCust
                            ? `${primaryCust.firstName || ""} ${primaryCust.lastName || ""}`.trim()
                            : "Unknown Customer";

                        const mappedCustomers: BookingCustomerPaymentSummary[] =
                            booking.customers
                                ? booking.customers.map((c) => ({
                                    id: c.bookingCustomerId || c.id || "",
                                    customerId: c.id || "",
                                    name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Passenger",
                                    email: c.email || "",
                                    phone: c.phone || "",
                                    ageCategory: c.ageCategory || "adult",
                                    tierName: c.packageTierName,
                                    calculatedShare: Number(c.calculatedShare || 0),
                                    paidAmount: Number(c.paidAmount || 0),
                                    balanceAmount: Number(c.balanceAmount || 0),
                                    status: c.paymentStatus || "unpaid",
                                }))
                                : [];

                        const bookingItem: BookingForPayment = {
                            id: booking.id,
                            bookingNumber: booking.bookingNumber,
                            customer: {
                                id: primaryCust?.id || "",
                                name: customerName,
                                email: primaryCust?.email || "",
                            },
                            package: {
                                id: booking.package?.id || "",
                                name: booking.package?.name || "Unknown Package",
                                destination: booking.package?.destination,
                            },
                            totalAmount: Number(booking.totalAmount) || 0,
                            advancePaid: Number(booking.advancePaid) || 0,
                            balanceAmount: Number(booking.balanceAmount) || 0,
                            customers: mappedCustomers,
                        };

                        setBookings((prev) => {
                            const exists = prev.some((b) => b.id === bookingItem.id);
                            return exists ? prev : [bookingItem, ...prev];
                        });

                        setFormData((prev) => ({
                            ...prev,
                            bookingId: bookingItem.id,
                            amount:
                                bookingItem.balanceAmount > 0
                                    ? String(bookingItem.balanceAmount)
                                    : prev.amount,
                            paymentType:
                                bookingItem.advancePaid === 0
                                    ? PaymentType.ADVANCE
                                    : bookingItem.balanceAmount > 0
                                        ? PaymentType.BALANCE
                                        : prev.paymentType,
                        }));

                        setSelectedPassengerIds(mappedCustomers.map((c) => c.id));
                    }
                } catch (err) {
                    console.error("Failed to load initial booking:", err);
                } finally {
                    setLoading((prev) => ({ ...prev, bookings: false }));
                }
            };

            loadInitialBooking();
        }
    }, [open, initialBookingId]);

    // Quick Split actions
    const handleSplitEqually = () => {
        const activeIds = selectedPassengerIds;
        if (activeIds.length === 0) {
            toast({
                title: "No passengers selected",
                description: "Please select at least one passenger to split payment among.",
                variant: "destructive",
            });
            return;
        }

        const totalToSplit = Number(formData.amount) || selectedBooking?.balanceAmount || 0;
        if (totalToSplit <= 0) return;

        const equalShare = Math.floor((totalToSplit / activeIds.length) * 100) / 100;
        let remainder = Math.round((totalToSplit - equalShare * activeIds.length) * 100) / 100;

        const newAllocations: Record<string, string> = {};
        activeIds.forEach((id, index) => {
            let allocated = equalShare;
            if (index === activeIds.length - 1 && remainder !== 0) {
                allocated = Math.round((allocated + remainder) * 100) / 100;
            }
            newAllocations[id] = String(allocated);
        });

        setFormData((prev) => ({
            ...prev,
            amount: String(totalToSplit),
            allocations: newAllocations,
        }));
    };

    const handlePayFullBalances = () => {
        if (!selectedBooking?.customers || selectedBooking.customers.length === 0) return;

        const newAllocations: Record<string, string> = {};
        let total = 0;

        selectedBooking.customers.forEach((c) => {
            if (selectedPassengerIds.includes(c.id)) {
                const balance = Number(c.balanceAmount || 0);
                newAllocations[c.id] = String(balance);
                total += balance;
            }
        });

        setFormData((prev) => ({
            ...prev,
            amount: String(total),
            allocations: newAllocations,
        }));
    };

    const handleAllocationChange = (passengerId: string, val: string) => {
        const newAllocations = {
            ...formData.allocations,
            [passengerId]: val,
        };

        // Recalculate total amount from all allocations
        const total = Object.values(newAllocations).reduce(
            (sum, curr) => sum + (Number(curr) || 0),
            0
        );

        setFormData((prev) => ({
            ...prev,
            allocations: newAllocations,
            amount: total > 0 ? String(total) : prev.amount,
        }));
    };

    const togglePassengerCheckbox = (passengerId: string) => {
        setSelectedPassengerIds((prev) => {
            if (prev.includes(passengerId)) {
                const next = prev.filter((id) => id !== passengerId);
                // Remove allocation for unselected
                const updatedAllocations = { ...formData.allocations };
                delete updatedAllocations[passengerId];
                const total = Object.values(updatedAllocations).reduce(
                    (sum, curr) => sum + (Number(curr) || 0),
                    0
                );
                setFormData((p) => ({
                    ...p,
                    allocations: updatedAllocations,
                    amount: total > 0 ? String(total) : p.amount,
                }));
                return next;
            } else {
                return [...prev, passengerId];
            }
        });
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.bookingId) {
            errors.bookingId = "Please select a booking";
        }

        const totalAmountNum = Number(formData.amount);
        if (!formData.amount || totalAmountNum <= 0) {
            errors.amount = "Please enter a valid amount";
        }

        if (
            selectedBooking &&
            totalAmountNum > selectedBooking.balanceAmount
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

        // Passenger split validations
        if (formData.isPassengerSplit) {
            const allocationsList = Object.entries(formData.allocations)
                .filter(([id, amt]) => selectedPassengerIds.includes(id) && Number(amt) > 0);

            if (allocationsList.length === 0) {
                errors.allocations = "Please allocate amounts to at least one passenger";
            }

            const allocatedSum = allocationsList.reduce(
                (sum, [_, amt]) => sum + Number(amt),
                0
            );

            if (Math.abs(allocatedSum - totalAmountNum) > 0.01) {
                errors.allocations = `Passenger allocations total (${formatCurrency(
                    allocatedSum
                )}) must match payment amount (${formatCurrency(totalAmountNum)})`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "application/pdf",
            ];
            const maxSize = 5 * 1024 * 1024;

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

            let payerName: string | undefined = undefined;
            let payerCustomerId: string | undefined = undefined;

            if (formData.isPassengerSplit) {
                if (formData.payerType === "primary") {
                    payerCustomerId = selectedBooking?.customer?.id;
                    payerName = selectedBooking?.customer?.name;
                } else if (formData.payerType === "passenger") {
                    const pass = selectedBooking?.customers?.find(
                        (c) => c.customerId === formData.payerCustomerId || c.id === formData.payerCustomerId
                    );
                    payerCustomerId = pass?.customerId;
                    payerName = pass?.name;
                } else if (formData.payerType === "custom") {
                    payerName = formData.payerName.trim();
                }
            }

            // Prepare allocations
            let allocations: PassengerPaymentAllocation[] | undefined = undefined;
            if (formData.isPassengerSplit) {
                allocations = Object.entries(formData.allocations)
                    .filter(([id, amt]) => selectedPassengerIds.includes(id) && Number(amt) > 0)
                    .map(([bcId, amt]) => ({
                        bookingCustomerId: bcId,
                        amount: Number(amt),
                    }));
            }

            const paymentData: CreatePaymentDto = {
                bookingId: formData.bookingId,
                amount: Number(formData.amount),
                paymentType: formData.paymentType as PaymentType,
                paymentMethod: formData.paymentMethod as PaymentMethod,
                paymentReference: formData.paymentReference || undefined,
                transactionId: formData.transactionId || undefined,
                paymentDate: formData.paymentDate,
                notes: formData.notes || undefined,
                isPassengerSplit: formData.isPassengerSplit,
                payerName,
                payerCustomerId,
                allocations,
            };

            const newPayment = await PaymentService.createPayment(paymentData);

            if (formData.paymentScreenshot) {
                try {
                    setLoading((prev) => ({ ...prev, upload: true }));
                    await PaymentService.uploadReceipt(
                        newPayment.id,
                        formData.paymentScreenshot
                    );
                } catch (uploadError) {
                    console.error("Error uploading receipt:", uploadError);
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

            resetForm();
            onOpenChange(false);
            onPaymentAdded?.();
        } catch (err: any) {
            console.error("Error creating payment:", err);
            const errorMessage =
                err?.response?.data?.message ||
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
            isPassengerSplit: false,
            payerType: "primary",
            payerCustomerId: "",
            payerName: "",
            allocations: {},
        });
        setSelectedPassengerIds([]);
        setBookingSearch("");
        setBookings([]);
        setPage(1);
        setError(null);
        setValidationErrors({});
    };

    const currentPaymentAmount = Number(formData.amount) || 0;
    const balanceAfterPayment = selectedBooking
        ? Math.max(0, selectedBooking.balanceAmount - currentPaymentAmount)
        : 0;

    const totalAllocatedAmount = Object.entries(formData.allocations)
        .filter(([id]) => selectedPassengerIds.includes(id))
        .reduce((sum, [_, amt]) => sum + (Number(amt) || 0), 0);

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
            <DialogContent className="responsive-dialog sm:max-w-6xl w-[95vw] h-[88vh] max-lg:h-auto max-lg:max-h-[92vh] overflow-hidden max-lg:overflow-y-auto p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
                <style>{`
                    @media (max-height: 800px) {
                        .responsive-dialog {
                            height: auto !important;
                            max-height: 92vh !important;
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
                            Search for a booking, choose payment split or bulk mode, and record the transaction.
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
                                            <Label htmlFor="bookingSearch" className="text-sm font-semibold">
                                                1. Search and Select Booking
                                            </Label>
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
                                                        onClick={() => handleSelectBooking(booking)}
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
                                                                    {booking.customers && booking.customers.length > 1 && (
                                                                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                                                            <Users className="w-2.5 h-2.5 mr-1" />
                                                                            {booking.customers.length} Travelers
                                                                        </Badge>
                                                                    )}
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
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                                            disabled={page === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground">
                                                            Page {page} of {totalPages}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                                            disabled={page === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

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

                                        {/* Optional Switch: Passenger-Wise Payment Allocation */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border bg-card border-border/80 shadow-2xs">
                                            <div className="space-y-1 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <Split className="w-4 h-4 text-primary" />
                                                    <Label htmlFor="passengerSplitToggle" className="text-sm font-bold cursor-pointer">
                                                        Passenger-Wise Split / Multi-Payer Mode
                                                    </Label>
                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
                                                        Optional
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Enable if this payment is provided by a specific person or is allocated towards specific travelers (e.g. joint family branches).
                                                </p>
                                            </div>
                                            <Switch
                                                id="passengerSplitToggle"
                                                checked={formData.isPassengerSplit}
                                                onCheckedChange={(checked) => {
                                                    setFormData((prev) => ({ ...prev, isPassengerSplit: checked }));
                                                    if (checked && selectedBooking?.customers && selectedBooking.customers.length > 0) {
                                                        setSelectedPassengerIds(selectedBooking.customers.map((c) => c.id));
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Passenger Split & Multi-Payer Controls */}
                                        {formData.isPassengerSplit && (
                                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="w-4 h-4 text-primary" />
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                                                            Passenger Allocations & Payer Details
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleSplitEqually}
                                                            className="text-xs h-7 bg-background"
                                                        >
                                                            <Split className="w-3 h-3 mr-1 text-primary" />
                                                            Split Amount Evenly
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handlePayFullBalances}
                                                            className="text-xs h-7 bg-background"
                                                        >
                                                            <Sparkles className="w-3 h-3 mr-1 text-primary" />
                                                            Pay Full Balances
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Payer Configuration */}
                                                <div className="grid sm:grid-cols-2 gap-3 bg-background/80 p-3 rounded-lg border">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-muted-foreground">
                                                            Who made this payment? (Payer)
                                                        </Label>
                                                        <Select
                                                            value={formData.payerType}
                                                            onValueChange={(val) => {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    payerType: val,
                                                                    payerCustomerId:
                                                                        val === "primary"
                                                                            ? selectedBooking?.customer?.id || ""
                                                                            : val === "passenger" && selectedBooking?.customers?.[0]
                                                                                ? selectedBooking.customers[0].customerId
                                                                                : "",
                                                                }));
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-9 text-xs bg-background">
                                                                <SelectValue placeholder="Select payer" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="primary">
                                                                    Primary Booker: {selectedBooking?.customer.name}
                                                                </SelectItem>
                                                                <SelectItem value="passenger">Specific Passenger</SelectItem>
                                                                <SelectItem value="custom">Other / Custom Name</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {formData.payerType === "passenger" && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                                Select Passenger
                                                            </Label>
                                                            <Select
                                                                value={formData.payerCustomerId}
                                                                onValueChange={(val) =>
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        payerCustomerId: val,
                                                                    }))
                                                                }
                                                            >
                                                                <SelectTrigger className="h-9 text-xs bg-background">
                                                                    <SelectValue placeholder="Choose passenger" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {selectedBooking?.customers?.map((c) => (
                                                                        <SelectItem key={c.id} value={c.customerId}>
                                                                            {c.name} ({c.tierName || c.ageCategory})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    {formData.payerType === "custom" && (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                                Payer Name / Family Head
                                                            </Label>
                                                            <Input
                                                                placeholder="e.g. Ramesh Kumar (Uncle)"
                                                                value={formData.payerName}
                                                                onChange={(e) =>
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        payerName: e.target.value,
                                                                    }))
                                                                }
                                                                className="h-9 text-xs bg-background"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Passenger Allocation Grid */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                                                        <span>Select & Allocate to Travelers</span>
                                                        <span className="text-[11px]">
                                                            Allocated: {formatCurrency(totalAllocatedAmount)} / {formatCurrency(currentPaymentAmount)}
                                                        </span>
                                                    </div>

                                                    {validationErrors.allocations && (
                                                        <p className="text-xs text-destructive font-medium">
                                                            {validationErrors.allocations}
                                                        </p>
                                                    )}

                                                    <div className="space-y-2">
                                                        {selectedBooking?.customers && selectedBooking.customers.length > 0 ? (
                                                            selectedBooking.customers.map((c) => {
                                                                const isChecked = selectedPassengerIds.includes(c.id);
                                                                const allocated = formData.allocations[c.id] || "";
                                                                return (
                                                                    <div
                                                                        key={c.id}
                                                                        className={`p-3 rounded-lg border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isChecked
                                                                            ? "bg-background border-primary/40 shadow-2xs"
                                                                            : "bg-muted/20 border-muted opacity-70"
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-start gap-3 min-w-0">
                                                                            <Checkbox
                                                                                id={`chk-${c.id}`}
                                                                                checked={isChecked}
                                                                                onCheckedChange={() => togglePassengerCheckbox(c.id)}
                                                                                className="mt-1"
                                                                            />
                                                                            <div className="space-y-0.5">
                                                                                <label
                                                                                    htmlFor={`chk-${c.id}`}
                                                                                    className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5"
                                                                                >
                                                                                    {c.name}
                                                                                    {c.status === "paid" && (
                                                                                        <Badge className="text-[9px] py-0 px-1 bg-green-500/10 text-green-700 border-green-200">
                                                                                            Paid
                                                                                        </Badge>
                                                                                    )}
                                                                                </label>
                                                                                <p className="text-[11px] text-muted-foreground">
                                                                                    Share: {formatCurrency(c.calculatedShare)} • Paid: {formatCurrency(c.paidAmount)} •{" "}
                                                                                    <span className="font-semibold text-primary">
                                                                                        Bal: {formatCurrency(c.balanceAmount)}
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                                                                            <Label className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                                                Pay:
                                                                            </Label>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                disabled={!isChecked}
                                                                                value={allocated}
                                                                                onChange={(e) =>
                                                                                    handleAllocationChange(c.id, e.target.value)
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="h-8 w-28 text-xs font-semibold text-right bg-background"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-muted-foreground bg-background rounded-lg border border-dashed">
                                                                Loading travelers list...
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Total allocation warning banner if mismatch */}
                                                    {formData.isPassengerSplit &&
                                                        Math.abs(totalAllocatedAmount - currentPaymentAmount) > 0.01 && (
                                                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-1.5">
                                                                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                                                    <span>
                                                                        Allocations sum ({formatCurrency(totalAllocatedAmount)}) differs from payment amount ({formatCurrency(currentPaymentAmount)}).
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            amount: String(totalAllocatedAmount),
                                                                        }))
                                                                    }
                                                                    className="h-6 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                                                                >
                                                                    Sync Total
                                                                </Button>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4 pt-2">
                                            <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                                                {formData.isPassengerSplit ? "3." : "2."} Payment Transaction Details
                                            </h4>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground">
                                                        Total Payment Amount *
                                                    </Label>
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
                                                    <Label htmlFor="paymentType" className="text-xs font-bold text-muted-foreground">
                                                        Payment Type *
                                                    </Label>
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
                                                    <Label htmlFor="paymentMethod" className="text-xs font-bold text-muted-foreground">
                                                        Payment Method *
                                                    </Label>
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
                                                    <Label htmlFor="paymentDate" className="text-xs font-bold text-muted-foreground">
                                                        Payment Date *
                                                    </Label>
                                                    <TypableDatePicker
                                                        id="paymentDate"
                                                        value={formData.paymentDate}
                                                        onChange={(val) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentDate: val,
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
                                                    <Label htmlFor="paymentReference" className="text-xs font-bold text-muted-foreground">
                                                        Payment Reference
                                                    </Label>
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
                                                    <Label htmlFor="transactionId" className="text-xs font-bold text-muted-foreground">
                                                        Transaction ID / UTR
                                                    </Label>
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
                                                                        <span className="text-primary font-semibold truncate max-w-[220px] inline-block">
                                                                            {formData.paymentScreenshot.name}
                                                                        </span>
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

                                {/* Passenger Split Summary in Sidebar */}
                                {formData.isPassengerSplit && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                                            <span>Allocations</span>
                                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-primary">
                                                {selectedPassengerIds.length} Selected
                                            </Badge>
                                        </h4>
                                        <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                            {formData.payerType === "custom" && formData.payerName && (
                                                <p className="pb-1.5 border-b text-[11px]">
                                                    <span className="text-muted-foreground">Payer: </span>
                                                    <span className="font-bold text-foreground">{formData.payerName}</span>
                                                </p>
                                            )}
                                            {selectedBooking?.customers
                                                ?.filter((c) => selectedPassengerIds.includes(c.id))
                                                .map((c) => (
                                                    <div key={c.id} className="flex justify-between items-center text-[11px]">
                                                        <span className="truncate max-w-[120px] text-muted-foreground">{c.name}</span>
                                                        <span className="font-bold text-foreground">
                                                            {formatCurrency(Number(formData.allocations[c.id] || 0))}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

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
