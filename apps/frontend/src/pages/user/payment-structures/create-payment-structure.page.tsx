import { Navigate } from "react-router-dom";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import PaymentStructureForm from "./_components/payment-structure-form";

export default function CreatePaymentStructurePage() {
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
        return <Navigate to="/payment-structures" replace />;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 pb-2">
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Payment Structure</h1>
                    <p className="text-sm text-muted-foreground">Add a new payment milestone configuration template</p>
                </div>
            </div>

            <Card className="border border-muted bg-card/40 backdrop-blur-md shadow-lg">
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>
                        Specify the milestones and percentages. The sum of all milestone amounts must equal 100%.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentStructureForm />
                </CardContent>
            </Card>
        </div>
    );
}
