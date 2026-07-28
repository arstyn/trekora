import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Banknote, ChefHat, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DefaultsPage() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Meal Plans",
            description: "Manage default menus and item configurations for Breakfast, Lunch, and Dinner.",
            url: "/defaults/meals",
            icon: ChefHat,
            color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20",
            iconBg: "bg-amber-100 dark:bg-amber-950/50 text-amber-600",
            badge: "Food & Beverage",
        },
        {
            title: "Payment Structures",
            description: "Define template milestone percentages and payment due date guidelines.",
            url: "/defaults/payment-structures",
            icon: Banknote,
            color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20",
            iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600",
            badge: "Finance & Accounts",
        },
        {
            title: "Cancellation Tiers",
            description: "Configure charge percentages and time-frames for guest cancellations.",
            url: "/defaults/cancellation-tiers",
            icon: AlertTriangle,
            color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-500/20",
            iconBg: "bg-rose-100 dark:bg-rose-950/50 text-rose-600",
            badge: "Risk & Policies",
        },
        {
            title: "Block Duration",
            description: "Configure default timeframe (in days) for temporarily blocking batch slots.",
            url: "/defaults/block-slots",
            icon: Settings2,
            color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20",
            iconBg: "bg-blue-100 dark:bg-blue-950/50 text-blue-600",
            badge: "Sales & Bookings",
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Settings2 className="h-8 w-8 text-primary animate-spin-slow" /> Defaults & Templates
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Configure standardized settings and policies to speed up your package creation workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={idx}
                            className="group relative overflow-hidden border border-muted bg-card/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Decorative top gradient bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${section.color}`} />

                            <CardHeader className="pt-6 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-xl ${section.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
                                        {section.badge}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground mt-4 group-hover:text-primary transition-colors">
                                    {section.title}
                                </CardTitle>
                                <CardDescription className="text-sm mt-2 text-muted-foreground min-h-[48px]">
                                    {section.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pb-6 pt-2">
                                <Button
                                    onClick={() => navigate(section.url)}
                                    className="w-full flex items-center justify-center gap-2 group/btn cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                                >
                                    Manage Configurations
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
