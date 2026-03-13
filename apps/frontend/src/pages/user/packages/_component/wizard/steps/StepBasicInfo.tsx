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
import { Save } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

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
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., 7 Days, 6 Nights"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (INR)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="1299"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number.parseFloat(
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
