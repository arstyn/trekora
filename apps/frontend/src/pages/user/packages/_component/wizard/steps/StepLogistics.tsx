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
import { indianStates } from "@/lib/constants/indian-states";
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transportation</CardTitle>
                    <CardDescription>How will travelers move?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(
                        [
                            "toDestination",
                            "fromDestination",
                            "duringTrip",
                        ] as const
                    ).map((key) => (
                        <div
                            key={key}
                            className="space-y-3 border-b pb-4 last:border-0 last:pb-0"
                        >
                            <Label className="text-base font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`transportation.${key}.mode`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mode</FormLabel>
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
                                                    <SelectItem value="flight">
                                                        Flight
                                                    </SelectItem>
                                                    <SelectItem value="train">
                                                        Train
                                                    </SelectItem>
                                                    <SelectItem value="bus">
                                                        Bus
                                                    </SelectItem>
                                                    <SelectItem value="car">
                                                        Car
                                                    </SelectItem>
                                                    <SelectItem value="ship">
                                                        Ship
                                                    </SelectItem>
                                                    <SelectItem value="boat">
                                                        Boat
                                                    </SelectItem>
                                                    <SelectItem value="walking">
                                                        Walking
                                                    </SelectItem>
                                                    <SelectItem value="mixed">
                                                        Mixed
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`transportation.${key}.details`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Details</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`transportation.${key}.included`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-full pt-6">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <FormLabel>Included</FormLabel>
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
                    <CardTitle>Package Location</CardTitle>
                    <CardDescription>
                        Where is this tour taking place?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="packageLocation.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Package Type</FormLabel>
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
                                        <SelectItem value="international">
                                            International
                                        </SelectItem>
                                        <SelectItem value="local">
                                            Local/Domestic
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="packageLocation.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.watch("packageLocation.type") === "local" && (
                            <FormField
                                control={form.control}
                                name="packageLocation.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State/Region</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select state" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {indianStates.map((state) => (
                                                    <SelectItem
                                                        key={state}
                                                        value={state}
                                                    >
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
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
