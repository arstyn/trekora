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
import { cn } from "@/lib/utils";
import CancellationTierForm from "@/pages/user/cancellation-tiers/_components/cancellation-tier-form";
import PaymentStructureForm from "@/pages/user/payment-structures/_components/payment-structure-form";
import type { ICancellationTierTemplate } from "@/services/cancellation-tiers.service";
import cancellationTiersService from "@/services/cancellation-tiers.service";
import type { IPaymentStructureTemplate } from "@/services/payment-structures.service";
import paymentStructuresService from "@/services/payment-structures.service";
import type { PackageFormData } from "@/types/package.schema";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Bus,
    Calculator,
    DollarSign,
    Edit,
    MapPin,
    Percent,
    Plus,
    Receipt,
    Trash2,
    TrendingUp,
    User,
    Users,
    Utensils,
    Wallet
} from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

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
            {/* Base Cost Overview Card */}
            <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 shadow-xs overflow-hidden rounded-2xl">
                <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/15 text-primary">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Calculated Base Cost</CardTitle>
                                <CardDescription className="text-xs">
                                    Aggregated cost breakdown from Itinerary, Meals, Additional Costs, and Ground Transport
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-background/80 border-primary/30 text-primary font-mono px-3 py-1 text-xs self-start sm:self-auto">
                            Base Total: ₹{calculatedBaseCost.toLocaleString("en-IN")}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="p-3 rounded-xl bg-background/60 border space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                Itinerary
                            </span>
                            <p className="text-base font-bold font-mono">₹{itineraryCost.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/60 border space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                                Meals
                            </span>
                            <p className="text-base font-bold font-mono">₹{mealsCost.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/60 border space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Receipt className="w-3.5 h-3.5 text-purple-500" />
                                Additional
                            </span>
                            <p className="text-base font-bold font-mono">₹{addCostsSum.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/60 border space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Bus className="w-3.5 h-3.5 text-emerald-500" />
                                Ground Transport
                            </span>
                            <p className="text-base font-bold font-mono">₹{groundTransportCost.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-primary text-primary-foreground space-y-1 shadow-xs">
                            <span className="text-xs opacity-90 flex items-center gap-1.5 font-medium">
                                <Wallet className="w-3.5 h-3.5" />
                                Base Cost Total
                            </span>
                            <p className="text-lg font-bold font-mono">₹{calculatedBaseCost.toLocaleString("en-IN")}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Costs Section */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Additional Costs</CardTitle>
                                <CardDescription className="text-xs">
                                    Define fixed surcharges or extra service fees not covered in pricing tiers.
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendAdditionalCost({ name: "", cost: 0 })}
                            size="sm"
                            className="rounded-xl gap-1.5 text-xs font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            Add Cost Fee
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {additionalCostFields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-end p-3 rounded-xl bg-muted/40 border">
                            <FormField
                                control={form.control}
                                name={`additionalCosts.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="text-xs font-medium">Cost Name</FormLabel>
                                        <FormControl>
                                            <Input className="rounded-xl h-9 text-xs" placeholder="e.g. Visa Fee, National Park Entry" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`additionalCosts.${index}.cost`}
                                render={({ field }) => (
                                    <FormItem className="w-36">
                                        <FormLabel className="text-xs font-medium">Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                className="rounded-xl h-9 text-xs font-mono"
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
                                className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 rounded-xl shrink-0"
                                onClick={() => removeAdditionalCost(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {additionalCostFields.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-xl bg-muted/20 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">No additional costs added yet.</p>
                            <p className="text-[11px] text-muted-foreground/70">Click "Add Cost Fee" above if you need permits, visa fees, or taxes.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Package Pricing Tiers Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader className="border-b bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-bold">Package Pricing Tiers</CardTitle>
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {tierFields.length} {tierFields.length === 1 ? "Tier" : "Tiers"}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs mt-0.5">
                                Define pricing tiers (Adults, Children, Infants) & link transportation packages.
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
                                className="rounded-xl gap-1.5 text-xs font-semibold shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                Add Pricing Tier
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Max Discount Limit Header Control */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-background border border-emerald-500/20 space-y-3">
                        <FormField
                            control={form.control}
                            name="maxDiscountType"
                            render={({ field: typeField }) => {
                                const currentType = typeField.value || "amount";
                                return (
                                    <FormItem className="space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                                    {currentType === "amount" ? (
                                                        <DollarSign className="w-4 h-4" />
                                                    ) : (
                                                        <Percent className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <FormLabel className="text-xs font-bold text-foreground block">
                                                        Max Discount Limit
                                                    </FormLabel>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        Set the maximum allowable discount for bookings
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Scope Switcher */}
                                                <FormField
                                                    control={form.control}
                                                    name="maxDiscountScope"
                                                    render={({ field: scopeField }) => {
                                                        const currentScope = scopeField.value || "group";
                                                        return (
                                                            <div className="inline-flex items-center bg-muted/80 p-0.5 rounded-lg border text-xs gap-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        scopeField.onChange("group");
                                                                        form.setValue("maxDiscountScope", "group");
                                                                    }}
                                                                    className={cn(
                                                                        "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 text-xs cursor-pointer",
                                                                        currentScope === "group"
                                                                            ? "bg-background text-foreground shadow-xs font-semibold"
                                                                            : "text-muted-foreground hover:text-foreground"
                                                                    )}
                                                                >
                                                                    <Users className="w-3.5 h-3.5 text-primary" />
                                                                    Group Total
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        scopeField.onChange("passenger");
                                                                        form.setValue("maxDiscountScope", "passenger");
                                                                    }}
                                                                    className={cn(
                                                                        "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 text-xs cursor-pointer",
                                                                        currentScope === "passenger"
                                                                            ? "bg-background text-foreground shadow-xs font-semibold"
                                                                            : "text-muted-foreground hover:text-foreground"
                                                                    )}
                                                                >
                                                                    <User className="w-3.5 h-3.5 text-primary" />
                                                                    Per Passenger
                                                                </button>
                                                            </div>
                                                        );
                                                    }}
                                                />

                                                {/* Unit Selector Switcher */}
                                                <div className="inline-flex items-center bg-muted/80 p-0.5 rounded-lg border text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            typeField.onChange("amount");
                                                            form.setValue("maxDiscountType", "amount");
                                                        }}
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-md transition-all font-medium text-xs cursor-pointer",
                                                            currentType === "amount"
                                                                ? "bg-background text-foreground shadow-xs font-semibold dark:text-emerald-400"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        Amount (₹)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            typeField.onChange("percentage");
                                                            form.setValue("maxDiscountType", "percentage");
                                                        }}
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-md transition-all font-medium text-xs cursor-pointer",
                                                            currentType === "percentage"
                                                                ? "bg-background text-foreground shadow-xs font-semibold dark:text-emerald-400"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        Percent (%)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <FormField
                                                control={form.control}
                                                name="maxDiscountValue"
                                                render={({ field: valField }) => (
                                                    <div className="relative max-w-sm">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={currentType === "percentage" ? "100" : undefined}
                                                            step={currentType === "percentage" ? "0.01" : "1"}
                                                            placeholder={currentType === "amount" ? "e.g. 1000" : "e.g. 15"}
                                                            className="rounded-xl h-10 font-mono text-sm pl-9"
                                                            {...valField}
                                                            value={valField.value ?? ""}
                                                            onChange={(e) => {
                                                                const numVal = e.target.value === "" ? 0 : Number(e.target.value);
                                                                valField.onChange(numVal);
                                                                if (currentType === "percentage") {
                                                                    form.setValue("maxDiscountPercentage", numVal);
                                                                }
                                                            }}
                                                        />
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none font-semibold text-xs">
                                                            {currentType === "amount" ? "₹" : "%"}
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    {/* Transportation Check Alert */}
                    {transportations.length === 0 ? (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100">Transportation options are required</h4>
                                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                                        You must add at least one transportation option in Step 4 (Logistics) before defining package pricing tiers.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                className="rounded-xl border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold gap-2 shrink-0 text-xs"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go to Logistics Step
                            </Button>
                        </div>
                    ) : (
                        <>
                            {tierFields.map((field, index) => (
                                <div key={field.id} className="border rounded-2xl p-5 space-y-5 bg-card/60 shadow-xs hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs font-bold px-2.5 py-0.5">
                                                Tier {index + 1}
                                            </Badge>
                                            <span className="font-bold text-sm">
                                                {form.watch(`packageTiers.${index}.name`) || "Unnamed Tier"}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 text-xs gap-1"
                                            onClick={() => removeTier(index)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove Tier
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`packageTiers.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium">Tier Name (e.g. Deluxe, VIP, Standard)</FormLabel>
                                                    <FormControl>
                                                        <Input className="rounded-xl h-10 text-xs" placeholder="e.g. Standard Package" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`packageTiers.${index}.adultCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium">Adult Price (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="rounded-xl h-10 font-mono text-xs"
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
                                                    <FormLabel className="text-xs font-medium">Linked Transportation Option</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl h-10 text-xs"><SelectValue placeholder="Select transportation option" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">None (No Transport)</SelectItem>
                                                            {transportations.map((t) => (
                                                                t.id ? <SelectItem key={t.id} value={t.id}>{t.title || 'Unnamed Option'} (₹{t.cost || 0})</SelectItem> : null
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Operator Margin & Discount Calculation Box */}
                                    {(() => {
                                        const tier = form.watch(`packageTiers.${index}`);
                                        const selectedTransport = transportations.find((t) => t.id === tier?.transportationId);
                                        const transportCost = Number(selectedTransport?.cost) || 0;
                                        const finalPrice = Number(tier?.adultCost) || 0;
                                        const margin = finalPrice - (calculatedBaseCost + transportCost);
                                        const discountType = form.watch("maxDiscountType") || "amount";
                                        const discountVal = form.watch("maxDiscountValue") ?? form.watch("maxDiscountPercentage") ?? 0;
                                        const maxDiscountAmount = discountType === "percentage"
                                            ? Math.round((finalPrice * discountVal) / 100)
                                            : Math.min(finalPrice, discountVal);
                                        const discountedAdultPrice = Math.max(0, finalPrice - maxDiscountAmount);

                                        return (
                                            <div className="p-4 rounded-xl bg-card border space-y-3 shadow-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-xs flex items-center gap-1.5">
                                                        <TrendingUp className="w-4 h-4 text-primary" />
                                                        Calculated Operator Margin:
                                                    </span>
                                                    <span className={`font-bold text-base px-2.5 py-0.5 rounded-lg font-mono ${margin >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"}`}>
                                                        ₹{margin.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground border-t pt-2 flex flex-col md:flex-row md:justify-between gap-1 font-mono">
                                                    <span>Breakdown:</span>
                                                    <span>
                                                        ₹{finalPrice} (Adult Price) - [₹{calculatedBaseCost} (Base) + ₹{transportCost} (Transport)] = ₹{margin}
                                                    </span>
                                                </div>
                                                {discountVal > 0 && finalPrice > 0 && (
                                                    <div className="flex justify-between items-center text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mt-2">
                                                        <span className="flex items-center gap-1.5 font-bold">
                                                            {discountType === "percentage" ? <Percent className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                                                            Max Discount Limit {discountType === "percentage" ? `(${discountVal}%)` : `(₹${discountVal})`}:
                                                        </span>
                                                        <span className="font-mono">
                                                            <strong>-₹{maxDiscountAmount.toLocaleString("en-IN")}</strong> → Reduced Adult Price: <strong>₹{discountedAdultPrice.toLocaleString("en-IN")}</strong>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Child & Infant pricing */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t">
                                        <div className="space-y-2.5">
                                            <Label className="font-semibold text-xs">Child Pricing Rules</Label>
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.childCostType`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
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
                                                                    className="rounded-xl h-9 text-xs font-mono"
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
                                        <div className="space-y-2.5">
                                            <Label className="font-semibold text-xs">Infant Pricing Rules</Label>
                                            <div className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`packageTiers.${index}.infantCostType`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <Select onValueChange={field.onChange} defaultValue={field.value || "percentage"}>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
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
                                                                    className="rounded-xl h-9 text-xs font-mono"
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
                                <div className="text-center py-8 border border-dashed rounded-2xl bg-muted/20 space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">No pricing tiers created yet.</p>
                                    <p className="text-[11px] text-muted-foreground/70">Click "Add Pricing Tier" above to define package tiers.</p>
                                </div>
                            )}
                        </>
                    )}
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
