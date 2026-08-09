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

interface StepReviewProps {
    form: UseFormReturn<PackageFormData>;
    onBack: () => void;
    onPublish: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onUnpublish: () => void;
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
    isLoading,
    packageData,
}: StepReviewProps) {
    const values = form.getValues();

    const getChanges = () => {
        if (!packageData) return [];
        const changes: { field: string; from: any; to: any }[] = [];

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
            const current = Array.isArray(values[key]) ? (values[key] as any[]) : [];
            let originalRaw = (packageData as any)[key];
            let original: any[] = [];

            if (key === "inclusions" || key === "exclusions") {
                original = Array.isArray(originalRaw) ?
                    originalRaw.map((item) =>
                        typeof item === "object" && item !== null ? item.item : item,
                    ) : [];
            } else if (key === "cancellationPolicy") {
                original = Array.isArray(originalRaw) ?
                    originalRaw.map((item) =>
                        typeof item === "object" && item !== null ? item.text : item,
                    ) : [];
            } else {
                original = Array.isArray(originalRaw) ? originalRaw : [];
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
            const original = packageData.itinerary || [];
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

    // Basic validation for review
    const issues: {
        field: string;
        message: string;
        severity: "error" | "warning";
    }[] = [];

    if (!values.name)
        issues.push({
            field: "Name",
            message: "Package name is missing",
            severity: "error",
        });
    if (!values.packageTiers || values.packageTiers.length === 0)
        issues.push({
            field: "Package Tiers",
            message: "At least one package tier must be defined",
            severity: "error",
        });
    if (!values.destination)
        issues.push({
            field: "Destination",
            message: "Destination is missing",
            severity: "error",
        });
    if (!values.description)
        issues.push({
            field: "Description",
            message: "Description is missing",
            severity: "warning",
        });
    if (!values.itinerary || values.itinerary.length === 0)
        issues.push({
            field: "Itinerary",
            message: "At least one day in itinerary is required",
            severity: "error",
        });

    const totalMilestones = (values.paymentStructure || []).reduce(
        (sum, m) => sum + (m.amount || 0),
        0,
    );
    if (values.paymentStructure && values.paymentStructure.length > 0) {
        if (totalMilestones !== 100) {
            issues.push({
                field: "Payments",
                message: `Milestone percentages total ${totalMilestones}%, but must equal exactly 100%.`,
                severity: "error",
            });
        }
    }

    const hasErrors = issues.some((i) => i.severity === "error");

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            <Card
                className={`shadow-xs border rounded-2xl ${
                    hasErrors
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-emerald-500/30 bg-emerald-500/5"
                }`}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                        {hasErrors ? (
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        <span>Review Package Readiness</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {hasErrors
                            ? "Please resolve the highlighted validation errors before publishing."
                            : "All mandatory fields and cost structures are complete! Ready to publish."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {issues.length > 0 ? (
                        <div className="space-y-2.5">
                            {issues.map((issue, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                                        issue.severity === "error"
                                            ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    }`}
                                >
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-bold">
                                            {issue.field}
                                        </p>
                                        <p className="text-[11px] opacity-90">
                                            {issue.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                                <Rocket className="w-8 h-8 animate-bounce" />
                            </div>
                            <p className="font-bold text-base text-foreground">
                                All Systems Go!
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-md">
                                Your tour package is fully configured. Publish now to make it visible to clients and available for booking.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pending Changes Block */}
            {pendingChanges.length > 0 && (
                <Card className="shadow-xs border border-amber-500/30 bg-amber-500/5 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-amber-700 dark:text-amber-400 text-base font-bold flex items-center gap-2">
                            <FileEdit className="w-4 h-4" />
                            Pending Changes Summary
                        </CardTitle>
                        <CardDescription className="text-xs">
                            The following modifications will be published live to the catalog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                            {pendingChanges.map((change, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10"
                                >
                                    <span className="font-semibold text-amber-800 dark:text-amber-300">
                                        {change.field}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground line-through truncate max-w-[140px] text-[11px]">
                                            {String(change.from || "Empty")}
                                        </span>
                                        <span className="text-muted-foreground text-[10px]">→</span>
                                        <span className="text-amber-700 dark:text-amber-300 font-bold truncate max-w-[140px]">
                                            {String(change.to || "Empty")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-xs border rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Package Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-bold text-foreground">
                                {values.name || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Destination
                            </span>
                            <span className="font-bold text-foreground">
                                {values.destination || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Base Adult Price</span>
                            <Badge variant="outline" className="text-xs font-mono font-bold border-primary/30 text-primary rounded-md">
                                ₹{(values.packageTiers?.[0]?.adultCost || 0).toLocaleString()}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Duration
                            </span>
                            <span className="font-semibold text-foreground">
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
                                className={`capitalize text-xs font-semibold rounded-md ${
                                    packageData?.status === "edited"
                                        ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                                        : ""
                                }`}
                            >
                                {packageData?.status || "Draft"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Content Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Itinerary Days
                            </span>
                            <span className="font-semibold">{values.itinerary?.length || 0} Days</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Inclusions
                            </span>
                            <span className="font-semibold">{values.inclusions?.length || 0} Items</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Exclusions
                            </span>
                            <span className="font-semibold">{values.exclusions?.length || 0} Items</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">
                                Document Requirements
                            </span>
                            <span className="font-semibold">
                                {values.documentRequirements?.length || 0} Required
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Checklist Tasks
                            </span>
                            <span className="font-semibold">
                                {values.preTripChecklist?.length || 0} Tasks
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="rounded-xl px-5 text-xs font-semibold"
                >
                    Back
                </Button>

                <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
                    {packageData?.status === "draft" && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isLoading}
                            className="rounded-xl text-xs font-semibold gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
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
                                className="rounded-xl text-xs font-semibold gap-1.5 border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {packageData?.status === "edited"
                                    ? "Discard Changes"
                                    : "Unpublish"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onArchive}
                                disabled={isLoading}
                                className="rounded-xl text-xs font-semibold gap-1.5"
                            >
                                <Archive className="w-4 h-4" />
                                Archive
                            </Button>
                        </>
                    )}

                    {packageData?.status === "archived" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onUnpublish}
                            disabled={isLoading}
                            className="rounded-xl text-xs font-semibold gap-1.5"
                        >
                            <FileEdit className="w-4 h-4" />
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
                        className="rounded-xl text-xs font-semibold gap-1.5"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>

                    {(packageData?.status === "draft" ||
                        packageData?.status === "published" ||
                        packageData?.status === "edited") && (
                        <Button
                            type="button"
                            onClick={onPublish}
                            disabled={isLoading || hasErrors}
                            className="rounded-xl px-6 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Rocket className="w-4 h-4" />
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
