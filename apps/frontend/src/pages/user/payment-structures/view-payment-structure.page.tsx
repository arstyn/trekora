import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyPermissionSets } from "@/hooks/use-permissions";
import type { IPaymentStructureTemplate } from "@/services/payment-structures.service";
import paymentStructuresService from "@/services/payment-structures.service";
import { ArrowLeft, Banknote, Clock, Edit, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ViewPaymentStructurePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<IPaymentStructureTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    const { permissionSets, loading: permissionLoading } = useMyPermissionSets();
    const isAdminOrManager = permissionSets.some(
        (set) => set.name === "Admin - Full Access" || set.name === "General Manager"
    );

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!id) return;
            try {
                const data = await paymentStructuresService.getTemplate(id);
                setTemplate(data);
            } catch (error) {
                console.error("Error fetching template:", error);
                toast.error("Failed to load payment structure");
                navigate("/defaults/payment-structures");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!template || !window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
            return;
        }

        try {
            await paymentStructuresService.deleteTemplate(template.id);
            toast.success("Payment structure template deleted successfully");
            navigate("/defaults/payment-structures");
        } catch (error) {
            console.error("Error deleting template:", error);
            toast.error("Failed to delete template");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!template) return null;

    const formatDueDate = (date: string) => {
        if (date === "booking") return "Booking";
        if (date === "30_days_before") return "30 Days Before";
        if (date === "2_weeks_before") return "2 Weeks Before";
        if (date === "1_week_before") return "1 Week Before";
        if (date === "departure") return "Departure";
        return date;
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate("/defaults/payment-structures")} className="cursor-pointer">
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to templates
                </Button>
                {!permissionLoading && isAdminOrManager && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/defaults/payment-structures/edit/${template.id}`)}
                            className="cursor-pointer border-primary/20 text-primary hover:bg-primary/5"
                        >
                            <Edit className="mr-1.5 h-4 w-4" /> Edit Template
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            className="cursor-pointer"
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{template.name}</h1>
                    <p className="text-sm text-muted-foreground">Payment milestone schedule template details</p>
                </div>
            </div>

            <Card className="border border-muted bg-card/45 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Milestone Timeline</CardTitle>
                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                            Total amount: 100%
                        </Badge>
                    </div>
                    <CardDescription>
                        Payment collection timeline split by percentages
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative border-l-2 border-primary/20 pl-6 ml-3 space-y-6 py-2">
                        {template.milestones?.map((milestone, idx) => (
                            <div key={idx} className="relative">
                                {/* Bullet indicator */}
                                <div className="absolute -left-[31px] top-1 bg-background border-2 border-primary h-4.5 w-4.5 rounded-full flex items-center justify-center">
                                    <div className="bg-primary h-2 w-2 rounded-full" />
                                </div>

                                <div className="p-4 border rounded-xl bg-secondary/20 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <h4 className="font-bold text-foreground">{milestone.name}</h4>
                                        <div className="flex gap-2 items-center">
                                            <Badge variant="secondary" className="text-xs">
                                                {formatDueDate(milestone.dueDate)}
                                            </Badge>
                                            <Badge variant="default" className="text-xs font-bold font-mono">
                                                {milestone.amount}%
                                            </Badge>
                                        </div>
                                    </div>
                                    {milestone.description && (
                                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/10 flex justify-between items-center text-xs text-muted-foreground p-4 rounded-b-xl border-t">
                    <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>Created by {template.createdBy?.name || "Employee"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Last updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
