import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import cancellationTiersService from "@/services/cancellation-tiers.service";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CancellationTierForm from "./_components/cancellation-tier-form";

export default function EditCancellationTierPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<any>(null);
    const [loadingTemplate, setLoadingTemplate] = useState(true);

    const { permissionSets, loading: permissionsLoading } = useMyPermissionSets();

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!id) return;
            try {
                const data = await cancellationTiersService.getTemplate(id);
                setTemplate(data);
            } catch (error) {
                console.error("Error loading template:", error);
                toast.error("Failed to load cancellation template");
                navigate("/defaults/cancellation-tiers");
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
        return <Navigate to="/defaults/cancellation-tiers" replace />;
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 pb-2">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Cancellation Tier</h1>
                    <p className="text-sm text-muted-foreground">Update an existing cancellation charge template</p>
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
                    <CancellationTierForm initialData={template} />
                </CardContent>
            </Card>
        </div>
    );
}
