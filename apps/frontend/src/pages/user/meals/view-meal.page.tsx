import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ChefHat, Edit, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

    const sections = [
        { title: "Breakfast", items: meal.breakfast || [], color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20" },
        { title: "Lunch", items: meal.lunch || [], color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20" },
        { title: "Dinner", items: meal.dinner || [], color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 border-indigo-500/20" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/meals")}
                        className="rounded-full hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Utensils className="h-6 w-6 text-primary" /> {meal.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Created at {new Date(meal.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                {isAdminOrManager && (
                    <Button onClick={() => navigate(`/meals/edit/${meal.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Meal Option
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map((sec) => (
                    <Card key={sec.title} className="border border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className={`bg-gradient-to-br ${sec.color} border-b border-muted/30 rounded-t-xl py-4`}>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ChefHat className="h-5 w-5" /> {sec.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-inherit opacity-80">
                                {sec.items.length} items configured
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {sec.items.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No items configured for {sec.title.toLowerCase()}.</p>
                            ) : (
                                <ul className="divide-y divide-muted/50">
                                    {sec.items.map((item, idx) => (
                                        <li key={idx} className="py-3 flex flex-col space-y-1">
                                            <span className="font-semibold text-sm text-foreground capitalize">
                                                {item.name}
                                            </span>
                                            {item.curry && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                    {item.curry}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
