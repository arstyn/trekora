import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import cancellationTiersService from "@/services/cancellation-tiers.service";

const tierSchema = z.object({
    timeframe: z.string().min(1, "Timeframe is required"),
    amount: z.number().min(0, "Amount must be at least 0%").max(100, "Amount cannot exceed 100%"),
    description: z.string().optional(),
});

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    tiers: z.array(tierSchema).min(1, "At least one cancellation tier is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CancellationTierFormProps {
    initialData?: {
        id: string;
        name: string;
        tiers: any[];
    };
    isInline?: boolean;
    onSuccess?: (newTemplate?: any) => void;
    onCancel?: () => void;
}

export default function CancellationTierForm({
    initialData,
    onSuccess,
    onCancel,
}: CancellationTierFormProps) {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            tiers: initialData?.tiers?.map((t) => ({
                timeframe: t.timeframe || "",
                amount: Number(t.amount) || 0,
                description: t.description || "",
            })) || [
                { timeframe: "30_days_before", amount: 10, description: "Low cancellation fee" },
                { timeframe: "departure", amount: 100, description: "Full charge" }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tiers",
    });

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true);
        try {
            let result;
            if (initialData?.id) {
                result = await cancellationTiersService.updateTemplate(initialData.id, values);
                toast.success("Cancellation tier template updated successfully");
            } else {
                result = await cancellationTiersService.createTemplate(values);
                toast.success("Cancellation tier template created successfully");
            }

            if (onSuccess) {
                onSuccess(result);
            } else {
                navigate("/cancellation-tiers");
            }
        } catch (error: any) {
            console.error("Error saving cancellation template:", error);
            const msg = error.response?.data?.message || "Failed to save template";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Template Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Standard Strict Cancellation" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <div>
                            <h3 className="font-bold text-lg">Cancellation Policy Tiers</h3>
                            <p className="text-xs text-muted-foreground">Define fees charged based on cancellation timeframe</p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => append({ timeframe: "30_days_before", amount: 0, description: "" })}
                            className="cursor-pointer"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Tier
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => {
                            return (
                                <div key={field.id} className="p-4 border rounded-xl bg-card/25 backdrop-blur-sm relative space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Tier {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            disabled={fields.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`tiers.${index}.timeframe`}
                                            render={({ field }) => {
                                                const standardTimeframes = ["30_days_before", "2_weeks_before", "1_week_before", "departure"];
                                                const isCustom = field.value !== undefined && !standardTimeframes.includes(field.value);
                                                const selectValue = isCustom ? "custom" : (field.value || "30_days_before");

                                                return (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Timeframe</FormLabel>
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
                                                                    <SelectValue placeholder="Select timeframe" />
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
                                                                className="mt-2 text-xs h-9"
                                                                value={isCustom ? field.value : ""}
                                                                onChange={(e) => field.onChange(e.target.value)}
                                                            />
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`tiers.${index}.amount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Charge Percentage (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="e.g. 100"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Full package price forfeiture" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                navigate("/cancellation-tiers");
                            }
                        }}
                        disabled={submitting}
                        className="cursor-pointer"
                    >
                        <X className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="cursor-pointer bg-primary">
                        <Save className="mr-1.5 h-4 w-4" /> {initialData?.id ? "Update Template" : "Save Template"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
