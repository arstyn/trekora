import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash, Trash2, Upload } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

interface StepItineraryProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
    itineraryPreviewUrls: Record<number, string[]>;
    handleDayImageUpload: (
        dayIndex: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => void;
    removeDayImage: (dayIndex: number, imageIndex: number) => void;
}

export function StepItinerary({
    form,
    onNext,
    onBack,
    isLoading,
    itineraryPreviewUrls,
    handleDayImageUpload,
    removeDayImage,
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
            "",
        ]);
    };

    const removeActivity = (dayIndex: number, activityIndex: number) => {
        const currentActivities =
            form.getValues(`itinerary.${dayIndex}.activities`) || [];
        form.setValue(
            `itinerary.${dayIndex}.activities`,
            currentActivities.filter((_, i) => i !== activityIndex),
        );
    };

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
                        <Button
                            type="button"
                            onClick={() => {
                                appendItinerary({
                                    day: itineraryFields.length + 1,
                                    title: "",
                                    description: "",
                                    activities: [""],
                                    meals: [],
                                    accommodation: "",
                                    images: [],
                                });
                            }}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Day
                        </Button>
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(itineraryPreviewUrls[dayIndex] || []).map(
                                        (url, imageIndex) => (
                                            <div className="relative group overflow-hidden rounded-lg aspect-video border bg-secondary/20">
                                                <img
                                                    src={url}
                                                    alt={`Day ${dayIndex + 1} - ${imageIndex + 1}`}
                                                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).src =
                                                            "/placeholder.svg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() =>
                                                            removeDayImage(
                                                                dayIndex,
                                                                imageIndex,
                                                            )
                                                        }
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {/* Optional: Add spinner if you want logic to track real loading state, 
                                                        but for local previews it's instant. For existing images, 
                                                        showing a background color/blur is usually enough. */}
                                            </div>
                                        ),
                                    )}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
                                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                        <Label
                                            htmlFor={`day-${dayIndex}-image`}
                                            className="cursor-pointer text-sm"
                                        >
                                            Add Images
                                        </Label>
                                        <Input
                                            id={`day-${dayIndex}-image`}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) =>
                                                handleDayImageUpload(
                                                    dayIndex,
                                                    e,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
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
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Activities</Label>
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
                                {(
                                    form.watch(
                                        `itinerary.${dayIndex}.activities`,
                                    ) || []
                                ).map((_, activityIndex) => (
                                    <div
                                        key={activityIndex}
                                        className="flex gap-2"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`itinerary.${dayIndex}.activities.${activityIndex}`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Activity name"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeActivity(
                                                    dayIndex,
                                                    activityIndex,
                                                )
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Meals Included</Label>
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
                                <FormField
                                    control={form.control}
                                    name={`itinerary.${dayIndex}.accommodation`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Accommodation</FormLabel>
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
                                        activities: [""],
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
