import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash, Trash2, Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

interface StepItineraryProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
    existingItineraryImages: Record<number, string[]>;
    setExistingItineraryImages: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
}

export function StepItinerary({
    form,
    onNext,
    onBack,
    isLoading,
    existingItineraryImages,
    setExistingItineraryImages,
}: StepItineraryProps) {
    const {
        fields: itineraryFields,
        append: appendItinerary,
        remove: removeItinerary,
    } = useFieldArray({
        control: form.control,
        name: "itinerary",
    });

    const addActivity = (dayIndex: number) => {
        const currentActivities =
            form.getValues(`itinerary.${dayIndex}.activities`) || [];
        form.setValue(`itinerary.${dayIndex}.activities`, [
            ...currentActivities,
            { name: "", cost: 0 },
        ] as any);
    };

    const removeActivity = (dayIndex: number, activityIndex: number) => {
        const currentActivities =
            form.getValues(`itinerary.${dayIndex}.activities`) || [];
        form.setValue(
            `itinerary.${dayIndex}.activities`,
            currentActivities.filter((_, i) => i !== activityIndex),
        );
    };

    const numDays = form.watch("days") || 0;

    const syncInProgress = useRef(false);

    useEffect(() => {
        if (numDays > 0 && !syncInProgress.current) {
            const currentDays = itineraryFields.length;
            if (numDays > currentDays) {
                syncInProgress.current = true;
                const newDays: any[] = [];
                for (let i = currentDays; i < numDays; i++) {
                    newDays.push({
                        day: i + 1,
                        title: "",
                        description: "",
                        activities: [],
                        activitiesCostType: "per_day",
                        meals: [],
                        accommodation: "",
                        images: [],
                    });
                }
                appendItinerary(newDays);
                // Allow state to settle before next sync
                setTimeout(() => { syncInProgress.current = false; }, 100);
            } else if (numDays < currentDays) {
                syncInProgress.current = true;
                for (let i = currentDays - 1; i >= numDays; i--) {
                    removeItinerary(i);
                }
                setTimeout(() => { syncInProgress.current = false; }, 100);
            }
        }
    }, [numDays, itineraryFields.length, appendItinerary, removeItinerary]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Itinerary</CardTitle>
                            <CardDescription>
                                Plan the day-by-day activities
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {itineraryFields.map((field, dayIndex) => (
                        <div
                            key={field.id}
                            className="p-6 border rounded-xl space-y-4 relative"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">
                                    Day {dayIndex + 1}
                                </h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItinerary(dayIndex)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Day Images</Label>
                                <FileUploader
                                    value={[
                                        ...(existingItineraryImages[dayIndex] || []),
                                        ...(form.watch(`itinerary.${dayIndex}.images`) || []),
                                    ]}
                                    onChange={(newFiles) => {
                                        const current = form.getValues(`itinerary.${dayIndex}.images`) || [];
                                        form.setValue(`itinerary.${dayIndex}.images`, [...current, ...newFiles]);
                                    }}
                                    onRemoveNew={(idx) => {
                                        const current = form.getValues(`itinerary.${dayIndex}.images`) || [];
                                        form.setValue(
                                            `itinerary.${dayIndex}.images`,
                                            current.filter((_, i) => i !== idx)
                                        );
                                    }}
                                    onRemoveExisting={(idx) => {
                                        const existing = existingItineraryImages[dayIndex] || [];
                                        setExistingItineraryImages((prev) => ({
                                            ...prev,
                                            [dayIndex]: existing.filter((_, i) => i !== idx),
                                        }));
                                    }}
                                    maxFiles={10}
                                    accept="image/*"
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name={`itinerary.${dayIndex}.title`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Arrival in Bali"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`itinerary.${dayIndex}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the day's overview..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Activities */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Activities</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addActivity(dayIndex)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Activity
                                    </Button>
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`itinerary.${dayIndex}.activitiesCostType`}
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Cost Configuration</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value || "per_day"}
                                                    className="flex flex-row space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="per_day" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Total Cost Per Day
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="per_activity" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Cost Per Activity
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="no_cost" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            No Cost
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.watch(`itinerary.${dayIndex}.activitiesCostType`) === "per_day" && (
                                    <FormField
                                        control={form.control}
                                        name={`itinerary.${dayIndex}.activitiesTotalCost`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Activities Cost for Day (₹)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="e.g., 500"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === "" ? "" : Number(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {(
                                    form.watch(`itinerary.${dayIndex}.activities`) || []
                                ).map((_, activityIndex) => (
                                    <div key={activityIndex} className="flex gap-2 items-end">
                                        <FormField
                                            control={form.control}
                                            name={`itinerary.${dayIndex}.activities.${activityIndex}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="sr-only">Activity Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Activity name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {form.watch(`itinerary.${dayIndex}.activitiesCostType`) === "per_activity" && (
                                            <FormField
                                                control={form.control}
                                                name={`itinerary.${dayIndex}.activities.${activityIndex}.cost`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32">
                                                        <FormLabel className="sr-only">Cost</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Cost"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mb-1"
                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Meals Included</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => {
                                                const currentMeals = form.getValues(`itinerary.${dayIndex}.meals`) || [];
                                                if (currentMeals.length === 3) {
                                                    form.setValue(`itinerary.${dayIndex}.meals`, []);
                                                } else {
                                                    form.setValue(`itinerary.${dayIndex}.meals`, ["Breakfast", "Lunch", "Dinner"]);
                                                }
                                            }}
                                        >
                                            {form.watch(`itinerary.${dayIndex}.meals`)?.length === 3 ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {["Breakfast", "Lunch", "Dinner"].map(
                                            (meal) => (
                                                <FormField
                                                    key={meal}
                                                    control={form.control}
                                                    name={`itinerary.${dayIndex}.meals`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={(
                                                                        field.value ||
                                                                        []
                                                                    ).includes(
                                                                        meal,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) => {
                                                                        const current =
                                                                            field.value ||
                                                                            [];
                                                                        const updated =
                                                                            checked
                                                                                ? [
                                                                                    ...current,
                                                                                    meal,
                                                                                ]
                                                                                : current.filter(
                                                                                    (
                                                                                        m,
                                                                                    ) =>
                                                                                        m !==
                                                                                        meal,
                                                                                );
                                                                        field.onChange(
                                                                            updated,
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {meal}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`itinerary.${dayIndex}.accommodation`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Accommodation Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Luxury Beach Resort"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`itinerary.${dayIndex}.accommodationCost`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Accommodation Cost (₹)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="e.g., 2500"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === "" ? "" : Number(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {itineraryFields.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                No itinerary days added yet.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4"
                                onClick={() =>
                                    appendItinerary({
                                        day: 1,
                                        title: "",
                                        description: "",
                                        activities: [{ name: "", cost: 0 }],
                                        meals: [],
                                        accommodation: "",
                                        images: [],
                                    })
                                }
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Day
                            </Button>
                        </div>
                    )}
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
