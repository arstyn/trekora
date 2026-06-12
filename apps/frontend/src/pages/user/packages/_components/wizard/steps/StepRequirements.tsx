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

    const {
        fields: checklistFields,
        append: appendChecklist,
        remove: removeChecklist,
    } = useFieldArray({
        control: form.control,
        name: "preTripChecklist",
    });

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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Pre-trip Checklist</CardTitle>
                            <CardDescription>
                                Common tasks to be completed before the trip.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                appendChecklist({
                                    task: "",
                                    description: "",
                                    category: "documents",
                                    type: "common",
                                    dueDate: "",
                                })
                            }
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {checklistFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                    Item {index + 1}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeChecklist(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`preTripChecklist.${index}.task`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Task</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter task name"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`preTripChecklist.${index}.category`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
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
                                                    <SelectItem value="documents">
                                                        Documents
                                                    </SelectItem>
                                                    <SelectItem value="booking">
                                                        Booking
                                                    </SelectItem>
                                                    <SelectItem value="preparation">
                                                        Preparation
                                                    </SelectItem>
                                                    <SelectItem value="communication">
                                                        Communication
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`preTripChecklist.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
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
                                                    <SelectItem value="common">
                                                        Common (Per Booking)
                                                    </SelectItem>
                                                    <SelectItem value="individual">
                                                        Individual (Per
                                                        Traveler)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`preTripChecklist.${index}.dueDate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Due In (Days before trip)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Optional"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`preTripChecklist.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter task description"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    {checklistFields.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                                No pre-trip checklist items added yet.
                            </p>
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
