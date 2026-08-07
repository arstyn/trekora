import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import axiosInstance from "@/lib/axios";
import {
    packageFormSchema,
    type IPackages,
    type PackageFormData,
} from "@/types/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Globe, MapPin, IndianRupee, Landmark, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFileUrl } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import paymentStructuresService from "@/services/payment-structures.service";
import type { IPaymentStructureTemplate } from "@/services/payment-structures.service";
import cancellationTiersService from "@/services/cancellation-tiers.service";
import type { ICancellationTierTemplate } from "@/services/cancellation-tiers.service";
import PaymentStructureForm from "@/pages/user/payment-structures/_components/payment-structure-form";
import CancellationTierForm from "@/pages/user/cancellation-tiers/_components/cancellation-tier-form";
import { SearchableSelect } from "@/components/searchable-select";
import { countries } from "@/pages/user/customers/_components/countries";
import { getAllStates, getDistricts } from "india-state-district";
import { Label } from "@/components/ui/label";

interface NormalPackageFormProps {
    isEditing?: boolean;
    packageId?: string;
    onSuccess?: () => void;
}

const defaultValues: PackageFormData = {
    name: "",
    destination: "",
    days: 1,
    nights: 0,
    description: "",
    maxGuests: 1,
    category: "adventure", // Required by DB but bypassed visually in normal mode
    status: "draft",
    packageSetup: "normal",
    thumbnail: undefined,
    packageLocation: {
        type: "local",
        countries: ["India"],
        states: [],
        cities: [],
    },
    packageTiers: [
        {
            name: "Standard",
            adultCost: 0,
            childCostType: "flat",
            childCostValue: 0,
            infantCostType: "flat",
            infantCostValue: 0,
            transportationId: "none",
        }
    ],
    paymentStructure: [
        {
            name: "Booking Amount",
            amount: 100,
            description: "Initial booking amount",
            dueDate: "booking",
            order: 1,
        },
    ],
    cancellationStructure: [
        {
            timeframe: "30_days_before",
            amount: 100,
            description: "Full cancellation fee",
        },
    ],
};

