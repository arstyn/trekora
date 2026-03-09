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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

interface StepRequirementsProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function StepRequirements({
    form,
    onNext,
    onBack,
    isLoading,
}: StepRequirementsProps) {
    const {
        fields: documentFields,
        append: appendDocument,
        remove: removeDocument,
    } = useFieldArray({
        control: form.control,
        name: "documentRequirements",
    });

    const [newChecklistItem, setNewChecklistItem] = useState("");

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        const current = form.getValues("preTripChecklist") || [];
        form.setValue("preTripChecklist", [
            ...current,
            {
                task: newChecklistItem.trim(),
                description: "",
                category: "preparation",
                type: "common",
                dueDate: "departure",
                completed: false,
            },
        ]);
        setNewChecklistItem("");
    };

    const removeChecklistItem = (index: number) => {
        const current = form.getValues("preTripChecklist") || [];
        form.setValue(
            "preTripChecklist",
            current.filter((_, i) => i !== index),
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Document Requirements</CardTitle>
                            <CardDescription>
                                What documents do travelers need?
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                appendDocument({
                                    name: "",
                                    description: "",
                                    mandatory: true,
                                    applicableFor: "all",
                                })
                            }
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Document
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {documentFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                    Document {index + 1}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`documentRequirements.${index}.name`}
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
                                    name={`documentRequirements.${index}.applicableFor`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Applicable For
                                            </FormLabel>
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
                                                    <SelectItem value="all">
                                                        All Travelers
                                                    </SelectItem>
                                                    <SelectItem value="adults">
                                                        Adults Only
                                                    </SelectItem>
                                                    <SelectItem value="children">
                                                        Children Only
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`documentRequirements.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`documentRequirements.${index}.mandatory`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel>Mandatory</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pre-trip Checklist</CardTitle>
                    <CardDescription>
                        Items travelers should check before leaving
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add checklist item..."
                            value={newChecklistItem}
                            onChange={(e) =>
                                setNewChecklistItem(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addChecklistItem();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={addChecklistItem}
                            variant="secondary"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(form.watch("preTripChecklist") || []).map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-center p-2 border rounded-md"
                                >
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="flex-1 text-sm">
                                        {item.task}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            removeChecklistItem(index)
                                        }
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
