import { FileUploader } from "@/components/file-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getFileUrl } from "@/lib/utils";
import type { PackageFormData } from "@/types/package.schema";
import { Building2, Edit, Globe, Landmark, MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { LocationSelectionModal, type PackageLocationValue } from "../../location-selection-modal";

interface StepBasicInfoProps {
    form: UseFormReturn<PackageFormData>;
    thumbnailFile?: string;
    setThumbnailFile: (val?: string) => void;
    onNext: () => void;
    isLoading?: boolean;
}

export function StepBasicInfo({
    form,
    thumbnailFile,
    setThumbnailFile,
    onNext,
    isLoading,
}: StepBasicInfoProps) {
    const selectedThumbnail = form.watch("thumbnail");
    const hasThumbnail = !!(selectedThumbnail || thumbnailFile);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

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
    const selectedCountries = form.watch("packageLocation.countries") || (locationType === "local" ? ["India"] : []);
    const selectedStates = form.watch("packageLocation.states") || [];
    const selectedCities = form.watch("packageLocation.cities") || [];

    const [locationModalOpen, setLocationModalOpen] = useState(false);

    const handleLocationModalChange = (newVal: PackageLocationValue) => {
        form.setValue("packageLocation", newVal);
    };

    return (
        <div className="space-y-6">
            {/* Thumbnail Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-bold">Package Thumbnail</CardTitle>
                    <CardDescription className="text-xs">
                        Upload a primary high-resolution cover image for your package brochure & listing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasThumbnail ? (
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold block">Package Cover Image</Label>
                            <div className="relative group overflow-hidden rounded-2xl border aspect-[16/9] w-full max-h-[340px] bg-muted flex items-center justify-center shadow-md">
                                <img
                                    src={thumbnailSrc}
                                    alt="Package thumbnail"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="shadow-lg rounded-xl text-xs"
                                        onClick={() => {
                                            form.setValue("thumbnail", undefined);
                                            setThumbnailFile(undefined);
                                        }}
                                    >
                                        Remove Thumbnail
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <Label className="text-xs font-semibold mb-2 block">Upload Thumbnail</Label>
                            <FileUploader
                                value={[]}
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        form.setValue("thumbnail", files[0]);
                                    }
                                }}
                                maxFiles={1}
                                accept="image/*"
                                className="w-full rounded-2xl border-dashed"
                            />
                            <p className="text-[11px] text-muted-foreground mt-2">
                                Recommended resolution: 1200x800px, JPG or PNG (under 5MB)
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-bold">Basic Information</CardTitle>
                    <CardDescription className="text-xs">
                        Enter title, destination, category, and stay duration details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium">Package Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Bali Paradise Getaway"
                                            className="rounded-xl h-10 text-xs"
                                            {...field}
                                        />
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
                                    <FormLabel className="text-xs font-medium">Primary Destination</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Bali, Indonesia"
                                            className="rounded-xl h-10 text-xs"
                                            {...field}
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
                                <FormLabel className="text-xs font-medium">Overview Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe key highlights, experience, and overview of this package..."
                                        className="min-h-[100px] rounded-xl text-xs"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium">Total Days</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="7"
                                            className="rounded-xl h-10 font-mono text-xs"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
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
                                    <FormLabel className="text-xs font-medium">Total Nights</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="6"
                                            className="rounded-xl h-10 font-mono text-xs"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
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
                                    <FormLabel className="text-xs font-medium">Max Group Capacity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="12"
                                            className="rounded-xl h-10 font-mono text-xs"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium">Travel Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 text-xs">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="adventure">Adventure</SelectItem>
                                        <SelectItem value="cultural">Cultural</SelectItem>
                                        <SelectItem value="relaxation">Relaxation</SelectItem>
                                        <SelectItem value="wildlife">Wildlife</SelectItem>
                                        <SelectItem value="luxury">Luxury</SelectItem>
                                        <SelectItem value="budget">Budget</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Package Location Card */}
            <Card className="shadow-xs border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-bold">Package Location Scope</CardTitle>
                    <CardDescription className="text-xs">
                        Specify geographic coverage (Domestic/Local vs International) and target cities
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="packageLocation.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium">Package Region Type</FormLabel>
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
                                        <SelectItem value="international">International Destination</SelectItem>
                                        <SelectItem value="local">Local / Domestic India</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <div className="border rounded-2xl p-4 bg-muted/30 space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                                    {locationType === "international" ? <Globe className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-foreground">Selected Destinations</h4>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-primary/30 text-primary rounded-md">
                                            {locationType}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {locationType === "international"
                                            ? "Configured for international travel destinations"
                                            : "Configured for domestic travel across India"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLocationModalOpen(true)}
                                className="text-xs gap-1.5 h-8 font-semibold shrink-0 cursor-pointer rounded-xl border-primary/20 hover:border-primary"
                            >
                                <Edit className="h-3.5 w-3.5" />
                                Configure Locations
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t text-xs">
                            {selectedCountries.map((c) => (
                                <Badge key={`fc-${c}`} variant="secondary" className="text-xs gap-1 font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 rounded-md">
                                    <Globe className="h-3 w-3" />
                                    <span>{c}</span>
                                </Badge>
                            ))}
                            {selectedStates.map((s) => (
                                <Badge key={`fs-${s}`} variant="secondary" className="text-xs gap-1 font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-md">
                                    <Landmark className="h-3 w-3" />
                                    <span>{s}</span>
                                </Badge>
                            ))}
                            {selectedCities.map((ct) => (
                                <Badge key={`fct-${ct}`} variant="secondary" className="text-xs gap-1 font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-md">
                                    <Building2 className="h-3 w-3" />
                                    <span>{ct}</span>
                                </Badge>
                            ))}

                            {selectedCountries.length === 0 && selectedStates.length === 0 && selectedCities.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">No locations configured yet. Click "Configure Locations" to set destinations.</span>
                            )}
                        </div>
                    </div>

                    <LocationSelectionModal
                        open={locationModalOpen}
                        onOpenChange={setLocationModalOpen}
                        value={{
                            type: locationType,
                            countries: selectedCountries,
                            states: selectedStates,
                            cities: selectedCities,
                        }}
                        onChange={handleLocationModalChange}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end pt-2 border-t">
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading}
                    className="rounded-xl px-6 gap-2 text-xs font-semibold"
                >
                    {isLoading ? "Saving..." : "Save & Next"}
                    <Save className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
