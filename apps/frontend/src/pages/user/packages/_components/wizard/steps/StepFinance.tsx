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
import { Plus, Save, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
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
        fields: paymentFields,
        append: appendPayment,
        remove: removePayment,
    } = useFieldArray({
        control: form.control,
        name: "paymentStructure",
    });

    const {
        fields: cancellationFields,
        append: appendCancellation,
        remove: removeCancellation,
    } = useFieldArray({
        control: form.control,
        name: "cancellationStructure",
    });

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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <FormField
                                            control={form.control}
                                            name={`packageTiers.${index}.adultCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tier Additional Cost (₹)</FormLabel>
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

                                    {(() => {
                                        const tier = form.watch(`packageTiers.${index}`);
                                        const selectedTransport = transportations.find((t) => t.id === tier?.transportationId);
                                        const transportCost = Number(selectedTransport?.cost) || 0;
                                        const tierAddCost = Number(tier?.adultCost) || 0;
                                        const totalCost = calculatedBaseCost + transportCost + tierAddCost;

                                        return (
                                            <div className="mt-4 p-3 bg-primary/5 rounded-md flex justify-between items-center border border-primary/20">
                                                <span className="font-medium text-sm">Total Package Cost (Per Adult):</span>
                                                <span className="font-bold text-lg text-primary">₹{totalCost}</span>
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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Payment Structure</CardTitle>
                            <CardDescription>
                                Define payment milestones and amounts
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                appendPayment({
                                    name: "",
                                    amount: 0,
                                    description: "",
                                    dueDate: "booking",
                                })
                            }
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Milestone
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                        <span className="font-medium">
                            Total Milestone Amount:
                        </span>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground">
                                target: 100%
                            </span>
                            <Badge
                                variant={
                                    totalPayments === 100
                                        ? "default"
                                        : "destructive"
                                }
                            >
                                {totalPayments.toFixed(0)}%
                            </Badge>
                        </div>
                    </div>

                    {paymentFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                    Milestone {index + 1}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePayment(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`paymentStructure.${index}.dueDate`}
                                    render={({ field }) => {
                                        const standardDueDates = ["booking", "30_days_before", "2_weeks_before", "1_week_before", "departure"];
                                        const isCustom = field.value !== undefined && !standardDueDates.includes(field.value);
                                        const selectValue = isCustom ? "custom" : (field.value || "booking");

                                        return (
                                            <FormItem>
                                                <FormLabel>Due Date</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        if (val === "custom") {
                                                            field.onChange("");
                                                        } else {
                                                            field.onChange(val);
                                                        }
                                                    }}
                                                    value={selectValue}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="booking">Booking</SelectItem>
                                                        <SelectItem value="30_days_before">30 Days Before</SelectItem>
                                                        <SelectItem value="2_weeks_before">2 Weeks Before</SelectItem>
                                                        <SelectItem value="1_week_before">1 Week Before</SelectItem>
                                                        <SelectItem value="departure">Departure</SelectItem>
                                                        <SelectItem value="custom">Custom...</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {selectValue === "custom" && (
                                                    <Input
                                                        placeholder="Enter custom due date..."
                                                        className="mt-2"
                                                        value={isCustom ? field.value : ""}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                )}
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name={`paymentStructure.${index}.amount`}
                                    render={({ field }) => {
                                        const percentage = field.value || 0;
                                        const tiers = form.watch("packageTiers") || [];
                                        return (
                                            <FormItem>
                                                <FormLabel>Percentage (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                {percentage > 0 && tiers.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                                        {tiers.map((tier, i) => {
                                                            const selectedTransport = transportations.find((t) => t.id === tier?.transportationId);
                                                            const transportCost = Number(selectedTransport?.cost) || 0;
                                                            const tierAddCost = Number(tier?.adultCost) || 0;
                                                            const totalCost = calculatedBaseCost + transportCost + tierAddCost;
                                                            return (
                                                                <div key={i}>{tier.name || `Tier ${i + 1}`}: ₹{(totalCost * (percentage / 100)).toFixed(2)}</div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </FormItem>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Cancellation Tiers</CardTitle>
                            <CardDescription>
                                Charge amounts based on cancellation timing
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                appendCancellation({
                                    timeframe: "30_days_before",
                                    amount: 0,
                                    description: "",
                                })
                            }
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Tier
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cancellationFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                    Tier {index + 1}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCancellation(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`cancellationStructure.${index}.timeframe`}
                                    render={({ field }) => {
                                        const standardTimeframes = ["30_days_before", "2_weeks_before", "1_week_before", "departure"];
                                        const isCustom = field.value !== undefined && !standardTimeframes.includes(field.value);
                                        const selectValue = isCustom ? "custom" : (field.value || "30_days_before");

                                        return (
                                            <FormItem>
                                                <FormLabel>Timeframe</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        if (val === "custom") {
                                                            field.onChange("");
                                                        } else {
                                                            field.onChange(val);
                                                        }
                                                    }}
                                                    value={selectValue}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="30_days_before">30+ Days Before</SelectItem>
                                                        <SelectItem value="2_weeks_before">15-30 Days Before</SelectItem>
                                                        <SelectItem value="1_week_before">7-14 Days Before</SelectItem>
                                                        <SelectItem value="departure">0-7 Days Before / No Show</SelectItem>
                                                        <SelectItem value="custom">Custom...</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {selectValue === "custom" && (
                                                    <Input
                                                        placeholder="Enter custom timeframe..."
                                                        className="mt-2"
                                                        value={isCustom ? field.value : ""}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                )}
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name={`cancellationStructure.${index}.amount`}
                                    render={({ field }) => {
                                        const percentage = field.value || 0;
                                        const tiers = form.watch("packageTiers") || [];
                                        return (
                                            <FormItem>
                                                <FormLabel>
                                                    Charge Percentage (%)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                {percentage > 0 && tiers.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                                        {tiers.map((tier, i) => {
                                                            const selectedTransport = transportations.find((t) => t.id === tier?.transportationId);
                                                            const transportCost = Number(selectedTransport?.cost) || 0;
                                                            const tierAddCost = Number(tier?.adultCost) || 0;
                                                            const totalCost = calculatedBaseCost + transportCost + tierAddCost;
                                                            return (
                                                                <div key={i}>{tier.name || `Tier ${i + 1}`}: ₹{(totalCost * (percentage / 100)).toFixed(2)}</div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </FormItem>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    ))}
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
        </div>
    );
}
