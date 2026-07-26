import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PackageFormData } from "@/types/package.schema";
import { AlertTriangle, Plus, Save, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import paymentStructuresService from "@/services/payment-structures.service";
import type { IPaymentStructureTemplate } from "@/services/payment-structures.service";
import cancellationTiersService from "@/services/cancellation-tiers.service";
import type { ICancellationTierTemplate } from "@/services/cancellation-tiers.service";
import PaymentStructureForm from "@/pages/user/payment-structures/_components/payment-structure-form";
import CancellationTierForm from "@/pages/user/cancellation-tiers/_components/cancellation-tier-form";

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

    const {
        fields: tierFields,
        append: appendTier,
        remove: removeTier,
    } = useFieldArray({
        control: form.control,
        name: "packageTiers",
    });

    const {
        fields: additionalCostFields,
        append: appendAdditionalCost,
        remove: removeAdditionalCost,
    } = useFieldArray({
        control: form.control,
        name: "additionalCosts",
    });

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

    const itinerary = form.watch("itinerary") || [];
    const itineraryCost = itinerary.reduce((sum, day) => {
        let dayCost = 0;
        if (day.activitiesCostType === "per_day") {
            dayCost += Number(day.activitiesTotalCost) || 0;
        } else if (day.activitiesCostType === "per_activity") {
            dayCost += (day.activities || []).reduce((s, act) => s + (Number((act as any).cost) || 0), 0);
        }
        dayCost += Number(day.accommodationCost) || 0;
        return sum + dayCost;
    }, 0);

    const mealsCost = Number(form.watch("mealsBreakdown.mealsCost")) || 0;
    const additionalCosts = form.watch("additionalCosts") || [];
    const addCostsSum = additionalCosts.reduce((sum, cost) => sum + (Number(cost.cost) || 0), 0);
    const groundTransportCost = Number(form.watch("groundTransportationCost")) || 0;

    const calculatedBaseCost = itineraryCost + mealsCost + addCostsSum + groundTransportCost;
    const transportations = form.watch("transportation") || [];

    return (
        <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Calculated Base Cost</CardTitle>
                    <CardDescription>Aggregated from Itinerary, Meals, Additional Costs, and Ground Transport</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block mb-1">Itinerary (Activities & Accomm.)</span>
                            <span className="font-semibold">₹{itineraryCost}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Meals</span>
                            <span className="font-semibold">₹{mealsCost}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Additional Costs</span>
                            <span className="font-semibold">₹{addCostsSum}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Ground Transport</span>
                            <span className="font-semibold">₹{groundTransportCost}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Total Base Cost</span>
                            <span className="font-bold text-lg text-primary">₹{calculatedBaseCost}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Additional Costs</CardTitle>
                            <CardDescription>
                                Add any extra costs not covered in the package tiers.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendAdditionalCost({ name: "", cost: 0 })}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Cost
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {additionalCostFields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-end">
                            <FormField
                                control={form.control}
                                name={`additionalCosts.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Cost Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Visa Fee" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`additionalCosts.${index}.cost`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mb-1"
                                onClick={() => removeAdditionalCost(index)}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {additionalCostFields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No additional costs added.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Package Pricing Tiers</CardTitle>
                            <CardDescription>
                                Define cost structure for Adults, Children, and Infants.
                            </CardDescription>
                        </div>
                        {transportations.length > 0 && (
                            <Button
                                type="button"
                                onClick={() =>
                                    appendTier({
                                        name: "",
                                        adultCost: 0,
                                        childCostType: "percentage",
                                        childCostValue: 0,
                                        infantCostType: "percentage",
                                        infantCostValue: 0,
                                        transportationId: "none",
                                    })
                                }
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Tier
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {transportations.length === 0 ? (
                        <div className="p-4 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg text-sm flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span>
                                <span className="font-medium">Transportation options are required.</span> Please go back to the Logistics step and add at least one transportation option before defining package tiers.
                            </span>
                        </div>
                    ) : (
                        <>
                            {tierFields.map((field, index) => (
                                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium">Pricing Tier {index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTier(index)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`packageTiers.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tier Name (e.g. Standard, Premium)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`packageTiers.${index}.adultCost`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Adult Price (₹)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <FormField
                                                control={form.control}
                                                name={`packageTiers.${index}.transportationId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Transportation Option</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select transportation" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="none">None</SelectItem>
                                                                {transportations.map((t) => (
                                                                    t.id ? <SelectItem key={t.id} value={t.id}>{t.title || 'Unnamed'} (₹{t.cost || 0})</SelectItem> : null
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {(() => {
                                        const tier = form.watch(`packageTiers.${index}`);
                                        const selectedTransport = transportations.find((t) => t.id === tier?.transportationId);
                                        const transportCost = Number(selectedTransport?.cost) || 0;
                                        const finalPrice = Number(tier?.adultCost) || 0;
                                        const margin = finalPrice - (calculatedBaseCost + transportCost);

                                        return (
                                            <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">Calculated Operator Margin:</span>
                                                    <span className={`font-bold text-lg ${margin >= 0 ? "text-green-600" : "text-destructive"}`}>
                                                        ₹{margin}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground border-t pt-2 flex flex-col md:flex-row md:justify-between gap-1">
                                                     <span>Calculation Breakdown:</span>
                                                     <span className="font-mono">
                                                         ₹{finalPrice} (Adult Price) - [₹{calculatedBaseCost} (Base Total) + ₹{transportCost} (Transport)] = ₹{margin}
                                                     </span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
                                        <div className="space-y-3">
                                            <Label className="font-medium">Child Pricing</Label>
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.childCostType`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                    <SelectItem value="flat">Flat Amount</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.childCostValue`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="Value"
                                                                    {...field}
                                                                    value={field.value ?? ""}
                                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-medium">Infant Pricing</Label>
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.infantCostType`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                    <SelectItem value="flat">Flat Amount</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.infantCostValue`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="Value"
                                                                    {...field}
                                                                    value={field.value ?? ""}
                                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tierFields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No pricing tiers added.</p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <CardTitle>Payment Structure</CardTitle>
                            <CardDescription>
                                Select milestone template or configure inline
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
                                className="cursor-pointer"
                            >
                                <Edit className="h-4 w-4 mr-1.5" /> Edit Template
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingPaymentTemplate(null);
                                    setPaymentDialogOpen(true);
                                }}
                                className="cursor-pointer bg-primary"
                            >
                                <Plus className="h-4 w-4 mr-1.5" /> Create New
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
                                <FormLabel>Payment Structure Template</FormLabel>
                                <Select
                                    key={paymentTemplates.length}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleSelectPaymentTemplate(val);
                                    }}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Select payment structure..." />
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
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-muted-foreground">Milestones Preview</span>
                                <Badge variant={totalPayments === 100 ? "default" : "destructive"}>
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
                                        <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-secondary/35 border rounded-lg">
                                            <div>
                                                <div className="font-bold">{m.name || `Milestone ${idx + 1}`}</div>
                                                {m.description && <div className="text-[10px] text-muted-foreground">{m.description}</div>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px]">{formatDue(m.dueDate || "")}</Badge>
                                                <Badge variant="secondary" className="font-bold">{m.amount}%</Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <CardTitle>Cancellation Tiers</CardTitle>
                            <CardDescription>
                                Select cancellation policy template or configure inline
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
                                className="cursor-pointer"
                            >
                                <Edit className="h-4 w-4 mr-1.5" /> Edit Template
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingCancellationTemplate(null);
                                    setCancellationDialogOpen(true);
                                }}
                                className="cursor-pointer bg-primary"
                            >
                                <Plus className="h-4 w-4 mr-1.5" /> Create New
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
                                <FormLabel>Cancellation Tiers Template</FormLabel>
                                <Select
                                    key={cancellationTemplates.length}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleSelectCancellationTemplate(val);
                                    }}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Select cancellation tiers..." />
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
                            <div className="text-sm font-semibold text-muted-foreground">Cancellation Policies Preview</div>
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
                                        <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-secondary/35 border rounded-lg">
                                            <div>
                                                <div className="font-bold">{formatTime(t.timeframe || "")}</div>
                                                {t.description && <div className="text-[10px] text-muted-foreground">{t.description}</div>}
                                            </div>
                                            <Badge variant="destructive" className="font-bold font-mono">{t.amount}% Charge</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cancellation Policy Details</CardTitle>
                    <CardDescription>
                        Additional points for your policy
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Add policy point..."
                            value={newPolicyPoint}
                            onChange={(e) => setNewPolicyPoint(e.target.value)}
                        />
                        <Button
                            type="button"
                            onClick={addPolicyPoint}
                            variant="secondary"
                            className="h-auto"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(form.watch("cancellationPolicy") || []).map(
                            (point, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 p-3 border rounded-lg bg-secondary/10"
                                >
                                    <p className="flex-1 text-sm">{point}</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePolicyPoint(index)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ),
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? "Saving..." : "Save \u0026 Next"}
                    <Save className="w-4 h-4" />
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
