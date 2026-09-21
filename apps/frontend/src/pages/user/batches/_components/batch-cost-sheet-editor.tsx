import { useState } from "react";
import type {
    IBatchCostSheet,
    ICostSheetTier,
    ICostSheetItem,
} from "@/types/cost-sheet.types";
import {
    generateId,
    calculateItemsTotal,
    createDefaultAgeCategory,
    createDefaultTier,
} from "@/types/cost-sheet.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Trash2,
    Copy,
    Layers,
    Users,
    Sparkles,
    Check,
    RotateCcw,
    Tag,
    User
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BatchCostSheetEditorProps {
    value: IBatchCostSheet;
    onChange: (costSheet: IBatchCostSheet) => void;
    previousBatchCostSheet?: IBatchCostSheet | null;
    packageTemplateCostSheet?: IBatchCostSheet | null;
    packageName?: string;
}

export function BatchCostSheetEditor({
    value,
    onChange,
    previousBatchCostSheet,
    packageTemplateCostSheet,
    packageName,
}: BatchCostSheetEditorProps) {
    const [activeTierIndex, setActiveTierIndex] = useState(0);
    const [activeAgeIndex, setActiveAgeIndex] = useState(0);
    const [isAddAgeModalOpen, setIsAddAgeModalOpen] = useState(false);
    const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
    const [newAgeName, setNewAgeName] = useState("");
    const [newAgeDesc, setNewAgeDesc] = useState("");
    const [newTierName, setNewTierName] = useState("");

    // Safe access
    const safeTiers = value.tiers && value.tiers.length > 0 ? value.tiers : [createDefaultTier("Standard", true)];
    const currentTier = safeTiers[Math.min(activeTierIndex, safeTiers.length - 1)] || safeTiers[0];
    const safeAges = currentTier.ageCategories && currentTier.ageCategories.length > 0
        ? currentTier.ageCategories
        : [createDefaultAgeCategory("Adult", "12+ yrs", true)];
    const currentAge = safeAges[Math.min(activeAgeIndex, safeAges.length - 1)] || safeAges[0];

    // Helper to update active age items
    const updateActiveAgeItems = (updater: (items: ICostSheetItem[]) => ICostSheetItem[]) => {
        const updatedItems = updater([...(currentAge.items || [])]);
        const updatedTotal = calculateItemsTotal(updatedItems);

        const updatedAgeCategories = safeAges.map((age, idx) => {
            if (idx === activeAgeIndex) {
                return {
                    ...age,
                    items: updatedItems,
                    totalCost: updatedTotal,
                };
            }
            return age;
        });

        const updatedTiers = safeTiers.map((tier, idx) => {
            if (idx === activeTierIndex) {
                return {
                    ...tier,
                    ageCategories: updatedAgeCategories,
                };
            }
            return tier;
        });

        onChange({
            ...value,
            tiers: updatedTiers,
        });
    };

    // Item Operations
    const handleAddItem = () => {
        updateActiveAgeItems((items) => {
            const newItem: ICostSheetItem = {
                id: generateId(),
                title: "",
                cost: 0,
            };
            // Insert right before the margin item
            const marginIdx = items.findIndex(it => it.isMargin);
            if (marginIdx !== -1) {
                const copy = [...items];
                copy.splice(marginIdx, 0, newItem);
                return copy;
            }
            return [...items, newItem];
        });
    };

    const handleItemChange = (index: number, field: "title" | "cost", val: any) => {
        updateActiveAgeItems((items) => {
            return items.map((it, idx) => {
                if (idx === index) {
                    return {
                        ...it,
                        [field]: field === "cost" ? (val === "" ? 0 : Number(val)) : val,
                    };
                }
                return it;
            });
        });
    };

    const handleRemoveItem = (index: number) => {
        updateActiveAgeItems((items) => {
            if (items[index]?.isMargin) {
                toast.error("The margin row is mandatory and cannot be deleted");
                return items;
            }
            return items.filter((_, idx) => idx !== index);
        });
    };

    // Age Category Operations
    const handleAddAgeCategory = (name: string, desc?: string) => {
        if (!name.trim()) return;
        const exists = safeAges.some(a => a.name.toLowerCase() === name.trim().toLowerCase());
        if (exists) {
            toast.error(`Age category "${name}" already exists in this tier`);
            return;
        }

        // Clone items structure from adult or empty default
        const adultCat = safeAges.find(a => a.isDefault) || safeAges[0];
        const initialItems = adultCat ? adultCat.items.map(it => ({ ...it, id: generateId(), cost: 0 })) : [];

        const newCat = createDefaultAgeCategory(name.trim(), desc?.trim() || "", false, initialItems);

        const updatedAgeCategories = [...safeAges, newCat];
        const updatedTiers = safeTiers.map((tier, idx) => {
            if (idx === activeTierIndex) {
                return {
                    ...tier,
                    ageCategories: updatedAgeCategories,
                };
            }
            return tier;
        });

        onChange({
            ...value,
            tiers: updatedTiers,
        });

        setActiveAgeIndex(updatedAgeCategories.length - 1);
        setIsAddAgeModalOpen(false);
        setNewAgeName("");
        setNewAgeDesc("");
        toast.success(`Added age category: ${name}`);
    };

    const handleRemoveAgeCategory = (index: number) => {
        if (safeAges[index]?.isDefault) {
            toast.error("The default adult category cannot be removed");
            return;
        }
        const updatedAgeCategories = safeAges.filter((_, idx) => idx !== index);
        const updatedTiers = safeTiers.map((tier, idx) => {
            if (idx === activeTierIndex) {
                return {
                    ...tier,
                    ageCategories: updatedAgeCategories,
                };
            }
            return tier;
        });

        onChange({
            ...value,
            tiers: updatedTiers,
        });
        setActiveAgeIndex(Math.max(0, index - 1));
        toast.info("Age category removed");
    };

    const handleCopyFromAdult = () => {
        const adultCat = safeAges.find(a => a.isDefault) || safeAges[0];
        if (!adultCat || currentAge.isDefault) return;

        updateActiveAgeItems(() => {
            return adultCat.items.map(it => ({
                ...it,
                id: generateId(),
                cost: it.cost,
            }));
        });
        toast.success(`Copied items from ${adultCat.name}`);
    };

    // Tier Operations
    const handleToggleTiers = (enabled: boolean) => {
        if (!enabled) {
            // Revert to single tier (first tier or standard)
            const firstTier = safeTiers[0] || createDefaultTier("Standard", true);
            onChange({
                hasTiers: false,
                tiers: [{ ...firstTier, name: "Standard", isDefault: true }],
            });
            setActiveTierIndex(0);
        } else {
            // Enable tiers
            onChange({
                hasTiers: true,
                tiers: safeTiers.map((t, idx) => ({ ...t, isDefault: idx === 0 })),
            });
        }
    };

    const handleAddTier = () => {
        if (!newTierName.trim()) return;
        const exists = safeTiers.some(t => t.name.toLowerCase() === newTierName.trim().toLowerCase());
        if (exists) {
            toast.error(`Tier "${newTierName}" already exists`);
            return;
        }

        // Clone categories from first tier
        const baseTier = safeTiers[0];
        const clonedCategories = (baseTier?.ageCategories || []).map(cat => ({
            ...cat,
            id: generateId(),
            items: cat.items.map(it => ({ ...it, id: generateId() })),
            totalCost: cat.totalCost,
        }));

        const newTier: ICostSheetTier = {
            id: generateId(),
            name: newTierName.trim(),
            isDefault: false,
            ageCategories: clonedCategories.length > 0 ? clonedCategories : [createDefaultAgeCategory("Adult", "12+ yrs", true)],
        };

        const updatedTiers = [...safeTiers, newTier];
        onChange({
            ...value,
            hasTiers: true,
            tiers: updatedTiers,
        });

        setActiveTierIndex(updatedTiers.length - 1);
        setIsAddTierModalOpen(false);
        setNewTierName("");
        toast.success(`Added tier: ${newTier.name}`);
    };

    const handleRemoveTier = (index: number) => {
        if (safeTiers.length <= 1) {
            toast.error("At least one tier must remain");
            return;
        }
        const updatedTiers = safeTiers.filter((_, idx) => idx !== index);
        onChange({
            ...value,
            tiers: updatedTiers,
        });
        setActiveTierIndex(Math.max(0, index - 1));
        toast.info("Tier removed");
    };

    // Quick Copy Actions
    const handleLoadPreviousBatch = () => {
        if (!previousBatchCostSheet) return;
        onChange(JSON.parse(JSON.stringify(previousBatchCostSheet)));
        setActiveTierIndex(0);
        setActiveAgeIndex(0);
        toast.success("Loaded previous batch cost sheet successfully!");
    };

    const handleLoadPackageTemplate = () => {
        if (!packageTemplateCostSheet) return;
        onChange(JSON.parse(JSON.stringify(packageTemplateCostSheet)));
        setActiveTierIndex(0);
        setActiveAgeIndex(0);
        toast.success("Loaded package cost sheet template!");
    };

    // Computations for active age category
    const items = currentAge.items || [];
    const marginItem = items.find(it => it.isMargin);
    const nonMarginItems = items.filter(it => !it.isMargin);
    const baseExpensesSum = nonMarginItems.reduce((sum, it) => sum + (Number(it.cost) || 0), 0);
    const marginCost = Number(marginItem?.cost) || 0;
    const totalAdultCost = baseExpensesSum + marginCost;

    return (
        <div className="space-y-6">
            {/* Top Quick Actions Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Dynamic Cost Sheet & Pricing</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Set up expenses and operator margin to automatically calculate per-traveler pricing{packageName ? ` for ${packageName}` : ""}.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {previousBatchCostSheet && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadPreviousBatch}
                            className="rounded-xl border-primary/30 hover:bg-primary/10 text-primary font-semibold text-xs gap-1.5 h-9"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Load Previous Batch
                        </Button>
                    )}
                    {packageTemplateCostSheet && !previousBatchCostSheet && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadPackageTemplate}
                            className="rounded-xl border-primary/30 hover:bg-primary/10 text-primary font-semibold text-xs gap-1.5 h-9"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Load Package Template
                        </Button>
                    )}
                </div>
            </div>

            {/* Tiers Toggle & Management */}
            <Card className="rounded-2xl border shadow-xs">
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Pricing Tiers</CardTitle>
                                <CardDescription className="text-xs">
                                    Enable if this batch offers different packages (e.g. Standard vs Deluxe or Room Sharing).
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">
                                {value.hasTiers ? "Multi-Tier Enabled" : "Single Standard Tier"}
                            </span>
                            <Switch
                                checked={value.hasTiers}
                                onCheckedChange={handleToggleTiers}
                            />
                        </div>
                    </div>
                </CardHeader>

                {value.hasTiers && (
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {safeTiers.map((tier, idx) => (
                                <div
                                    key={tier.id || idx}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${idx === activeTierIndex
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background hover:bg-muted text-foreground border-border"
                                        }`}
                                    onClick={() => {
                                        setActiveTierIndex(idx);
                                        setActiveAgeIndex(0);
                                    }}
                                >
                                    <span>{tier.name}</span>
                                    {safeTiers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTier(idx);
                                            }}
                                            className={`p-0.5 rounded-md hover:bg-rose-500/20 hover:text-rose-500 transition-colors ${idx === activeTierIndex ? "text-primary-foreground/80" : "text-muted-foreground"
                                                }`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddTierModalOpen(true)}
                                className="rounded-xl h-8 text-xs gap-1 border-dashed font-semibold"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Tier
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Age Categories Segmented Switcher */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Age Categories for {value.hasTiers ? `"${currentTier.name}"` : "Batch"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!currentAge.isDefault && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyFromAdult}
                                className="rounded-xl h-8 text-xs text-primary font-semibold gap-1 hover:bg-primary/10"
                            >
                                <Copy className="w-3 h-3" />
                                Copy Items from Adult
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddAgeModalOpen(true)}
                            className="rounded-xl h-8 text-xs gap-1 font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Age Category
                        </Button>
                    </div>
                </div>

                {/* Age Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {safeAges.map((age, idx) => (
                        <div
                            key={age.id || idx}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all shrink-0 ${idx === activeAgeIndex
                                ? "bg-card border-primary ring-2 ring-primary/20 shadow-xs font-bold text-foreground"
                                : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                                }`}
                            onClick={() => setActiveAgeIndex(idx)}
                        >
                            <div>
                                <span className="block">{age.name}</span>
                                {age.ageDescription && (
                                    <span className="text-[10px] font-mono opacity-70 block">
                                        ({age.ageDescription})
                                    </span>
                                )}
                            </div>
                            <Badge
                                variant={idx === activeAgeIndex ? "default" : "secondary"}
                                className="font-mono text-[11px] px-1.5 py-0"
                            >
                                ₹{(age.totalCost || 0).toLocaleString("en-IN")}
                            </Badge>

                            {!age.isDefault && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveAgeCategory(idx);
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Items Table Card */}
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
                <CardHeader className="pb-3 bg-muted/20 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-bold">
                                    Cost Sheet: {currentAge.name}
                                </CardTitle>
                                {value.hasTiers && (
                                    <Badge variant="outline" className="text-[10px]">
                                        Tier: {currentTier.name}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs mt-0.5">
                                Add title and cost for every expense. The sum (including margin) forms the final traveler price.
                            </CardDescription>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAddItem}
                            className="rounded-xl h-8 text-xs gap-1.5 font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Expense Item
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2.5">
                    {items.map((item, index) => {
                        const isMargin = item.isMargin;
                        return (
                            <div
                                key={item.id || index}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${isMargin
                                    ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                    : "bg-background border-border hover:border-primary/30"
                                    }`}
                            >
                                <div className="flex-1">
                                    {isMargin ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Operator Margin</span>
                                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30 text-[10px] py-0">
                                                Required Margin
                                            </Badge>
                                        </div>
                                    ) : (
                                        <Input
                                            value={item.title}
                                            onChange={(e) => handleItemChange(index, "title", e.target.value)}
                                            placeholder="e.g. Hotel Stay, Flight, Permit, Meals"
                                            className="h-9 text-xs rounded-xl border-input bg-card"
                                        />
                                    )}
                                </div>

                                <div className="w-40 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs pointer-events-none">
                                        ₹
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={item.cost || ""}
                                        onChange={(e) => handleItemChange(index, "cost", e.target.value)}
                                        placeholder="0"
                                        className={`h-9 pl-7 text-xs font-mono font-semibold rounded-xl ${isMargin
                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                                            : "bg-card"
                                            }`}
                                    />
                                </div>

                                <div className="w-8 flex justify-center">
                                    {isMargin ? (
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {items.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-xl bg-muted/20">
                            <p className="text-xs text-muted-foreground">No cost items added yet.</p>
                        </div>
                    )}
                </CardContent>

                {/* Real-time Calculation Footer */}
                <div className="p-4 bg-muted/30 border-t flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs">
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Base Expenses</span>
                            <span className="font-bold font-mono text-sm text-foreground">
                                ₹{baseExpensesSum.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="text-muted-foreground font-bold">+</div>
                        <div>
                            <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-semibold">
                                Operator Margin
                            </span>
                            <span className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400">
                                ₹{marginCost.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="text-muted-foreground font-bold">=</div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="text-right">
                            <span className="text-[11px] text-muted-foreground block">
                                Per-Traveler Rate ({currentAge.name})
                            </span>
                            <span className="text-lg font-bold font-mono text-primary">
                                ₹{totalAdultCost.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-1">
                            Calculated Price
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Maximum Discount Policy Card */}
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
                <CardHeader className="pb-3 bg-muted/20 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    Maximum Discount Policy
                                    {value.maxDiscountEnabled && (
                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold">
                                            Active Cap
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Define maximum allowed discount caps during booking creation for this batch.
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="discount-toggle" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                                {value.maxDiscountEnabled ? "Enabled" : "Disabled"}
                            </Label>
                            <Switch
                                id="discount-toggle"
                                checked={!!value.maxDiscountEnabled}
                                onCheckedChange={(checked) => {
                                    onChange({
                                        ...value,
                                        maxDiscountEnabled: checked,
                                        maxDiscountType: value.maxDiscountType || "amount",
                                        maxDiscountScope: value.maxDiscountScope || "group",
                                        maxDiscountValue: value.maxDiscountValue ?? 0,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>

                {value.maxDiscountEnabled ? (
                    <CardContent className="p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border">
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-foreground">Discount Scope & Type</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Configure whether limits apply per individual passenger or the entire booking group.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Scope Selector: Group vs Passenger */}
                                <div className="inline-flex items-center bg-background p-0.5 rounded-lg border text-xs gap-0.5 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...value, maxDiscountScope: "group" })}
                                        className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 text-xs cursor-pointer ${
                                            (value.maxDiscountScope || "group") === "group"
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        Group Total
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...value, maxDiscountScope: "passenger" })}
                                        className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 text-xs cursor-pointer ${
                                            value.maxDiscountScope === "passenger"
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        Per Passenger
                                    </button>
                                </div>

                                {/* Unit Selector: Amount vs Percentage */}
                                <div className="inline-flex items-center bg-background p-0.5 rounded-lg border text-xs gap-0.5 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...value, maxDiscountType: "amount" })}
                                        className={`px-2.5 py-1 rounded-md transition-all font-medium text-xs cursor-pointer ${
                                            (value.maxDiscountType || "amount") === "amount"
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Amount (₹)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...value, maxDiscountType: "percentage" })}
                                        className={`px-2.5 py-1 rounded-md transition-all font-medium text-xs cursor-pointer ${
                                            value.maxDiscountType === "percentage"
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Percent (%)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    {value.maxDiscountType === "percentage" ? "Maximum Discount Percentage (%)" : "Maximum Discount Amount (₹)"}
                                </Label>
                                <div className="relative max-w-sm">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs pointer-events-none">
                                        {value.maxDiscountType === "percentage" ? "%" : "₹"}
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={value.maxDiscountType === "percentage" ? 100 : undefined}
                                        value={
                                            value.maxDiscountType === "percentage"
                                                ? (value.maxDiscountPercentage ?? value.maxDiscountValue ?? "")
                                                : (value.maxDiscountValue ?? "")
                                        }
                                        onChange={(e) => {
                                            const num = e.target.value === "" ? 0 : Number(e.target.value);
                                            if (value.maxDiscountType === "percentage") {
                                                onChange({
                                                    ...value,
                                                    maxDiscountPercentage: Math.min(100, num),
                                                    maxDiscountValue: Math.min(100, num),
                                                });
                                            } else {
                                                onChange({
                                                    ...value,
                                                    maxDiscountValue: num,
                                                });
                                            }
                                        }}
                                        placeholder={value.maxDiscountType === "percentage" ? "e.g. 15" : "e.g. 2000"}
                                        className="h-10 pl-7 text-xs font-mono font-semibold rounded-xl bg-card"
                                    />
                                </div>
                            </div>

                            {/* Real-time Calculation Summary */}
                            {(() => {
                                const currentAdultRate = totalAdultCost;
                                const discountVal = value.maxDiscountType === "percentage"
                                    ? (value.maxDiscountPercentage ?? value.maxDiscountValue ?? 0)
                                    : (value.maxDiscountValue ?? 0);
                                const calcAmount = value.maxDiscountType === "percentage"
                                    ? Math.round((currentAdultRate * discountVal) / 100)
                                    : discountVal;
                                const minSellingRate = Math.max(0, currentAdultRate - calcAmount);

                                return (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                                        <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-200">
                                            <span className="font-semibold flex items-center gap-1">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Cap Preview:
                                            </span>
                                            <span className="font-bold font-mono">
                                                {value.maxDiscountType === "percentage" ? `${discountVal}% Off` : `₹${discountVal.toLocaleString("en-IN")} Off`}
                                                {" "}({value.maxDiscountScope === "passenger" ? "/ Passenger" : "Total Booking"})
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                                            Max discount on adult rate: <strong>-₹{calcAmount.toLocaleString("en-IN")}</strong> → Min Floor Price: <strong>₹{minSellingRate.toLocaleString("en-IN")}</strong>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </CardContent>
                ) : (
                    <CardContent className="p-4 text-center bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            No maximum discount limit is enforced for this batch. Toggle switch above to set a cap.
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Add Age Category Modal */}
            <Dialog open={isAddAgeModalOpen} onOpenChange={setIsAddAgeModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Add Age Category</DialogTitle>
                        <DialogDescription className="text-xs">
                            Define a custom age group for this batch (e.g. Child, Infant, Senior, Youth).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Quick Presets</Label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { name: "Child", desc: "5-11 yrs" },
                                    { name: "Child (No Bed)", desc: "2-5 yrs" },
                                    { name: "Infant", desc: "0-2 yrs" },
                                    { name: "Senior", desc: "60+ yrs" },
                                    { name: "Youth", desc: "12-17 yrs" },
                                ].map((preset) => (
                                    <Button
                                        key={preset.name}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setNewAgeName(preset.name);
                                            setNewAgeDesc(preset.desc);
                                        }}
                                        className="rounded-xl text-xs h-8"
                                    >
                                        {preset.name} <span className="text-[10px] text-muted-foreground ml-1">({preset.desc})</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryName" className="text-xs font-semibold">Category Name *</Label>
                            <Input
                                id="categoryName"
                                placeholder="e.g. Child (with Bed)"
                                value={newAgeName}
                                onChange={(e) => setNewAgeName(e.target.value)}
                                className="rounded-xl h-10 text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryDesc" className="text-xs font-semibold">Age Range / Description (Optional)</Label>
                            <Input
                                id="categoryDesc"
                                placeholder="e.g. 5-11 yrs"
                                value={newAgeDesc}
                                onChange={(e) => setNewAgeDesc(e.target.value)}
                                className="rounded-xl h-10 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddAgeModalOpen(false)}
                            className="rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleAddAgeCategory(newAgeName, newAgeDesc)}
                            disabled={!newAgeName.trim()}
                            className="rounded-xl text-xs font-semibold"
                        >
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Tier Modal */}
            <Dialog open={isAddTierModalOpen} onOpenChange={setIsAddTierModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Add Pricing Tier</DialogTitle>
                        <DialogDescription className="text-xs">
                            Define a new tier such as Deluxe, Luxury, VIP, or Double Sharing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Quick Presets</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Deluxe", "Premium", "VIP", "Double Sharing", "Triple Sharing"].map((preset) => (
                                    <Button
                                        key={preset}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setNewTierName(preset)}
                                        className="rounded-xl text-xs h-8"
                                    >
                                        {preset}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tierName" className="text-xs font-semibold">Tier Name *</Label>
                            <Input
                                id="tierName"
                                placeholder="e.g. Deluxe"
                                value={newTierName}
                                onChange={(e) => setNewTierName(e.target.value)}
                                className="rounded-xl h-10 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddTierModalOpen(false)}
                            className="rounded-xl text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddTier}
                            disabled={!newTierName.trim()}
                            className="rounded-xl text-xs font-semibold"
                        >
                            Add Tier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
