import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader";
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
import type { PackageFormData } from "@/types/package.schema";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { getFileUrl } from "@/lib/utils";
import { SearchableSelect } from "@/components/searchable-select";
import { countries } from "@/pages/user/customers/_components/countries";
import { getAllStates, getDistricts } from "india-state-district";

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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Package Thumbnail</CardTitle>
                    <CardDescription>
                        Upload a main image for your package
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasThumbnail ? (
                        <div className="space-y-4">
                            <Label className="text-sm font-medium mb-2 block">Package Thumbnail</Label>
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
                        </div>
                    ) : (
                        <div className="w-full">
                            <Label className="text-sm font-medium mb-2 block">Upload Thumbnail</Label>
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
                            <p className="text-xs text-muted-foreground mt-2">
                                Recommended: 400x300px, JPG or PNG (under 5MB)
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        Enter the basic details of your tour package
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Package Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Bali Paradise Getaway"
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
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Bali, Indonesia"
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe your tour package..."
                                        className="min-h-[100px]"
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
                                    <FormLabel>Days</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="7"
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
                                    <FormLabel>Nights</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="6"
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
                                    <FormLabel>Max Guests</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="12"
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
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="adventure">
                                            Adventure
                                        </SelectItem>
                                        <SelectItem value="cultural">
                                            Cultural
                                        </SelectItem>
                                        <SelectItem value="relaxation">
                                            Relaxation
                                        </SelectItem>
                                        <SelectItem value="wildlife">
                                            Wildlife
                                        </SelectItem>
                                        <SelectItem value="luxury">
                                            Luxury
                                        </SelectItem>
                                        <SelectItem value="budget">
                                            Budget
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Package Location</CardTitle>
                    <CardDescription>
                        Where is this tour taking place?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="packageLocation.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Package Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="international">
                                            International
                                        </SelectItem>
                                        <SelectItem value="local">
                                            Local/Domestic
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {form.watch("packageLocation.type") && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                            {form.watch("packageLocation.type") === "international" ? (
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
                </CardContent>
            </Card>

            <div className="flex justify-end">
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
