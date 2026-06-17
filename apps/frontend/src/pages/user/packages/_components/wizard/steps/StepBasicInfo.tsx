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
import type { PackageFormData } from "@/types/package.schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { StepErrors } from "../../step-errors";

interface StepBasicInfoProps {
    form: UseFormReturn<PackageFormData>;
    thumbnailFile?: string;
    handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
    isLoading?: boolean;
}

export function StepBasicInfo({
    form,
    thumbnailFile,
    handleThumbnailUpload,
    onNext,
    isLoading,
}: StepBasicInfoProps) {
    const [newItem, setNewItem] = useState<{
        type: "countries" | "states" | "cities";
        value: string;
    }>({ type: "countries", value: "" });

    const addLocationItem = (type: "countries" | "states" | "cities") => {
        if (!newItem.value.trim()) return;
        const current = form.getValues(`packageLocation.${type}`) || [];
        form.setValue(`packageLocation.${type}`, [...current, newItem.value.trim()]);
        setNewItem({ type, value: "" });
    };

    const removeLocationItem = (type: "countries" | "states" | "cities", index: number) => {
        const current = form.getValues(`packageLocation.${type}`) || [];
        form.setValue(
            `packageLocation.${type}`,
            current.filter((_, i) => i !== index),
        );
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
                    <div className="flex items-center gap-4">
                        <div className="relative group overflow-hidden rounded-lg border aspect-[4/3] w-[200px]">
                            <img
                                src={thumbnailFile || "/placeholder.svg"}
                                alt="Package thumbnail"
                                className={`w-full h-full object-cover transition-all duration-300 ${!thumbnailFile ? "blur-sm grayscale" : "hover:scale-105"}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "/placeholder.svg";
                                }}
                            />
                            {!thumbnailFile && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Upload Thumbnail</Label>
                            <Input
                                id="thumbnail"
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                                className="w-full"
                            />
                            <p className="text-sm">
                                Recommended: 400x300px, JPG or PNG
                            </p>
                        </div>
                    </div>
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
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseInt(e.target.value) || 0
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
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseInt(e.target.value) || 0
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
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseInt(
                                                        e.target.value,
                                                    ) || 0,
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {form.watch("packageLocation.type") === "international" && (
                                <div className="space-y-2">
                                    <Label className="font-medium">Countries</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add country..."
                                            value={newItem.type === "countries" ? newItem.value : ""}
                                            onChange={(e) => setNewItem({ type: "countries", value: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addLocationItem("countries");
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={() => addLocationItem("countries")} variant="secondary">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(form.watch("packageLocation.countries") || []).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md text-sm">
                                                <span>{item}</span>
                                                <Button type="button" variant="ghost" size="sm" className="h-auto p-0" onClick={() => removeLocationItem("countries", idx)}>
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="font-medium">States/Regions</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add state..."
                                        value={newItem.type === "states" ? newItem.value : ""}
                                        onChange={(e) => setNewItem({ type: "states", value: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addLocationItem("states");
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={() => addLocationItem("states")} variant="secondary">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(form.watch("packageLocation.states") || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md text-sm">
                                            <span>{item}</span>
                                            <Button type="button" variant="ghost" size="sm" className="h-auto p-0" onClick={() => removeLocationItem("states", idx)}>
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Cities</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add city..."
                                        value={newItem.type === "cities" ? newItem.value : ""}
                                        onChange={(e) => setNewItem({ type: "cities", value: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addLocationItem("cities");
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={() => addLocationItem("cities")} variant="secondary">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(form.watch("packageLocation.cities") || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md text-sm">
                                            <span>{item}</span>
                                            <Button type="button" variant="ghost" size="sm" className="h-auto p-0" onClick={() => removeLocationItem("cities", idx)}>
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end items-center gap-4">
                <StepErrors
                    form={form}
                    fields={[
                        "name",
                        "destination",
                        "days",
                        "nights",
                        "basePrice",
                        "description",
                        "maxGuests",
                        "category",
                        "thumbnail",
                        "status",
                        "packageLocation",
                    ]}
                />
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
