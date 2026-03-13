import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { PackageFormData } from "@/types/package.schema";
import { useState } from "react";

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
            <Card>
                <CardHeader>
                    <CardTitle>Inclusions</CardTitle>
                    <CardDescription>
                        What's included in this tour package?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add inclusion..."
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
                            variant="secondary"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(form.watch("inclusions") || []).map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <Input value={item} readOnly />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInclusion(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exclusions</CardTitle>
                    <CardDescription>
                        What's NOT included in this tour package?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add exclusion..."
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
                            variant="secondary"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(form.watch("exclusions") || []).map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <Input value={item} readOnly />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExclusion(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
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
