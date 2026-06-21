import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat, Edit, Eye, Plus, Trash2, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import type { IMeal } from "@/types/meals.types";
import mealsService from "@/services/meals.service";

export default function MealsPage() {
    const navigate = useNavigate();
    const [meals, setMeals] = useState<IMeal[]>([]);
    const [loading, setLoading] = useState(true);

    const { permissionSets, loading: permissionLoading } = useMyPermissionSets();
    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const data = await mealsService.getMeals();
            setMeals(data);
        } catch (error) {
            console.error("Error fetching meals:", error);
            toast.error("Failed to load meal plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await mealsService.deleteMeal(id);
            toast.success("Meal option deleted successfully");
            setMeals((prev) => prev.filter((m) => m.id !== id));
        } catch (error: any) {
            console.error("Error deleting meal:", error);
            const message = error.response?.data?.message || "Failed to delete meal option";
            toast.error(message);
        }
    };

    const isLoaded = !loading && !permissionLoading;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Utensils className="h-8 w-8 text-primary" /> Meals
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Manage standardized meal combinations including breakfast, lunch, and dinner items.
                    </p>
                </div>
                {isLoaded && isAdminOrManager && (
                    <Button onClick={() => navigate("/meals/create")} className="shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Meal Option
                    </Button>
                )}
            </div>

            {loading || permissionLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
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
            ) : meals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-muted rounded-xl bg-card text-center min-h-[300px]">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <ChefHat className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">No Meals Configured</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                        Standardized menus make it easy to configure itineraries. Let's create your first menu plan.
                    </p>
                    {isAdminOrManager && (
                        <Button onClick={() => navigate("/meals/create")} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Create First Meal Option
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meals.map((meal) => {
                        const breakfastCount = meal.breakfast?.length || 0;
                        const lunchCount = meal.lunch?.length || 0;
                        const dinnerCount = meal.dinner?.length || 0;

                        return (
                            <Card
                                key={meal.id}
                                className="border border-muted shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 bg-card/45 backdrop-blur-sm flex flex-col justify-between"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                                            {meal.name}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Created at {new Date(meal.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3 flex-grow">
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 border border-amber-500/20">
                                            <div className="font-bold text-lg">{breakfastCount}</div>
                                            <div>Breakfast</div>
                                        </div>
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 border border-emerald-500/20">
                                            <div className="font-bold text-lg">{lunchCount}</div>
                                            <div>Lunch</div>
                                        </div>
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 border border-indigo-500/20">
                                            <div className="font-bold text-lg">{dinnerCount}</div>
                                            <div>Dinner</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-muted-foreground flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span>Breakfast sample:</span>
                                            <span className="font-medium text-foreground truncate max-w-[140px]">
                                                {meal.breakfast?.[0]?.name || "None"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Lunch sample:</span>
                                            <span className="font-medium text-foreground truncate max-w-[140px]">
                                                {meal.lunch?.[0]?.name || "None"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Dinner sample:</span>
                                            <span className="font-medium text-foreground truncate max-w-[140px]">
                                                {meal.dinner?.[0]?.name || "None"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t border-muted/50 flex justify-between gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/meals/${meal.id}`)}
                                        className="h-8 flex-1"
                                    >
                                        <Eye className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> View
                                    </Button>
                                    {isAdminOrManager && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/meals/edit/${meal.id}`)}
                                                className="h-8 flex-1 border-primary/20 hover:border-primary/50 text-primary hover:text-primary hover:bg-primary/5"
                                            >
                                                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(meal.id, meal.name)}
                                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
