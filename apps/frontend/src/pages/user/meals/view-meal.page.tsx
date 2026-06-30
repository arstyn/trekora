import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ChefHat, Edit, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import type { IMeal } from "@/types/meals.types";
import mealsService from "@/services/meals.service";

export default function ViewMealPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [meal, setMeal] = useState<IMeal | null>(null);
    const [loading, setLoading] = useState(true);

    const { permissionSets, loading: permissionLoading } = useMyPermissionSets();
    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    useEffect(() => {
        const fetchMeal = async () => {
            if (!id) return;
            try {
                const data = await mealsService.getMeal(id);
                setMeal(data);
            } catch (error) {
                console.error("Error loading meal details:", error);
                toast.error("Failed to load meal details");
            } finally {
                setLoading(false);
            }
        };

        fetchMeal();
    }, [id]);

    if (loading || permissionLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h2 className="text-xl font-bold text-destructive">Meal Option Not Found</h2>
                <p className="text-muted-foreground mt-2">The requested meal details could not be loaded.</p>
                <Button onClick={() => navigate("/meals")} className="mt-4">
                    Back to Meals List
                </Button>
            </div>
        );
    }

    const totalBreakfastPrice = (meal.breakfast || []).reduce((sum, item) => sum + (item.price || 0), 0);
    const totalLunchPrice = (meal.lunch || []).reduce((sum, item) => sum + (item.price || 0), 0);
    const totalDinnerPrice = (meal.dinner || []).reduce((sum, item) => sum + (item.price || 0), 0);
    const totalMealsPrice = totalBreakfastPrice + totalLunchPrice + totalDinnerPrice;
    const totalItemsCount = (meal.breakfast?.length || 0) + (meal.lunch?.length || 0) + (meal.dinner?.length || 0);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate("/meals")}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Meals
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold capitalize">{meal.name}</h1>
                        <p className="text-muted-foreground text-xs">
                            Standardized Meal Plan Configuration
                        </p>
                    </div>
                </div>
                {isAdminOrManager && (
                    <Button onClick={() => navigate(`/meals/edit/${meal.id}`)} className="shadow-xs">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Meal Option
                    </Button>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Single Card with Tab lists */}
                <div className="lg:col-span-2">
                    <Card className="border border-muted shadow-xs">
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ChefHat className="h-4 w-4 text-primary" /> Meal Plan Configuration
                            </CardTitle>
                            <Badge variant="outline" className="font-semibold text-xs bg-primary/10 text-primary border-primary/20">
                                {totalItemsCount} Total Items
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs defaultValue="breakfast" className="w-full">
                                <TabsList className="grid grid-cols-3 w-[360px] max-w-full mb-4">
                                    <TabsTrigger value="breakfast" className="text-xs font-semibold">
                                        Breakfast ({meal.breakfast?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="lunch" className="text-xs font-semibold">
                                        Lunch ({meal.lunch?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="dinner" className="text-xs font-semibold">
                                        Dinner ({meal.dinner?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                {(["breakfast", "lunch", "dinner"] as const).map((tab) => {
                                    const items = meal[tab] || [];
                                    return (
                                        <TabsContent key={tab} value={tab} className="focus-visible:outline-none">
                                            {items.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                                                    <Utensils className="h-8 w-8 opacity-30 mb-2" />
                                                    <p className="text-xs italic">No items configured for this section</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-muted/50 border border-muted/50 rounded-lg overflow-hidden bg-muted/5">
                                                    {items.map((item, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="p-3.5 flex justify-between items-center hover:bg-muted/15 transition-colors bg-card"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-primary/80 shrink-0" />
                                                                <div>
                                                                    <span className="font-semibold text-sm text-foreground capitalize">{item.name}</span>
                                                                    {item.curry && (
                                                                        <span className="text-xs text-muted-foreground ml-2 capitalize">
                                                                            (Curry: {item.curry})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {item.price !== undefined && item.price !== null && item.price > 0 && (
                                                                <Badge variant="outline" className="font-bold text-xs bg-primary/5 text-primary border-primary/20 shrink-0">
                                                                    ₹{item.price}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <Card className="border border-muted shadow-xs">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold">Meal Plan Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">Type:</span>
                                {meal.type === "veg" ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize font-semibold shadow-2xs">
                                        Veg
                                    </Badge>
                                ) : meal.type === "non-veg" ? (
                                    <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 capitalize font-semibold shadow-2xs">
                                        Non-Veg
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 capitalize font-semibold shadow-2xs">
                                        All
                                    </Badge>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">Total Items:</span>
                                <span className="font-semibold text-foreground">{totalItemsCount}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">Est. Total Cost:</span>
                                <span className="font-bold text-base text-primary">₹{totalMealsPrice}</span>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Metadata</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="font-medium text-foreground/80">
                                        {new Date(meal.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="font-medium text-foreground/80">
                                        {new Date(meal.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </span>
                                </div>
                                {meal.createdBy?.name && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Created By:</span>
                                        <span className="font-medium text-foreground/80">{meal.createdBy.name}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
