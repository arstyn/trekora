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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PackageFormData } from "@/types/package.schema";
import { Clock, Hash, MapPin, Plus, Save, Trash2, Utensils, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import mealsService from "@/services/meals.service";
import type { IMeal, MealItem } from "@/types/meals.types";
import { toast } from "sonner";

interface StepLogisticsProps {
    form: UseFormReturn<PackageFormData>;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

function TransportationSegmentList({ control, index }: { control: any; index: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `transportation.${index}.segments`,
    });

    const watchedSegments = useWatch({
        control,
        name: `transportation.${index}.segments`,
    }) || [];

    return (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20 mt-4 bg-secondary/5 p-4 rounded-r-lg">
            <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Journey Segments</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ mode: "flight", number: "", from: "", to: "", departureTime: "", arrivalTime: "", coachType: "none" })}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Segment
                </Button>
            </h5>

            {fields.map((field, segIndex) => {
                const modeName = `transportation.${index}.segments.${segIndex}.mode`;
                return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-end border-b border-primary/10 pb-4 last:border-0 last:pb-0 relative pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => remove(segIndex)}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>

                        <FormField
                            control={control}
                            name={modeName as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Mode</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "flight"}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="flight">Flight</SelectItem>
                                            <SelectItem value="train">Train</SelectItem>
                                            <SelectItem value="bus">Bus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.number` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Number (Flight/Train/Bus)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Hash className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="e.g. AI-101" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.from` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">From</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="Origin" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.to` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">To</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input className="h-8 text-xs pl-6" placeholder="Destination" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.departureTime` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Departure Time</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input type="time" className="h-8 text-xs pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`transportation.${index}.segments.${segIndex}.arrivalTime` as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Arrival Time</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                            <Input type="time" className="h-8 text-xs pl-6" {...field} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Render Coach Type only if mode is train */}
                        {watchedSegments[segIndex]?.mode === 'train' && (
                            <FormField
                                control={control}
                                name={`transportation.${index}.segments.${segIndex}.coachType` as any}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-xs">Coach Type (Train only)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="1AC">1AC (First AC)</SelectItem>
                                                    <SelectItem value="2AC">2AC (Second AC)</SelectItem>
                                                    <SelectItem value="3AC">3AC (Third AC)</SelectItem>
                                                    <SelectItem value="SL">SL (Sleeper)</SelectItem>
                                                    <SelectItem value="CC">CC (AC Chair Car)</SelectItem>
                                                    <SelectItem value="EC">EC (Exec Chair Car)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    );
                                }}
                            />
                        )}
                    </div>
                );
            })}

            {fields.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No segments added. Click 'Add Segment' to build this journey.</p>
            )}
        </div>
    );
}

export function StepLogistics({
    form,
    onNext,
    onBack,
    isLoading,
}: StepLogisticsProps) {
    const { fields: transportationFields, append: appendTransportation, remove: removeTransportation } = useFieldArray({
        control: form.control,
        name: "transportation",
    });

    const [meals, setMeals] = useState<IMeal[]>([]);
    const [loadingMeals, setLoadingMeals] = useState(true);
    const [filterType, setFilterType] = useState<"all" | "veg" | "non-veg">("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add New Meal Plan State
    const [newMealName, setNewMealName] = useState("");
    const [newMealType, setNewMealType] = useState<"veg" | "non-veg">("veg");
    const [newBreakfast, setNewBreakfast] = useState<MealItem[]>([]);
    const [newLunch, setNewLunch] = useState<MealItem[]>([]);
    const [newDinner, setNewDinner] = useState<MealItem[]>([]);

    // Temporary inputs for creator modal
    const [tempItemName, setTempItemName] = useState("");
    const [tempCurry, setTempCurry] = useState("");
    const [tempPrice, setTempPrice] = useState("");

    const fetchMeals = async () => {
        try {
            setLoadingMeals(true);
            const data = await mealsService.getMeals();
            setMeals(data);
        } catch (err) {
            console.error("Error fetching meals:", err);
            toast.error("Failed to load meal plans");
        } finally {
            setLoadingMeals(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, []);

    const handleMealSelect = (mealId: string) => {
        const selectedMeal = meals.find((m) => m.id === mealId);
        if (!selectedMeal) return;

        const formatItem = (item: MealItem) => {
            let str = item.name;
            if (item.curry) str += ` (${item.curry})`;
            if (item.price !== undefined && item.price !== null && item.price > 0) {
                str += ` - ₹${item.price}`;
            }
            return str;
        };

        form.setValue("mealsBreakdown.mealId", selectedMeal.id, { shouldDirty: true });
        form.setValue("mealsBreakdown.breakfast", (selectedMeal.breakfast || []).map(formatItem), { shouldDirty: true });
        form.setValue("mealsBreakdown.lunch", (selectedMeal.lunch || []).map(formatItem), { shouldDirty: true });
        form.setValue("mealsBreakdown.dinner", (selectedMeal.dinner || []).map(formatItem), { shouldDirty: true });
    };

    const handleCreateMeal = async () => {
        if (!newMealName.trim()) {
            toast.error("Meal option name is required");
            return;
        }

        try {
            const data = await mealsService.createMeal({
                name: newMealName.trim(),
                type: newMealType,
                breakfast: newBreakfast,
                lunch: newLunch,
                dinner: newDinner,
            });

            toast.success("Meal option created successfully");
            // Reset state
            setNewMealName("");
            setNewMealType("veg");
            setNewBreakfast([]);
            setNewLunch([]);
            setNewDinner([]);
            setIsAddModalOpen(false);

            // Refetch & auto select
            const updated = await mealsService.getMeals();
            setMeals(updated);
            
            const newlyCreated = updated.find(m => m.name === data.name || m.id === data.id);
            if (newlyCreated) {
                handleMealSelect(newlyCreated.id);
            }
        } catch (error: any) {
            console.error("Error creating meal option:", error);
            const message = error.response?.data?.message || "Failed to create meal option";
            toast.error(message);
        }
    };

    const addTempItem = (type: "breakfast" | "lunch" | "dinner") => {
        if (!tempItemName.trim()) {
            toast.error("Item name is required");
            return;
        }
        const item: MealItem = {
            name: tempItemName.trim(),
            curry: tempCurry.trim() || undefined,
            price: tempPrice ? Number(tempPrice) : undefined,
        };

        if (type === "breakfast") setNewBreakfast(prev => [...prev, item]);
        else if (type === "lunch") setNewLunch(prev => [...prev, item]);
        else setNewDinner(prev => [...prev, item]);

        setTempItemName("");
        setTempCurry("");
        setTempPrice("");
    };

    const removeTempItem = (type: "breakfast" | "lunch" | "dinner", idx: number) => {
        if (type === "breakfast") setNewBreakfast(prev => prev.filter((_, i) => i !== idx));
        else if (type === "lunch") setNewLunch(prev => prev.filter((_, i) => i !== idx));
        else setNewDinner(prev => prev.filter((_, i) => i !== idx));
    };

    const currentMealId = form.watch("mealsBreakdown.mealId");
    const selectedMeal = meals.find((m) => m.id === currentMealId);

    const filteredMeals = meals.filter((m) => {
        if (m.id === currentMealId) return true;
        if (filterType === "all") return true;
        return m.type === filterType;
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Meals Breakdown</CardTitle>
                    <CardDescription>
                        Select a standardized meal option or add a new one.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filter and Selection row */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-auto flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Filter by Type</Label>
                            <Tabs
                                value={filterType}
                                onValueChange={(val) => setFilterType(val as "all" | "veg" | "non-veg")}
                                className="w-fit"
                            >
                                <TabsList className="h-9 p-[3px]">
                                    <TabsTrigger
                                        value="all"
                                        className="text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="veg"
                                        className="text-xs px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                                    >
                                        Veg
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="non-veg"
                                        className="text-xs px-4 data-[state=active]:bg-rose-600 data-[state=active]:text-white"
                                    >
                                        Non-Veg
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex-1 w-full flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Select Meal Plan</Label>
                            <Select
                                value={currentMealId || ""}
                                onValueChange={handleMealSelect}
                                disabled={loadingMeals}
                            >
                                <SelectTrigger className="w-full h-9">
                                    <SelectValue placeholder={loadingMeals ? "Loading meal options..." : "Choose standard meal plan"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredMeals.map((meal) => (
                                        <SelectItem key={meal.id} value={meal.id}>
                                            <span className="font-medium mr-2">{meal.name}</span>
                                            <span className="text-[10px] text-muted-foreground capitalize">({meal.type})</span>
                                        </SelectItem>
                                    ))}
                                    {filteredMeals.length === 0 && (
                                        <SelectItem value="none" disabled>
                                            No plans found for selected filter
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 w-full md:w-auto">
                            <Label className="text-xs text-muted-foreground invisible select-none">Action</Label>
                            <Button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="h-9 gap-1 flex-1 md:flex-none"
                            >
                                <Plus className="w-4 h-4" /> Add New
                            </Button>
                        </div>
                    </div>

                    {/* Selected Meal Details Preview in Logistics form */}
                    {selectedMeal && (
                        <div className="border rounded-xl p-4 bg-muted/10 space-y-4 shadow-xs">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    Selected Plan: <span className="text-primary font-bold">{selectedMeal.name}</span>
                                </h4>
                                {selectedMeal.type === "veg" ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize font-medium">
                                        Veg
                                    </Badge>
                                ) : selectedMeal.type === "non-veg" ? (
                                    <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 capitalize font-medium">
                                        Non-Veg
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 capitalize font-medium">
                                        All
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                                    const items = selectedMeal[mealType] || [];
                                    return (
                                        <div key={mealType} className="space-y-2">
                                            <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground capitalize flex items-center gap-1.5">
                                                <Utensils className="w-3.5 h-3.5 text-primary" /> {mealType}
                                            </h5>
                                            {items.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No items configured</p>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {items.map((item, idx) => (
                                                        <li key={idx} className="text-xs flex flex-col border-b border-muted/50 pb-1.5 last:border-0 last:pb-0">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium text-foreground capitalize">{item.name}</span>
                                                                {item.price !== undefined && item.price !== null && item.price > 0 && (
                                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">₹{item.price}</span>
                                                                )}
                                                            </div>
                                                            {item.curry && (
                                                                <span className="text-[10px] text-muted-foreground mt-0.5">{item.curry}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <FormField
                            control={form.control}
                            name="mealsBreakdown.mealsCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Meals Cost (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 5000"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Transportation Options</CardTitle>
                            <CardDescription>Available transport tiers and costs</CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={() => appendTransportation({ id: crypto.randomUUID(), title: "", segments: [], cost: 0 })}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {transportationFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <h4 className="font-medium text-primary flex items-center gap-2">
                                    Transportation Option {index + 1}
                               </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTransportation(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Two-Way Flight, Mixed (Train+Flight)" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`transportation.${index}.cost`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Option Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <TransportationSegmentList control={form.control} index={index} />
                        </div>
                    ))}
                    {transportationFields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No transportation options added. Click 'Add Option' to include transport tiers.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ground Transportation</CardTitle>
                    <CardDescription>Overall ground transportation costs for the package</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="groundTransportationCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ground Transportation Cost (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 2000"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
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



            {/* Modal: Create New Meal Option from Logistics */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create Meal Option</DialogTitle>
                        <DialogDescription>
                            Configure a new meal combination. Once saved, it will be added to the global meals table and selected for this package.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 my-4">
                        {/* Name and Type Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Meal Option Name</Label>
                                <Input
                                    value={newMealName}
                                    onChange={(e) => setNewMealName(e.target.value)}
                                    placeholder="e.g. Deluxe Veg Meal plan"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Meal Type</Label>
                                <Select
                                    value={newMealType}
                                    onValueChange={(val) => setNewMealType(val as any)}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="veg">Veg</SelectItem>
                                        <SelectItem value="non-veg">Non-Veg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Interactive Item Constructor */}
                        <div className="border rounded-xl p-4 bg-muted/10 space-y-4">
                            <h4 className="font-semibold text-sm text-foreground">Add Items to Sections</h4>
                            
                            {/* Temp constructor row */}
                            <div className="bg-card p-3 rounded-lg border space-y-3">
                                <Label className="text-xs font-semibold block text-primary">Item Details</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Item Name</Label>
                                        <Input
                                            value={tempItemName}
                                            onChange={(e) => setTempItemName(e.target.value)}
                                            placeholder="e.g. Chapathi, Chicken Biryani"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Curry / Side (Optional)</Label>
                                        <Input
                                            value={tempCurry}
                                            onChange={(e) => setTempCurry(e.target.value)}
                                            placeholder="e.g. Paneer Butter Masala"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Price (₹)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={tempPrice}
                                            onChange={(e) => setTempPrice(e.target.value)}
                                            placeholder="e.g. 50"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-1 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] font-semibold text-amber-600 border-amber-500/20 hover:bg-amber-500/5"
                                        onClick={() => addTempItem("breakfast")}
                                    >
                                        Add to Breakfast
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] font-semibold text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/5"
                                        onClick={() => addTempItem("lunch")}
                                    >
                                        Add to Lunch
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] font-semibold text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/5"
                                        onClick={() => addTempItem("dinner")}
                                    >
                                        Add to Dinner
                                    </Button>
                                </div>
                            </div>

                            {/* Added list tabs */}
                            <Tabs defaultValue="breakfast" className="w-full">
                                <TabsList className="w-full justify-start h-8">
                                    <TabsTrigger value="breakfast" className="text-xs h-7">Breakfast ({newBreakfast.length})</TabsTrigger>
                                    <TabsTrigger value="lunch" className="text-xs h-7">Lunch ({newLunch.length})</TabsTrigger>
                                    <TabsTrigger value="dinner" className="text-xs h-7">Dinner ({newDinner.length})</TabsTrigger>
                                </TabsList>

                                {(["breakfast", "lunch", "dinner"] as const).map((type) => {
                                    const list = type === "breakfast" ? newBreakfast : type === "lunch" ? newLunch : newDinner;
                                    return (
                                        <TabsContent key={type} value={type} className="mt-2 min-h-[100px] border rounded-lg bg-card p-3">
                                            {list.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic text-center py-6">No items added to {type} yet.</p>
                                            ) : (
                                                <ul className="space-y-1.5">
                                                    {list.map((item, idx) => (
                                                        <li key={idx} className="flex justify-between items-center text-xs border-b border-muted pb-1.5 last:border-0 last:pb-0">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold capitalize">{item.name}</span>
                                                                {item.curry && <span className="text-[10px] text-muted-foreground">{item.curry}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {item.price !== undefined && item.price !== null && (
                                                                    <span className="font-semibold text-primary">₹{item.price}</span>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 text-red-500 hover:bg-red-50"
                                                                    onClick={() => removeTempItem(type, idx)}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateMeal}>
                            Save Meal Option
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
