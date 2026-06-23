import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import { MealForm } from "./_components/meal-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMeal } from "@/types/meals.types";
import mealsService from "@/services/meals.service";

export default function EditMealPage() {
    const { id } = useParams<{ id: string }>();
    const [meal, setMeal] = useState<IMeal | null>(null);
    const [loadingMeal, setLoadingMeal] = useState(true);

    const { permissionSets, loading: loadingPermissions } = useMyPermissionSets();
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
                console.error("Error fetching meal details:", error);
                toast.error("Failed to load meal plan details");
            } finally {
                setLoadingMeal(false);
            }
        };

        fetchMeal();
    }, [id]);

    if (loadingPermissions || loadingMeal) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!isAdminOrManager) {
        return <Navigate to="/meals" replace />;
    }

    if (!meal) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h2 className="text-xl font-bold text-destructive">Meal Option Not Found</h2>
                <p className="text-muted-foreground mt-2">The requested meal configuration could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <MealForm initialData={meal} isEditing={true} />
        </div>
    );
}
