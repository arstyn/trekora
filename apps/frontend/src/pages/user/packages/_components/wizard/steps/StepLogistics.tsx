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
import type { PackageFormData } from "@/types/package.schema";
import { Clock, Hash, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "flight"}>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
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
                                    <FormLabel>Total Meals Cost (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 5000"
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

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Transportation Options</CardTitle>
                            <CardDescription>Available transport tiers and costs</CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendTransportation({ id: crypto.randomUUID(), title: "", segments: [], cost: 0 })}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {transportationFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <h4 className="font-medium text-primary flex items-center gap-2">
                                    Transportation Option {index + 1}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTransportation(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Two-Way Flight, Mixed (Train+Flight)" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.cost`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Option Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
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
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No transportation options added. Click 'Add Option' to include transport tiers.
                        </p>
                    )}
                </CardContent>
            </Card>



            <Card>
                <CardHeader>
                    <CardTitle>Ground Transportation</CardTitle>
                    <CardDescription>Overall ground transportation costs for the package</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="groundTransportationCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ground Transportation Cost (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 2000"
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
