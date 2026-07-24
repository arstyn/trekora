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
import { Loader2, Plus, Save, Trash2, Globe, MapPin, IndianRupee, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFileUrl } from "@/lib/utils";

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

    const {
        fields: paymentFields,
        append: appendPayment,
        remove: removePayment,
    } = useFieldArray({
        control: form.control,
        name: "paymentStructure",
    });

    const {
        fields: cancellationFields,
        append: appendCancellation,
        remove: removeCancellation,
    } = useFieldArray({
        control: form.control,
        name: "cancellationStructure",
    });

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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-primary" />
                                    Payment Structure
                                </CardTitle>
                                <CardDescription>Define due date milestones. Percentages must total 100%.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendPayment({ name: "", amount: 0, description: "", dueDate: "booking" })}
                                className="h-8 gap-1 text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Milestone
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                                <span className="text-sm font-medium">Total Milestone Percentage:</span>
                                <Badge variant={totalPaymentPercentage === 100 ? "default" : "destructive"}>
                                    {totalPaymentPercentage}% / 100%
                                </Badge>
                            </div>

                            {paymentFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-end border p-4 rounded-xl bg-card/40 relative">
                                    <FormField
                                        control={form.control}
                                        name={`paymentStructure.${index}.dueDate`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Due Date Timeframe</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || "booking"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="booking">At Booking</SelectItem>
                                                        <SelectItem value="30_days_before">30 Days Before</SelectItem>
                                                        <SelectItem value="2_weeks_before">2 Weeks Before</SelectItem>
                                                        <SelectItem value="1_week_before">1 Week Before</SelectItem>
                                                        <SelectItem value="departure">At Departure</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`paymentStructure.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Percentage (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={paymentFields.length === 1}
                                        onClick={() => removePayment(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50/10 h-10 w-10 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Cancellation Section */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Cancellation Tiers
                                </CardTitle>
                                <CardDescription>Policy percentages based on timeframe</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendCancellation({ timeframe: "30_days_before", amount: 0, description: "" })}
                                className="h-8 gap-1 text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Tier
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cancellationFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-end border p-4 rounded-xl bg-card/40 relative">
                                    <FormField
                                        control={form.control}
                                        name={`cancellationStructure.${index}.timeframe`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Timeframe</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || "30_days_before"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="30_days_before">30+ Days Before</SelectItem>
                                                        <SelectItem value="2_weeks_before">15-30 Days Before</SelectItem>
                                                        <SelectItem value="1_week_before">7-14 Days Before</SelectItem>
                                                        <SelectItem value="departure">0-7 Days / No Show</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`cancellationStructure.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Charge Percentage (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={cancellationFields.length === 1}
                                        onClick={() => removeCancellation(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50/10 h-10 w-10 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
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
        </div>
    );
}
