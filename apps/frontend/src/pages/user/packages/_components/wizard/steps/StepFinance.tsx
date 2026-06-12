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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash2 } from "lucide-react";
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

    const totalPackagePrice = form.watch("price") || 0;
    const totalPayments = (form.watch("paymentStructure") || []).reduce(
        (sum, milestone) => sum + (milestone.amount || 0),
        0,
    );

    return (
        <div className="space-y-6">
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
                                target: ₹{totalPackagePrice}
                            </span>
                            <Badge
                                variant={
                                    totalPayments === totalPackagePrice
                                        ? "default"
                                        : "destructive"
                                }
                            >
                                ₹{totalPayments.toFixed(2)}
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`paymentStructure.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`paymentStructure.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`paymentStructure.${index}.dueDate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="booking">
                                                        Booking
                                                    </SelectItem>
                                                    <SelectItem value="30_days_before">
                                                        30 Days Before
                                                    </SelectItem>
                                                    <SelectItem value="2_weeks_before">
                                                        2 Weeks Before
                                                    </SelectItem>
                                                    <SelectItem value="1_week_before">
                                                        1 Week Before
                                                    </SelectItem>
                                                    <SelectItem value="departure">
                                                        Departure
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
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
                                    timeframe: "",
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timeframe</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., 30+ days before"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`cancellationStructure.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Charge Amount (₹)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
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
                    disabled={isLoading || totalPayments !== totalPackagePrice}
                    className="gap-2"
                >
                    {isLoading ? "Saving..." : "Save \u0026 Next"}
                    <Save className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
