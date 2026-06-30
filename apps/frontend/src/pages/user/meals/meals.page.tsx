import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat, Edit, Plus, Search, Trash2, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const [searchQuery, setSearchQuery] = useState("");

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

    const vegCount = meals.filter((m) => m.type === "veg").length;
    const nonVegCount = meals.filter((m) => m.type === "non-veg").length;

    const filteredMeals = meals.filter((m) => {
        const matchesType = !typeFilter || m.type === typeFilter;
        const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

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

            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-3 rounded-xl border border-muted/70">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search meal plans..."
                        className="pl-9 h-9 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <Tabs
                    value={typeFilter || "all"}
                    onValueChange={(val) => setTypeFilter(val === "all" ? null : val as "veg" | "non-veg")}
                    className="w-fit"
                >
                    <TabsList className="grid grid-cols-3 h-9 w-[280px]">
                        <TabsTrigger value="all" className="text-xs font-semibold">
                            All ({meals.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="veg" 
                            className="text-xs font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            Veg ({vegCount})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="non-veg" 
                            className="text-xs font-semibold data-[state=active]:bg-rose-600 data-[state=active]:text-white"
                        >
                            Non-Veg ({nonVegCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

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
                                    <TableRow 
                                        key={meal.id} 
                                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/meals/${meal.id}`)}
                                    >
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
                                                {isAdminOrManager && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 navigate(`/meals/edit/${meal.id}`);
                                                            }}
                                                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/5"
                                                            title="Edit Plan"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 handleDelete(meal.id, meal.name);
                                                            }}
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
