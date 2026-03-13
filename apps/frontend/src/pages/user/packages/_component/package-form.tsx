import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import axiosInstance from "@/lib/axios";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import {
    packageFormSchema,
    type IPackages,
    type PackageFormData,
} from "@/types/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CheckCircle2,
    Loader2,
    Package as PackageIcon,
    Rocket,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
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
    duration: "",
    price: 0,
    description: "",
    maxGuests: 0,
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
            activities: [""],
            meals: [],
            accommodation: "",
            images: [],
        },
    ],
    paymentStructure: [
        {
            name: "Booking Advance",
            amount: 0,
            description: "Initial booking amount",
            dueDate: "booking",
        },
    ],
    cancellationStructure: [
        {
            timeframe: "30+ days before",
            amount: 0,
            description: "Minimal cancellation fee",
        },
    ],
    cancellationPolicy: [
        "Cancellation must be made in writing",
        "Refunds will be processed within 7-10 business days",
    ],
    mealsBreakdown: {
        breakfast: [],
        lunch: [],
        dinner: [],
    },
    transportation: {
        toDestination: { mode: "flight", details: "", included: false },
        fromDestination: { mode: "flight", details: "", included: false },
        duringTrip: { mode: "bus", details: "", included: true },
    },
    documentRequirements: [],
    preTripChecklist: [],
    packageLocation: {
        type: "local",
        country: "India",
        state: "",
    },
};

const SECTION_KEYS: Record<string, string[]> = {
    basic: [
        "name",
        "destination",
        "duration",
        "price",
        "description",
        "maxGuests",
        "category",
        "thumbnail",
        "inclusions",
        "exclusions",
        "status",
    ],
    itinerary: ["itinerary"],
    logistics: ["transportation", "mealsBreakdown", "packageLocation"],
    "payments-cancellation": [
        "paymentStructure",
        "cancellationStructure",
        "cancellationPolicy",
    ],
    requirements: ["documentRequirements", "preTripChecklist"],
};

