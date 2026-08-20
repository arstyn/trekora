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
import mealsService from "@/services/meals.service";
import type { IMeal } from "@/types/meals.types";
import type { PackageFormData } from "@/types/package.schema";
import {
    ArrowLeft,
    ArrowRight,
    Bus,
    Clock,
    Hash,
    MapPin,
    Plus,
    Trash2,
    Truck,
    Utensils
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";

interface StepLogisticsProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

function TransportationSegmentList({ control, index }: { control: any; index: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `transportation.${index}.segments`,
    });

    const watchedSegments = useWatch({
        control,
        name: `transportation.${index}.segments`,
    }) || [];

    return (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20 mt-4 bg-secondary/5 p-4 rounded-r-lg">
            <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Journey Segments</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ mode: "flight", number: "", from: "", to: "", departureTime: "", arrivalTime: "", coachType: "none" })}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Segment
                </Button>
            </h5>

            {fields.map((field, segIndex) => {
                const modeName = `transportation.${index}.segments.${segIndex}.mode`;
                return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-end border-b border-primary/10 pb-4 last:border-0 last:pb-0 relative pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => remove(segIndex)}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>

                        <FormField
                            control={control}
                            name={modeName as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Mode</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "flight"}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="flight">Flight</SelectItem>
                                            <SelectItem value="train">Train</SelectItem>
                                            <SelectItem value="bus">Bus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.number` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Number (Flight/Train/Bus)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Hash className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="e.g. AI-101" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.from` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">From</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="Origin" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.to` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">To</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="Destination" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.departureTime` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Departure Time</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input type="time" className="h-8 text-xs pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.arrivalTime` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Arrival Time</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input type="time" className="h-8 text-xs pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Render Coach Type only if mode is train */}
                        {watchedSegments[segIndex]?.mode === 'train' && (
                            <FormField
                                control={control}
                                name={`transportation.${index}.segments.${segIndex}.coachType` as any}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-xs">Coach Type (Train only)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || "none"}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="1AC">1AC (First AC)</SelectItem>
                                                    <SelectItem value="2AC">2AC (Second AC)</SelectItem>
                                                    <SelectItem value="3AC">3AC (Third AC)</SelectItem>
                                                    <SelectItem value="SL">SL (Sleeper)</SelectItem>
                                                    <SelectItem value="CC">CC (AC Chair Car)</SelectItem>
                                                    <SelectItem value="EC">EC (Exec Chair Car)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    );
                                }}
                            />
                        )}
                    </div>
                );
            })}

            {fields.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No segments added. Click 'Add Segment' to build this journey.</p>
            )}
        </div>
    );
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

    const [mealsTemplates, setMealsTemplates] = useState<IMeal[]>([]);

    useEffect(() => {
        const loadMeals = async () => {
            try {
                const data = await mealsService.getMeals();
                setMealsTemplates(data);
            } catch (error) {
                console.error("Error fetching meals templates:", error);
            }
        };
        loadMeals();
    }, []);

    const handleSelectMealTemplate = (templateId: string) => {
        if (templateId === "none") {
            form.setValue("mealsTemplateId", undefined);
            form.setValue("mealsBreakdown.breakfast", []);
            form.setValue("mealsBreakdown.lunch", []);
            form.setValue("mealsBreakdown.dinner", []);
            return;
        }
        const template = mealsTemplates.find((t) => t.id === templateId);
        if (template) {
            form.setValue("mealsTemplateId", template.id);
            form.setValue("mealsBreakdown.breakfast", template.breakfast?.map(item => item.name) || []);
            form.setValue("mealsBreakdown.lunch", template.lunch?.map(item => item.name) || []);
            form.setValue("mealsBreakdown.dinner", template.dinner?.map(item => item.name) || []);
        }
    };

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
            {/* Meals Breakdown Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Meals Breakdown</CardTitle>
                            <CardDescription className="text-xs">
                                Define breakfast, lunch, and dinner inclusions for traveler itinerary
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="mealsTemplateId"
                        render={({ field }) => (
                            <FormItem className="pb-4 border-b">
                                <FormLabel className="font-semibold text-xs flex items-center gap-1.5">
                                    Select Meal Plan Template
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleSelectMealTemplate(val);
                                    }}
                                    value={field.value || "none"}
                                >
                                    <FormControl>
                                        <SelectTrigger className="cursor-pointer rounded-xl h-10 text-xs">
                                            <SelectValue placeholder="Select a pre-defined meal plan..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None (Custom Meals)</SelectItem>
                                        {mealsTemplates.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {(["breakfast", "lunch", "dinner"] as const).map((type) => (
                        <div key={type} className="space-y-2.5">
                            <Label className="capitalize font-semibold text-xs text-foreground">
                                {type} Items
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={`Add ${type} menu item...`}
                                    className="rounded-xl h-9 text-xs"
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
                                    size="sm"
                                    className="rounded-xl px-3 gap-1 shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>
                            {newMealItem.type === type && newMealItem.value.trim().length > 0 && (
                                <p className="text-[11px] text-amber-600 font-medium">
                                    ⚠️ You have typed a menu item. Remember to click "+ Add" to save it.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                                {(
                                    form.watch(`mealsBreakdown.${type}`) || []
                                ).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1.5 bg-muted/60 border px-2.5 py-1 rounded-xl text-xs"
                                    >
                                        <span className="font-medium">{item}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 text-rose-500 hover:bg-rose-500/10 rounded-full"
                                            onClick={() =>
                                                removeMealItem(type, index)
                                            }
                                        >
                                            <Trash2 className="w-3 h-3" />
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
                                    <FormLabel className="text-xs font-medium">Total Meals Cost (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 5000"
                                            className="rounded-xl h-10 font-mono text-xs max-w-sm"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
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

            {/* Transportation Options Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Transportation Options</CardTitle>
                                <CardDescription className="text-xs">
                                    Configure transport tiers (Flights, Trains, Buses) linked to pricing tiers
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendTransportation({ id: crypto.randomUUID(), title: "", segments: [], cost: 0 })}
                            size="sm"
                            className="rounded-xl gap-1.5 text-xs font-semibold shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Transport Option
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {transportationFields.map((field, index) => (
                        <div key={field.id} className="border rounded-2xl p-5 space-y-4 bg-card/50 shadow-xs">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                        Option {index + 1}
                                    </span>
                                    <span className="font-semibold text-xs">
                                        {form.watch(`transportation.${index}.title`) || "Unnamed Option"}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 text-xs gap-1"
                                    onClick={() => removeTransportation(index)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">Option Title</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl h-10 text-xs" placeholder="e.g., Round-trip Flight + AC Coach" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.cost`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">Total Option Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
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

                            <TransportationSegmentList control={form.control} index={index} />
                        </div>
                    ))}
                    {transportationFields.length === 0 && (
                        <div className="text-center py-8 border border-dashed rounded-2xl bg-muted/20 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">No transportation options added yet.</p>
                            <p className="text-[11px] text-muted-foreground/70">Click "Add Transport Option" above to include transportation choices for pricing tiers.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ground Transportation Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Bus className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Ground Transportation</CardTitle>
                            <CardDescription className="text-xs">Fixed local cabs, transfers, or bus charter expenses</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="groundTransportationCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium">Ground Transport Cost (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 3500"
                                        className="rounded-xl h-10 font-mono text-xs max-w-sm"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Action Buttons */}
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
        </div>
    );
}
