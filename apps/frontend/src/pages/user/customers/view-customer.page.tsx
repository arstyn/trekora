import { ImageGallery } from "@/components/image-gallery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axiosInstance from "@/lib/axios";
import BookingService from "@/services/booking.service";
import type { ICustomer } from "@/types/customer.type";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Edit,
    Eye,
    FileText,
    HeartPulse,
    Mail,
    MapPin,
    Phone,
    ShieldAlert,
    User,
    Users,
    Loader2,
    ClipboardList,
    DollarSign
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EnhancedCustomerForm from "./_components/enhanced-customer-form";

export default function ViewCustomerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Image Zoom Modal State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageModalTitle, setImageModalTitle] = useState<string>("Document Image");

    const fetchCustomerData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const res = await axiosInstance.get<ICustomer>(`/customers/${id}`);
            setCustomer(res.data);
        } catch (err) {
            console.error("Failed to fetch customer details:", err);
            setError((err as Error)?.message || "Failed to load customer details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchBookingsData = useCallback(async () => {
        if (!id) return;
        try {
            setBookingsLoading(true);
            const data = await BookingService.getBookingsByCustomer(id);
            setBookings(data);
        } catch (err) {
            console.error("Failed to fetch customer bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchCustomerData();
            fetchBookingsData();
        }
    }, [id, fetchCustomerData, fetchBookingsData]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("edit") === "true") {
            setIsEditing(true);
        }
    }, []);

    const handleSave = (updatedCustomer: ICustomer) => {
        setCustomer(updatedCustomer);
        setIsEditing(false);
        toast.success("Customer profile updated successfully");
    };

    const openImageModal = (imageUrl: string, title: string = "Document Image") => {
        setSelectedImage(imageUrl);
        setImageModalTitle(title);
        setImageModalOpen(true);
    };

    // Formatter helpers
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return <span className="text-muted-foreground italic">N/A</span>;
        try {
            return format(new Date(dateStr), "MMMM d, yyyy");
        } catch (e) {
            return dateStr;
        }
    };

    const displayVal = (value?: string | number | null) => {
        return value !== undefined && value !== null && value !== "" ? (
            value
        ) : (
            <span className="text-muted-foreground italic">N/A</span>
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            case "completed":
                return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPaymentStatus = (advancePaid: number, totalAmount: number) => {
        const paymentStatus = BookingService.getPaymentStatus(advancePaid, totalAmount);
        switch (paymentStatus) {
            case "none":
                return <Badge variant="destructive">No Payment</Badge>;
            case "partial":
                return <Badge variant="secondary">Partial Payment</Badge>;
            case "full":
                return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading customer details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Alert variant="destructive" className="border-2 shadow-lg">
                    <AlertCircle className="h-6 w-6" />
                    <AlertDescription className="text-lg font-medium ml-2">
                        {error || "Customer not found."}
                    </AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    className="mt-6 shadow-sm"
                    onClick={() => navigate("/customers")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Customers
                </Button>
            </div>
        );
    }

    const fullName = [customer.firstName, customer.middleName, customer.lastName]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border rounded-full">
                        <AvatarImage
                            src={customer.profilePhoto || "/placeholder.svg"}
                            className="object-cover"
                            alt={fullName}
                        />
                        <AvatarFallback>
                            {customer.firstName.charAt(0)}
                            {customer.lastName?.charAt(0) || ""}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {fullName}
                        </h1>
                        <p className="text-muted-foreground">Customer Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Customer
                    </Badge>
                    <Button variant="outline" onClick={() => navigate("/customers")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Breadcrumb section */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <NavLink
                                to="/customers"
                                className="hover:text-primary transition-colors"
                            >
                                Customers
                            </NavLink>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{fullName}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Main content grid: 3-column equal layout with zero empty horizontal space */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1: Customer Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Personal info fields with vertical stack icons */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Full Name</p>
                                        <p className="font-medium text-sm">{fullName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Gender</p>
                                        <p className="font-medium text-sm capitalize">{displayVal(customer.gender?.replace("_", " "))}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                                        <p className="font-semibold text-sm">{formatDate(customer.dateOfBirth)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email Address</p>
                                        <p className="font-semibold text-sm overflow-hidden text-ellipsis max-w-[220px]" title={customer.email || ""}>
                                            {displayVal(customer.email)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone Number</p>
                                        <p className="font-semibold text-sm">{displayVal(customer.phone)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Alternative Phone</p>
                                        <p className="font-semibold text-sm">{displayVal(customer.alternativePhone)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Address</p>
                                        <p className="font-semibold text-sm leading-snug">{displayVal(customer.address)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact details inside overview */}
                        {(customer.emergencyContactName || customer.emergencyContactPhone) && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                        Emergency Contact
                                    </h4>
                                    <div className="flex flex-col gap-3 bg-amber-50/20 p-3 rounded-lg border border-amber-100 text-xs">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Contact Name</p>
                                            <p className="font-semibold">{displayVal(customer.emergencyContactName)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Relationship</p>
                                            <p className="font-semibold">{displayVal(customer.emergencyContactRelation)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Emergency Phone</p>
                                            <p className="font-bold text-amber-800">{displayVal(customer.emergencyContactPhone)}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Notes details inside overview */}
                        {customer.notes && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                                        Notes / Remarks
                                    </h4>
                                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border leading-relaxed">
                                        {customer.notes}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Column 2: Documents */}
                <Card className="space-y-6">
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Passport manifest details */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                Passport Details
                            </h4>
                            <div className="flex flex-col gap-3 text-xs pl-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Passport Number</p>
                                    <p className="font-medium text-sm">{displayVal(customer.passportNumber)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Issuing Country</p>
                                    <p className="font-medium text-sm">{displayVal(customer.passportCountry)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Issue Date</p>
                                    <p className="font-medium text-sm">{formatDate(customer.passportIssueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Expiry Date</p>
                                    <p className="font-medium text-sm">{formatDate(customer.passportExpiryDate)}</p>
                                </div>
                            </div>
                            {customer.passportPhotos && customer.passportPhotos.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <p className="text-[10px] text-muted-foreground font-semibold">Document Photos</p>
                                    <ImageGallery
                                        images={customer.passportPhotos}
                                        onImageClick={(imageUrl) => openImageModal(imageUrl, "Passport Document")}
                                    />
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Government Registrations */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                Government IDs
                            </h4>
                            <div className="space-y-3 text-xs pl-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Aadhaar Card ID</p>
                                    <p className="font-medium text-sm">{displayVal(customer.aadhaarId)}</p>
                                </div>
                                {customer.aadhaarIdPhotos && customer.aadhaarIdPhotos.length > 0 && (
                                    <ImageGallery
                                        images={customer.aadhaarIdPhotos}
                                        onImageClick={(imageUrl) => openImageModal(imageUrl, "Aadhaar Card Document")}
                                    />
                                )}
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Voter Card ID</p>
                                    <p className="font-medium text-sm">{displayVal(customer.voterId)}</p>
                                </div>
                                {customer.voterIdPhotos && customer.voterIdPhotos.length > 0 && (
                                    <ImageGallery
                                        images={customer.voterIdPhotos}
                                        onImageClick={(imageUrl) => openImageModal(imageUrl, "Voter ID Document")}
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 3: Preferences & Relatives */}
                <Card className="space-y-6">
                    <CardHeader>
                        <CardTitle>Preferences & Relatives</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Travel preferences details */}
                        {(customer.dietaryRestrictions || customer.medicalConditions || customer.specialRequests) && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                                    Travel Preferences
                                </h4>
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Dietary Restrictions</p>
                                        <p className="font-medium text-slate-800 bg-muted/30 p-2 rounded border">
                                            {displayVal(customer.dietaryRestrictions)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Medical Conditions</p>
                                        <p className="font-medium text-slate-800 bg-muted/30 p-2 rounded border">
                                            {displayVal(customer.medicalConditions)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Special Requests</p>
                                        <p className="font-medium text-slate-800 bg-muted/30 p-2 rounded border">
                                            {displayVal(customer.specialRequests)}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                            </div>
                        )}

                        {/* Associated Relatives */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                Associated Relatives
                            </h4>
                            {customer.relatives && customer.relatives.length > 0 ? (
                                <div className="space-y-3">
                                    {customer.relatives.map((relative, idx) => (
                                        <div key={idx} className="border p-3 rounded-md bg-muted/30 space-y-2 text-xs">
                                            <div className="flex justify-between items-center font-bold">
                                                <p>{relative.name}</p>
                                                <Badge variant="outline" className="capitalize text-[10px] bg-white">
                                                    {relative.relation}
                                                </Badge>
                                            </div>
                                            <div className="text-muted-foreground space-y-1">
                                                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {relative.phone || "—"}</p>
                                                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {relative.address || "—"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                    No relatives associated
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booking History card full width below */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        Booking History ({bookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Booking Financial Summary */}
                    {bookings.length > 0 && (
                        <div className="space-y-4 px-6 pt-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                                Customer Bookings Financial Summary
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border text-xs">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1">Total Expected</p>
                                    <p className="text-lg font-black">
                                        {BookingService.formatCurrency(
                                            bookings
                                                .filter((b) => b.status !== "cancelled")
                                                .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
                                        )}
                                    </p>
                                </div>
                                <div className="border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-muted">
                                    <p className="text-[10px] text-muted-foreground mb-1">Total Paid</p>
                                    <p className="text-lg font-black text-emerald-600">
                                        {BookingService.formatCurrency(
                                            bookings
                                                .filter((b) => b.status !== "cancelled")
                                                .reduce((sum, b) => sum + Number(b.advancePaid || 0), 0)
                                        )}
                                    </p>
                                </div>
                                <div className="border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 border-muted">
                                    <p className="text-[10px] text-muted-foreground mb-1">Outstanding Balance</p>
                                    <p className="text-lg font-black text-red-600">
                                        {BookingService.formatCurrency(
                                            bookings
                                                .filter((b) => b.status !== "cancelled" && b.status !== "completed")
                                                .reduce((sum, b) => sum + Number(b.balanceAmount || 0), 0)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {bookings.length > 0 && <Separator />}

                    <div className="p-0">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking Number</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Batch Start</TableHead>
                                <TableHead>Passengers</TableHead>
                                <TableHead>Payments</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookingsLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={`booking-skeleton-${index}`}>
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <TableCell key={`cell-skeleton-${index}-${i}`} className="py-4">
                                                <Skeleton className="h-5 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            {BookingService.formatBookingNumber(booking.bookingNumber)}
                                        </TableCell>
                                        <TableCell>{booking.packageName}</TableCell>
                                        <TableCell>
                                            {new Date(booking.batchStartDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-muted-foreground" />
                                                {booking.numberOfCustomers}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm font-medium">
                                                    {BookingService.formatCurrency(booking.advancePaid)}
                                                    /
                                                    {BookingService.formatCurrency(booking.totalAmount)}
                                                </div>
                                                {getPaymentStatus(booking.advancePaid, booking.totalAmount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <NavLink to={`/bookings/${booking.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </NavLink>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No bookings found for this customer
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Customer Dialog Form Overlay */}
            {isEditing && (
                <EnhancedCustomerForm
                    customer={customer}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            )}

            {/* Image Preview Zoom Modal */}
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{imageModalTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-0 flex justify-center items-center overflow-auto max-h-[75vh]">
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Zoomed Document"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
