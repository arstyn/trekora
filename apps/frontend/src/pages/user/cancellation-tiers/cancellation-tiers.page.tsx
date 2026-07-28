import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Edit, Eye, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import type { ICancellationTierTemplate } from "@/services/cancellation-tiers.service";
import cancellationTiersService from "@/services/cancellation-tiers.service";

export default function CancellationTiersPage() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<ICancellationTierTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const { permissionSets, loading: permissionLoading } = useMyPermissionSets();
    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await cancellationTiersService.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Error fetching cancellation templates:", error);
            toast.error("Failed to load cancellation templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await cancellationTiersService.deleteTemplate(id);
            toast.success("Cancellation tier template deleted successfully");
            setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (error: any) {
            console.error("Error deleting template:", error);
            const message = error.response?.data?.message || "Failed to delete template";
            toast.error(message);
        }
    };

    const isLoaded = !loading && !permissionLoading;

    const formatTimeframe = (timeframe: string) => {
        if (timeframe === "30_days_before") return "30+ Days Before";
        if (timeframe === "2_weeks_before") return "15-30 Days Before";
        if (timeframe === "1_week_before") return "7-14 Days Before";
        if (timeframe === "departure") return "0-7 Days Before / No Show";
        return timeframe;
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-primary" /> Cancellation Tiers
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Manage template policies defining cancellation timeframe charge percentages.
                    </p>
                </div>
                {isLoaded && isAdminOrManager && (
                    <Button onClick={() => navigate("/cancellation-tiers/create")} className="shadow-sm cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" /> Add Cancellation Tier
                    </Button>
                )}
            </div>

            {loading || permissionLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <Card key={idx} className="border border-muted">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-20" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-muted rounded-xl bg-card text-center min-h-[300px]">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">No Cancellation Tiers Configured</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                        Standardize cancellation policy schedules. Create your first cancellation tier template.
                    </p>
                    {isAdminOrManager && (
                        <Button onClick={() => navigate("/cancellation-tiers/create")} className="mt-6 cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Create First Cancellation Tier
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => {
                        const totalTiers = template.tiers?.length || 0;
                        return (
                            <Card
                                key={template.id}
                                className="border border-muted shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 bg-card/45 backdrop-blur-sm flex flex-col justify-between"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                                            {template.name}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Created at {new Date(template.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3 flex-grow space-y-4">
                                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex justify-between items-center text-sm">
                                        <span className="font-semibold text-muted-foreground">Tiers</span>
                                        <span className="font-bold text-primary">{totalTiers} Tiers</span>
                                    </div>

                                    {/* Breakdown Preview */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Policy Schedule</h4>
                                        <div className="space-y-1.5 pr-1">
                                            {template.tiers?.map((t, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-secondary/30 rounded border">
                                                    <span className="font-medium text-foreground truncate max-w-[155px]">
                                                        {formatTimeframe(t.timeframe)}
                                                    </span>
                                                    <span className="font-bold text-foreground bg-destructive/10 text-destructive px-1.5 py-0.5 rounded text-[10px]">
                                                        {t.amount}% Fee
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t border-muted/50 flex justify-between gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/cancellation-tiers/${template.id}`)}
                                        className="h-8 flex-1 cursor-pointer"
                                    >
                                        <Eye className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> View
                                    </Button>
                                    {isAdminOrManager && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/cancellation-tiers/edit/${template.id}`)}
                                                className="h-8 flex-1 border-primary/20 hover:border-primary/50 text-primary hover:text-primary hover:bg-primary/5 cursor-pointer"
                                            >
                                                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(template.id, template.name)}
                                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
