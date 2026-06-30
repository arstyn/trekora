import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ChefHat, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mealFormSchema, type MealFormData, type IMeal } from "@/types/meals.types";
import mealsService from "@/services/meals.service";

interface MealFormProps {
    initialData?: IMeal | null;
    isEditing?: boolean;
}

interface SectionItemsProps {
    control: any;
    name: "breakfast" | "lunch" | "dinner";
    label: string;
}

const SectionItems: React.FC<SectionItemsProps> = ({ control, name, label }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold capitalize text-foreground">{label} List</h3>
                    <p className="text-xs text-muted-foreground">Add items, matching curries, and prices for {label}</p>
                </div>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed hover:border-primary hover:text-primary transition-all duration-200"
                    onClick={() => append({ name: "", curry: "", price: undefined })}
                >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add {label} Item
                </Button>
            </div>

            {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-muted rounded-xl bg-muted/10 text-center">
                    <ChefHat className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">No items added to {label} yet.</p>
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-xs text-primary"
                        onClick={() => append({ name: "", curry: "", price: undefined })}
                    >
                        Click here to add one
                    </Button>
                </div>
            ) : (
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex gap-4 items-end bg-card/50 p-4 rounded-xl border border-muted hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
                        >
                            <div className="flex-1 min-w-0">
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-semibold">Item Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-9 transition-all duration-200 focus:ring-1 focus:ring-primary"
                                                    placeholder="e.g. Chapathi, Porota, Appam"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.curry`}
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-semibold">Curry / Side (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-9 transition-all duration-200 focus:ring-1 focus:ring-primary"
                                                    placeholder="e.g. Veg Kurma, Chicken Curry"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-28 shrink-0">
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-semibold">Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="h-9 transition-all duration-200 focus:ring-1 focus:ring-primary"
                                                    placeholder="e.g. 50"
                                                    {...field}
                                                    value={field.value === 0 ? "" : (field.value ?? "")}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 rounded-lg"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const MealForm: React.FC<MealFormProps> = ({ initialData, isEditing = false }) => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = React.useState(false);

    const form = useForm<any>({
        resolver: zodResolver(mealFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            type: initialData?.type || "veg",
            breakfast: initialData?.breakfast || [],
            lunch: initialData?.lunch || [],
            dinner: initialData?.dinner || [],
        },
    });

    const onSubmit = async (data: MealFormData) => {
        try {
            setSubmitting(true);
            if (isEditing && initialData) {
                await mealsService.updateMeal(initialData.id, data);
                toast.success("Meal option updated successfully");
            } else {
                await mealsService.createMeal(data);
                toast.success("Meal option created successfully");
            }
            navigate("/meals");
        } catch (error: any) {
            console.error("Error saving meal:", error);
            const message = error.response?.data?.message || "Failed to save meal option";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/meals")}
                            className="rounded-full hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEditing ? "Edit Meal Option" : "Create Meal Option"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isEditing ? "Modify the existing meal details and sections" : "Configure a new standard meal option for packages"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="border border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                            <CardDescription>Enter a recognizable name and type for this meal combo</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Meal Option Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                placeholder="e.g. Daily South Indian Menu, Premium North Indian Menu"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Meal Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "veg"}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 text-base">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="veg">Veg</SelectItem>
                                                <SelectItem value="non-veg">Non-Veg</SelectItem>
                                                <SelectItem value="all">All (Mixed)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Meal Sections</CardTitle>
                            <CardDescription>Organize items for breakfast, lunch, and dinner separately</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="breakfast" className="w-full space-y-4">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                                </TabsList>
                                <TabsContent value="breakfast" className="mt-0 focus-visible:outline-none">
                                    <SectionItems control={form.control} name="breakfast" label="breakfast" />
                                </TabsContent>
                                <TabsContent value="lunch" className="mt-0 focus-visible:outline-none">
                                    <SectionItems control={form.control} name="lunch" label="lunch" />
                                </TabsContent>
                                <TabsContent value="dinner" className="mt-0 focus-visible:outline-none">
                                    <SectionItems control={form.control} name="dinner" label="dinner" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-muted">
                        <Button type="button" variant="outline" onClick={() => navigate("/meals")} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[120px]">
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 mr-2 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
