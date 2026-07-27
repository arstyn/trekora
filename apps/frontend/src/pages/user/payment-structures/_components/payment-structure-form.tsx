import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, X, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import paymentStructuresService from "@/services/payment-structures.service";

const milestoneSchema = z.object({
    name: z.string().min(1, "Milestone name is required"),
    amount: z.number().min(1, "Amount must be at least 1%").max(100, "Amount cannot exceed 100%"),
    description: z.string().optional(),
    dueDate: z.string().min(1, "Due date is required"),
});

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    milestones: z.array(milestoneSchema).min(1, "At least one milestone is required"),
}).refine(
    (data) => {
        const sum = data.milestones.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        return sum === 100;
    },
    {
        message: "The sum of milestone percentages must total exactly 100%",
        path: ["milestones"],
    }
);

type FormValues = z.infer<typeof formSchema>;

interface PaymentStructureFormProps {
    initialData?: {
        id: string;
        name: string;
        milestones: any[];
    };
    isInline?: boolean;
    onSuccess?: (newTemplate?: any) => void;
    onCancel?: () => void;
}

export default function PaymentStructureForm({
    initialData,
    onSuccess,
    onCancel,
}: PaymentStructureFormProps) {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            milestones: initialData?.milestones?.map((m) => ({
                name: m.name || "",
                amount: Number(m.amount) || 0,
                description: m.description || "",
                dueDate: m.dueDate || "booking",
            })) || [
                { name: "Booking Amount", amount: 20, description: "Initial deposit", dueDate: "booking" },
                { name: "Second Installment", amount: 80, description: "Balance payment", dueDate: "departure" }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "milestones",
    });

    const watchMilestones = form.watch("milestones") || [];
    const totalPercentage = watchMilestones.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true);
        try {
            // Sort milestones to set order before save
            const milestonesWithOrder = values.milestones.map((m, idx) => ({
                ...m,
                order: idx + 1,
            }));

            let result;
            if (initialData?.id) {
                result = await paymentStructuresService.updateTemplate(initialData.id, {
                    name: values.name,
                    milestones: milestonesWithOrder,
                });
                toast.success("Payment structure template updated successfully");
            } else {
                result = await paymentStructuresService.createTemplate({
                    name: values.name,
                    milestones: milestonesWithOrder,
                });
                toast.success("Payment structure template created successfully");
            }

            if (onSuccess) {
                onSuccess(result);
            } else {
                navigate("/payment-structures");
            }
        } catch (error: any) {
            console.error("Error saving template:", error);
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
                                <Input placeholder="e.g. Standard 50-50 Schedule" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b">
                        <div>
                            <h3 className="font-bold text-lg">Milestones</h3>
                            <p className="text-xs text-muted-foreground">Define payment breakdown milestones</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-muted-foreground">Total:</span>
                            <Badge variant={totalPercentage === 100 ? "default" : "destructive"}>
                                {totalPercentage}% / 100%
                            </Badge>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => append({ name: "", amount: 0, description: "", dueDate: "booking" })}
                                className="cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Milestone
                            </Button>
                        </div>
                    </div>

                    {form.formState.errors.milestones?.root && (
                        <p className="text-sm font-semibold text-destructive">{form.formState.errors.milestones.root.message}</p>
                    )}

                    <div className="space-y-4">
                        {fields.map((field, index) => {
                            return (
                                <div key={field.id} className="p-4 border rounded-xl bg-card/25 backdrop-blur-sm relative space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Milestone {index + 1}
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`milestones.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Milestone Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Booking Deposit" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`milestones.${index}.amount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Percentage (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="e.g. 50"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`milestones.${index}.dueDate`}
                                            render={({ field }) => {
                                                const standardDueDates = ["booking", "30_days_before", "2_weeks_before", "1_week_before", "departure"];
                                                const isCustom = field.value !== undefined && !standardDueDates.includes(field.value);
                                                const selectValue = isCustom ? "custom" : (field.value || "booking");

                                                return (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Due Date</FormLabel>
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
                                                                    <SelectValue placeholder="Select due date" />
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
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`milestones.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Non-refundable advance" {...field} />
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

                {totalPercentage !== 100 && (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2 font-medium">
                        <Info className="h-4 w-4" />
                        <span>The current milestone amounts sum up to {totalPercentage}%. To save, they must total exactly 100%.</span>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                navigate("/payment-structures");
                            }
                        }}
                        disabled={submitting}
                        className="cursor-pointer"
                    >
                        <X className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || totalPercentage !== 100} className="cursor-pointer bg-primary">
                        <Save className="mr-1.5 h-4 w-4" /> {initialData?.id ? "Update Template" : "Save Template"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
