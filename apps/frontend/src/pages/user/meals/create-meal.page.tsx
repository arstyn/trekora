import { Skeleton } from "@/components/ui/skeleton";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import { Navigate } from "react-router-dom";
import { MealForm } from "./_components/meal-form";

export default function CreateMealPage() {
    const { permissionSets, loading } = useMyPermissionSets();
    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!isAdminOrManager) {
        return <Navigate to="/defaults/meals" replace />;
    }

    return (
        <div className="container mx-auto p-6">
            <MealForm />
        </div>
    );
}
