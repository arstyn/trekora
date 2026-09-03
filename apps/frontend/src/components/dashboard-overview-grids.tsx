import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreateBookingDialog } from "@/pages/user/bookings/_components/create-booking-dialog";
import {
    DashboardService,
    type BestPerformingPackage,
    type DashboardActiveOffer,
    type FastFillingBatch,
    type LatestBooking,
    type LatestLead,
} from "@/services/dashboard.service";
import { format } from "date-fns";
import {
    ArrowRight,
    Calendar,
    Clock,
    Flame,
    MapPin,
    Package as PackageIcon,
    Phone,
    Sparkles,
    Star,
    Ticket,
    User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function DashboardOverviewGrids() {
    const navigate = useNavigate();
    const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);
    const [latestLeads, setLatestLeads] = useState<LatestLead[]>([]);
    const [fastFillingBatches, setFastFillingBatches] = useState<FastFillingBatch[]>([]);
    const [bestPackages, setBestPackages] = useState<BestPerformingPackage[]>([]);
    const [activeOffers, setActiveOffers] = useState<DashboardActiveOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    const [activityTab, setActivityTab] = useState<"bookings" | "leads">("bookings");
    const [performanceTab, setPerformanceTab] = useState<"offers" | "batches" | "packages">("offers");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bookings, leads, batches, packages, offers] = await Promise.all([
                    DashboardService.getLatestBookings(6),
                    DashboardService.getLatestLeads(6),
                    DashboardService.getFastFillingBatches(6),
                    DashboardService.getBestPerformingPackages(6),
                    DashboardService.getActiveOffers(6),
                ]);

                setLatestBookings(bookings || []);
                setLatestLeads(leads || []);
                setFastFillingBatches(batches || []);
                setBestPackages(packages || []);
                setActiveOffers(offers || []);

                if (!offers || offers.length === 0) {
                    setPerformanceTab("batches");
                }
            } catch (err) {
                console.error("Failed to load dashboard overview data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
            case "completed":
            case "converted":
                return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-semibold">{status}</Badge>;
            case "pending":
            case "new":
            case "contacted":
                return <Badge variant="secondary" className="text-[10px] font-semibold">{status}</Badge>;
            case "cancelled":
            case "lost":
                return <Badge variant="destructive" className="text-[10px] font-semibold">{status}</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-semibold">{status || "Unknown"}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                <Card className="h-96 animate-pulse bg-muted/20" />
                <Card className="h-96 animate-pulse bg-muted/20" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
            {/* Card 1: Pipeline & Recent Activity (Bookings & Leads) */}
            <Card className="border shadow-xs flex flex-col justify-between p-0">
                <div>
                    <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between gap-3 space-y-0">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Sales Activity & Pipeline
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Real-time customer bookings and incoming sales leads
                            </CardDescription>
                        </div>

                        {/* Segmented Switch */}
                        <div className="flex items-center p-1 bg-muted rounded-lg text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActivityTab("bookings")}
                                className={cn(
                                    "px-3 py-1 rounded-md transition-all cursor-pointer",
                                    activityTab === "bookings"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Bookings ({latestBookings.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivityTab("leads")}
                                className={cn(
                                    "px-3 py-1 rounded-md transition-all cursor-pointer",
                                    activityTab === "leads"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Leads ({latestLeads.length})
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 divide-y">
                        {activityTab === "bookings" ? (
                            latestBookings.length > 0 ? (
                                latestBookings.map((b) => (
                                    <div
                                        key={b.id}
                                        className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                {b.customerName?.charAt(0) || "U"}
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-xs text-foreground truncate">
                                                        {b.customerName || "Unnamed Customer"}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        #{b.bookingNumber}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {b.packageName} • {b.numberOfCustomers || 1} Pax
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 text-right">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-xs text-foreground">
                                                    {formatCurrency(b.totalAmount)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {b.createdAt ? format(new Date(b.createdAt), "MMM dd") : ""}
                                                </p>
                                            </div>
                                            {getStatusBadge(b.status)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No recent bookings recorded yet.
                                </div>
                            )
                        ) : latestLeads.length > 0 ? (
                            latestLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-semibold text-xs text-foreground truncate">
                                                {lead.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                {lead.phone && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Phone className="w-3 h-3 shrink-0" />
                                                        {lead.phone}
                                                    </span>
                                                )}
                                                {lead.company && (
                                                    <span className="truncate">• {lead.company}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] text-muted-foreground">
                                            {lead.createdAt ? format(new Date(lead.createdAt), "MMM dd") : ""}
                                        </span>
                                        {getStatusBadge(lead.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No incoming leads found.
                            </div>
                        )}
                    </CardContent>
                </div>

                <div className="p-3 bg-muted/20 border-t flex items-center justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(activityTab === "bookings" ? "/bookings" : "/leads")}
                    >
                        View All {activityTab === "bookings" ? "Bookings" : "Leads"}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button>
                </div>
            </Card>

            {/* Card 2: Inventory Focus & Top Performers */}
            <Card className="border shadow-xs flex flex-col justify-between p-0">
                <div>
                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between gap-3 space-y-0">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Flame className="w-4 h-4 text-amber-500" />
                                Inventory & Top Packages
                            </CardTitle>
                            <CardDescription className="text-xs">
                                High-demand batches needing quick sales & top performers
                            </CardDescription>
                        </div>

                        {/* Segmented Switch */}
                        <div className="flex items-center p-1 bg-muted rounded-lg text-xs font-semibold overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setPerformanceTab("offers")}
                                className={cn(
                                    "px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                                    performanceTab === "offers"
                                        ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Special Offers ({activeOffers.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setPerformanceTab("batches")}
                                className={cn(
                                    "px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap",
                                    performanceTab === "batches"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Fast Filling ({fastFillingBatches.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setPerformanceTab("packages")}
                                className={cn(
                                    "px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap",
                                    performanceTab === "packages"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Top Packages ({bestPackages.length})
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 divide-y">
                        {performanceTab === "offers" ? (
                            activeOffers.length > 0 ? (
                                activeOffers.map((offer) => (
                                    <div
                                        key={offer.id}
                                        className="p-4 flex items-center justify-between gap-3 hover:bg-amber-500/5 transition-colors"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-xs text-foreground truncate">
                                                    {offer.name}
                                                </p>
                                                <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-mono text-[10px] shrink-0 font-bold">
                                                    {offer.discountMode === "range" &&
                                                        offer.minDiscountValue !== undefined &&
                                                        offer.minDiscountValue !== null
                                                        ? offer.discountType === "percentage"
                                                            ? `${offer.minDiscountValue}% - ${offer.maxDiscountValue}% OFF`
                                                            : `₹${Number(offer.minDiscountValue).toLocaleString("en-IN")} - ₹${Number(offer.maxDiscountValue).toLocaleString("en-IN")} OFF`
                                                        : offer.discountType === "percentage"
                                                            ? `${offer.discountValue}% OFF`
                                                            : `₹${Number(offer.discountValue).toLocaleString("en-IN")} OFF`}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                                                <span className="font-medium text-foreground truncate">
                                                    {offer.packageName}
                                                </span>
                                                {offer.destination && (
                                                    <span className="flex items-center gap-0.5 shrink-0">
                                                        • <MapPin className="w-3 h-3 text-amber-500" />
                                                        {offer.destination}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-amber-500" />
                                                    {format(new Date(offer.batchStartDate), "MMM dd")} - {format(new Date(offer.batchEndDate), "MMM dd")}
                                                </span>
                                                <span>•</span>
                                                <span className={cn(
                                                    "font-semibold",
                                                    offer.availableSeats <= 5
                                                        ? "text-rose-600 dark:text-rose-400 font-bold"
                                                        : "text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                    {offer.availableSeats} of {offer.totalSeats} seats left
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 shadow-xs"
                                                onClick={() => {
                                                    setSelectedBatchId(offer.batchId);
                                                    setBookingDialogOpen(true);
                                                }}
                                            >
                                                <Ticket className="w-3 h-3 mr-1" />
                                                Book
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No active special offers available at this moment.
                                </div>
                            )
                        ) : performanceTab === "batches" ? (
                            fastFillingBatches.length > 0 ? (
                                fastFillingBatches.map((batch) => {
                                    const available = Math.max(0, batch.totalSeats - batch.bookedSeats);
                                    const fillPct = Math.round(batch.fillPercentage || 0);

                                    return (
                                        <div
                                            key={batch.id}
                                            className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-xs text-foreground truncate">
                                                        {batch.packageName}
                                                    </p>
                                                    {batch.destination && (
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                                            <MapPin className="w-3 h-3 text-amber-500" />
                                                            {batch.destination}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        {format(new Date(batch.startDate), "MMM dd")} - {format(new Date(batch.endDate), "MMM dd")}
                                                    </span>
                                                    <span>•</span>
                                                    <span className={cn(
                                                        "font-semibold",
                                                        available <= 5 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-emerald-600 dark:text-emerald-400"
                                                    )}>
                                                        {available} Seats Left ({batch.bookedSeats}/{batch.totalSeats})
                                                    </span>
                                                </div>

                                                {/* Mini Progress Bar */}
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden max-w-xs">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            fillPct >= 80 ? "bg-rose-500" : fillPct >= 50 ? "bg-amber-500" : "bg-emerald-500"
                                                        )}
                                                        style={{ width: `${Math.min(100, Math.max(8, fillPct))}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5"
                                                    onClick={() => {
                                                        setSelectedBatchId(batch.id);
                                                        setBookingDialogOpen(true);
                                                    }}
                                                >
                                                    <Ticket className="w-3 h-3 mr-1" />
                                                    Book
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No fast-filling batches at this moment.
                                </div>
                            )
                        ) : bestPackages.length > 0 ? (
                            bestPackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <PackageIcon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-semibold text-xs text-foreground truncate">
                                                {pkg.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                <span>{pkg.destination || "Destination"}</span>
                                                <span>•</span>
                                                <span className="font-medium text-foreground">
                                                    {pkg.totalBookings} Bookings
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-xs text-foreground">
                                            {formatCurrency(pkg.totalRevenue)}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-amber-500 font-semibold mt-0.5">
                                            <Star className="w-3 h-3 fill-amber-500" />
                                            <span>{pkg.averageRating || 5}/5</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No package performance data available.
                            </div>
                        )}
                    </CardContent>
                </div>

                <div className="p-3 bg-muted/20 border-t flex items-center justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(performanceTab === "offers" ? "/batches" : performanceTab === "batches" ? "/batches" : "/packages")}
                    >
                        View All {performanceTab === "offers" ? "Batches" : performanceTab === "batches" ? "Batches" : "Packages"}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button>
                </div>
            </Card>

            {/* Quick Booking Dialog */}
            {bookingDialogOpen && (
                <CreateBookingDialog
                    open={bookingDialogOpen}
                    onOpenChange={(open) => {
                        setBookingDialogOpen(open);
                        if (!open) setSelectedBatchId(null);
                    }}
                    onBookingCreated={() => {
                        setBookingDialogOpen(false);
                        setSelectedBatchId(null);
                        navigate("/bookings");
                    }}
                    preselectedBatchId={selectedBatchId || undefined}
                />
            )}
        </div>
    );
}
