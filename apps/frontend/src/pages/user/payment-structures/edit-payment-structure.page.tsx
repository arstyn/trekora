import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import paymentStructuresService from "@/services/payment-structures.service";
import { Banknote, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PaymentStructureForm from "./_components/payment-structure-form";

export default function EditPaymentStructurePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<any>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(true);

    const { permissionSets, loading: permissionsLoading } = useMyPermissionSets();

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!id) return;
            try {
                const data = await paymentStructuresService.getTemplate(id);
                setTemplate(data);
            } catch (error) {
                console.error("Error loading template:", error);
                toast.error("Failed to load payment structure template");
                navigate("/defaults/payment-structures");
            } finally {
                setLoadingTemplate(false);
            }
        };

        fetchTemplate();
    }, [id, navigate]);

    if (permissionsLoading || loadingTemplate) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading template...</span>
            </div>
        );
    }

    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    if (!isAdminOrManager) {
        return <Navigate to="/defaults/payment-structures" replace />;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 pb-2">
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Payment Structure</h1>
                    <p className="text-sm text-muted-foreground">Update an existing payment milestone template</p>
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
                    <PaymentStructureForm initialData={template} />
                </CardContent>
            </Card>
        </div>
    );
}
