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
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { StepErrors } from "../../step-errors";

interface StepLogisticsProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function StepLogistics({
    form,
    onNext,
    onBack,
    isLoading,
}: StepLogisticsProps) {
    const { fields: transportationFields, append: appendTransportation, remove: removeTransportation } = useFieldArray({
        control: form.control,
        name: "transportation",
    });

    const [newMealItem, setNewMealItem] = useState<{
        type: "breakfast" | "lunch" | "dinner";
        value: string;
    }>({
        type: "breakfast",
        value: "",
    });

    const addMealItem = (type: "breakfast" | "lunch" | "dinner") => {
        if (!newMealItem.value.trim()) return;
        const current = form.getValues(`mealsBreakdown.${type}`) || [];
        form.setValue(`mealsBreakdown.${type}`, [
            ...current,
            newMealItem.value.trim(),
        ]);
        setNewMealItem({ type: "breakfast", value: "" });
    };

    const removeMealItem = (
        type: "breakfast" | "lunch" | "dinner",
        index: number,
    ) => {
        const current = form.getValues(`mealsBreakdown.${type}`) || [];
        form.setValue(
            `mealsBreakdown.${type}`,
            current.filter((_, i) => i !== index),
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Meals Breakdown</CardTitle>
                    <CardDescription>
                        Details about what's served for each meal
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(["breakfast", "lunch", "dinner"] as const).map((type) => (
                        <div key={type} className="space-y-2">
                            <Label className="capitalize font-bold">
                                {type}
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={`Add ${type} item...`}
                                    value={
                                        newMealItem.type === type
                                            ? newMealItem.value
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setNewMealItem({
                                            type,
                                            value: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addMealItem(type);
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => addMealItem(type)}
                                    variant="secondary"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(
                                    form.watch(`mealsBreakdown.${type}`) || []
                                ).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md text-sm"
                                    >
                                        <span>{item}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 hover:bg-transparent"
                                            onClick={() =>
                                                removeMealItem(type, index)
                                            }
                                        >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="pt-4 border-t">
                        <FormField
                            control={form.control}
                            name="mealsBreakdown.mealsCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Meals Cost (INR)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 5000"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseInt(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Transportation Options</CardTitle>
                            <CardDescription>Available transport tiers and costs</CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendTransportation({ title: "", details: "", cost: 0 })}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {transportationFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_auto] gap-3 items-start border-b pb-4 last:border-0 last:pb-0">
                            <FormField
                                control={form.control}
                                name={`transportation.${index}.title`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tier/Mode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Standard Flight" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`transportation.${index}.details`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Details</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Economy class round trip" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`transportation.${index}.cost`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost (INR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="pt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTransportation(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {transportationFields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No transportation options added. Click 'Add Option' to include transport tiers.
                        </p>
                    )}
                </CardContent>
            </Card>



            <div className="flex justify-between items-center gap-4">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <div className="flex items-center gap-4">
                    <StepErrors
                        form={form}
                        fields={["transportation", "mealsBreakdown"]}
                    />
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
        </div>
    );
}
