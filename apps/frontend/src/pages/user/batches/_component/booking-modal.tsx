import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorkflowManager } from "@/components/workflow/workflow-manager";
import type { IBooking } from "@/types/booking.types";
import {
    Calendar,
    ClipboardList,
    DollarSign,
    Download,
    FileText,
    Mail,
    Phone,
    Plus,
    User,
    Users,
    XCircle,
    UserMinus,
} from "lucide-react";
import { format } from "date-fns";
import BookingService from "@/services/booking.service";
import { InvoiceService } from "@/services/invoice.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { IBatches } from "@/types/batches.types";

interface BookingModalProps {
    booking: IBooking;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: () => void;
}

export function BookingModal({
    booking,
    open,
    onOpenChange,
    onUpdate,
}: BookingModalProps) {
    if (!booking) return null;

    const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");

    useEffect(() => {
        if (open && booking) {
            BookingService.getAvailableBatches(booking.package.id).then(setAvailableBatches);
        }
    }, [open, booking]);

    const handleCancelBooking = async () => {
        if (!confirm("Are you sure you want to cancel this entire booking?")) return;
        try {
            await BookingService.cancelBooking(booking.id);
            toast.success("Booking cancelled successfully");
            onUpdate?.();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const handleMoveBooking = async () => {
        if (!selectedBatchId) {
            toast.error("Please select a target batch");
            return;
        }
        if (!confirm("Are you sure you want to move this booking to another batch?")) return;
        
        setIsMoving(true);
        try {
            await BookingService.moveBooking(booking.id, selectedBatchId);
            toast.success("Booking moved successfully");
            onUpdate?.();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to move booking");
        } finally {
            setIsMoving(false);
        }
    };

    const handlePutOnHold = async () => {
        if (!confirm("Are you sure you want to put this booking ON HOLD?")) return;
        try {
            await BookingService.updateBooking(booking.id, { status: 'on_hold' });
            toast.success("Booking put on hold");
            onUpdate?.();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to put booking on hold");
        }
    };

    const handleRemoveTraveler = async (customerId: string, customerName: string) => {
        if (!confirm(`Are you sure you want to remove ${customerName} from this booking?`)) return;
        try {
            await BookingService.cancelCustomerFromBooking(booking.id, customerId);
            toast.success("Traveler removed successfully");
            onUpdate?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to remove traveler");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-5xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center justify-between w-full pr-8">
                        <div className="flex items-center gap-2 text-xl">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            Booking Details: {booking.bookingNumber}
                        </div>
                        <div className="flex items-center gap-2">
                             {booking.status !== 'cancelled' && booking.status !== 'on_hold' && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                    onClick={handlePutOnHold}
                                >
                                    Put on Hold
                                </Button>
                             )}
                             {booking.status !== 'cancelled' && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-destructive border-red-200 hover:bg-red-50"
                                    onClick={handleCancelBooking}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                </Button>
                             )}
                             {booking.status !== 'cancelled' && (
                                <div className="flex items-center gap-2">
                                    <select 
                                        className="text-sm border rounded p-1 h-9"
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        disabled={isMoving}
                                    >
                                        <option value="">Move to...</option>
                                        {availableBatches
                                            .filter(b => b.id !== booking.batch.id)
                                            .map(b => (
                                                <option key={b.id} value={b.id}>
                                                    {format(new Date(b.startDate), "MMM d, yyyy")} ({b.totalSeats - b.bookedSeats} left)
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={handleMoveBooking}
                                        disabled={!selectedBatchId || isMoving}
                                    >
                                        Move
                                    </Button>
                                </div>
                             )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-80px)]">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Primary Customer Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        Primary Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">
                                            {booking.primaryCustomer?.firstName}{" "}
                                            {booking.primaryCustomer?.lastName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        {booking.primaryCustomer?.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        {booking.primaryCustomer?.phone}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Booking Summary */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        Payment Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">
                                            Total Amount:
                                        </span>
                                        <span className="font-bold">
                                            ₹{booking.totalAmount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">
                                            Paid:
                                        </span>
                                        <span className="font-bold text-green-600">
                                            ₹{booking.advancePaid}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">
                                            Balance:
                                        </span>
                                        <span className="font-bold text-red-600">
                                            ₹{booking.balanceAmount}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Status:
                                        </span>
                                        <Badge className="capitalize">
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Package Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Package Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">
                                            Package Name
                                        </p>
                                        <p className="font-semibold">
                                            {booking.package.name}
                                        </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                Rate
                                            </p>
                                            <p className="font-medium text-sm">
                                                {BookingService.formatCurrency(
                                                    booking.package.price,
                                                )}
                                            </p>
                                        </div>
                                        {booking.package.duration && (
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                                    Duration
                                                </p>
                                                <p className="font-medium text-sm">
                                                    {booking.package.duration}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {booking.package.destination && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                Destination
                                            </p>
                                            <p className="text-sm">
                                                {booking.package.destination}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Batch & Travel */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Batch & Travel Dates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">
                                            Travel Schedule
                                        </p>
                                        <div className="flex items-center gap-2 font-medium">
                                            {format(
                                                new Date(
                                                    booking.batch.startDate,
                                                ),
                                                "MMM d, yyyy",
                                            )}
                                            <span className="text-muted-foreground">
                                                →
                                            </span>
                                            {format(
                                                new Date(booking.batch.endDate),
                                                "MMM d, yyyy",
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                Group Size
                                            </p>
                                            <p className="font-medium text-sm">
                                                {booking.numberOfCustomers}{" "}
                                                travelers
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                Batch Load
                                            </p>
                                            <p className="font-medium text-sm">
                                                {booking.batch.bookedSeats}/
                                                {booking.batch.totalSeats} seats
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Detailed History */}
                        <Card>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    Payment History
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            InvoiceService.generateAndDownloadInvoice(
                                                booking,
                                            )
                                        }
                                        disabled={
                                            !InvoiceService.hasCompletedPayments(
                                                booking,
                                            )
                                        }
                                    >
                                        <Download className="w-3 h-3 mr-2" />
                                        Invoice
                                    </Button>
                                    {booking.balanceAmount > 0 && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                (window.location.href = `/payments?addNew=true&bookingId=${booking.id}`)
                                            }
                                        >
                                            <Plus className="w-3 h-3 mr-2" />
                                            Add Payment
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {booking.payments &&
                                    booking.payments.length > 0 ? (
                                        booking.payments.map((payment, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold">
                                                            {BookingService.formatCurrency(
                                                                payment.amount,
                                                            )}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                payment.status ===
                                                                "completed"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="text-[10px] h-4 py-0"
                                                        >
                                                            {payment.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.paymentMethod.replace(
                                                            "_",
                                                            " ",
                                                        )}{" "}
                                                        •{" "}
                                                        {payment.paymentDate
                                                            ? format(
                                                                  new Date(
                                                                      payment.paymentDate,
                                                                  ),
                                                                  "MMM d, yyyy",
                                                              )
                                                            : "Date N/A"}
                                                    </p>
                                                </div>
                                                {payment.paymentReference && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase">
                                                            Ref:{" "}
                                                            {
                                                                payment.paymentReference
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                            No payment records found
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Travelers List */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1">
                                <Users className="w-3 h-3" />
                                Travelers ({booking.customers?.length})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {booking.customers?.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="p-3 border rounded-lg bg-background"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">
                                                    {customer.firstName}{" "}
                                                    {customer.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {customer.email}
                                                </p>
                                            </div>
                                            {booking.status !== 'cancelled' && booking.customers.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleRemoveTraveler(customer.id, `${customer.firstName} ${customer.lastName}`)}
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Workflow Manager */}
                        {booking.currentWorkflowId && (
                            <div className="space-y-3">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1">
                                    <ClipboardList className="w-3 h-3" />
                                    Technical Workflow & Operations
                                </div>
                                <WorkflowManager
                                    workflowId={booking.currentWorkflowId}
                                    onUpdate={onUpdate}
                                />
                            </div>
                        )}

                        {booking.specialRequests && (
                            <Card className="bg-amber-50/30 border-amber-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800">
                                        Special Requests / Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-amber-900/80 italic">
                                        "{booking.specialRequests}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
