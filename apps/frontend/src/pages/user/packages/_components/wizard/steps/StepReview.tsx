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
import { useMemo } from "react";
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
    initialPackageData?: IPackages | null;
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
    initialPackageData,
}: StepReviewProps) {
    const values = form.getValues();

    const getChanges = () => {
        const compareTarget = initialPackageData || packageData;
        if (!compareTarget) return [];

        type DiffType = 'add' | 'remove' | 'info';
        type DiffLine = { type: DiffType; text: string };
        const changes: { field: string; diffs: DiffLine[] }[] = [];

        const safeParse = (val: any) => {
            if (typeof val === 'string') {
                try {
                    return JSON.parse(val);
                } catch {
                    return val;
                }
            }
            return val;
        };

        const cleanObject = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(cleanObject);
            if (typeof obj === 'object' && obj !== null) {
                const cleaned: any = {};
                for (const key in obj) {
                    if (
                        !["id", "packageId", "createdAt", "updatedAt", "createdById", "organizationId"].includes(key) &&
                        obj[key] !== null && obj[key] !== undefined && obj[key] !== ""
                    ) {
                        let val = obj[key];
                        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                            val = safeParse(val);
                        }
                        if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
                            val = Number(val);
                        }
                        cleaned[key] = cleanObject(val);
                    }
                }
                return cleaned;
            }
            if (typeof obj === 'string' && !isNaN(Number(obj)) && obj.trim() !== '') {
                return Number(obj);
            }
            return obj;
        };

        const formatVal = (v: any) => {
            if (v === undefined || v === null || v === "") return "None";
            if (typeof v === "boolean") return v ? "Yes" : "No";
            if (Array.isArray(v)) {
                if (v.length === 0) return "None";
                if (v.every(item => typeof item === 'string' || typeof item === 'number')) return v.join(", ");
                return `${v.length} items`;
            }
            if (typeof v !== 'object') return String(v);
            return "Object";
        };

        const formatObjectSummary = (obj: any) => {
            if (!obj) return "None";
            return Object.entries(obj)
                .filter(([_, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${formatVal(v)}`)
                .join(', ');
        };

        const compareSimple = (key: keyof PackageFormData, label: string) => {
            const current = values[key];
            let original = safeParse((compareTarget as any)[key]);

            if (key === "maxGuests" || key === "days" || key === "nights") {
                original = Number(original) || 0;
            }

            if (current !== original && original !== undefined) {
                if (!current && !original) return;
                changes.push({
                    field: label,
                    diffs: [
                        { type: 'remove', text: String(original || "Empty") },
                        { type: 'add', text: String(current || "Empty") }
                    ]
                });
            }
        };

        const compareArray = (key: keyof PackageFormData, label: string) => {
            let current = Array.isArray(values[key]) ? (values[key] as any[]) : [];
            let originalRaw = safeParse((compareTarget as any)[key]);
            let original: any[] = [];

            if (key === "inclusions" || key === "exclusions") {
                original = Array.isArray(originalRaw) ?
                    originalRaw.map((item) => typeof item === "object" && item !== null ? item.item : item) : [];
            } else if (key === "cancellationPolicy") {
                original = Array.isArray(originalRaw) ?
                    originalRaw.map((item) => typeof item === "object" && item !== null ? item.text : item) : [];
            } else {
                original = Array.isArray(originalRaw) ? originalRaw : [];
            }

            const cleanedCurrent = cleanObject(current);
            const cleanedOriginal = cleanObject(original);

            if (JSON.stringify(cleanedCurrent) !== JSON.stringify(cleanedOriginal)) {
                const diffs: DiffLine[] = [];

                if (
                    (current.length > 0 && typeof current[0] === 'string') ||
                    (original.length > 0 && typeof original[0] === 'string')
                ) {
                    const added = current.filter(x => !original.includes(x));
                    const removed = original.filter(x => !current.includes(x));

                    removed.forEach(r => diffs.push({ type: 'remove', text: String(r) }));
                    added.forEach(a => diffs.push({ type: 'add', text: String(a) }));
                } else {
                    if (cleanedCurrent.length !== cleanedOriginal.length) {
                        diffs.push({ type: 'info', text: `Count changed (${cleanedOriginal.length} → ${cleanedCurrent.length})` });
                    }

                    const maxLen = Math.max(cleanedCurrent.length, cleanedOriginal.length);
                    for (let i = 0; i < maxLen; i++) {
                        const origObj = cleanedOriginal[i];
                        const currObj = cleanedCurrent[i];

                        if (!origObj && currObj) {
                            diffs.push({ type: 'add', text: `Item ${i + 1}: ${formatObjectSummary(currObj)}` });
                        } else if (origObj && !currObj) {
                            diffs.push({ type: 'remove', text: `Item ${i + 1}: ${formatObjectSummary(origObj)}` });
                        } else if (JSON.stringify(origObj) !== JSON.stringify(currObj)) {
                            const allKeys = new Set([...Object.keys(currObj || {}), ...Object.keys(origObj || {})]);
                            for (const k of allKeys) {
                                const oVal = (origObj || {})[k];
                                const cVal = (currObj || {})[k];
                                if (JSON.stringify(oVal) !== JSON.stringify(cVal)) {
                                    const keyName = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
                                    diffs.push({ type: 'remove', text: `Item ${i + 1} [${keyName}]: ${formatVal(oVal)}` });
                                    diffs.push({ type: 'add', text: `Item ${i + 1} [${keyName}]: ${formatVal(cVal)}` });
                                }
                            }
                        }
                    }
                }

                if (diffs.length > 0) {
                    changes.push({ field: label, diffs });
                }
            }
        };

        const compareItinerary = () => {
            const current = values.itinerary || [];
            let originalRaw = safeParse(compareTarget.itinerary);
            const original = Array.isArray(originalRaw) ? originalRaw : [];

            const cleanedCurrent = cleanObject(current);
            const cleanedOriginal = cleanObject(original);

            const stripImages = (days: any[]) => days.map(day => {
                const { images, ...rest } = day;
                return rest;
            });

            const currentNoImages = stripImages(cleanedCurrent);
            const originalNoImages = stripImages(cleanedOriginal);

            if (JSON.stringify(currentNoImages) !== JSON.stringify(originalNoImages)) {
                const diffs: DiffLine[] = [];
                if (currentNoImages.length !== originalNoImages.length) {
                    diffs.push({ type: 'info', text: `Count changed (${originalNoImages.length} → ${currentNoImages.length})` });
                }

                const maxLen = Math.max(currentNoImages.length, originalNoImages.length);
                for (let i = 0; i < maxLen; i++) {
                    const origObj = originalNoImages[i];
                    const currObj = currentNoImages[i];

                    if (!origObj && currObj) {
                        diffs.push({ type: 'add', text: `Day ${i + 1}: Added` });
                    } else if (origObj && !currObj) {
                        diffs.push({ type: 'remove', text: `Day ${i + 1}: Removed` });
                    } else if (JSON.stringify(origObj) !== JSON.stringify(currObj)) {
                        const allKeys = new Set([...Object.keys(currObj || {}), ...Object.keys(origObj || {})]);
                        for (const k of allKeys) {
                            const oVal = (origObj || {})[k];
                            const cVal = (currObj || {})[k];
                            if (JSON.stringify(oVal) !== JSON.stringify(cVal)) {
                                const keyName = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
                                diffs.push({ type: 'remove', text: `Day ${i + 1} [${keyName}]: ${formatVal(oVal)}` });
                                diffs.push({ type: 'add', text: `Day ${i + 1} [${keyName}]: ${formatVal(cVal)}` });
                            }
                        }
                    }
                }

                if (diffs.length > 0) {
                    changes.push({ field: "Itinerary Details", diffs });
                }
            }
        };

        const compareObject = (key: keyof PackageFormData, label: string) => {
            const current = values[key];
            let originalRaw = safeParse((packageData as any)[key]);

            const cleanedCurrent = cleanObject(current) || (Array.isArray(current) ? [] : {});
            const cleanedOriginal = cleanObject(originalRaw) || (Array.isArray(originalRaw) ? [] : {});

            if (JSON.stringify(cleanedCurrent) !== JSON.stringify(cleanedOriginal)) {
                const diffs: DiffLine[] = [];

                if (Array.isArray(cleanedCurrent) && Array.isArray(cleanedOriginal)) {
                    if (cleanedCurrent.length !== cleanedOriginal.length) {
                        diffs.push({ type: 'info', text: `Count changed (${cleanedOriginal.length} → ${cleanedCurrent.length})` });
                    }
                    const maxLen = Math.max(cleanedCurrent.length, cleanedOriginal.length);
                    for (let i = 0; i < maxLen; i++) {
                        if (JSON.stringify(cleanedCurrent[i]) !== JSON.stringify(cleanedOriginal[i])) {
                            diffs.push({ type: 'info', text: `Modified item: ${i + 1}` });
                        }
                    }
                } else {
                    const allKeys = new Set([...Object.keys(cleanedCurrent), ...Object.keys(cleanedOriginal)]);
                    for (const k of allKeys) {
                        const origVal = cleanedOriginal[k];
                        const currVal = cleanedCurrent[k];

                        if (JSON.stringify(origVal) !== JSON.stringify(currVal)) {
                            const keyName = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
                            diffs.push({ type: 'remove', text: `[${keyName}]: ${formatVal(origVal)}` });
                            diffs.push({ type: 'add', text: `[${keyName}]: ${formatVal(currVal)}` });
                        }
                    }
                }

                if (diffs.length > 0) {
                    changes.push({ field: label, diffs });
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

        const logisticsKeys = ["mealsBreakdown", "transportation", "packageLocation"];
        logisticsKeys.forEach((k) => compareObject(k as keyof PackageFormData, k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim()));

        return changes;
    };

    const pendingChanges = useMemo(() => getChanges(), [values, initialPackageData, packageData]);

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
            <Card
                className={`shadow-xs border rounded-2xl ${hasErrors
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
                                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${issue.severity === "error"
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

            {pendingChanges.length > 0 && (
                <Card className="shadow-xs border border-amber-500/30 bg-amber-500/5 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-amber-500/10 pb-4">
                        <CardTitle className="text-amber-700 dark:text-amber-400 text-base font-bold flex items-center gap-2">
                            <FileEdit className="w-4 h-4" />
                            Pending Changes Summary
                        </CardTitle>
                        <CardDescription className="text-xs">
                            The following modifications will be published live to the catalog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {pendingChanges.map((change, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col rounded-xl border border-amber-500/20 bg-background shadow-sm overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 border-b border-amber-500/20">
                                        <FileEdit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                                            {change.field}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-xs font-mono">
                                        {change.diffs.map((diff, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-start px-4 py-2 border-b last:border-b-0 border-border/50 ${diff.type === 'add' ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' :
                                                        diff.type === 'remove' ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300' :
                                                            'bg-muted/30 text-muted-foreground'
                                                    }`}
                                            >
                                                <span className="w-5 shrink-0 select-none opacity-50 font-bold">
                                                    {diff.type === 'add' ? '+' : diff.type === 'remove' ? '-' : 'i'}
                                                </span>
                                                <span className={`break-words whitespace-pre-wrap ${diff.type === 'remove' ? 'line-through opacity-70' : ''}`}>
                                                    {diff.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                className={`capitalize text-xs font-semibold rounded-md ${packageData?.status === "edited"
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
                                disabled={
                                    isLoading ||
                                    hasErrors ||
                                    (packageData?.status === "published" && pendingChanges.length === 0)
                                }
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
