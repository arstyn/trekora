import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { IPackages, PackageFormData } from "@/types/package.schema";
import {
    AlertCircle,
    Archive,
    CheckCircle2,
    Eye,
    FileEdit,
    Loader2,
    Rocket,
    RotateCcw,
    Trash2,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";

const FIELD_STEP_MAPPING: Record<string, { field: string; stepIndex: number }> = {
    name: { field: "Name", stepIndex: 0 },
    destination: { field: "Destination", stepIndex: 0 },
    days: { field: "Days", stepIndex: 0 },
    nights: { field: "Nights", stepIndex: 0 },
    basePrice: { field: "Base Price", stepIndex: 0 },
    description: { field: "Description", stepIndex: 0 },
    maxGuests: { field: "Max Guests", stepIndex: 0 },
    category: { field: "Category", stepIndex: 0 },
    thumbnail: { field: "Thumbnail", stepIndex: 0 },
    packageLocation: { field: "Location", stepIndex: 0 },
    itinerary: { field: "Itinerary", stepIndex: 1 },
    inclusions: { field: "Inclusions", stepIndex: 2 },
    exclusions: { field: "Exclusions", stepIndex: 2 },
    transportation: { field: "Transportation", stepIndex: 3 },
    mealsBreakdown: { field: "Meals Breakdown", stepIndex: 3 },
    paymentStructure: { field: "Payment Structure", stepIndex: 4 },
    cancellationStructure: { field: "Cancellation Structure", stepIndex: 4 },
    cancellationPolicy: { field: "Cancellation Policy", stepIndex: 4 },
    documentRequirements: { field: "Document Requirements", stepIndex: 5 },
    preTripChecklist: { field: "Pre-trip Checklist", stepIndex: 5 },
};

interface StepReviewProps {
    form: UseFormReturn<PackageFormData>;
    onBack: () => void;
    onPublish: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onUnpublish: () => void;
    onJumpToStep?: (stepIndex: number) => void;
    isLoading?: boolean;
    packageData?: IPackages | null;
}

export function StepReview({
    form,
    onBack,
    onPublish,
    onDelete,
    onArchive,
    onUnpublish,
    onJumpToStep,
    isLoading,
    packageData,
}: StepReviewProps) {
    const values = form.getValues();

    useEffect(() => {
        form.trigger();
    }, [form]);

    const getChanges = () => {
        if (!packageData) return [];
        const changes: { field: string; from: any; to: any }[] = [];

        const safeArray = (val: any): any[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) return parsed;
                } catch (_) {}
            }
            return [];
        };

        const compareSimple = (key: keyof PackageFormData, label: string) => {
            const current = values[key];
            let original = (packageData as any)[key];

            // Normalize
            if (key === "maxGuests") original = Number(original) || 0;

            if (current !== original && original !== undefined) {
                // Ignore if both are empty-ish
                if (!current && !original) return;
                changes.push({ field: label, from: original, to: current });
            }
        };

        const compareArray = (key: keyof PackageFormData, label: string) => {
            const current = (values[key] as any[]) || [];
            let originalRaw = safeArray((packageData as any)[key]);
            let original: any[] = [];

            if (key === "inclusions" || key === "exclusions") {
                original =
                    originalRaw.map((item) =>
                        typeof item === "object" ? item.item : item,
                    );
            } else if (key === "cancellationPolicy") {
                original =
                    originalRaw.map((item) =>
                        typeof item === "object" ? item.text : item,
                    );
            } else {
                original = originalRaw;
            }

            if (JSON.stringify(current) !== JSON.stringify(original)) {
                changes.push({
                    field: label,
                    from: `${original.length} items`,
                    to: `${current.length} items`,
                });
            }
        };

        const compareItinerary = () => {
            const current = values.itinerary || [];
            const original = safeArray(packageData.itinerary);
            if (current.length !== original.length) {
                changes.push({
                    field: "Itinerary",
                    from: `${original.length} Days`,
                    to: `${current.length} Days`,
                });
            } else {
                // Deep check for changes in existing days
                const changed = current.some((day, idx) => {
                    const orig = original[idx];
                    return (
                        day.title !== orig.title ||
                        day.description !== orig.description ||
                        JSON.stringify(day.activities) !==
                            JSON.stringify(orig.activities)
                    );
                });
                if (changed) {
                    changes.push({
                        field: "Itinerary Details",
                        from: "Original",
                        to: "Modified",
                    });
                }
            }
        };

        compareSimple("name", "Name");
        compareSimple("destination", "Destination");
        compareSimple("days", "Days");
        compareSimple("nights", "Nights");
        compareSimple("description", "Description");
        compareSimple("maxGuests", "Max Guests");
        compareSimple("category", "Category");

        compareArray("inclusions", "Inclusions");
        compareArray("exclusions", "Exclusions");
        compareArray("cancellationPolicy", "Cancellation Policies");
        compareArray("paymentStructure", "Payment Structure");
        compareArray("cancellationStructure", "Cancellation Structure");
        compareArray("documentRequirements", "Document Requirements");
        compareArray("preTripChecklist", "Pre-trip Checklist");
        compareArray("packageTiers", "Package Tiers");
        compareArray("additionalCosts", "Additional Costs");

        compareItinerary();

        // Object types
        const compareObject = (key: keyof PackageFormData, label: string) => {
            const current = values[key];
            const original = (packageData as any)[key];
            if (JSON.stringify(current) !== JSON.stringify(original)) {
                changes.push({
                    field: label,
                    from: "Original",
                    to: "Modified",
                });
            }
        };

        compareObject("packageLocation", "Location");
        compareObject("transportation", "Transportation");
        compareObject("mealsBreakdown", "Meals Breakdown");

        return changes;
    };

    const pendingChanges = getChanges();

    const getZodErrors = () => {
        const { errors } = form.formState;
        const zodIssues: {
            field: string;
            message: string;
            severity: "error" | "warning";
            stepIndex: number;
        }[] = [];

        const collectErrors = (obj: any, parentKey: string) => {
            if (!obj) return;
            if (typeof obj.message === "string") {
                const mapping = FIELD_STEP_MAPPING[parentKey];
                zodIssues.push({
                    field: mapping?.field || parentKey,
                    message: obj.message,
                    severity: "error",
                    stepIndex: mapping?.stepIndex ?? 0,
                });
                return;
            }
            if (Array.isArray(obj)) {
                obj.forEach((item) => collectErrors(item, parentKey));
            } else if (typeof obj === "object") {
                Object.keys(obj).forEach((key) => {
                    const nextKey = FIELD_STEP_MAPPING[key] ? key : parentKey;
                    collectErrors(obj[key], nextKey);
                });
            }
        };

        Object.keys(errors).forEach((key) => {
            collectErrors(errors[key as keyof typeof errors], key);
        });

        if (errors.root?.message) {
            zodIssues.push({
                field: "Global",
                message: errors.root.message,
                severity: "error",
                stepIndex: 0,
            });
        }

        return zodIssues;
    };

    const zodIssues = getZodErrors();
    const manualIssues: {
        field: string;
        message: string;
        severity: "error" | "warning";
        stepIndex: number;
    }[] = [];

    if (!values.name)
        manualIssues.push({
            field: "Name",
            message: "Package name is missing",
            severity: "error",
            stepIndex: 0,
        });
    if (!values.packageTiers || values.packageTiers.length === 0)
        manualIssues.push({
            field: "Package Tiers",
            message: "At least one package tier must be defined",
            severity: "error",
            stepIndex: 4,
        });
    if (!values.destination)
        manualIssues.push({
            field: "Destination",
            message: "Destination is missing",
            severity: "error",
            stepIndex: 0,
        });
    if (!values.description)
        manualIssues.push({
            field: "Description",
            message: "Description is missing",
            severity: "warning",
            stepIndex: 0,
        });
    if (!values.itinerary || values.itinerary.length === 0)
        manualIssues.push({
            field: "Itinerary",
            message: "At least one day in itinerary is required",
            severity: "error",
            stepIndex: 1,
        });

    const totalMilestones = (values.paymentStructure || []).reduce(
        (sum, m) => sum + (m.amount || 0),
        0,
    );
    if (values.packageTiers && values.packageTiers.length > 0) {
        const firstTierAdultCost = values.packageTiers[0].adultCost || 0;
        if (totalMilestones !== firstTierAdultCost) {
            manualIssues.push({
                field: "Payments",
                message: `Milestone total (₹${totalMilestones}) doesn't match the first tier adult cost (₹${firstTierAdultCost})`,
                severity: "error",
                stepIndex: 4,
            });
        }
    }

    // Combine and deduplicate
    const issues = [...zodIssues];
    manualIssues.forEach((m) => {
        const isDuplicate = issues.some(
            (i) => i.field.toLowerCase() === m.field.toLowerCase() || i.message === m.message
        );
        if (!isDuplicate) {
            issues.push(m);
        }
    });

    const hasErrors = issues.some((i) => i.severity === "error");

    return (
        <div className="space-y-6">
            <Card
                className={
                    hasErrors
                        ? "border-red-200 bg-red-50/10"
                        : "border-green-200 bg-green-50/10"
                }
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {hasErrors ? (
                            <AlertCircle className="text-red-500" />
                        ) : (
                            <CheckCircle2 className="text-green-500" />
                        )}
                        Review Package Status
                    </CardTitle>
                    <CardDescription>
                        {hasErrors
                            ? "Please fix the following errors before publishing."
                            : "Your package is ready to be published!"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {issues.length > 0 ? (
                        <div className="space-y-3">
                            {issues.map((issue, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                                        issue.severity === "error"
                                            ? "border-red-100 bg-red-50/50 text-red-800 dark:text-red-400 dark:border-red-900/50 dark:bg-red-950/10"
                                            : "border-yellow-100 bg-yellow-50/50 text-yellow-800 dark:text-yellow-400 dark:border-yellow-900/50 dark:bg-yellow-950/10"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {issue.field}
                                            </p>
                                            <p className="text-sm opacity-90">
                                                {issue.message}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onJumpToStep?.(issue.stepIndex)}
                                        className="gap-1 shrink-0 bg-background hover:bg-muted text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                                    >
                                        <FileEdit className="w-4 h-4" />
                                        Edit
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center">
                            <Rocket className="w-12 h-12 text-primary mb-2 animate-bounce" />
                            <p className="font-medium text-lg">
                                All checks passed!
                            </p>
                            <p className="text-muted-foreground">
                                You can now publish this package to make it
                                visible to customers.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {pendingChanges.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/10">
                    <CardHeader>
                        <CardTitle className="text-amber-700 text-lg flex items-center gap-2">
                            <FileEdit className="w-5 h-5" />
                            Pending Changes
                        </CardTitle>
                        <CardDescription>
                            The following modifications will be saved when you
                            publish.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                            {pendingChanges.map((change, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm p-2 rounded border"
                                >
                                    <span className="font-medium text-amber-700">
                                        {change.field}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 line-through truncate max-w-[150px]">
                                            {String(change.from || "Empty")}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-amber-700 font-medium truncate max-w-[150px]">
                                            {String(change.to || "Empty")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">
                                {values.name || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Destination
                            </span>
                            <span className="font-medium">
                                {values.destination || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Price (Starting from)</span>
                            <Badge variant="outline" className="text-base">
                                ₹{values.packageTiers?.[0]?.adultCost || 0}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Duration
                            </span>
                            <span className="font-medium">
                                {values.days ? `${values.days} Days / ${values.nights} Nights` : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <Badge
                                variant={
                                    packageData?.status === "published"
                                        ? "default"
                                        : packageData?.status === "edited"
                                          ? "outline"
                                          : "secondary"
                                }
                                className={`capitalize ${
                                    packageData?.status === "edited"
                                        ? "border-amber-500 text-amber-600 bg-amber-50"
                                        : ""
                                }`}
                            >
                                {packageData?.status || "Draft"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Itinerary
                            </span>
                            <span>{values.itinerary?.length || 0} Days</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Inclusions
                            </span>
                            <span>{values.inclusions?.length || 0} Items</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Exclusions
                            </span>
                            <span>{values.exclusions?.length || 0} Items</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Documents
                            </span>
                            <span>
                                {values.documentRequirements?.length || 0}{" "}
                                Required
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Checklist Items
                            </span>
                            <span>
                                {values.preTripChecklist?.length || 0} Items
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>

                <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                    {/* Management Actions based on status */}
                    {packageData?.status === "draft" && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Draft
                        </Button>
                    )}

                    {(packageData?.status === "published" ||
                        packageData?.status === "edited") && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onUnpublish}
                                disabled={isLoading}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {packageData?.status === "edited"
                                    ? "Discard Changes"
                                    : "Unpublish"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onArchive}
                                disabled={isLoading}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                            </Button>
                        </>
                    )}

                    {packageData?.status === "archived" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onUnpublish} // Moving archived back to draft
                            disabled={isLoading}
                        >
                            <FileEdit className="w-4 h-4 mr-2" />
                            Move to Draft
                        </Button>
                    )}

                    <div className="h-8 w-px bg-border mx-1 hidden md:block" />

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            window.open(
                                `/packages/${packageData?.id}`,
                                "_blank",
                            )
                        }
                        disabled={!packageData?.id}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>

                    {(packageData?.status === "draft" ||
                        packageData?.status === "published" ||
                        packageData?.status === "edited") && (
                        <Button
                            type="button"
                            onClick={onPublish}
                            disabled={isLoading || hasErrors}
                            className="bg-primary hover:bg-primary/90 min-w-[120px]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Rocket className="w-4 h-4 mr-2" />
                            )}
                            {packageData?.status === "published" ||
                            packageData?.status === "edited"
                                ? "Publish Changes"
                                : "Publish Now"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