export function NormalPackageForm({
    isEditing = false,
    packageId,
    onSuccess,
}: NormalPackageFormProps) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<string>();

    const form = useForm<PackageFormData>({
        resolver: zodResolver(packageFormSchema),
        defaultValues,
    });

    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const selectedThumbnail = form.watch("thumbnail");
    const hasThumbnail = !!(selectedThumbnail || thumbnailFile);

    useEffect(() => {
        if (selectedThumbnail instanceof File) {
            const url = URL.createObjectURL(selectedThumbnail);
            setLocalPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setLocalPreview(null);
        }
    }, [selectedThumbnail]);

    const thumbnailSrc = localPreview || (thumbnailFile ? (thumbnailFile.startsWith("blob:") || thumbnailFile.startsWith("data:") ? thumbnailFile : getFileUrl(thumbnailFile)) : undefined);

    const locationType = form.watch("packageLocation.type") || "local";
    const selectedCountry = form.watch("packageLocation.countries")?.[0] || (locationType === "local" ? "India" : "");
    const selectedState = form.watch("packageLocation.states")?.[0] || "";
    const selectedCity = form.watch("packageLocation.cities")?.[0] || "";

    const stateOptions = getAllStates().map((s) => ({
        value: s.name,
        label: s.name,
    }));

    const selectedStateObj = getAllStates().find((s) => s.name === selectedState);
    const districtOptions = selectedStateObj
        ? getDistricts(selectedStateObj.code).map((d) => ({
            value: d,
            label: d,
        }))
        : [];

    const handleCountryChange = (val: string) => {
        form.setValue("packageLocation.countries", [val]);
        if (val === "India") {
            form.setValue("packageLocation.states", ["Kerala"]);
            form.setValue("packageLocation.cities", []);
        } else {
            form.setValue("packageLocation.states", []);
            form.setValue("packageLocation.cities", []);
        }
    };

    const handleStateChange = (val: string) => {
        form.setValue("packageLocation.states", [val]);
        form.setValue("packageLocation.cities", []);
    };

    const handleCityChange = (val: string) => {
        form.setValue("packageLocation.cities", [val]);
    };

    const [paymentTemplates, setPaymentTemplates] = useState<IPaymentStructureTemplate[]>([]);
    const [cancellationTemplates, setCancellationTemplates] = useState<ICancellationTierTemplate[]>([]);
    
    // Dialog control states
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingPaymentTemplate, setEditingPaymentTemplate] = useState<any>(null);
    const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
    const [editingCancellationTemplate, setEditingCancellationTemplate] = useState<any>(null);

    const loadTemplates = async () => {
        try {
            const pData = await paymentStructuresService.getTemplates();
            setPaymentTemplates(pData);
            const cData = await cancellationTiersService.getTemplates();
            setCancellationTemplates(cData);

            // Default to 0th position if not already set (only if NOT editing)
            const currentPaymentId = form.getValues("paymentStructureTemplateId");
            if (pData.length > 0 && !currentPaymentId && !isEditing) {
                form.setValue("paymentStructureTemplateId", pData[0].id, { shouldValidate: true });
                form.setValue("paymentStructure", pData[0].milestones.map(m => ({
                    name: m.name,
                    amount: m.amount,
                    description: m.description,
                    dueDate: m.dueDate,
                    order: m.order
                })), { shouldValidate: true });
            }

            const currentCancellationId = form.getValues("cancellationStructureTemplateId");
            if (cData.length > 0 && !currentCancellationId && !isEditing) {
                form.setValue("cancellationStructureTemplateId", cData[0].id, { shouldValidate: true });
                form.setValue("cancellationStructure", cData[0].tiers.map(t => ({
                    timeframe: t.timeframe,
                    amount: t.amount,
                    description: t.description
                })), { shouldValidate: true });
            }
        } catch (error) {
            console.error("Error fetching templates in normal package form:", error);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, [isEditing]);

    const handleSelectPaymentTemplate = (templateId: string) => {
        const template = paymentTemplates.find((t) => t.id === templateId);
        if (template) {
            form.setValue("paymentStructureTemplateId", template.id);
            form.setValue("paymentStructure", template.milestones.map(m => ({
                name: m.name,
                amount: m.amount,
                description: m.description,
                dueDate: m.dueDate,
                order: m.order
            })));
        }
    };

    const handleSelectCancellationTemplate = (templateId: string) => {
        const template = cancellationTemplates.find((t) => t.id === templateId);
        if (template) {
            form.setValue("cancellationStructureTemplateId", template.id);
            form.setValue("cancellationStructure", template.tiers.map(t => ({
                timeframe: t.timeframe,
                amount: t.amount,
                description: t.description
            })));
        }
    };

    useEffect(() => {
        if (!isEditing || !packageId) return;

        const loadPackageData = async () => {
            setIsLoading(true);
            try {
                const res = await axiosInstance.get<IPackages>(`/packages/${packageId}`);
                if (res.data) {
                    // Transform backend response to match form structure
                    const data: any = { ...res.data };
                    
                    if (res.data.thumbnail) {
                        setThumbnailFile(res.data.thumbnail);
                    }

                    if (res.data.packageTiers) {
                        data.packageTiers = res.data.packageTiers.map((tier: any) => ({
                            ...tier,
                            adultCost: parseFloat(tier.adultCost?.toString() ?? "0"),
                            childCostValue: parseFloat(tier.childCostValue?.toString() ?? "0"),
                            infantCostValue: parseFloat(tier.infantCostValue?.toString() ?? "0"),
                        }));
                    }

                    if (res.data.paymentStructure) {
                        data.paymentStructure = res.data.paymentStructure.map((milestone: any) => ({
                            ...milestone,
                            amount: parseFloat(milestone.amount?.toString() ?? "0"),
                        }));
                    }

                    if (res.data.cancellationStructure) {
                        data.cancellationStructure = res.data.cancellationStructure.map((can: any) => ({
                            ...can,
                            amount: parseFloat(can.amount?.toString() ?? "0"),
                        }));
                    }

                    form.reset({
                        name: data.name ?? "",
                        destination: data.destination ?? "",
                        days: data.days ?? 1,
                        nights: data.nights ?? 0,
                        description: data.description ?? "",
                        maxGuests: data.maxGuests ?? 1,
                        category: data.category ?? "adventure",
                        status: data.status ?? "draft",
                        packageSetup: "normal",
                        packageLocation: {
                            type: data.packageLocation?.type ?? "local",
                            countries: data.packageLocation?.countries ?? ["India"],
                            states: data.packageLocation?.states ?? [],
                            cities: data.packageLocation?.cities ?? [],
                        },
                        packageTiers: data.packageTiers && data.packageTiers.length > 0 ? data.packageTiers : defaultValues.packageTiers,
                        paymentStructure: data.paymentStructure && data.paymentStructure.length > 0 ? data.paymentStructure : defaultValues.paymentStructure,
                        cancellationStructure: data.cancellationStructure && data.cancellationStructure.length > 0 ? data.cancellationStructure : defaultValues.cancellationStructure,
                        paymentStructureTemplateId: data.paymentStructureTemplateId ?? undefined,
                        cancellationStructureTemplateId: data.cancellationStructureTemplateId ?? undefined,
                    });
                }
            } catch (error) {
                console.error("Failed to load package details:", error);
                toast.error("Failed to load package details");
            } finally {
                setIsLoading(false);
            }
        };

        loadPackageData();
    }, [isEditing, packageId, form]);

    const totalPaymentPercentage = (form.watch("paymentStructure") || []).reduce(
        (sum, milestone) => sum + (milestone.amount || 0),
        0,
    );

    const packageFormDataToFormData = (data: PackageFormData): FormData => {
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
            if (key !== "thumbnail") {
                appendIfDefined(key, (data as any)[key]);
            }
        });

        if (data.thumbnail instanceof File) {
            formData.append("thumbnail", data.thumbnail);
        }

        return formData;
    };

    const savePackage = async (status: "draft" | "published") => {
        setIsSaving(true);
        try {
            const values = form.getValues();
            values.status = status;

            // Force exactly one tier in packageTiers for normal package setup
            const firstTier = values.packageTiers?.[0] || {};

            values.packageTiers = [
                {
                    id: firstTier.id,
                    name: "Standard",
                    adultCost: Number(firstTier.adultCost) || 0,
                    childCostType: "flat",
                    childCostValue: Number(firstTier.childCostValue) || 0,
                    infantCostType: "flat",
                    infantCostValue: Number(firstTier.infantCostValue) || 0,
                    transportationId: "none",
                }
            ];

            // Populate required DB fields silently for normal mode
            values.description = values.description || `Normal Package for ${values.destination}`;
            values.category = values.category || "adventure";

            // Add order fields to milestones
            if (values.paymentStructure) {
                values.paymentStructure = values.paymentStructure.map((milestone, idx) => ({
                    ...milestone,
                    order: idx + 1,
                }));
            }

            const formData = packageFormDataToFormData(values);
            let response;
            if (isEditing && packageId) {
                response = await axiosInstance.patch(`/packages/${packageId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await axiosInstance.post("/packages", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (response.data) {
                toast.success(
                    status === "published"
                        ? "Package published successfully!"
                        : "Package draft saved successfully!"
                );
                onSuccess?.();
                navigate("/packages");
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || "Failed to save package";
            toast.error(errorMsg);
            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors as string[];
                errors.forEach(err => toast.error(err));
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading package details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Form {...form}>
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight">
                                {isEditing ? "Edit Normal Package" : "Create Normal Package"}
                            </h2>
                            <p className="text-muted-foreground mt-1">Configure your simplified package offering.</p>
                        </div>
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 px-3 py-1 font-semibold text-xs tracking-wider">
                            NORMAL SETUP
                        </Badge>
                    </div>

                    {/* Basic Info Section */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>Primary attributes of your package</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Weekend Gateway in Goa" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="destination"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Goa, India" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="packageLocation.type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Type</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    form.setValue(
                                                        "packageLocation.countries",
                                                        val === "local" ? ["India"] : []
                                                    );
                                                }}
                                                value={field.value || "local"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="local">Domestic</SelectItem>
                                                    <SelectItem value="international">International</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="days"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Days</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nights"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nights</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxGuests"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Guests</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {locationType && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    {locationType === "international" ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Country</Label>
                                                <SearchableSelect
                                                    options={countries}
                                                    value={selectedCountry}
                                                    onChange={handleCountryChange}
                                                    placeholder="Select Country"
                                                    searchPlaceholder="Search Country..."
                                                />
                                            </div>
                                            
                                            {selectedCountry === "India" ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">State</Label>
                                                        <SearchableSelect
                                                            options={stateOptions}
                                                            value={selectedState}
                                                            onChange={handleStateChange}
                                                            placeholder="Select State"
                                                            searchPlaceholder="Search State..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">City</Label>
                                                        <SearchableSelect
                                                            options={districtOptions}
                                                            value={selectedCity}
                                                            onChange={handleCityChange}
                                                            placeholder={selectedState ? "Select City" : "Select State First"}
                                                            searchPlaceholder="Search City..."
                                                            disabled={!selectedState}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">State/Region</Label>
                                                        <Input
                                                            placeholder="Enter state..."
                                                            value={selectedState}
                                                            onChange={(e) => form.setValue("packageLocation.states", [e.target.value])}
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">City</Label>
                                                        <Input
                                                            placeholder="Enter city..."
                                                            value={selectedCity}
                                                            onChange={(e) => form.setValue("packageLocation.cities", [e.target.value])}
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Country</Label>
                                                <Input
                                                    value="India"
                                                    disabled
                                                    className="h-9 text-sm bg-muted text-muted-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">State</Label>
                                                <SearchableSelect
                                                    options={stateOptions}
                                                    value={selectedState}
                                                    onChange={handleStateChange}
                                                    placeholder="Select State"
                                                    searchPlaceholder="Search State..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">City</Label>
                                                <SearchableSelect
                                                    options={districtOptions}
                                                    value={selectedCity}
                                                    onChange={handleCityChange}
                                                    placeholder={selectedState ? "Select City" : "Select State First"}
                                                    searchPlaceholder="Search City..."
                                                    disabled={!selectedState}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brief Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Explain what makes this package special..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Thumbnail Image</FormLabel>
                                {hasThumbnail ? (
                                    <div className="relative group overflow-hidden rounded-xl border aspect-[16/9] w-full max-h-[360px] bg-muted flex items-center justify-center shadow-md">
                                        <img
                                            src={thumbnailSrc}
                                            alt="Package thumbnail"
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="shadow-lg"
                                                onClick={() => {
                                                    form.setValue("thumbnail", undefined);
                                                    setThumbnailFile(undefined);
                                                }}
                                            >
                                                Remove Thumbnail
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <FileUploader
                                        value={[]}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                form.setValue("thumbnail", files[0]);
                                            }
                                        }}
                                        maxFiles={1}
                                        accept="image/*"
                                        className="w-full"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Package Pricing Section */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-primary" />
                                Package Pricing
                            </CardTitle>
                            <CardDescription>Define the base pricing for adults, children, and infants.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="packageTiers.0.adultCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adult Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 30000"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="packageTiers.0.childCostValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Child Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 25000"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="packageTiers.0.infantCostValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Infant Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 13000"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Milestone Section */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-primary" />
                                    Payment Structure
                                </CardTitle>
                                <CardDescription>Select milestone template or configure inline</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const selectedId = form.getValues("paymentStructureTemplateId");
                                        const template = paymentTemplates.find((t) => t.id === selectedId);
                                        if (template) {
                                            setEditingPaymentTemplate(template);
                                            setPaymentDialogOpen(true);
                                        }
                                    }}
                                    disabled={!form.watch("paymentStructureTemplateId")}
                                    className="h-8 gap-1 text-xs cursor-pointer"
                                >
                                    <Edit className="w-3.5 h-3.5" /> Edit Template
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        setEditingPaymentTemplate(null);
                                        setPaymentDialogOpen(true);
                                    }}
                                    className="h-8 gap-1 text-xs cursor-pointer bg-primary"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Create New
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="paymentStructureTemplateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Payment Structure Template</FormLabel>
                                        <Select
                                            key={paymentTemplates.length}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                handleSelectPaymentTemplate(val);
                                            }}
                                            value={field.value || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue placeholder="Select payment structure..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentTemplates.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Preview milestones */}
                            {form.watch("paymentStructure") && form.watch("paymentStructure")!.length > 0 && (
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-muted-foreground">Milestones Preview</span>
                                        <Badge variant={totalPaymentPercentage === 100 ? "default" : "destructive"}>
                                            Total: {totalPaymentPercentage}% / 100%
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {form.watch("paymentStructure")!.map((m, idx) => {
                                            const formatDue = (d: string) => {
                                                if (d === "booking") return "Booking";
                                                if (d === "30_days_before") return "30 Days Before";
                                                if (d === "2_weeks_before") return "2 Weeks Before";
                                                if (d === "1_week_before") return "1 Week Before";
                                                if (d === "departure") return "Departure";
                                                return d;
                                            };
                                            return (
                                                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-secondary/35 border rounded-lg">
                                                    <div>
                                                        <div className="font-bold">{m.name || `Milestone ${idx + 1}`}</div>
                                                        {m.description && <div className="text-[10px] text-muted-foreground">{m.description}</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px]">{formatDue(m.dueDate || "")}</Badge>
                                                        <Badge variant="secondary" className="font-bold">{m.amount}%</Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cancellation Section */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Cancellation Tiers
                                </CardTitle>
                                <CardDescription>Select cancellation policy template or configure inline</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const selectedId = form.getValues("cancellationStructureTemplateId");
                                        const template = cancellationTemplates.find((t) => t.id === selectedId);
                                        if (template) {
                                            setEditingCancellationTemplate(template);
                                            setCancellationDialogOpen(true);
                                        }
                                    }}
                                    disabled={!form.watch("cancellationStructureTemplateId")}
                                    className="h-8 gap-1 text-xs cursor-pointer"
                                >
                                    <Edit className="w-3.5 h-3.5" /> Edit Template
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        setEditingCancellationTemplate(null);
                                        setCancellationDialogOpen(true);
                                    }}
                                    className="h-8 gap-1 text-xs cursor-pointer bg-primary"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Create New
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="cancellationStructureTemplateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cancellation Tiers Template</FormLabel>
                                        <Select
                                            key={cancellationTemplates.length}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                handleSelectCancellationTemplate(val);
                                            }}
                                            value={field.value || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue placeholder="Select cancellation tiers..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cancellationTemplates.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Preview cancellation tiers */}
                            {form.watch("cancellationStructure") && form.watch("cancellationStructure")!.length > 0 && (
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="text-sm font-semibold text-muted-foreground">Cancellation Policies Preview</div>
                                    <div className="space-y-2">
                                        {form.watch("cancellationStructure")!.map((t, idx) => {
                                            const formatTime = (time: string) => {
                                                if (time === "30_days_before") return "30+ Days Before";
                                                if (time === "2_weeks_before") return "15-30 Days Before";
                                                if (time === "1_week_before") return "7-14 Days Before";
                                                if (time === "departure") return "0-7 Days Before / No Show";
                                                return time;
                                            };
                                            return (
                                                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-secondary/35 border rounded-lg">
                                                    <div>
                                                        <div className="font-bold">{formatTime(t.timeframe || "")}</div>
                                                        {t.description && <div className="text-[10px] text-muted-foreground">{t.description}</div>}
                                                    </div>
                                                    <Badge variant="destructive" className="font-bold font-mono">{t.amount}% Charge</Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/packages")}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => savePackage("draft")}
                            disabled={isSaving || totalPaymentPercentage !== 100}
                        >
                            {isSaving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => savePackage("published")}
                            disabled={isSaving || totalPaymentPercentage !== 100}
                            className="gap-2"
                        >
                            {isSaving ? "Saving..." : "Publish Package"}
                            <Save className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Payment Structure dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPaymentTemplate ? "Edit Payment Structure Template" : "Create Payment Structure Template"}</DialogTitle>
                    </DialogHeader>
                    <PaymentStructureForm 
                        initialData={editingPaymentTemplate} 
                        onSuccess={async (newT: any) => {
                            await loadTemplates();
                            setPaymentDialogOpen(false);
                            if (newT) {
                                form.setValue("paymentStructureTemplateId", newT.id);
                                handleSelectPaymentTemplate(newT.id);
                            }
                        }}
                        onCancel={() => setPaymentDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Cancellation Tiers dialog */}
            <Dialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCancellationTemplate ? "Edit Cancellation Tier Template" : "Create Cancellation Tier Template"}</DialogTitle>
                    </DialogHeader>
                    <CancellationTierForm 
                        initialData={editingCancellationTemplate} 
                        onSuccess={async (newT: any) => {
                            await loadTemplates();
                            setCancellationDialogOpen(false);
                            if (newT) {
                                form.setValue("cancellationStructureTemplateId", newT.id);
                                handleSelectCancellationTemplate(newT.id);
                            }
                        }}
                        onCancel={() => setCancellationDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
