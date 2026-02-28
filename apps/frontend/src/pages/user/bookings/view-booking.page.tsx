import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Download,
    Edit,
    FileText,
    Mail,
    Phone,
    Users,
    Loader2,
    AlertCircle,
    Plus,
} from "lucide-react";
import { WorkflowManager } from "@/components/workflow/workflow-manager";
import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import BookingService from "@/services/booking.service";
import { InvoiceService } from "@/services/invoice.service";
import type { IBooking, BookingStatus } from "@/types/booking.types";

export default function BookingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<unknown>(null);

    const fetchBookingDetails = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const bookingData = await BookingService.getBookingById(id);
            setBooking(bookingData);
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError(
                (err as Error)?.message || "Failed to load booking details.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchBookingDetails();
        }
    }, [id, fetchBookingDetails]);

    const handleDownloadInvoice = async () => {
        if (!booking) return;

        try {
            setIsGeneratingInvoice(true);
            await InvoiceService.generateAndDownloadInvoice(booking);
        } catch (err) {
            console.error("Error generating invoice:", err);
            // You could show a toast or alert here
            alert((err as Error).message || "Failed to generate invoice");
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Confirmed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Pending
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Completed
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPaymentStatus = () => {
        if (!booking) return null;

        const paymentStatus = BookingService.getPaymentStatus(
            booking.advancePaid,
            booking.totalAmount,
        );

        switch (paymentStatus) {
            case "none":
                return <Badge variant="destructive">No Payment</Badge>;
            case "partial":
                return <Badge variant="secondary">Partial Payment</Badge>;
            case "full":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Fully Paid
                    </Badge>
                );
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <NavLink to="/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </NavLink>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading booking details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <NavLink to="/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </NavLink>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || "Booking not found"}
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-4"
                            onClick={fetchBookingDetails}
                        >
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <NavLink to="/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </NavLink>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Booking{" "}
                            {BookingService.formatBookingNumber(
                                booking.bookingNumber,
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            Booked on{" "}
                            {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                        </div>
                    </div>
                    <NavLink to={`/bookings/${booking.id}/edit`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Booking
                        </Button>
                    </NavLink>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-5">
                <div className="col-span-3 space-y-5">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Full Name
                                        </label>
                                        <p className="text-lg">
                                            {booking.primaryCustomer.firstName}{" "}
                                            {booking.primaryCustomer.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <p>
                                                {booking.primaryCustomer.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <p>
                                                {booking.primaryCustomer.phone}
                                            </p>
                                        </div>
                                    </div>
                                    {booking.primaryCustomer.address && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Address
                                            </label>
                                            <p>
                                                {
                                                    booking.primaryCustomer
                                                        .address
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Package & Batch Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Package Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Package Name
                                    </label>
                                    <p className="text-lg font-medium">
                                        {booking.package.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Price per Person
                                    </label>
                                    <p className="text-lg">
                                        {BookingService.formatCurrency(
                                            booking.package.price,
                                        )}
                                    </p>
                                </div>
                                {booking.package.destination && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Destination
                                        </label>
                                        <p>{booking.package.destination}</p>
                                    </div>
                                )}
                                {booking.package.duration && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Duration
                                        </label>
                                        <p>{booking.package.duration}</p>
                                    </div>
                                )}
                                {booking.package.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Description
                                        </label>
                                        <p className="text-sm">
                                            {booking.package.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Batch Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Travel Dates
                                    </label>
                                    <p className="text-lg">
                                        {new Date(
                                            booking.batch.startDate,
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                            booking.batch.endDate,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Batch Capacity
                                    </label>
                                    <p>
                                        {booking.batch.bookedSeats} /{" "}
                                        {booking.batch.totalSeats} seats booked
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Number of Customers
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <p className="text-lg font-medium">
                                            {booking.numberOfCustomers}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                        <span className="font-medium">
                                            Total Amount:
                                        </span>
                                        <span className="text-xl font-bold">
                                            {BookingService.formatCurrency(
                                                booking.totalAmount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg">
                                        <span className="font-medium">
                                            Amount Paid:
                                        </span>
                                        <span className="text-xl font-bold text-green-700">
                                            {BookingService.formatCurrency(
                                                booking.advancePaid,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-yellow-500/10 rounded-lg">
                                        <span className="font-medium">
                                            Balance Amount:
                                        </span>
                                        <span className="text-xl font-bold text-yellow-700">
                                            {BookingService.formatCurrency(
                                                booking.balanceAmount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Payment Status
                                        </label>
                                        <div className="mt-1">
                                            {getPaymentStatus()}
                                        </div>
                                    </div>
                                    {booking.payments &&
                                        booking.payments.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Payment History
                                                </label>
                                                <div className="mt-2 space-y-2">
                                                    {booking.payments.map(
                                                        (payment, index) => (
                                                            <div
                                                                key={
                                                                    payment.id ||
                                                                    index
                                                                }
                                                                className="p-3 border rounded-lg"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {BookingService.formatCurrency(
                                                                                payment.amount,
                                                                            )}
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {payment.paymentMethod
                                                                                .replace(
                                                                                    "_",
                                                                                    " ",
                                                                                )
                                                                                .toUpperCase()}{" "}
                                                                            •{" "}
                                                                            {payment.paymentDate
                                                                                ? new Date(
                                                                                      payment.paymentDate,
                                                                                  ).toLocaleDateString()
                                                                                : "N/A"}
                                                                        </p>
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            payment.status ===
                                                                            "completed"
                                                                                ? "default"
                                                                                : "secondary"
                                                                        }
                                                                    >
                                                                        {
                                                                            payment.status
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                                {payment.paymentReference && (
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        Ref:{" "}
                                                                        {
                                                                            payment.paymentReference
                                                                        }
                                                                    </p>
                                                                )}
                                                                {payment.notes && (
                                                                    <p className="text-sm mt-1">
                                                                        {
                                                                            payment.notes
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-2">
                    {booking.currentWorkflowId && (
                        <WorkflowManager
                            workflowId={booking.currentWorkflowId}
                        />
                    )}
                </div>
            </div>

            {/* Customer Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Customer Details ({booking.numberOfCustomers})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Emergency Contact</TableHead>
                                <TableHead>Special Requirements</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {booking.customers.map((customer, index) => (
                                <TableRow key={customer.id || index}>
                                    <TableCell className="font-medium">
                                        {customer.firstName} {customer.lastName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Mail className="w-3 h-3" />
                                            {customer.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Phone className="w-3 h-3" />
                                            {customer.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customer.emergencyContactName &&
                                        customer.emergencyContactPhone ? (
                                            <div className="text-sm">
                                                <div>
                                                    {
                                                        customer.emergencyContactName
                                                    }
                                                </div>
                                                <div className="text-gray-500">
                                                    {
                                                        customer.emergencyContactPhone
                                                    }
                                                </div>
                                            </div>
                                        ) : (
                                            "Not provided"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.specialRequests || "None"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
                <Card>
                    <CardHeader>
                        <CardTitle>Special Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{booking.specialRequests}</p>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadInvoice}
                                    disabled={
                                        !booking ||
                                        !InvoiceService.hasCompletedPayments(
                                            booking,
                                        ) ||
                                        isGeneratingInvoice
                                    }
                                >
                                    {isGeneratingInvoice ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Invoice
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            {booking &&
                                !InvoiceService.hasCompletedPayments(
                                    booking,
                                ) && (
                                    <TooltipContent>
                                        <p>
                                            Invoice can only be downloaded when
                                            there are completed payments
                                        </p>
                                    </TooltipContent>
                                )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-2">
                    {booking.balanceAmount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                navigate(
                                    `/payments?addNew=true&bookingId=${booking.id}`,
                                );
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment
                        </Button>
                    )}
                    <NavLink to={`/bookings/${booking.id}/edit`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Booking
                        </Button>
                    </NavLink>
                </div>
            </div>

            {/* Document Viewer Dialog */}
            <Dialog
                open={!!selectedDocument}
                onOpenChange={() => setSelectedDocument(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>
                            {(selectedDocument as { name?: string })?.name ||
                                "Document Viewer"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                            Document viewer would be implemented here
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
