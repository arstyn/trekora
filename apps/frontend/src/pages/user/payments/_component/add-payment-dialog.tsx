import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
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
import { AlertTriangle, Loader2, Search, Upload } from "lucide-react";
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

    const selectedBooking = bookings.find(
        (booking) => booking.id === formData.bookingId
    );

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchTerm: string) => {
            if (searchTerm.trim().length < 2) {
                setBookings([]);
                return;
            }

            try {
                setLoading((prev) => ({ ...prev, bookings: true }));
                setError(null);

                const response = await PaymentService.searchBookings({
                    search: searchTerm,
                    limit: 10,
                });

                setBookings(response.data);
            } catch (error) {
                console.error("Error searching bookings:", error);
                setError("Failed to search bookings. Please try again.");
                setBookings([]);
            } finally {
                setLoading((prev) => ({ ...prev, bookings: false }));
            }
        }, 500),
        []
    );

    // Handle booking search
    useEffect(() => {
        debouncedSearch(bookingSearch);
    }, [bookingSearch, debouncedSearch]);

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
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
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
        setError(null);
        setValidationErrors({});
    };

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Payment</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Booking Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Select Booking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="bookingSearch">
                                    Search Booking
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="bookingSearch"
                                        placeholder="Search by booking ID, customer name, or package..."
                                        value={bookingSearch}
                                        onChange={(e) =>
                                            setBookingSearch(e.target.value)
                                        }
                                        className="pl-8"
                                    />
                                </div>
                                {validationErrors.bookingId && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {validationErrors.bookingId}
                                    </p>
                                )}
                            </div>

                            {/* Loading skeleton for bookings */}
                            {loading.bookings && (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-3 border rounded-lg"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Booking search results */}
                            {!loading.bookings &&
                                bookingSearch &&
                                bookings.length > 0 && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    formData.bookingId ===
                                                    booking.id
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted/50"
                                                }`}
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        bookingId: booking.id,
                                                    }))
                                                }
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                booking.bookingNumber
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                booking.customer
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                booking.package
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <p>
                                                            Total:{" "}
                                                            {formatCurrency(
                                                                booking.totalAmount
                                                            )}
                                                        </p>
                                                        <p>
                                                            Paid:{" "}
                                                            {formatCurrency(
                                                                booking.advancePaid
                                                            )}
                                                        </p>
                                                        <p className="font-medium">
                                                            Balance:{" "}
                                                            {formatCurrency(
                                                                booking.balanceAmount
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            {/* No results message */}
                            {!loading.bookings &&
                                bookingSearch.length >= 2 &&
                                bookings.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No bookings found for "{bookingSearch}"
                                    </div>
                                )}

                            {/* Selected booking display */}
                            {selectedBooking && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-2">
                                        Selected Booking
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p>
                                                <span className="font-medium">
                                                    Booking ID:
                                                </span>{" "}
                                                {selectedBooking.bookingNumber}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Customer:
                                                </span>{" "}
                                                {selectedBooking.customer.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Package:
                                                </span>{" "}
                                                {selectedBooking.package.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p>
                                                <span className="font-medium">
                                                    Total Amount:
                                                </span>{" "}
                                                {formatCurrency(
                                                    selectedBooking.totalAmount
                                                )}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Paid Amount:
                                                </span>{" "}
                                                {formatCurrency(
                                                    selectedBooking.advancePaid
                                                )}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Balance:
                                                </span>{" "}
                                                {formatCurrency(
                                                    selectedBooking.balanceAmount
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    {formData.bookingId && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="amount">
                                            Payment Amount *
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
                                            placeholder="Enter amount"
                                            required
                                        />
                                        {validationErrors.amount && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {validationErrors.amount}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="paymentType">
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={PaymentType.ADVANCE}
                                                >
                                                    Advance Payment
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentType.BALANCE}
                                                >
                                                    Balance Payment
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentType.PARTIAL}
                                                >
                                                    Partial Payment
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentType.REFUND}
                                                >
                                                    Refund
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.paymentType && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {validationErrors.paymentType}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="paymentMethod">
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.BANK_TRANSFER
                                                    }
                                                >
                                                    Bank Transfer
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.CREDIT_CARD
                                                    }
                                                >
                                                    Credit Card
                                                </SelectItem>
                                                <SelectItem
                                                    value={
                                                        PaymentMethod.DEBIT_CARD
                                                    }
                                                >
                                                    Debit Card
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentMethod.CASH}
                                                >
                                                    Cash
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentMethod.UPI}
                                                >
                                                    UPI
                                                </SelectItem>
                                                <SelectItem
                                                    value={PaymentMethod.OTHER}
                                                >
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.paymentMethod && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {validationErrors.paymentMethod}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="paymentDate">
                                            Payment Date *
                                        </Label>
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
                                            required
                                        />
                                        {validationErrors.paymentDate && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {validationErrors.paymentDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="paymentReference">
                                            Payment Reference
                                        </Label>
                                        <Input
                                            id="paymentReference"
                                            value={formData.paymentReference}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    paymentReference:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="Transaction ID, Check number, etc."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="transactionId">
                                            Transaction ID
                                        </Label>
                                        <Input
                                            id="transactionId"
                                            value={formData.transactionId}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    transactionId:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="Bank transaction ID"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="paymentScreenshot">
                                        Payment Screenshot/Receipt
                                    </Label>
                                    <div className="mt-2">
                                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
                                            <div className="text-center">
                                                {loading.upload ? (
                                                    <>
                                                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                                        <p className="text-sm text-muted-foreground">
                                                            Uploading...
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">
                                                            {formData.paymentScreenshot
                                                                ? formData
                                                                      .paymentScreenshot
                                                                      .name
                                                                : "Click to upload payment proof (JPEG, PNG, PDF - Max 5MB)"}
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
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        placeholder="Additional notes about this payment..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading.submit}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !formData.bookingId ||
                                !formData.amount ||
                                loading.submit ||
                                loading.upload
                            }
                        >
                            {loading.submit ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Payment...
                                </>
                            ) : (
                                "Add Payment"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