const STEPS = [
    { title: "Basic Info", icon: PackageIcon },
    { title: "Details", icon: PackageIcon },
    { title: "Itinerary", icon: PackageIcon },
    { title: "Logistics", icon: PackageIcon },
    { title: "Finance", icon: PackageIcon },
    { title: "Requirements", icon: PackageIcon },
    { title: "Review", icon: Rocket },
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
    const [itineraryPreviewUrls, setItineraryPreviewUrls] = useState<
        Record<number, string[]>
    >({});
    const [existingItineraryImages, setExistingItineraryImages] = useState<
        Record<number, string[]>
    >({});
    const [packageData, setPackageData] = useState<IPackages | null>(null);

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

            if (backendData.price !== undefined)
                transformed.price = Number(backendData.price) || 0;
            if (backendData.maxGuests !== undefined)
                transformed.maxGuests = Number(backendData.maxGuests) || 0;

            if (backendData.inclusions !== undefined) {
                transformed.inclusions =
                    backendData.inclusions?.map((inc: any) =>
                        typeof inc === "object" ? inc?.item : inc,
                    ) || [];
            }
            if (backendData.exclusions !== undefined) {
                transformed.exclusions =
                    backendData.exclusions?.map((exc: any) =>
                        typeof exc === "object" ? exc?.item : exc,
                    ) || [];
            }

            if (backendData.itinerary !== undefined) {
                transformed.itinerary = backendData.itinerary?.map(
                    (iti, index) => {
                        const { images, ...rest } = iti;
                        if (images && Array.isArray(images)) {
                            setExistingItineraryImages((prev) => ({
                                ...prev,
                                [index]: images,
                            }));
                            const urls = images.map((img) =>
                                getFileUrl(getServeFileUrl(img)),
                            );
                            setItineraryPreviewUrls((prev) => ({
                                ...prev,
                                [index]: urls,
                            }));
                        }
                        return { ...rest, images: [] };
                    },
                );
            }

            if (backendData.paymentStructure !== undefined) {
                transformed.paymentStructure =
                    backendData.paymentStructure?.map((pay) => ({
                        ...pay,
                        amount: parseFloat(pay.amount?.toString() ?? "0"),
                    }));
            }

            if (backendData.cancellationStructure !== undefined) {
                transformed.cancellationStructure =
                    backendData.cancellationStructure?.map((can) => ({
                        ...can,
                        amount: parseFloat(can.amount?.toString() ?? "0"),
                    }));
            }

            if (backendData.cancellationPolicy !== undefined) {
                transformed.cancellationPolicy =
                    backendData.cancellationPolicy?.map(
                        (can: any) => can.text || can,
                    ) || [];
            }

            if (backendData.preTripChecklist !== undefined) {
                transformed.preTripChecklist =
                    backendData.preTripChecklist?.map((item: any) => ({
                        ...item,
                        dueDate: item.dueDate?.toString() || "",
                    })) || [];
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
                            setThumbnailFile(
                                getFileUrl(getServeFileUrl(res.data.thumbnail)),
                            );
                        }
                        if (res.data.id) setPackageId(res.data.id);
                    }

                    setPackageData(
                        (prev) =>
                            ({
                                ...(prev || {}),
                                ...res.data,
                            }) as IPackages,
                    );
                    setLoadedSections((prev) => new Set(prev).add(section));
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

    // Progressive loading effect based on currentStep
    useEffect(() => {
        if (!isEditing || !packageId) return;

        const loadSectionForStep = async () => {
            // Always ensure basic is loaded for context
            if (!loadedSections.has("basic")) {
                await fetchSection("basic");
            }

            if (currentStep === 0 || currentStep === 1) {
                // Done (basic already loading/loaded above)
            } else if (currentStep === 2) {
                await fetchSection("itinerary");
            } else if (currentStep === 3) {
                await fetchSection("logistics");
            } else if (currentStep === 4) {
                await fetchSection("payments-cancellation");
            } else if (currentStep === 5) {
                await fetchSection("requirements");
            } else if (currentStep === 6) {
                // For review step, ensure everything is loaded
                const sections = [
                    "itinerary",
                    "logistics",
                    "payments-cancellation",
                    "requirements",
                ];
                for (const section of sections) {
                    await fetchSection(section);
                }
            }
        };

        loadSectionForStep();
    }, [currentStep, isEditing, packageId, fetchSection]);

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

            // Determine which keys to include in the save
            let keysToInclude: Set<string> | undefined;
            if (packageId && !isExplicitPublish) {
                const stepKey =
                    currentStep === 0 || currentStep === 1
                        ? "basic"
                        : currentStep === 2
                          ? "itinerary"
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
                setPackageData(response.data);
                form.setValue("status", newStatus);
            }
        } catch (error) {
            toast.error("Failed to unpublish package");
        } finally {
            setIsSaving(false);
        }
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) =>
                setThumbnailFile(ev.target?.result as string);
            reader.readAsDataURL(file);
            form.setValue("thumbnail", file);
        }
    };

    const handleDayImageUpload = (
        dayIndex: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(e.target.files || []);
        const urls = files.map((f) => URL.createObjectURL(f));
        setItineraryPreviewUrls((prev) => ({
            ...prev,
            [dayIndex]: [...(prev[dayIndex] || []), ...urls],
        }));
        const current = form.getValues(`itinerary.${dayIndex}.images`) || [];
        form.setValue(`itinerary.${dayIndex}.images`, [...current, ...files]);
    };

    const removeDayImage = (dayIndex: number, imageIndex: number) => {
        const existing = existingItineraryImages[dayIndex] || [];
        const isExisting = imageIndex < existing.length;
        if (isExisting) {
            setExistingItineraryImages((prev) => ({
                ...prev,
                [dayIndex]: existing.filter((_, i) => i !== imageIndex),
            }));
        } else {
            const formImages =
                form.getValues(`itinerary.${dayIndex}.images`) || [];
            const newIndex = imageIndex - existing.length;
            form.setValue(
                `itinerary.${dayIndex}.images`,
                formImages.filter((_, i) => i !== newIndex),
            );
        }
        setItineraryPreviewUrls((prev) => ({
            ...prev,
            [dayIndex]: (prev[dayIndex] || []).filter(
                (_, i) => i !== imageIndex,
            ),
        }));
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
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Multi-step Header */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Package Wizard</h2>
                    {packageId && (
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-primary gap-2"
                            onClick={() => setCurrentStep(STEPS.length - 1)}
                        >
                            Skip to Review
                            <Rocket className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10 transform -translate-y-1/2" />
                    {STEPS.map((step, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center gap-2 bg-background px-2"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                                    idx < currentStep
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : idx === currentStep
                                          ? "border-primary text-primary ring-4 ring-primary/10"
                                          : "bg-background border-muted text-muted-foreground hover:border-primary/50"
                                }`}
                                onClick={() => setCurrentStep(idx)}
                            >
                                {idx < currentStep ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <span>{idx + 1}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium hidden md:block ${idx === currentStep ? "text-primary" : "text-muted-foreground"}`}
                            >
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-8">
                    {currentStep === 0 && (
                        <StepBasicInfo
                            form={form}
                            thumbnailFile={thumbnailFile}
                            handleThumbnailUpload={handleThumbnailUpload}
                            onNext={handleNext}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 1 && (
                        <StepDetails
                            form={form}
                            onNext={handleNext}
                            onBack={handleBack}
                            isLoading={isSaving}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepItinerary
                            form={form}
                            itineraryPreviewUrls={itineraryPreviewUrls}
                            handleDayImageUpload={handleDayImageUpload}
                            removeDayImage={removeDayImage}
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
                        />
                    )}
                </form>
            </Form>
        </div>
    );
}
