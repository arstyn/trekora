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
import { ArrowLeft, ArrowRight, CheckSquare, FileText, Plus, Trash2 } from "lucide-react";
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
            {/* Document Requirements Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Document Requirements</CardTitle>
                                <CardDescription className="text-xs">
                                    Specify required documents (Passports, Visas, Medical Certificates) for travelers
                                </CardDescription>
                            </div>
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
                            className="rounded-xl gap-1.5 text-xs font-semibold shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Document
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {documentFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-2xl p-4 space-y-3 bg-card/60 shadow-xs"
                        >
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    Document {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 text-xs gap-1"
                                    onClick={() => removeDocument(index)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`documentRequirements.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">Document Name</FormLabel>
                                            <FormControl>
                                                <Input className="rounded-xl h-10 text-xs" placeholder="e.g., Passport (6 months validity)" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`documentRequirements.${index}.applicableFor`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">
                                                Applicable For
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">All Travelers</SelectItem>
                                                    <SelectItem value="adults">Adults Only</SelectItem>
                                                    <SelectItem value="children">Children Only</SelectItem>
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
                                        <FormLabel className="text-xs font-medium">Description / Instructions</FormLabel>
                                        <FormControl>
                                            <Input className="rounded-xl h-10 text-xs" placeholder="e.g. Scanned copy of front and back page" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`documentRequirements.${index}.mandatory`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2.5 space-y-0 pt-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="rounded-md"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">Mandatory Requirement</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    {documentFields.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-xl bg-muted/20 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">No document requirements added.</p>
                            <p className="text-[11px] text-muted-foreground/70">Click "Add Document" above to specify required traveler documentation.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pre-Trip Checklist Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Pre-trip Checklist</CardTitle>
                                <CardDescription className="text-xs">
                                    Define tasks and verification steps prior to departure
                                </CardDescription>
                            </div>
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
                            className="rounded-xl gap-1.5 text-xs font-semibold shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Checklist Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {checklistFields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-2xl p-4 space-y-3 bg-card/60 shadow-xs"
                        >
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    Task Item {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 text-xs gap-1"
                                    onClick={() => removeChecklist(index)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`preTripChecklist.${index}.task`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">Task Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="rounded-xl h-10 text-xs"
                                                    placeholder="e.g. Verify Passport Validity"
                                                    {...field}
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
                                            <FormLabel className="text-xs font-medium">Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="documents">Documents</SelectItem>
                                                    <SelectItem value="booking">Booking</SelectItem>
                                                    <SelectItem value="preparation">Preparation</SelectItem>
                                                    <SelectItem value="communication">Communication</SelectItem>
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
                                            <FormLabel className="text-xs font-medium">Type Scope</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="common">Common (Per Booking Group)</SelectItem>
                                                    <SelectItem value="individual">Individual (Per Traveler)</SelectItem>
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
                                            <FormLabel className="text-xs font-medium">
                                                Due In (Days before trip)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="e.g. 7"
                                                    className="rounded-xl h-10 font-mono text-xs"
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
                                        <FormLabel className="text-xs font-medium">Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="rounded-xl h-10 text-xs"
                                                placeholder="Enter task details..."
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    {checklistFields.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-xl bg-muted/20 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">No pre-trip checklist items added.</p>
                            <p className="text-[11px] text-muted-foreground/70">Click "Add Checklist Item" above to specify pre-trip tasks.</p>
                        </div>
                    )}
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
