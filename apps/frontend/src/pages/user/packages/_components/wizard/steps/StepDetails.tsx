import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PackageFormData } from "@/types/package.schema";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

interface StepDetailsProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function StepDetails({
    form,
    onNext,
    onBack,
    isLoading,
}: StepDetailsProps) {
    const [newInclusion, setNewInclusion] = useState("");
    const [newExclusion, setNewExclusion] = useState("");

    const addInclusion = () => {
        if (!newInclusion.trim()) return;
        const current = form.getValues("inclusions") || [];
        form.setValue("inclusions", [...current, newInclusion.trim()]);
        setNewInclusion("");
    };

    const removeInclusion = (index: number) => {
        const current = form.getValues("inclusions") || [];
        form.setValue(
            "inclusions",
            current.filter((_, i) => i !== index),
        );
    };

    const addExclusion = () => {
        if (!newExclusion.trim()) return;
        const current = form.getValues("exclusions") || [];
        form.setValue("exclusions", [...current, newExclusion.trim()]);
        setNewExclusion("");
    };

    const removeExclusion = (index: number) => {
        const current = form.getValues("exclusions") || [];
        form.setValue(
            "exclusions",
            current.filter((_, i) => i !== index),
        );
    };



    return (
        <div className="space-y-6">
            {/* Inclusions Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Package Inclusions</CardTitle>
                            <CardDescription className="text-xs">
                                What services, amenities, and tickets are included in this tour?
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add inclusion (e.g. Airport Transfers, Breakfast, Guided Tour)..."
                            className="rounded-xl h-10 text-xs"
                            value={newInclusion}
                            onChange={(e) => setNewInclusion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addInclusion();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={addInclusion}
                            className="rounded-xl px-4 gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>
                    {newInclusion.trim().length > 0 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                            ⚠️ You have typed an inclusion. Remember to click "+ Add" to save it.
                        </p>
                    )}
                    <div className="space-y-2">
                        {(form.watch("inclusions") || []).map((item, index) => (
                            <div key={index} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1 font-medium text-foreground">{item}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                                    onClick={() => removeInclusion(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {(form.watch("inclusions") || []).length === 0 && (
                            <p className="text-xs text-muted-foreground italic text-center py-4 border border-dashed rounded-xl">
                                No inclusions added yet.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Exclusions Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <X className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Package Exclusions</CardTitle>
                            <CardDescription className="text-xs">
                                What is explicitly NOT included (e.g. Personal Expenses, Flight surcharges)?
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add exclusion (e.g. Personal Expenses, Visa Fees)..."
                            className="rounded-xl h-10 text-xs"
                            value={newExclusion}
                            onChange={(e) => setNewExclusion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addExclusion();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={addExclusion}
                            className="rounded-xl px-4 gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>
                    {newExclusion.trim().length > 0 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                            ⚠️ You have typed an exclusion. Remember to click "+ Add" to save it.
                        </p>
                    )}
                    <div className="space-y-2">
                        {(form.watch("exclusions") || []).map((item, index) => (
                            <div key={index} className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                                <div className="p-1 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1 font-medium text-foreground">{item}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                                    onClick={() => removeExclusion(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {(form.watch("exclusions") || []).length === 0 && (
                            <p className="text-xs text-muted-foreground italic text-center py-4 border border-dashed rounded-xl">
                                No exclusions added yet.
                            </p>
                        )}
                    </div>
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
