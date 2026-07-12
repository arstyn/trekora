import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Briefcase,
    Calendar,
    CalendarDays,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    FileText,
    History,
    Loader2,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    Trash2,
    User,
    Users,
    XCircle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

    const fetchBookingDetails = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
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
            setLoading(false);
        }
    }, [id, fetchBookingLogs]);

    useEffect(() => {
        if (id) {
            fetchBookingDetails();
            fetchBookingLogs();
        }
    }, [id, fetchBookingDetails, fetchBookingLogs]);

    useEffect(() => {
        if (booking?.package.id) {
            fetchAvailableBatches(booking.package.id);
        }
    }, [booking?.package.id, fetchAvailableBatches]);

    const handleCancelBooking = async () => {
        if (!confirm("Are you sure you want to cancel this entire booking?"))
            return;
        try {
            await BookingService.cancelBooking(id!);
            toast.success("Booking cancelled successfully");
            fetchBookingDetails();
            fetchBookingLogs();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to cancel booking",
            );
        }
    };

    const handlePutOnHold = async () => {
        if (!confirm("Are you sure you want to put this booking ON HOLD?"))
            return;
        try {
            await BookingService.updateBooking(id!, { status: "on_hold" });
            toast.success("Booking put on hold");
            fetchBookingDetails();
            fetchBookingLogs();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                "Failed to put booking on hold",
            );
        }
    };

    const handleDeleteBooking = async () => {
        if (
            !confirm(
                "Are you sure you want to PERMANENTLY DELETE this booking? This action cannot be undone.",
            )
        )
            return;
        try {
            await BookingService.deleteBooking(id!);
            toast.success("Booking deleted successfully");
            navigate("/bookings");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to delete booking",
            );
        }
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
            fetchBookingLogs();
            setSelectedBatchId("");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to move booking",
            );
        } finally {
            setIsMoving(false);
        }
    };

    const handleRemoveTraveler = async (
        customerId: string,
        customerName: string,
    ) => {
        if (
            !confirm(
                `Are you sure you want to remove ${customerName} from this booking?`,
            )
        )
            return;
        try {
            await BookingService.cancelCustomerFromBooking(id!, customerId);
            toast.success("Traveler removed successfully");
            fetchBookingDetails();
            fetchBookingLogs();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to remove traveler",
            );
        }
    };

    const handleDownloadInvoice = async () => {
        if (!booking) return;

        try {
            setIsGeneratingInvoice(true);
            await InvoiceService.generateAndDownloadInvoice(booking, user?.organization?.name, user?.organization?.domain);
        } catch (err) {
            console.error("Error generating invoice:", err);
            alert((err as Error).message || "Failed to generate invoice");
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case "confirmed":
                return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            case "completed":
                return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
            case "on_hold":
                return <Badge className="bg-amber-100 text-amber-800">On Hold</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const displayVal = (value?: string | number | null) => {
        return value !== undefined && value !== null && value !== "" ? (
            value
        ) : (
            <span className="text-muted-foreground italic">N/A</span>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading booking resources...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Alert variant="destructive" className="border-2 shadow-lg">
                    <AlertCircle className="h-6 w-6" />
                    <AlertDescription className="text-lg font-medium ml-2">
                        {error || "Booking not found."}
                    </AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    className="mt-6 shadow-sm"
                    onClick={() => navigate("/bookings")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Bookings
                </Button>
            </div>
        );
    }

    const otherBatches = availableBatches.filter(
        (b: IBatches) => b.id !== booking.batch.id,
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header section (copied from view-batch.page.tsx) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-full text-primary border border-primary/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Booking #{booking.bookingNumber}
                        </h1>
                        <p className="text-muted-foreground">Booking Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}

                    {booking.status !== "cancelled" && otherBatches.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Select
                                value={selectedBatchId}
                                onValueChange={setSelectedBatchId}
                                disabled={isMoving}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Move batch..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {otherBatches.map((b: IBatches) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {format(new Date(b.startDate), "MMM d")} ({b.totalSeats - b.bookedSeats} left)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={handleMoveBooking}
                                disabled={!selectedBatchId || isMoving}
                            >
                                Move
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" onClick={() => navigate("/bookings")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <NavLink to={`/bookings/${booking.id}/edit`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                        </Button>
                    </NavLink>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {booking.status !== "cancelled" && booking.status !== "on_hold" && (
                                <DropdownMenuItem onClick={handlePutOnHold}>
                                    <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                    Put on Hold
                                </DropdownMenuItem>
                            )}
                            {booking.status !== "cancelled" && (
                                <DropdownMenuItem onClick={handleCancelBooking} className="text-destructive">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDeleteBooking} className="text-destructive font-semibold">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Booking
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <NavLink
                                to="/bookings"
                                className="hover:text-primary transition-colors"
                            >
                                Bookings
                            </NavLink>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>#{booking.bookingNumber}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Main content grid: 3-column equal layout with zero empty horizontal space */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1: Booking Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* General details list with vertical icons */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Booking Date</p>
                                        <p className="font-semibold text-sm">
                                            {format(new Date(booking.createdAt), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Package Assigned</p>
                                        <p className="font-semibold text-sm">{booking.package.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Batch Dates</p>
                                        <p className="font-semibold text-sm">
                                            {format(new Date(booking.batch.startDate), "MMM d, yyyy")} - {format(new Date(booking.batch.endDate), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Group Size</p>
                                        <p className="font-semibold text-sm">{booking.numberOfCustomers} travelers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Primary Booker details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                Primary Contact Info
                            </h4>
                            <div className="flex flex-col gap-3 text-xs pl-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Contact Name</p>
                                    <p className="font-semibold text-sm">
                                        {booking.primaryCustomer.firstName} {booking.primaryCustomer.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Email Address</p>
                                    <p className="font-semibold text-sm overflow-hidden text-ellipsis max-w-[200px]" title={booking.primaryCustomer.email || ""}>
                                        {displayVal(booking.primaryCustomer.email)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Phone Number</p>
                                    <p className="font-bold text-sm">{displayVal(booking.primaryCustomer.phone)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Financials & Package details */}
                <Card className="space-y-6">
                    <CardHeader>
                        <CardTitle>Financials & Package</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Booking Financials section matching view-batch.page.tsx layout */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                                Booking Financials
                            </h4>
                            <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-lg border text-xs">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Total Amount</p>
                                    <p className="font-bold text-sm">
                                        {BookingService.formatCurrency(booking.totalAmount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Total Paid</p>
                                    <p className="font-bold text-sm text-emerald-600">
                                        {BookingService.formatCurrency(booking.advancePaid)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Total Pending</p>
                                    <p className="font-bold text-sm text-red-600">
                                        {BookingService.formatCurrency(booking.balanceAmount)}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Payment Progress</span>
                                    <span>
                                        {booking.totalAmount > 0 ? Math.round((booking.advancePaid / booking.totalAmount) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500"
                                        style={{
                                            width: `${booking.totalAmount > 0 ? Math.min(100, Math.round((booking.advancePaid / booking.totalAmount) * 100)) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Package Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                Package Information
                            </h4>
                            <div className="space-y-3 text-xs pl-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Description</p>
                                    <p className="text-xs text-slate-700 leading-snug">{displayVal(booking.package.description)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Destinations</p>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline">{booking.package.destination || "N/A"}</Badge>
                                    </div>
                                </div>
                                {booking.package.packageTiers && booking.package.packageTiers.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1.5">Package Tiers</p>
                                        <div className="space-y-2">
                                            {booking.package.packageTiers.map((tier) => (
                                                <div key={tier.id || tier.name} className="flex justify-between items-center bg-muted/30 p-2 rounded border text-xs">
                                                    <p className="font-semibold">{tier.name}</p>
                                                    <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
                                                        <p>Adult: {BookingService.formatCurrency(Number(tier.totalAdultCost) + Number(tier.adultCost || 0))}</p>
                                                        <p>Child: {tier.childCostType === 'percentage' ? `${tier.childCostValue}%` : BookingService.formatCurrency(Number(tier.childCostValue || 0))}</p>
                                                        <p>Infant: {tier.infantCostType === 'percentage' ? `${tier.infantCostValue}%` : BookingService.formatCurrency(Number(tier.infantCostValue || 0))}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 3: Files & Artifacts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Files & Artifacts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {(booking.documents?.length ?? 0) > 0 ? (
                                booking.documents?.map((doc: any) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-2.5 rounded border hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer text-xs"
                                        onClick={() => setSelectedDocument(doc)}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                            <span className="truncate font-medium">{doc.originalName || doc.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded">
                                    No documents linked
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Travelers Table full width below */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Travelers ({booking.customers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Guest Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Requirements / Notes</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {booking.customers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="font-semibold">
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                                            {customer.gender} • {format(new Date(customer.dateOfBirth), "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5 text-xs text-muted-foreground">
                                            <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</p>
                                            <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]" title={customer.specialRequests || ""}>
                                            {customer.specialRequests || "No specific requirements"}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {booking.status !== "cancelled" && booking.customers.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-md"
                                                onClick={() => handleRemoveTraveler(customer.id, `${customer.firstName} ${customer.lastName}`)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Workflow Progress Tracker Card full width below */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Progress Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <WorkflowManager
                        workflowId={booking.currentWorkflowId || ""}
                        onUpdate={fetchBookingDetails}
                    />
                </CardContent>
            </Card>

            {/* Payment Ledger Card full width below */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Ledger
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadInvoice}
                            disabled={
                                !booking ||
                                !InvoiceService.hasCompletedPayments(booking) ||
                                isGeneratingInvoice
                            }
                        >
                            {isGeneratingInvoice ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Invoice
                        </Button>
                        {booking.balanceAmount > 0 && (
                            <Button
                                size="sm"
                                onClick={() => navigate(`/payments?addNew=true&bookingId=${booking.id}`)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
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
                                    <TableHead className="pl-6">Transaction ID</TableHead>
                                    <TableHead className="text-center">Date</TableHead>
                                    <TableHead className="text-center">Method</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-6">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {booking.payments.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-muted/50">
                                        <TableCell className="pl-6 py-4">
                                            <p className="font-semibold text-sm">#{payment.transactionId || "N/A"}</p>
                                            <p className="text-xs text-muted-foreground">Ref: {payment.paymentReference || "N/A"}</p>
                                        </TableCell>
                                        <TableCell className="text-center text-sm font-medium">
                                            {payment.paymentDate ? format(new Date(payment.paymentDate), "MMM d, yyyy") : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="capitalize">
                                                {payment.paymentMethod.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center items-center gap-1.5 text-xs font-semibold">
                                                <div className={`w-2 h-2 rounded-full ${payment.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`} />
                                                <span className="capitalize">{payment.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 font-semibold">
                                            {BookingService.formatCurrency(payment.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground text-sm">
                            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No payment history recorded.</p>
                            <p className="text-xs opacity-60 mt-1">Record an advance or full payment to generate invoices.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Audit History Timeline full width below */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        Audit Tracking & History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookingLogs.length > 0 ? (
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-muted ml-2">
                            {bookingLogs.map((log) => (
                                <div key={log.id} className="relative flex gap-6 items-start">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10">
                                        <div className={`h-2.5 w-2.5 rounded-full ${log.action === "create"
                                            ? "bg-green-500"
                                            : log.action === "status_change"
                                                ? "bg-blue-500"
                                                : log.action === "cancel" || log.action === "delete"
                                                    ? "bg-red-500"
                                                    : "bg-primary"
                                            }`} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold capitalize">{log.action.replace("_", " ")}</span>
                                            <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "MMM d, yyyy • HH:mm")}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Updated by <span className="font-semibold text-foreground">{log.changedBy?.name || "Automated System"}</span>.
                                        </p>
                                        {log.newData && (
                                            <div className="border bg-muted/20 p-2 rounded mt-1.5 text-xs">
                                                {(() => {
                                                    if (log.action === "status_change") {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] capitalize">{log.previousData as string}</Badge>
                                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                                                <Badge className="text-[10px] capitalize">{log.newData as string}</Badge>
                                                            </div>
                                                        );
                                                    }
                                                    if (log.action === "create") {
                                                        return <span className="text-green-600 font-medium">Created new booking record</span>;
                                                    }
                                                    if (log.action === "cancel") {
                                                        return <span className="text-red-600 font-medium">Booking has been cancelled</span>;
                                                    }
                                                    if (log.action === "batch_change") {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span>Transferred batch assignment</span>
                                                            </div>
                                                        );
                                                    }
                                                    if (log.action === "payment_add" || log.action === "payment") {
                                                        const data = log.newData as any;
                                                        return (
                                                            <div className="space-y-0.5">
                                                                <p><span className="font-semibold">Amount:</span> {BookingService.formatCurrency(data.amount)}</p>
                                                                <p><span className="font-semibold">Method:</span> <span className="uppercase">{data.paymentMethod}</span></p>
                                                            </div>
                                                        );
                                                    }
                                                    if (typeof log.newData === 'object' && log.newData !== null) {
                                                        return (
                                                            <div className="space-y-1">
                                                                {Object.entries(log.newData).map(([key, value]) => {
                                                                    if (key === 'updatedAt' || key === 'id') return null;
                                                                    return (
                                                                        <div key={key} className="flex gap-2">
                                                                            <span className="font-semibold capitalize min-w-[80px]">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                                                            <span className="truncate">{JSON.stringify(value)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    return <span>{String(log.newData)}</span>;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed rounded-md">
                            No modifications found in history log
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Document Viewer Dialog */}
            <Dialog
                open={!!selectedDocument}
                onOpenChange={() => setSelectedDocument(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden text-card-foreground">
                    <DialogHeader className="p-6 pb-0 flex flex-row justify-between items-center">
                        <DialogTitle className="text-xl font-bold">
                            {selectedDocument?.originalName || "Document Viewer"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/10 max-h-[70vh] overflow-auto">
                        {selectedDocument &&
                            (selectedDocument as any).mimeType?.startsWith(
                                "image/",
                            ) ? (
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
                                        "_blank",
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
        </div>
    );
}
