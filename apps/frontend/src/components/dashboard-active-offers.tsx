import { CreateBookingDialog } from "@/pages/user/bookings/_components/create-booking-dialog";
import {
    DashboardService,
    type DashboardActiveOffer,
} from "@/services/dashboard.service";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function DashboardActiveOffers() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState<DashboardActiveOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getActiveOffers(6);
                setOffers(data || []);
            } catch (err) {
                console.error("Failed to load active dashboard offers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading) {
        return (
            <div className="px-4 lg:px-6">
                <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                        <div className="h-6 w-24 bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="h-44 rounded-xl border bg-muted/20 animate-pulse p-4 space-y-3"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (offers.length === 0) {
        return null;
    }

    return (
        <div className="px-4 lg:px-6">
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
