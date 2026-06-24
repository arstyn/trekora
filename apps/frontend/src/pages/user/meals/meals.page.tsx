import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat, Edit, Eye, Leaf, Plus, Trash2, Utensils, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import type { IMeal } from "@/types/meals.types";
import mealsService from "@/services/meals.service";

export default function MealsPage() {
    const navigate = useNavigate();
    const [meals, setMeals] = useState<IMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<"veg" | "non-veg" | null>(null);

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

    const handleCardClick = (type: "veg" | "non-veg") => {
        if (typeFilter === type) {
            setTypeFilter(null); // Clear filter if already selected
        } else {
            setTypeFilter(type);
        }
    };

    const vegCount = meals.filter((m) => m.type === "veg").length;
    const nonVegCount = meals.filter((m) => m.type === "non-veg").length;

    const filteredMeals = typeFilter
        ? meals.filter((m) => m.type === typeFilter)
        : meals;

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

            {/* Default Veg and Non-Veg Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                    onClick={() => handleCardClick("veg")}
                    className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-md ${
                        typeFilter === "veg"
                            ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                            : "border-muted/50 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                    }`}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-emerald-500" /> Veg Meals
                        </CardTitle>
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                            Vegetarian
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{vegCount}</div>
                        <p className="text-xs text-emerald-600/70 mt-1">
                            {typeFilter === "veg" ? "Currently filtering Veg meals (Click to reset)" : "Click to filter vegetarian meal options"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleCardClick("non-veg")}
                    className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-md ${
                        typeFilter === "non-veg"
                            ? "border-rose-500 bg-rose-500/5 shadow-sm"
                            : "border-muted/50 hover:border-rose-500/30 hover:bg-rose-500/5"
                    }`}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-rose-500" /> Non-Veg Meals
                        </CardTitle>
                        <Badge variant="outline" className="text-rose-600 bg-rose-500/10 border-rose-500/20">
                            Non-Vegetarian
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">{nonVegCount}</div>
                        <p className="text-xs text-rose-600/70 mt-1">
                            {typeFilter === "non-veg" ? "Currently filtering Non-Veg meals (Click to reset)" : "Click to filter non-vegetarian meal options"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {typeFilter && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active Filter:</span>
                    <Badge variant="secondary" className="gap-1 pr-1 py-1 font-medium capitalize bg-primary/10 text-primary border border-primary/20">
                        {typeFilter}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent rounded-full"
                            onClick={() => setTypeFilter(null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                </div>
            )}

            {loading || permissionLoading ? (
                <Card className="border border-muted">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            ) : filteredMeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-muted rounded-xl bg-card text-center min-h-[300px]">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <ChefHat className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">No Meals Configured</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                        No meal plans match your selection. Let's create one or adjust your filters.
                    </p>
                    {isAdminOrManager && (
                        <Button onClick={() => navigate("/meals/create")} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Create Meal Option
                        </Button>
                    )}
                </div>
            ) : (
                <Card className="border border-muted shadow-sm overflow-hidden bg-card/45 backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-bold">Meal Plan Name</TableHead>
                                <TableHead className="font-bold w-[120px]">Type</TableHead>
                                <TableHead className="font-bold">Breakfast Items</TableHead>
                                <TableHead className="font-bold">Lunch Items</TableHead>
                                <TableHead className="font-bold">Dinner Items</TableHead>
                                <TableHead className="font-bold w-[130px]">Created At</TableHead>
                                <TableHead className="font-bold text-right w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMeals.map((meal) => {
                                const breakfastSample = meal.breakfast?.map((i) => i.name).join(", ") || "None";
                                const lunchSample = meal.lunch?.map((i) => i.name).join(", ") || "None";
                                const dinnerSample = meal.dinner?.map((i) => i.name).join(", ") || "None";

                                return (
                                    <TableRow key={meal.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-semibold text-foreground max-w-[200px] truncate" title={meal.name}>
                                            {meal.name}
                                        </TableCell>
                                        <TableCell>
                                            {meal.type === "veg" ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border border-emerald-500/20 capitalize font-medium">
                                                    Veg
                                                </Badge>
                                            ) : meal.type === "non-veg" ? (
                                                <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border border-rose-500/20 capitalize font-medium">
                                                    Non-Veg
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border border-blue-500/20 capitalize font-medium">
                                                    All
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-xs" title={breakfastSample}>
                                            <span className="font-semibold text-foreground block text-xs">{meal.breakfast?.length || 0} items</span>
                                            {breakfastSample}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-xs" title={lunchSample}>
                                            <span className="font-semibold text-foreground block text-xs">{meal.lunch?.length || 0} items</span>
                                            {lunchSample}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-xs" title={dinnerSample}>
                                            <span className="font-semibold text-foreground block text-xs">{meal.dinner?.length || 0} items</span>
                                            {dinnerSample}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {new Date(meal.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/meals/${meal.id}`)}
                                                    className="h-8 w-8 hover:bg-muted"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                {isAdminOrManager && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => navigate(`/meals/edit/${meal.id}`)}
                                                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/5"
                                                            title="Edit Plan"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(meal.id, meal.name)}
                                                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 text-muted-foreground"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
