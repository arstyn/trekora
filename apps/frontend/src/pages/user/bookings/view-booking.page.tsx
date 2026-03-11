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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
    CalendarDays,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    FileText,
    History,
    Info,
    Loader2,
    Mail,
    MapPin,
    MoreVertical,
    Phone,
    Plus,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function BookingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<unknown>(null);
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
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1"
                    >
                        Pending
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                        Confirmed
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive" className="px-3 py-1">
                        Cancelled
                    </Badge>
                );
            case "completed":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                    >
                        Completed
                    </Badge>
                );
            case "on_hold":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1"
                    >
                        On Hold
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="px-3 py-1">
                        {status}
                    </Badge>
                );
        }
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
        <div className="container mx-auto py-4 px-4 max-w-7xl space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb & Title Area */}
            <div className="flex flex-col gap-4">
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
                            <BreadcrumbPage className="font-bold text-foreground">
                                #{booking.bookingNumber}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card border rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="flex items-center gap-5 z-10">
                        <div className="bg-primary/10 p-4 rounded-2xl">
                            <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    Booking #{booking.bookingNumber}
                                </h1>
                                {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Booked on{" "}
                                {format(
                                    new Date(booking.createdAt),
                                    "MMMM d, yyyy",
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 z-10">
                        {booking.status !== "cancelled" && (
                            <div className="hidden sm:flex items-center gap-2 mr-2">
                                {otherBatches.length > 0 ? (
                                    <>
                                        <Select
                                            value={selectedBatchId}
                                            onValueChange={setSelectedBatchId}
                                            disabled={isMoving}
                                        >
                                            <SelectTrigger className="w-[180px] h-11 rounded-xl">
                                                <SelectValue placeholder="Transfer to..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {otherBatches.map(
                                                    (b: IBatches) => (
                                                        <SelectItem
                                                            key={b.id}
                                                            value={b.id}
                                                        >
                                                            {format(
                                                                new Date(
                                                                    b.startDate,
                                                                ),
                                                                "MMM d",
                                                            )}{" "}
                                                            (
                                                            {b.totalSeats -
                                                                b.bookedSeats}{" "}
                                                            left)
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleMoveBooking}
                                            disabled={
                                                !selectedBatchId || isMoving
                                            }
                                            className="h-11 rounded-xl px-4"
                                        >
                                            Move
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-[10px] font-black uppercase tracking-tight text-muted-foreground bg-muted/30 px-4 h-11 flex items-center rounded-xl border border-dashed">
                                        No other batches
                                        <NavLink
                                            to="/batches"
                                            className="text-primary hover:underline ml-2"
                                        >
                                            CREATE NEW
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        )}

                        <NavLink to={`/bookings/${booking.id}/edit`}>
                            <Button className="h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                            </Button>
                        </NavLink>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl shadow-sm"
                                >
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-60 rounded-xl p-2"
                            >
                                <DropdownMenuLabel>
                                    Management Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {booking.status !== "cancelled" &&
                                    booking.status !== "on_hold" && (
                                        <DropdownMenuItem
                                            onClick={handlePutOnHold}
                                            className="rounded-lg"
                                        >
                                            <Clock className="w-4 h-4 mr-3 text-amber-500" />
                                            Put on Hold
                                        </DropdownMenuItem>
                                    )}
                                {booking.status !== "cancelled" && (
                                    <DropdownMenuItem
                                        onClick={handleCancelBooking}
                                        className="text-destructive focus:text-destructive rounded-lg"
                                    >
                                        <XCircle className="w-4 h-4 mr-3" />
                                        Cancel Booking
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDeleteBooking}
                                    className="text-destructive focus:text-destructive font-bold rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    Delete Permanently
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Financial & Group Overviews Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border shadow-md hover:shadow-lg transition-all bg-muted/20 rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Group Size
                                </p>
                                <h3 className="text-2xl font-black">
                                    {booking.numberOfCustomers} Adults
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border shadow-md hover:shadow-lg transition-all bg-muted/10 rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Total Value
                                </p>
                                <h3 className="text-2xl font-black">
                                    {BookingService.formatCurrency(
                                        booking.totalAmount,
                                    )}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border shadow-md hover:shadow-lg transition-all bg-emerald-50/10 rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Collected
                                </p>
                                <h3 className="text-2xl font-black text-emerald-600">
                                    {BookingService.formatCurrency(
                                        booking.advancePaid,
                                    )}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border shadow-md hover:shadow-lg transition-all bg-rose-50/10 rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Outstanding
                                </p>
                                <h3 className="text-2xl font-black text-rose-600">
                                    {BookingService.formatCurrency(
                                        booking.balanceAmount,
                                    )}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Integrated Trip & Primary Contact Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Contact Profile */}
                        <Card className="border-none shadow-md rounded-2xl h-full flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Primary Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-4 flex-1">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/10">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                                            Full Name
                                        </p>
                                        <p className="font-bold text-lg">
                                            {booking.primaryCustomer.firstName}{" "}
                                            {booking.primaryCustomer.lastName}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-muted-foreground/10 hover:bg-muted/20 transition-all cursor-pointer">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                                                Email Address
                                            </p>
                                            <div className="flex items-center gap-2 text-primary font-bold overflow-hidden">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate text-sm">
                                                    {
                                                        booking.primaryCustomer
                                                            .email
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-muted-foreground/10 hover:bg-muted/20 transition-all">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                                                Phone Number
                                            </p>
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                                {booking.primaryCustomer.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Package Card */}
                        <Card className="border-none shadow-md rounded-2xl h-full">
                            <CardContent className="p-6 h-full flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2.5 bg-white/20 rounded-xl">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3">
                                            Trip Active
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black mb-1 leading-tight">
                                            {booking.package.name}
                                        </h3>
                                        <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                                            {booking.package.destination ||
                                                "Global Destination"}{" "}
                                            •{" "}
                                            {booking.package.duration ||
                                                "N/A Duration"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                                        <span>Current Batch Assignment</span>
                                        <CalendarDays className="w-4 h-4" />
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/10 flex items-center justify-between">
                                        <div className="text-sm font-black text-center flex-1">
                                            {format(
                                                new Date(
                                                    booking.batch.startDate,
                                                ),
                                                "MMM d, yyyy",
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                                        <div className="text-sm font-black text-center flex-1">
                                            {format(
                                                new Date(booking.batch.endDate),
                                                "MMM d, yyyy",
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Travelers List Table */}
                    <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                            <CardTitle className="text-lg font-black flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary" />
                                Traveler Manifest
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10 border-b">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 font-bold py-4">
                                            Guest Name
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Contact Info
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Requirements / Notes
                                        </TableHead>
                                        <TableHead className="text-right pr-6 font-bold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.customers.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            className="group hover:bg-muted/10 transition-colors"
                                        >
                                            <TableCell className="pl-6 py-5">
                                                <div className="font-extrabold text-foreground">
                                                    {customer.firstName}{" "}
                                                    {customer.lastName}
                                                </div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase mt-0.5">
                                                    {customer.gender} •{" "}
                                                    {format(
                                                        new Date(
                                                            customer.dateOfBirth,
                                                        ),
                                                        "MMM d, yyyy",
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-primary/80">
                                                        <Mail className="w-3 h-3" />{" "}
                                                        {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                        <Phone className="w-3 h-3" />{" "}
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p
                                                    className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-[200px]"
                                                    title={
                                                        customer.specialRequests ||
                                                        "No specific requirements"
                                                    }
                                                >
                                                    {customer.specialRequests ||
                                                        "No specific requirements"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {booking.status !==
                                                    "cancelled" &&
                                                    booking.customers.length >
                                                        1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                            onClick={() =>
                                                                handleRemoveTraveler(
                                                                    customer.id,
                                                                    `${customer.firstName} ${customer.lastName}`,
                                                                )
                                                            }
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

                    {/* Detailed Side Stats Card */}
                    <Card className="border-none shadow-md rounded-2xl p-6 space-y-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Financial Breakdown
                        </CardTitle>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-muted/30">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Net Fare Collected
                                </span>
                                <span className="text-sm font-black">
                                    {BookingService.formatCurrency(
                                        booking.advancePaid,
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-muted/30">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Taxes & Surcharges
                                </span>
                                <span className="text-sm font-black">
                                    {BookingService.formatCurrency(0)}{" "}
                                    (Included)
                                </span>
                            </div>
                            <Separator className="opacity-40" />
                            <div className="flex justify-between items-center px-4 py-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <span className="text-sm font-black text-rose-700">
                                    Final Balance
                                </span>
                                <span className="text-xl font-black text-rose-700">
                                    {BookingService.formatCurrency(
                                        booking.balanceAmount,
                                    )}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Payments History & Summary */}
                    <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <CardTitle className="text-lg font-black flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-primary" />
                                Payment Ledger
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg h-9"
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
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Invoice
                                </Button>
                                {booking.balanceAmount > 0 && (
                                    <Button
                                        size="sm"
                                        className="rounded-lg h-9 shadow-sm"
                                        onClick={() =>
                                            navigate(
                                                `/payments?addNew=true&bookingId=${booking.id}`,
                                            )
                                        }
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
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="pl-6 py-3 font-bold text-xs uppercase tracking-wider">
                                                Transaction ID
                                            </TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">
                                                Date
                                            </TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">
                                                Method
                                            </TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right pr-6 font-bold text-xs uppercase tracking-wider">
                                                Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.payments.map((payment) => (
                                            <TableRow
                                                key={payment.id}
                                                className="group hover:bg-muted/10"
                                            >
                                                <TableCell className="pl-6 py-4">
                                                    <p className="font-bold text-sm">
                                                        #
                                                        {payment.transactionId ||
                                                            "N/A"}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase opacity-70">
                                                        Ref:{" "}
                                                        {payment.paymentReference ||
                                                            "N/A"}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-sm">
                                                    {payment.paymentDate
                                                        ? format(
                                                              new Date(
                                                                  payment.paymentDate,
                                                              ),
                                                              "MMM d, yyyy",
                                                          )
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] font-bold uppercase rounded-md px-2 py-0 border-primary/20 bg-primary/5"
                                                    >
                                                        {payment.paymentMethod.replace(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <div
                                                            className={`w-2 h-2 rounded-full mr-2 self-center ${payment.status === "completed" ? "bg-emerald-500" : "bg-yellow-500"}`}
                                                        />
                                                        <span className="text-xs font-bold capitalize">
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-extrabold text-sm">
                                                    {BookingService.formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-12 text-center text-muted-foreground">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-sm font-bold">
                                        No payment history recorded.
                                    </p>
                                    <p className="text-xs opacity-60">
                                        Record an advance or full payment to
                                        generate invoices.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Access Documents Widget */}
                    <Card className="border-none shadow-md rounded-2xl overflow-hidden group/doc">
                        <CardHeader className="bg-card group-hover/doc:bg-muted/30 transition-colors py-4">
                            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                                <FileText className="w-4 h-4 text-primary" />
                                Files & Artifacts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {(booking.documents?.length ?? 0) > 0 ? (
                                booking.documents?.map((doc: any) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-muted-foreground/10 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                                        onClick={() => setSelectedDocument(doc)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-black truncate text-foreground/80">
                                                    {doc.originalName ||
                                                        doc.name ||
                                                        "Document"}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                    {doc.mimeType
                                                        ?.split("/")[1]
                                                        ?.toUpperCase() ||
                                                        "FILE"}{" "}
                                                    •{" "}
                                                    {doc.fileSize
                                                        ? (
                                                              doc.fileSize /
                                                              1024 /
                                                              1024
                                                          ).toFixed(1)
                                                        : "1.2"}{" "}
                                                    MB
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 px-4 bg-muted/20 border border-dashed rounded-2xl">
                                    <div className="mb-3 flex justify-center opacity-20">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground mb-4">
                                        No documents linked
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-lg text-xs font-black uppercase tracking-tighter"
                                    >
                                        Upload Manifest
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced Audit Timeline */}
                    <Card className="border shadow-md rounded-2xl overflow-hidden bg-muted/5">
                        <CardHeader className="bg-muted/10 pb-6">
                            <CardTitle className="text-lg font-black flex items-center gap-3">
                                <History className="w-6 h-6 text-primary" />
                                Audit Tracking & History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {bookingLogs.length > 0 ? (
                                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-muted">
                                    {bookingLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="relative flex items-start gap-8 group"
                                        >
                                            <div className="absolute left-0 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 bg-background shadow-md z-10 transition-transform group-hover:scale-110">
                                                <div
                                                    className={`h-4 w-4 rounded-md flex items-center justify-center ${
                                                        log.action === "create"
                                                            ? "bg-emerald-500 text-white"
                                                            : log.action ===
                                                                "status_change"
                                                              ? "bg-blue-500 text-white"
                                                              : log.action ===
                                                                      "cancel" ||
                                                                  log.action ===
                                                                      "delete"
                                                                ? "bg-rose-500 text-white"
                                                                : "bg-primary text-white"
                                                    }`}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 pb-10 pl-14">
                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                    <span className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                                                        {log.action.replace(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </span>
                                                    <time className="text-[10px] font-black text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg border border-muted-foreground/10">
                                                        {format(
                                                            new Date(
                                                                log.createdAt,
                                                            ),
                                                            "MMM d, yyyy • HH:mm",
                                                        )}
                                                    </time>
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-3">
                                                    Booking updated by{" "}
                                                    <span className="font-bold text-foreground underline decoration-primary/30 underline-offset-4 decoration-2">
                                                        {log.changedBy?.name ||
                                                            "Automated System"}
                                                    </span>
                                                    .
                                                </p>
                                                {log.newData && (
                                                    <div className="rounded-xl border bg-card/50 p-3 shadow-inner group-hover:bg-card transition-all overflow-hidden max-w-full">
                                                        <div className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground/80">
                                                            {log.action ===
                                                            "status_change" ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="opacity-50 text-[9px]"
                                                                    >
                                                                        {
                                                                            log.previousData as string
                                                                        }
                                                                    </Badge>
                                                                    <ChevronRight className="w-3 h-3" />
                                                                    <Badge className="text-[9px]">
                                                                        {
                                                                            log.newData as string
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            ) : (
                                                                <code className="block max-h-[120px] overflow-auto custom-scrollbar italic font-normal">
                                                                    {JSON.stringify(
                                                                        log.newData,
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </code>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center border-2 border-dashed rounded-3xl">
                                    <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                                        <History className="w-8 h-8 opacity-20" />
                                    </div>
                                    <h4 className="font-bold text-muted-foreground">
                                        End of audit trail
                                    </h4>
                                    <p className="text-xs opacity-50 mt-1">
                                        Found no historical modifications for
                                        this record.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Side Content (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Compact Workflow Focus Column */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden sticky top-8 outline-4 outline-primary/5">
                        <CardHeader className="">
                            <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                    Tracking Workflow
                                </Badge>
                                <span className="text-[10px] font-black opacity-60">
                                    ID: {booking.currentWorkflowId?.slice(0, 8)}
                                    ...
                                </span>
                            </div>
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <Clock className="w-6 h-6" />
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
                </div>
            </div>

            {/* Document Viewer Dialog */}
            <Dialog
                open={!!selectedDocument}
                onOpenChange={() => setSelectedDocument(null)}
            >
                <DialogContent className="max-w-5xl h-[85vh] rounded-3xl p-0 overflow-hidden border-none text-card-foreground">
                    <div className="bg-primary p-6 flex items-center justify-between text-white">
                        <DialogTitle className="text-2xl font-black">
                            Internal Document Viewer
                        </DialogTitle>
                        <Badge className="bg-black/20 text-white border-none rounded-lg">
                            Read Only
                        </Badge>
                    </div>
                    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 bg-muted/20">
                        {selectedDocument &&
                        (selectedDocument as any).mimeType?.startsWith(
                            "image/",
                        ) ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || ""}${(selectedDocument as any).filePath}`}
                                    alt={(selectedDocument as any).originalName}
                                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 text-primary opacity-40" />
                                </div>
                                <h3 className="text-xl font-black mb-2">
                                    {selectedDocument
                                        ? (selectedDocument as any).originalName
                                        : "Preview Unavailable"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs text-center leading-relaxed">
                                    Preview is not available for this file type.
                                    Please download the file to view locally.
                                </p>
                            </div>
                        )}
                        <Button
                            className="mt-8 rounded-2xl h-12 px-8 shadow-xl"
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
                            DOWNLOAD / VIEW ORIGINAL
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
