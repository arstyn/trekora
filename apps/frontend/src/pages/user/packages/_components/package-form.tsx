import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import axiosInstance from "@/lib/axios";
import {
    packageFormSchema,
    type IPackages,
    type PackageFormData,
} from "@/types/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CheckSquare,
    Coins,
    FileText,
    Info,
    Loader2,
    Rocket,
    Sparkles,
    Truck
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StepBasicInfo } from "./wizard/steps/StepBasicInfo";
import { StepDetails } from "./wizard/steps/StepDetails";
import { StepFinance } from "./wizard/steps/StepFinance";
import { StepItinerary } from "./wizard/steps/StepItinerary";
import { StepLogistics } from "./wizard/steps/StepLogistics";
import { StepRequirements } from "./wizard/steps/StepRequirements";
import { StepReview } from "./wizard/steps/StepReview";

interface PackageFormProps {
    isEditing?: boolean;
    packageId?: string;
    onSuccess?: () => void;
}

const defaultValues: PackageFormData = {
    name: "",
    destination: "",
    days: 0,
    nights: 0,
    description: "",
    maxGuests: 0,
    maxDiscountType: "amount",
    maxDiscountValue: 0,
    maxDiscountPercentage: 0,
    category: "adventure",
    inclusions: [],
    exclusions: [],
    status: "draft",
    thumbnail: undefined,
    itinerary: [
        {
            day: 1,
            title: "",
            description: "",
            activities: [{ name: "", cost: 0 }],
            meals: [],
            accommodation: "",
            images: [],
        },
    ],
    paymentStructure: [
        {
            amount: 0,
            description: "Initial booking amount",
            dueDate: "booking",
        },
    ],
    cancellationStructure: [
        {
            timeframe: "30_days_before",
            amount: 0,
            description: "Minimal cancellation fee",
        },
    ],
    cancellationPolicy: [
        "Cancellation must be made in writing",
        "Refunds will be processed within 7-10 business days",
    ],
    packageTiers: [],
    additionalCosts: [],
    mealsBreakdown: {
        breakfast: [],
        lunch: [],
        dinner: [],
    },
    transportation: [
        { title: "To Destination", cost: 0, segments: [{ mode: "flight" }] },
        { title: "From Destination", cost: 0, segments: [{ mode: "flight" }] },
        { title: "During Trip", cost: 0, segments: [{ mode: "bus" }] },
    ],
    documentRequirements: [],
    preTripChecklist: [],
    packageLocation: {
        type: "local",
        countries: ["India"],
        states: [],
        cities: [],
    },
};

const SECTION_KEYS: Record<string, string[]> = {
    basic: [
        "name",
        "destination",
        "days",
        "nights",
        "description",
        "maxGuests",
        "category",
        "thumbnail",
        "status",
        "packageLocation",
    ],
    itinerary: ["itinerary"],
    details: ["inclusions", "exclusions"],
    logistics: ["transportation", "mealsBreakdown"],
    "payments-cancellation": [
        "paymentStructure",
        "cancellationStructure",
        "cancellationPolicy",
        "additionalCosts",
        "packageTiers",
    ],
    requirements: ["documentRequirements", "preTripChecklist"],
};

const STEPS = [
    { title: "Basic Info", description: "Core details & location", icon: Info },
    { title: "Itinerary", description: "Day-by-day activities", icon: CalendarDays },
    { title: "Inclusions", description: "Included & excluded items", icon: CheckSquare },
    { title: "Logistics", description: "Transport & meals", icon: Truck },
    { title: "Finance", description: "Pricing tiers & policies", icon: Coins },
    { title: "Requirements", description: "Documents & checklist", icon: FileText },
    { title: "Review", description: "Summary & publish", icon: Rocket },
];

