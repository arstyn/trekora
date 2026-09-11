import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CancellationTierForm from "@/pages/user/cancellation-tiers/_components/cancellation-tier-form";
import PaymentStructureForm from "@/pages/user/payment-structures/_components/payment-structure-form";
import type { ICancellationTierTemplate } from "@/services/cancellation-tiers.service";
import cancellationTiersService from "@/services/cancellation-tiers.service";
import type { IPaymentStructureTemplate } from "@/services/payment-structures.service";
import paymentStructuresService from "@/services/payment-structures.service";
import type { PackageFormData } from "@/types/package.schema";
import {
    ArrowLeft,
    ArrowRight,
    Coins,
    Edit,
    Plus,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

interface StepFinanceProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function StepFinance({
    form,
    onNext,
    onBack,
    isLoading,
}: StepFinanceProps) {

    const [paymentTemplates, setPaymentTemplates] = useState<IPaymentStructureTemplate[]>([]);
    const [cancellationTemplates, setCancellationTemplates] = useState<ICancellationTierTemplate[]>([]);

    // Dialog control states
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingPaymentTemplate, setEditingPaymentTemplate] = useState<any>(null);
    const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
    const [editingCancellationTemplate, setEditingCancellationTemplate] = useState<any>(null);

    const loadTemplates = async () => {
        try {
            const pData = await paymentStructuresService.getTemplates();
            setPaymentTemplates(pData);
            const cData = await cancellationTiersService.getTemplates();
            setCancellationTemplates(cData);

            // Default to 0th position if not already set
            const currentPaymentId = form.getValues("paymentStructureTemplateId");
            if (pData.length > 0 && !currentPaymentId) {
                form.setValue("paymentStructureTemplateId", pData[0].id, { shouldValidate: true });
                form.setValue("paymentStructure", pData[0].milestones.map(m => ({
                    name: m.name,
                    amount: m.amount,
                    description: m.description,
                    dueDate: m.dueDate,
                    order: m.order
                })), { shouldValidate: true });
            }

            const currentCancellationId = form.getValues("cancellationStructureTemplateId");
            if (cData.length > 0 && !currentCancellationId) {
                form.setValue("cancellationStructureTemplateId", cData[0].id, { shouldValidate: true });
                form.setValue("cancellationStructure", cData[0].tiers.map(t => ({
                    timeframe: t.timeframe,
                    amount: t.amount,
                    description: t.description
                })), { shouldValidate: true });
            }
        } catch (error) {
            console.error("Error fetching templates in finance step:", error);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleSelectPaymentTemplate = (templateId: string) => {
        if (templateId === "none") {
            form.setValue("paymentStructureTemplateId", undefined);
            form.setValue("paymentStructure", []);
            return;
        }
        const template = paymentTemplates.find((t) => t.id === templateId);
        if (template) {
            form.setValue("paymentStructureTemplateId", template.id);
            form.setValue("paymentStructure", template.milestones.map(m => ({
                name: m.name,
                amount: m.amount,
                description: m.description,
                dueDate: m.dueDate,
                order: m.order
            })));
        }
    };

    const handleSelectCancellationTemplate = (templateId: string) => {
        if (templateId === "none") {
            form.setValue("cancellationStructureTemplateId", undefined);
            form.setValue("cancellationStructure", []);
            return;
        }
        const template = cancellationTemplates.find((t) => t.id === templateId);
        if (template) {
            form.setValue("cancellationStructureTemplateId", template.id);
            form.setValue("cancellationStructure", template.tiers.map(t => ({
                timeframe: t.timeframe,
                amount: t.amount,
                description: t.description
            })));
        }
    };

    const [newPolicyPoint, setNewPolicyPoint] = useState("");

    const addPolicyPoint = () => {
        if (!newPolicyPoint.trim()) return;
        const current = form.getValues("cancellationPolicy") || [];
        form.setValue("cancellationPolicy", [
            ...current,
            newPolicyPoint.trim(),
        ]);
        setNewPolicyPoint("");
    };

    const removePolicyPoint = (index: number) => {
        const current = form.getValues("cancellationPolicy") || [];
        form.setValue(
            "cancellationPolicy",
            current.filter((_, i) => i !== index),
        );
    };

    const totalPayments = (form.watch("paymentStructure") || []).reduce(
        (sum, milestone) => sum + (milestone.amount || 0),
        0,
    );

    return (
        <div className="space-y-6">
            {/* Dynamic Batch Cost Sheets Information Banner */}
            <Card className="rounded-2xl border bg-primary/5 border-primary/20 shadow-xs overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground">
                            Batch-Level Cost Sheets & Dynamic Pricing
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Base prices, line item expenses, operator margin, and max discount limits are defined per batch in the Batches section. Configure your package milestone payment schedule and cancellation rules below.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Structure Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <CardTitle className="text-base font-bold">Payment Structure</CardTitle>
                            <CardDescription className="text-xs">
                                Select milestone payment schedule template or configure custom terms.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const selectedId = form.getValues("paymentStructureTemplateId");
                                    const template = paymentTemplates.find((t) => t.id === selectedId);
                                    if (template) {
                                        setEditingPaymentTemplate(template);
                                        setPaymentDialogOpen(true);
                                    }
                                }}
                                disabled={!form.watch("paymentStructureTemplateId")}
                                className="cursor-pointer rounded-xl h-8 text-xs gap-1.5"
                            >
                                <Edit className="h-3.5 w-3.5" /> Edit Template
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingPaymentTemplate(null);
                                    setPaymentDialogOpen(true);
                                }}
                                className="cursor-pointer rounded-xl h-8 text-xs gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Create New
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="paymentStructureTemplateId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium">Payment Structure Template</FormLabel>
                                <Select
                                    key={paymentTemplates.length}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleSelectPaymentTemplate(val);
                                    }}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="cursor-pointer rounded-xl h-10 text-xs">
                                            <SelectValue placeholder="Select payment structure template..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {paymentTemplates.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* Preview milestones */}
                    {form.watch("paymentStructure") && form.watch("paymentStructure")!.length > 0 && (
                        <div className="space-y-3 pt-3 border-t">
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-muted-foreground">Milestones Preview</span>
                                <Badge variant={totalPayments === 100 ? "default" : "destructive"} className="font-mono text-xs rounded-lg">
                                    Total: {totalPayments}%
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {form.watch("paymentStructure")!.map((m, idx) => {
                                    const formatDue = (d: string) => {
                                        if (d === "booking") return "Booking";
                                        if (d === "30_days_before") return "30 Days Before";
                                        if (d === "2_weeks_before") return "2 Weeks Before";
                                        if (d === "1_week_before") return "1 Week Before";
                                        if (d === "departure") return "Departure";
                                        return d;
                                    };
                                    return (
                                        <div key={idx} className="flex justify-between items-center text-xs p-3 bg-muted/40 border rounded-xl">
                                            <div>
                                                <div className="font-bold text-xs">{m.name || `Milestone ${idx + 1}`}</div>
                                                {m.description && <div className="text-[11px] text-muted-foreground mt-0.5">{m.description}</div>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] rounded-md">{formatDue(m.dueDate || "")}</Badge>
                                                <Badge variant="secondary" className="font-bold font-mono text-xs rounded-md">{m.amount}%</Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancellation Tiers Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <CardTitle className="text-base font-bold">Cancellation Tiers</CardTitle>
                            <CardDescription className="text-xs">
                                Select cancellation policy penalty template or configure custom terms.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const selectedId = form.getValues("cancellationStructureTemplateId");
                                    const template = cancellationTemplates.find((t) => t.id === selectedId);
                                    if (template) {
                                        setEditingCancellationTemplate(template);
                                        setCancellationDialogOpen(true);
                                    }
                                }}
                                disabled={!form.watch("cancellationStructureTemplateId")}
                                className="cursor-pointer rounded-xl h-8 text-xs gap-1.5"
                            >
                                <Edit className="h-3.5 w-3.5" /> Edit Template
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingCancellationTemplate(null);
                                    setCancellationDialogOpen(true);
                                }}
                                className="cursor-pointer rounded-xl h-8 text-xs gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Create New
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="cancellationStructureTemplateId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium">Cancellation Tiers Template</FormLabel>
                                <Select
                                    key={cancellationTemplates.length}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleSelectCancellationTemplate(val);
                                    }}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="cursor-pointer rounded-xl h-10 text-xs">
                                            <SelectValue placeholder="Select cancellation tiers template..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {cancellationTemplates.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* Preview cancellation tiers */}
                    {form.watch("cancellationStructure") && form.watch("cancellationStructure")!.length > 0 && (
                        <div className="space-y-3 pt-3 border-t">
                            <div className="text-xs font-semibold text-muted-foreground">Cancellation Policies Preview</div>
                            <div className="space-y-2">
                                {form.watch("cancellationStructure")!.map((t, idx) => {
                                    const formatTime = (time: string) => {
                                        if (time === "30_days_before") return "30+ Days Before";
                                        if (time === "2_weeks_before") return "15-30 Days Before";
                                        if (time === "1_week_before") return "7-14 Days Before";
                                        if (time === "departure") return "0-7 Days Before / No Show";
                                        return time;
                                    };
                                    return (
                                        <div key={idx} className="flex justify-between items-center text-xs p-3 bg-muted/40 border rounded-xl">
                                            <div>
                                                <div className="font-bold text-xs">{formatTime(t.timeframe || "")}</div>
                                                {t.description && <div className="text-[11px] text-muted-foreground mt-0.5">{t.description}</div>}
                                            </div>
                                            <Badge variant="destructive" className="font-bold font-mono text-xs rounded-md">{t.amount}% Charge</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancellation Policy Bullet Points Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-bold">Cancellation Policy Guidelines</CardTitle>
                    <CardDescription className="text-xs">
                        Add clear bullet points or explicit rules regarding cancellation requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Add policy note (e.g. Requests must be submitted in writing)..."
                            value={newPolicyPoint}
                            onChange={(e) => setNewPolicyPoint(e.target.value)}
                            className="rounded-xl text-xs min-h-[70px]"
                        />
                        <Button
                            type="button"
                            onClick={addPolicyPoint}
                            className="rounded-xl shrink-0 px-4 gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Add Note
                        </Button>
                    </div>
                    {newPolicyPoint.trim().length > 0 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                            ⚠️ You have typed a guideline note. Remember to click "Add Note" to save it.
                        </p>
                    )}
                    <div className="space-y-2">
                        {(form.watch("cancellationPolicy") || []).map(
                            (point, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 border rounded-xl bg-muted/30 text-xs"
                                >
                                    <p className="flex-1 font-medium">{point}</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                                        onClick={() => removePolicyPoint(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ),
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Step Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="rounded-xl px-5 gap-2 text-xs font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading}
                    className="rounded-xl px-6 gap-2 text-xs font-semibold"
                >
                    {isLoading ? "Saving..." : "Save & Next"}
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Payment Structure dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPaymentTemplate ? "Edit Payment Structure Template" : "Create Payment Structure Template"}</DialogTitle>
                    </DialogHeader>
                    <PaymentStructureForm
                        initialData={editingPaymentTemplate}
                        onSuccess={async (newT: any) => {
                            await loadTemplates();
                            setPaymentDialogOpen(false);
                            if (newT) {
                                form.setValue("paymentStructureTemplateId", newT.id);
                                handleSelectPaymentTemplate(newT.id);
                            }
                        }}
                        onCancel={() => setPaymentDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Cancellation Tiers dialog */}
            <Dialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCancellationTemplate ? "Edit Cancellation Tier Template" : "Create Cancellation Tier Template"}</DialogTitle>
                    </DialogHeader>
                    <CancellationTierForm
                        initialData={editingCancellationTemplate}
                        onSuccess={async (newT: any) => {
                            await loadTemplates();
                            setCancellationDialogOpen(false);
                            if (newT) {
                                form.setValue("cancellationStructureTemplateId", newT.id);
                                handleSelectCancellationTemplate(newT.id);
                            }
                        }}
                        onCancel={() => setCancellationDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
