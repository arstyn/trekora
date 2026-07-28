import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import { AlertTriangle } from "lucide-react";
import { Navigate } from "react-router-dom";
import CancellationTierForm from "./_components/cancellation-tier-form";

export default function CreateCancellationTierPage() {
    const { permissionSets, loading } = useMyPermissionSets();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    if (!isAdminOrManager) {
        return <Navigate to="/defaults/cancellation-tiers" replace />;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 pb-2">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Cancellation Tier</h1>
                    <p className="text-sm text-muted-foreground">Add a new cancellation charge policy template</p>
                </div>
            </div>

            <Card className="border border-muted bg-card/40 backdrop-blur-md shadow-lg">
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>
                        Specify cancellation time-frames and charge percentages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CancellationTierForm />
                </CardContent>
            </Card>
        </div>
    );
}