export function PackageForm({
    isEditing = false,
    packageId: initialPackageId,
    onSuccess,
}: PackageFormProps) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [packageId, setPackageId] = useState<string | undefined>(
        initialPackageId,
    );
    const [thumbnailFile, setThumbnailFile] = useState<string>();
    const [existingItineraryImages, setExistingItineraryImages] = useState<
        Record<number, string[]>
    >({});
    const [packageData, setPackageData] = useState<IPackages | null>(null);
    const [initialPackageData, setInitialPackageData] = useState<IPackages | null>(null);

    const form = useForm<PackageFormData>({
        resolver: zodResolver(packageFormSchema),
        defaultValues,
    });

    const [loadedSections, setLoadedSections] = useState<Set<string>>(
        new Set(),
    );

    const transformBackendDataToForm = useCallback(
        (backendData: Partial<IPackages>) => {
            const transformed: any = { ...backendData };

            if (backendData.mealsTemplateId !== undefined) {
                transformed.mealsTemplateId = backendData.mealsTemplateId || undefined;
            }
            if (backendData.paymentStructureTemplateId !== undefined) {
                transformed.paymentStructureTemplateId = backendData.paymentStructureTemplateId || undefined;
            }
            if (backendData.cancellationStructureTemplateId !== undefined) {
                transformed.cancellationStructureTemplateId = backendData.cancellationStructureTemplateId || undefined;
            }


            if (backendData.days !== undefined)
                transformed.days = Number(backendData.days) || 0;
            if (backendData.nights !== undefined)
                transformed.nights = Number(backendData.nights) || 0;
            if (backendData.maxGuests !== undefined)
                transformed.maxGuests = Number(backendData.maxGuests) || 0;

            if (backendData.inclusions !== undefined) {
                transformed.inclusions = Array.isArray(backendData.inclusions) ?
                    backendData.inclusions.map((inc: any) =>
                        typeof inc === "object" ? inc?.item : inc,
                    ) : [];
            }
            if (backendData.exclusions !== undefined) {
                transformed.exclusions = Array.isArray(backendData.exclusions) ?
                    backendData.exclusions.map((exc: any) =>
                        typeof exc === "object" ? exc?.item : exc,
                    ) : [];
            }

            if (backendData.itinerary !== undefined) {
                transformed.itinerary = Array.isArray(backendData.itinerary) ? backendData.itinerary.map(
                    (iti, index) => {
                        const { images, ...rest } = iti;
                        if (images && Array.isArray(images)) {
                            setExistingItineraryImages((prev) => ({
                                ...prev,
                                [index]: images,
                            }));
                        }
                        return { ...rest, images: [] };
                    },
                ) : [];
            }

            if (backendData.paymentStructure !== undefined) {
                transformed.paymentStructure = Array.isArray(backendData.paymentStructure) ?
                    backendData.paymentStructure.map((pay) => ({
                        ...pay,
                        amount: parseFloat(pay.amount?.toString() ?? "0"),
                    })) : [];
            }

            if (backendData.cancellationStructure !== undefined) {
                transformed.cancellationStructure = Array.isArray(backendData.cancellationStructure) ?
                    backendData.cancellationStructure.map((can) => ({
                        ...can,
                        amount: parseFloat(can.amount?.toString() ?? "0"),
                    })) : [];
            }

            if (backendData.cancellationPolicy !== undefined) {
                transformed.cancellationPolicy = Array.isArray(backendData.cancellationPolicy) ?
                    backendData.cancellationPolicy.map(
                        (can: any) => can.text || can,
                    ) : [];
            }

            if (backendData.preTripChecklist !== undefined) {
                transformed.preTripChecklist = Array.isArray(backendData.preTripChecklist) ?
                    backendData.preTripChecklist.map((item: any) => ({
                        ...item,
                        dueDate: item.dueDate?.toString() || "",
                    })) : [];
            }

            if (backendData.additionalCosts !== undefined) {
                transformed.additionalCosts = Array.isArray(backendData.additionalCosts) ? backendData.additionalCosts.map((cost: any) => ({
                    ...cost,
                    cost: parseFloat(cost.cost?.toString() ?? "0")
                })) : [];
            }

            if (backendData.packageTiers !== undefined) {
                transformed.packageTiers = Array.isArray(backendData.packageTiers) ? backendData.packageTiers.map((tier: any) => ({
                    ...tier,
                    adultCost: parseFloat(tier.adultCost?.toString() ?? "0"),
                    childCostValue: parseFloat(tier.childCostValue?.toString() ?? "0"),
                    infantCostValue: parseFloat(tier.infantCostValue?.toString() ?? "0"),
                })) : [];
            }

            if (backendData.transportation !== undefined) {
                let transData = backendData.transportation;
                if (typeof transData === "string") {
                    try {
                        transData = JSON.parse(transData);
                    } catch {
                        transData = [];
                    }
                }
                if (Array.isArray(transData)) {
                    transformed.transportation = transData.map((t: any) => {
                        let segs = t.segments;
                        if (typeof segs === "string") {
                            try {
                                segs = JSON.parse(segs);
                            } catch {
                                segs = [];
                            }
                        }
                        return {
                            ...t,
                            id: t.id || crypto.randomUUID(),
                            title: t.title || "",
                            cost: parseFloat(t.cost?.toString() ?? "0"),
                            segments: Array.isArray(segs) ? segs : [],
                        };
                    });
                } else {
                    transformed.transportation = [];
                }
            }

            if (backendData.groundTransportationCost !== undefined) {
                transformed.groundTransportationCost = parseFloat(
                    backendData.groundTransportationCost?.toString() ?? "0",
                );
            }

            if (backendData.mealsBreakdown !== undefined) {
                let mealsData = backendData.mealsBreakdown;
                if (typeof mealsData === "string") {
                    try {
                        mealsData = JSON.parse(mealsData);
                    } catch {
                        mealsData = {};
                    }
                }
                if (mealsData && typeof mealsData === "object") {
                    transformed.mealsBreakdown = {
                        breakfast: Array.isArray(mealsData.breakfast) ? mealsData.breakfast : [],
                        lunch: Array.isArray(mealsData.lunch) ? mealsData.lunch : [],
                        dinner: Array.isArray(mealsData.dinner) ? mealsData.dinner : [],
                        mealsCost: parseFloat(mealsData.mealsCost?.toString() ?? "0"),
                    };
                }
            }

            if (backendData.packageLocation === null) {
                delete transformed.packageLocation;
            }

            return transformed as Partial<PackageFormData>;
        },
        [],
    );

    const fetchSection = useCallback(
        async (section: string) => {
            if (!packageId || loadedSections.has(section)) return;

            try {
                setIsLoading(true);
                const res = await axiosInstance.get<any>(
                    `/packages/${packageId}/${section}`,
                );
                if (res.data) {
                    const currentValues = form.getValues();

                    // The itinerary endpoint returns an array, but transformBackendDataToForm expects Partial<IPackages>
                    const dataToTransform =
                        section === "itinerary" && Array.isArray(res.data)
                            ? { itinerary: res.data }
                            : res.data;

                    const transformed =
                        transformBackendDataToForm(dataToTransform);

                    // Use reset with merged values to maintain form state while updating with fetched data
                    form.reset({
                        ...currentValues,
                        ...transformed,
                    });

                    // Special state updates
                    if (section === "basic") {
                        if (res.data.thumbnail) {
                            setThumbnailFile(res.data.thumbnail);
                        }
                        if (res.data.id) setPackageId(res.data.id);
                    }

                    setLoadedSections((prev) => new Set(prev).add(section));

                    const newData = section === "itinerary" && Array.isArray(res.data)
                        ? { itinerary: res.data }
                        : res.data;

                    setPackageData(
                        (prev) => {
                            return {
                                ...(prev || {}),
                                ...newData,
                            } as IPackages;
                        }
                    );
                    
                    // Fetch the live/catalog version to compare pending changes against
                    try {
                        const liveRes = await axiosInstance.get<any>(
                            `/packages/${packageId}/${section}?live=true`,
                        );
                        if (liveRes.data) {
                            const liveData = section === "itinerary" && Array.isArray(liveRes.data)
                                ? { itinerary: liveRes.data }
                                : liveRes.data;
                                
                            setInitialPackageData(
                                (prev) => {
                                    return {
                                        ...(prev || {}),
                                        ...liveData,
                                    } as IPackages;
                                }
                            );
                        }
                    } catch (e) {
                        console.error(`Failed to load live ${section} data:`, e);
                    }
                }
            } catch (error) {
                console.error(`Failed to load ${section} data:`, error);
                toast.error(`Failed to load ${section} details`);
            } finally {
                setIsLoading(false);
            }
        },
        [packageId, loadedSections, form, transformBackendDataToForm],
    );

    const initialLoadStarted = useRef(false);

    // Load all sections on mount when editing so skipping steps doesn't cause missing data
    useEffect(() => {
        if (!isEditing || !packageId || initialLoadStarted.current) return;
        initialLoadStarted.current = true;

        const loadAllSections = async () => {
            const sections = [
                "basic",
                "itinerary",
                "details",
                "logistics",
                "payments-cancellation",
                "requirements",
            ];
            for (const section of sections) {
                await fetchSection(section);
            }
        };

        loadAllSections();
    }, [isEditing, packageId, fetchSection]);

    const packageFormDataToFormData = (
        data: PackageFormData,
        keysToInclude?: Set<string>,
    ): FormData => {
        const formData = new FormData();
        const appendIfDefined = (key: string, value: any) => {
            if (value !== undefined && value !== null) {
                if (value instanceof File) formData.append(key, value);
                else if (Array.isArray(value) || typeof value === "object")
                    formData.append(key, JSON.stringify(value));
                else formData.append(key, String(value));
            }
        };

        Object.keys(data).forEach((key) => {
            if (keysToInclude && !keysToInclude.has(key)) return;

            if (key !== "itinerary" && key !== "thumbnail") {
                appendIfDefined(key, (data as any)[key]);
            }
        });

        if (!keysToInclude || keysToInclude.has("thumbnail")) {
            appendIfDefined("thumbnail", data.thumbnail);
        }

        if (!keysToInclude || keysToInclude.has("itinerary")) {
            const itineraryData = data.itinerary?.map((val, idx) => {
                const { images: _, ...rest } = val;
                const existing = existingItineraryImages[idx] || [];
                return { ...rest, images: [...existing] };
            });
            appendIfDefined("itinerary", itineraryData);

            data.itinerary?.forEach((day, idx) => {
                day.images?.forEach((file, fidx) => {
                    if (file instanceof File) {
                        formData.append(
                            `itinerary[${idx}].images[${fidx}]`,
                            file,
                        );
                    }
                });
            });
        }

        return formData;
    };

    const saveDraft = async (
        data: PackageFormData,
        isExplicitPublish = false,
    ) => {
        setIsSaving(true);
        try {
            const updateData = { ...data };

            // If we are just saving progress and it's already published/edited,
            // we don't want to send 'published' status because that triggers
            // a full update in the backend. We want it to stay 'edited'.
            if (
                !isExplicitPublish &&
                (updateData.status === "published" ||
                    updateData.status === "edited")
            ) {
                delete (updateData as any).status;
            }

            // For new packages, default to draft
            if (!updateData.status && !packageId) {
                updateData.status = "draft";
            }

            if (updateData.paymentStructure) {
                updateData.paymentStructure = updateData.paymentStructure.map((milestone, idx) => ({
                    ...milestone,
                    order: idx + 1,
                }));
            }

            // Determine which keys to include in the save
            let keysToInclude: Set<string> | undefined;
            if (packageId && !isExplicitPublish) {
                const stepKey =
                    currentStep === 0
                        ? "basic"
                        : currentStep === 1
                            ? "itinerary"
                            : currentStep === 2
                                ? "details"
                                : currentStep === 3
                                    ? "logistics"
                                    : currentStep === 4
                                        ? "payments-cancellation"
                                        : currentStep === 5
                                            ? "requirements"
                                            : "all";

                if (stepKey !== "all") {
                    const sections = new Set(loadedSections);
                    sections.add(stepKey);
                    keysToInclude = new Set(
                        Array.from(sections).flatMap(
                            (s) => SECTION_KEYS[s] || [],
                        ),
                    );
                }
            }

            const formData = packageFormDataToFormData(
                updateData,
                keysToInclude,
            );
            let response;
            if (packageId) {
                response = await axiosInstance.patch(
                    `/packages/${packageId}`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );
            } else {
                response = await axiosInstance.post(`/packages`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            if (response.data) {
                if (!packageId) {
                    setPackageId(response.data.id);
                    // Update URL without refreshing if it's a new package
                    window.history.replaceState(
                        null,
                        "",
                        `/packages/${response.data.id}/edit`,
                    );
                }
                setPackageData(response.data);
                // Also update the form status if it changed
                if (response.data.status) {
                    form.setValue("status", response.data.status);
                }
                return true;
            }
            return false;
        } catch (error) {
            toast.error("Failed to save progress");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        const success = await saveDraft(form.getValues());
        if (success) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
    };

    const handlePublish = async () => {
        const data = form.getValues();
        data.status = "published";
        const success = await saveDraft(data, true);
        if (success) {
            toast.success("Package published successfully!");
            onSuccess?.();
            navigate("/packages");
        }
    };

    const handleDelete = async () => {
        if (!packageId) return;
        setIsSaving(true);
        try {
            await axiosInstance.delete(`/packages/${packageId}`);
            toast.success("Package deleted successfully");
            navigate("/packages");
        } catch (error) {
            toast.error("Failed to delete package");
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!packageId) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("status", "archived");
            const response = await axiosInstance.patch(
                `/packages/${packageId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            if (response.data) {
                toast.success("Package archived successfully");
                setPackageData(response.data);
                navigate("/packages");
            }
        } catch (error) {
            toast.error("Failed to archive package");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnpublish = async () => {
        if (!packageId) return;
        setIsSaving(true);
        try {
            const isEdited = packageData?.status === "edited";
            const newStatus = isEdited ? "published" : "draft";

            const formData = new FormData();
            formData.append("status", newStatus);
            const response = await axiosInstance.patch(
                `/packages/${packageId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            if (response.data) {
                toast.success(
                    isEdited
                        ? "Changes discarded successfully"
                        : "Package unpublished and moved to draft",
                );
                
                // Force a hard reload to completely reset local form state and re-fetch all clean data
                window.location.reload();
            }
        } catch (error) {
            toast.error("Failed to unpublish package");
        } finally {
            setIsSaving(false);
        }
    };



    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                    Loading package details...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 p-4 md:p-6">
            {/* Header Card with Progress */}
            <div className="bg-card border rounded-2xl p-5 md:p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-xl h-10 w-10 shrink-0"
                            onClick={() => navigate("/packages")}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                                    {isEditing ? "Edit Package" : "Create Advanced Package"}
                                </h1>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Step {currentStep + 1} of {STEPS.length}
                                </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                                {STEPS[currentStep].title} — {STEPS[currentStep].description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {packageId && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="gap-2 rounded-xl text-xs"
                                onClick={() => setCurrentStep(STEPS.length - 1)}
                            >
                                <Rocket className="w-3.5 h-3.5 text-primary" />
                                Skip to Review
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Stepper Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentStep(idx)}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${isActive
                                    ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                                    : isCompleted
                                        ? "bg-card hover:bg-accent/50 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                        : "bg-card hover:bg-accent/30 border-muted text-muted-foreground"
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : isCompleted
                                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs truncate font-medium">{step.title}</p>
                                    <p className="text-[10px] text-muted-foreground truncate hidden lg:block">
                                        {isCompleted ? "Completed" : isActive ? "Active" : `Step ${idx + 1}`}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-8">
                    {currentStep === 0 && (
                        <StepBasicInfo
                            form={form}
                            thumbnailFile={thumbnailFile}
                            setThumbnailFile={setThumbnailFile}
                            onNext={handleNext}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 1 && (
                        <StepItinerary
                            form={form}
                            existingItineraryImages={existingItineraryImages}
                            setExistingItineraryImages={setExistingItineraryImages}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepDetails
                            form={form}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 3 && (
                        <StepLogistics
                            form={form}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 4 && (
                        <StepFinance
                            form={form}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 5 && (
                        <StepRequirements
                            form={form}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 6 && (
                        <StepReview
                            form={form}
                            onBack={handleBack}
                            onPublish={handlePublish}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            onUnpublish={handleUnpublish}
                            isLoading={isSaving}
                            packageData={packageData}
                            initialPackageData={initialPackageData}
                        />
                    )}
                </form>
            </Form>
        </div>
    );
}
