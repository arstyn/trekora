import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Payment } from "@/types/payment.types";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export function RecentPaymentsSlider({ payments, loading }: { payments: Payment[], loading: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!loading && payments.length > 0) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % payments.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [loading, payments.length]);

    if (loading || payments.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Payment</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                            {loading ? "Loading..." : "No recent payments"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className="flex flex-col h-full overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
                {/* Dots indicator in header */}
                <div className="flex justify-end space-x-1.5">
                    {payments.map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-primary/20"
                                }`}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col relative p-0 overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full w-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {payments.map((payment) => (
                        <div key={payment.id} className="min-w-full h-full px-6">
                            <NavLink to={`/payments/${payment.id}`} className="block w-full hover:opacity-80 transition-opacity">
                                <div className="text-2xl font-bold">
                                    {formatCurrency(payment.amount)}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                    {payment.booking?.customer?.name} • {payment.booking?.package?.name} • {new Date(payment.paymentDate).toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </NavLink>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
