import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BatchOffersService } from "@/services/batch-offers.service";
import type { IBatchOffer, ICreateBatchOffer, OfferDiscountMode, OfferDiscountScope, OfferDiscountType } from "@/types/batch-offers.types";
import {
    Calendar,
    Check,
    Clock,
    DollarSign,
    Info,
    Loader2,
    Percent,
    Plus,
    Sparkles,
    Tag,
    User,
    Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BatchOfferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batchId: string;
    offerToEdit?: IBatchOffer | null;
    onSaved: () => void;
}

export function BatchOfferDialog({
    open,
    onOpenChange,
    batchId,
    offerToEdit,
    onSaved,
}: BatchOfferDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState<OfferDiscountType>("flat");
    const [discountMode, setDiscountMode] = useState<OfferDiscountMode>("fixed");
    const [discountScope, setDiscountScope] = useState<OfferDiscountScope>("passenger");
    const [discountValue, setDiscountValue] = useState<string>("500");
    const [minDiscountValue, setMinDiscountValue] = useState<string>("200");
    const [maxDiscountValue, setMaxDiscountValue] = useState<string>("1000");
    const [minTravelers, setMinTravelers] = useState<string>("1");
    const [maxDiscountCap, setMaxDiscountCap] = useState<string>("");
    const [validFrom, setValidFrom] = useState<string>("");
    const [validUntil, setValidUntil] = useState<string>("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [simulatedTravelers, setSimulatedTravelers] = useState(2);
    const [simulatedBasePerPerson, setSimulatedBasePerPerson] = useState(5000);

    useEffect(() => {
        if (offerToEdit) {
            setName(offerToEdit.name || "");
            setDescription(offerToEdit.description || "");
            setDiscountType(offerToEdit.discountType || "flat");
            setDiscountMode(offerToEdit.discountMode || "fixed");
            setDiscountScope(offerToEdit.discountScope || "passenger");
            setDiscountValue(offerToEdit.discountValue?.toString() || "0");
            setMinDiscountValue(offerToEdit.minDiscountValue?.toString() || "");
            setMaxDiscountValue(offerToEdit.maxDiscountValue?.toString() || "");
            setMinTravelers(offerToEdit.minTravelers?.toString() || "1");
            setMaxDiscountCap(offerToEdit.maxDiscountCap ? offerToEdit.maxDiscountCap.toString() : "");
            setValidFrom(
                offerToEdit.validFrom
                    ? new Date(offerToEdit.validFrom).toISOString().slice(0, 16)
                    : ""
            );
            setValidUntil(
                offerToEdit.validUntil
                    ? new Date(offerToEdit.validUntil).toISOString().slice(0, 16)
                    : ""
            );
            setIsActive(offerToEdit.isActive !== false);
        } else {
            setName("");
            setDescription("");
            setDiscountType("flat");
            setDiscountMode("fixed");
            setDiscountScope("passenger");
            setDiscountValue("500");
            setMinDiscountValue("200");
            setMaxDiscountValue("1000");
            setMinTravelers("1");
            setMaxDiscountCap("");
            setValidFrom("");
            setValidUntil("");
            setIsActive(true);
        }
    }, [offerToEdit, open]);

    // Live savings simulator calculation
    const parsedVal = Math.max(0, parseFloat(discountValue) || 0);
    const parsedMinVal = Math.max(0, parseFloat(minDiscountValue) || 0);
    const parsedMaxVal = Math.max(0, parseFloat(maxDiscountValue) || 0);
    const parsedMinPax = Math.max(1, parseInt(minTravelers, 10) || 1);
    const parsedCap = maxDiscountCap ? Math.max(0, parseFloat(maxDiscountCap) || 0) : null;
    const isSimulatedEligible = simulatedTravelers >= parsedMinPax;
    const simulatedSubtotal = simulatedBasePerPerson * simulatedTravelers;

    let simulatedDiscount = 0;
    let simulatedMinDiscount = 0;
    let simulatedMaxDiscount = 0;

    if (isSimulatedEligible) {
        if (discountMode === "range") {
            if (discountType === "percentage") {
                const rawMin = Math.round((simulatedSubtotal * parsedMinVal) / 100);
                const rawMax = Math.round((simulatedSubtotal * parsedMaxVal) / 100);
                simulatedMinDiscount = parsedCap && rawMin > parsedCap ? parsedCap : rawMin;
                simulatedMaxDiscount = parsedCap && rawMax > parsedCap ? parsedCap : rawMax;
            } else {
                simulatedMinDiscount = discountScope === "passenger" ? parsedMinVal * simulatedTravelers : parsedMinVal;
                simulatedMaxDiscount = discountScope === "passenger" ? parsedMaxVal * simulatedTravelers : parsedMaxVal;
            }
            simulatedMinDiscount = Math.min(simulatedMinDiscount, simulatedSubtotal);
            simulatedMaxDiscount = Math.min(simulatedMaxDiscount, simulatedSubtotal);
            simulatedDiscount = simulatedMaxDiscount;
        } else {
            if (discountType === "percentage") {
                const rawDisc = Math.round((simulatedSubtotal * parsedVal) / 100);
                simulatedDiscount = parsedCap && rawDisc > parsedCap ? parsedCap : rawDisc;
            } else {
                simulatedDiscount = discountScope === "passenger" ? parsedVal * simulatedTravelers : parsedVal;
            }
            simulatedDiscount = Math.min(simulatedDiscount, simulatedSubtotal);
        }
    }
    const simulatedFinal = Math.max(0, simulatedSubtotal - simulatedDiscount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Offer name is required");
            return;
        }

        let finalValue = parseFloat(discountValue) || 0;
        let finalMinVal: number | undefined = undefined;
        let finalMaxVal: number | undefined = undefined;

        if (discountMode === "fixed") {
            if (isNaN(finalValue) || finalValue <= 0) {
                toast.error("Discount value must be greater than 0");
                return;
            }
            if (discountType === "percentage" && finalValue > 100) {
                toast.error("Percentage discount cannot exceed 100%");
                return;
            }
        } else {
            // Range Mode
            const minNum = parseFloat(minDiscountValue);
            const maxNum = parseFloat(maxDiscountValue);
            if (isNaN(minNum) || minNum < 0) {
                toast.error("Minimum discount value must be at least 0");
                return;
            }
            if (isNaN(maxNum) || maxNum <= 0) {
                toast.error("Maximum discount value must be greater than 0");
                return;
            }
            if (minNum > maxNum) {
                toast.error("Minimum discount cannot be greater than maximum discount");
                return;
            }
            if (discountType === "percentage" && maxNum > 100) {
                toast.error("Maximum percentage discount cannot exceed 100%");
                return;
            }
            finalMinVal = minNum;
            finalMaxVal = maxNum;
            finalValue = maxNum; // default value
        }

        const numMinTravelers = parseInt(minTravelers, 10);
        if (isNaN(numMinTravelers) || numMinTravelers < 1) {
            toast.error("Minimum travelers must be at least 1");
            return;
        }

        if (validFrom && validUntil && new Date(validFrom) > new Date(validUntil)) {
            toast.error("Start date cannot be after expiry date");
            return;
        }

        const payload: ICreateBatchOffer = {
            name: name.trim(),
            description: description.trim() || undefined,
            discountType,
            discountMode,
            discountValue: finalValue,
            minDiscountValue: finalMinVal,
            maxDiscountValue: finalMaxVal,
            discountScope,
            minTravelers: numMinTravelers,
            maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : undefined,
            validFrom: validFrom ? new Date(validFrom).toISOString() : null,
            validUntil: validUntil ? new Date(validUntil).toISOString() : null,
            isActive,
        };

        try {
            setLoading(true);
            if (offerToEdit) {
                await BatchOffersService.updateBatchOffer(batchId, offerToEdit.id, payload);
                toast.success("Special offer updated successfully");
            } else {
                await BatchOffersService.createBatchOffer(batchId, payload);
                toast.success("Special offer created successfully");
            }
            onSaved();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to save batch offer:", error);
            const msg = error?.response?.data?.message || "Failed to save special offer";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="responsive-dialog sm:max-w-5xl w-[95vw] h-[85vh] max-lg:h-auto max-lg:max-h-[90vh] overflow-hidden max-lg:overflow-y-auto p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
                <DialogDescription className="sr-only">
                    Form to create or edit a batch special offer.
                </DialogDescription>
                <style>{`
                    @media (max-height: 800px) {
                        .responsive-dialog {
                            height: auto !important;
                            max-height: 90vh !important;
                            overflow-y: auto !important;
                        }
                        .responsive-layout, .responsive-left {
                            overflow: visible !important;
                            height: auto !important;
                        }
                        .responsive-scroll {
                            height: auto !important;
                            overflow: visible !important;
                        }
                    }
                `}</style>

                {/* Top Header */}
                <div className="pl-6 pr-12 py-4 border-b bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            {offerToEdit ? "Edit Batch Special Offer" : "Create Batch Special Offer"}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Set up promotional discounts, group saver thresholds, or last-minute fill-up incentives.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={cn(
                                "text-xs font-semibold px-2.5 py-0.5",
                                isActive ? "bg-amber-600 hover:bg-amber-600 text-white" : ""
                            )}
                        >
                            {isActive ? "● Offer Active" : "○ Inactive Draft"}
                        </Badge>
                    </div>
                </div>

                {/* Main Body: 2-Column Split */}
                <div className="responsive-layout flex-1 flex overflow-hidden max-lg:overflow-visible min-h-0 p-0 m-0">
                    {/* Left Column: Form Configuration */}
                    <div className="responsive-left flex-1 flex flex-col overflow-hidden max-lg:overflow-visible min-h-0 bg-background">
                        <div className="responsive-scroll flex-1 overflow-y-auto p-6 max-lg:h-auto max-lg:overflow-visible">
                            <form id="batch-offer-form" onSubmit={handleSubmit} className="space-y-5">
                                {/* Section 1: Offer Identity */}
                                <div className="p-4 rounded-xl border bg-card space-y-4">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-primary" />
                                            Offer Identification
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">General Info</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="offer-name" className="text-xs font-semibold">
                                                Offer Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="offer-name"
                                                placeholder="e.g., Early Bird Special, Group Saver (4+ Pax), Last Minute 20% Off"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-10 bg-background font-medium"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="offer-desc" className="text-xs font-semibold">
                                                Description & Notes (Optional)
                                            </Label>
                                            <Textarea
                                                id="offer-desc"
                                                rows={2}
                                                placeholder="Explain terms, target customers, or reasons for this promotional offer..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="bg-background resize-none text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Discount Structure */}
                                <div className="p-4 rounded-xl border bg-card space-y-4">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            Discount Calculation & Scope
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">Pricing Rules</span>
                                    </div>

                                    {/* Mode, Type & Scope Segmented Selectors */}
                                    <div className="space-y-4">
                                        {/* Value Mode: Fixed vs Range */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Discount Pricing Mode
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setDiscountMode("fixed")}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                        discountMode === "fixed"
                                                            ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs"
                                                            : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    <Tag className="w-4 h-4" />
                                                    Fixed Amount / %
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDiscountMode("range")}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                        discountMode === "range"
                                                            ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs"
                                                            : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    Min & Max Range
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {discountMode === "fixed"
                                                    ? "Sets an exact non-negotiable discount value applied automatically."
                                                    : "Sets an allowable discount range (Min to Max) for booking agents to apply flexibly."}
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {/* Discount Type */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Discount Unit
                                                </Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDiscountType("flat")}
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                            discountType === "flat"
                                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs"
                                                                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                        Flat Amount (₹)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDiscountType("percentage")}
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                            discountType === "percentage"
                                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs"
                                                                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <Percent className="w-4 h-4" />
                                                        Percentage (%)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Discount Scope */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Discount Scope
                                                </Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDiscountScope("passenger")}
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                            discountScope === "passenger"
                                                                ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-xs"
                                                                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <User className="w-4 h-4" />
                                                        Per Passenger
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDiscountScope("booking")}
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                                                            discountScope === "booking"
                                                                ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-xs"
                                                                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <Users className="w-4 h-4" />
                                                        Total Booking
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discount Inputs: Fixed vs Range */}
                                    {discountMode === "fixed" ? (
                                        <div className="grid sm:grid-cols-2 gap-4 pt-1">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="discount-val" className="text-xs font-semibold">
                                                    {discountType === "flat" ? "Discount Value (₹)" : "Discount Percentage (%)"}{" "}
                                                    <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-bold text-xs">
                                                        {discountType === "flat" ? "₹" : "%"}
                                                    </div>
                                                    <Input
                                                        id="discount-val"
                                                        type="number"
                                                        min="0"
                                                        max={discountType === "percentage" ? "100" : undefined}
                                                        step={discountType === "percentage" ? "0.1" : "1"}
                                                        className="pl-8 h-10 bg-background font-bold text-base"
                                                        value={discountValue}
                                                        onChange={(e) => setDiscountValue(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {discountType === "flat"
                                                        ? discountScope === "passenger"
                                                            ? `Subtracts ₹${Number(discountValue || 0).toLocaleString("en-IN")} from each traveler's price.`
                                                            : `Subtracts ₹${Number(discountValue || 0).toLocaleString("en-IN")} once from the whole booking.`
                                                        : `Applies ${discountValue || 0}% discount to the base subtotal.`}
                                                </p>
                                            </div>

                                            {discountType === "percentage" ? (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="max-cap" className="text-xs font-semibold">
                                                        Max Discount Cap (₹) <span className="text-muted-foreground font-normal">(Optional)</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-bold text-xs">
                                                            ₹
                                                        </div>
                                                        <Input
                                                            id="max-cap"
                                                            type="number"
                                                            min="0"
                                                            placeholder="e.g. 5000"
                                                            value={maxDiscountCap}
                                                            onChange={(e) => setMaxDiscountCap(e.target.value)}
                                                            className="pl-8 h-10 bg-background"
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Prevents percent discount from exceeding this amount.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="min-travelers" className="text-xs font-semibold">
                                                        Min Travelers <span className="text-muted-foreground font-normal">(Group Threshold)</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                        </div>
                                                        <Input
                                                            id="min-travelers"
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            className="pl-9 h-10 bg-background font-semibold"
                                                            placeholder="1"
                                                            value={minTravelers}
                                                            onChange={(e) => setMinTravelers(e.target.value)}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {parseInt(minTravelers, 10) > 1
                                                            ? `Only groups of ${minTravelers}+ passengers unlock this offer.`
                                                            : "Applies to all bookings regardless of group size."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Range Mode Inputs */
                                        <div className="space-y-4 pt-1">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="min-discount-val" className="text-xs font-semibold">
                                                        Minimum Discount ({discountType === "flat" ? "₹" : "%"}){" "}
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-bold text-xs">
                                                            {discountType === "flat" ? "₹" : "%"}
                                                        </div>
                                                        <Input
                                                            id="min-discount-val"
                                                            type="number"
                                                            min="0"
                                                            max={discountType === "percentage" ? "100" : undefined}
                                                            step={discountType === "percentage" ? "0.1" : "1"}
                                                            className="pl-8 h-10 bg-background font-semibold"
                                                            value={minDiscountValue}
                                                            onChange={(e) => setMinDiscountValue(e.target.value)}
                                                            placeholder={discountType === "flat" ? "e.g. 500" : "e.g. 5"}
                                                            required
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Lowest allowed discount value.
                                                    </p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="max-discount-val" className="text-xs font-semibold">
                                                        Maximum Discount ({discountType === "flat" ? "₹" : "%"}){" "}
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-bold text-xs">
                                                            {discountType === "flat" ? "₹" : "%"}
                                                        </div>
                                                        <Input
                                                            id="max-discount-val"
                                                            type="number"
                                                            min="0"
                                                            max={discountType === "percentage" ? "100" : undefined}
                                                            step={discountType === "percentage" ? "0.1" : "1"}
                                                            className="pl-8 h-10 bg-background font-bold text-base"
                                                            value={maxDiscountValue}
                                                            onChange={(e) => setMaxDiscountValue(e.target.value)}
                                                            placeholder={discountType === "flat" ? "e.g. 2000" : "e.g. 20"}
                                                            required
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Upper ceiling for this promotional deal.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="min-travelers-range" className="text-xs font-semibold">
                                                        Min Travelers <span className="text-muted-foreground font-normal">(Group Threshold)</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                        </div>
                                                        <Input
                                                            id="min-travelers-range"
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            className="pl-9 h-10 bg-background font-semibold"
                                                            placeholder="1"
                                                            value={minTravelers}
                                                            onChange={(e) => setMinTravelers(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {discountType === "percentage" && (
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="max-cap-range" className="text-xs font-semibold">
                                                            Max Discount Cap (₹) <span className="text-muted-foreground font-normal">(Optional)</span>
                                                        </Label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-bold text-xs">
                                                                ₹
                                                            </div>
                                                            <Input
                                                                id="max-cap-range"
                                                                type="number"
                                                                min="0"
                                                                placeholder="e.g. 5000"
                                                                value={maxDiscountCap}
                                                                onChange={(e) => setMaxDiscountCap(e.target.value)}
                                                                className="pl-8 h-10 bg-background"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {discountType === "percentage" && (
                                        <div className="space-y-1.5 pt-1">
                                            <Label htmlFor="min-travelers-pct" className="text-xs font-semibold">
                                                Min Travelers <span className="text-muted-foreground font-normal">(Group Threshold)</span>
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    id="min-travelers-pct"
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    className="pl-9 h-10 bg-background font-semibold max-w-xs"
                                                    placeholder="1"
                                                    value={minTravelers}
                                                    onChange={(e) => setMinTravelers(e.target.value)}
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {parseInt(minTravelers, 10) > 1
                                                    ? `Requires at least ${minTravelers} travelers to unlock this percentage offer.`
                                                    : "Applies to any group size."}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Time Validity */}
                                <div className="p-4 rounded-xl border bg-card space-y-4">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            Validity Period & Expiry
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">Optional Timing Window</span>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="valid-from" className="text-xs font-semibold">
                                                Valid From (Start Date/Time)
                                            </Label>
                                            <Input
                                                id="valid-from"
                                                type="datetime-local"
                                                value={validFrom}
                                                onChange={(e) => setValidFrom(e.target.value)}
                                                className="h-10 bg-background"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="valid-until" className="text-xs font-semibold">
                                                Valid Until (Expiry Date/Time)
                                            </Label>
                                            <Input
                                                id="valid-until"
                                                type="datetime-local"
                                                value={validUntil}
                                                onChange={(e) => setValidUntil(e.target.value)}
                                                className="h-10 bg-background"
                                            />
                                        </div>
                                    </div>
                                    {(validFrom || validUntil) && (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                                            <Info className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                Offer will only be selectable between{" "}
                                                <strong>{validFrom ? new Date(validFrom).toLocaleString() : "Now"}</strong> and{" "}
                                                <strong>{validUntil ? new Date(validUntil).toLocaleString() : "Indefinitely"}</strong>.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Active Switch */}
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="offer-active" className="text-sm font-bold cursor-pointer flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Enable this Special Offer
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            When enabled, booking agents can apply this offer to eligible reservations.
                                        </p>
                                    </div>
                                    <Switch
                                        id="offer-active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Real-Time Preview & Simulator Sidebar */}
                    <div className="w-84 border-l bg-card/40 hidden lg:flex flex-col flex-shrink-0">
                        <div className="p-5 border-b bg-card flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Live Offer Preview
                            </h3>
                            <Badge variant="outline" className="text-[10px] bg-background">
                                Real-Time
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="space-y-5">
                                {/* Preview Card as it appears to agents */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">
                                        Agent Selection Badge
                                    </Label>
                                    <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 space-y-3 shadow-xs">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                                    <Tag className="w-4 h-4 text-amber-500" />
                                                    {name || "Untitled Offer"}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                    {description || "No description provided."}
                                                </p>
                                            </div>
                                            <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-mono text-xs">
                                                {discountMode === "range"
                                                    ? discountType === "percentage"
                                                        ? `${parsedMinVal}% - ${parsedMaxVal}% OFF`
                                                        : `₹${parsedMinVal.toLocaleString("en-IN")} - ₹${parsedMaxVal.toLocaleString("en-IN")} OFF`
                                                    : discountType === "percentage"
                                                        ? `${parsedVal}% OFF`
                                                        : `₹${parsedVal.toLocaleString("en-IN")} OFF`}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/20">
                                            <span className="text-muted-foreground">
                                                {parsedMinPax > 1 ? `Min ${parsedMinPax} travelers` : "All bookings"}
                                                {discountScope === "passenger" ? " • Per Pax" : " • Total"}
                                            </span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                                {discountMode === "range"
                                                    ? `Save up to ₹${simulatedMaxDiscount.toLocaleString("en-IN")}`
                                                    : discountType === "percentage"
                                                        ? `${parsedVal}% Discount`
                                                        : `Save ₹${parsedVal.toLocaleString("en-IN")}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Savings Simulator */}
                                <div className="space-y-3 p-4 rounded-xl border bg-background">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                            Savings Simulator
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground">Test scenario</span>
                                    </div>

                                    {/* Passenger Count Selector */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Test Travelers:</span>
                                            <span className="font-bold">{simulatedTravelers} Pax</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 4, 6, 8].map((num) => (
                                                <Button
                                                    key={num}
                                                    type="button"
                                                    variant={simulatedTravelers === num ? "default" : "outline"}
                                                    size="sm"
                                                    className="h-7 flex-1 text-xs px-1"
                                                    onClick={() => setSimulatedTravelers(num)}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Base Price Per Person */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Base Price / Person:</span>
                                            <span className="font-semibold">₹{simulatedBasePerPerson.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {[3000, 5000, 10000, 15000].map((amount) => (
                                                <Button
                                                    key={amount}
                                                    type="button"
                                                    variant={simulatedBasePerPerson === amount ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="h-6 flex-1 text-[10px] px-1 border"
                                                    onClick={() => setSimulatedBasePerPerson(amount)}
                                                >
                                                    ₹{amount / 1000}k
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-1.5 pt-2 border-t text-xs">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal ({simulatedTravelers} × ₹{simulatedBasePerPerson.toLocaleString("en-IN")}):</span>
                                            <span className="font-medium text-foreground">₹{simulatedSubtotal.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Eligibility:</span>
                                            <span className={cn("font-semibold", isSimulatedEligible ? "text-emerald-600" : "text-destructive")}>
                                                {isSimulatedEligible ? "✓ Eligible" : `✗ Needs ${parsedMinPax - simulatedTravelers} more pax`}
                                            </span>
                                        </div>
                                        {discountMode === "range" ? (
                                            <>
                                                <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                                                    <span>Savings Range (Min – Max):</span>
                                                    <span>
                                                        - ₹{simulatedMinDiscount.toLocaleString("en-IN")} to - ₹{simulatedMaxDiscount.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 font-bold text-sm text-foreground">
                                                    <span>Customer Pays (Max Savings):</span>
                                                    <span className="text-primary">₹{simulatedFinal.toLocaleString("en-IN")}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                                                    <span>Special Offer Savings:</span>
                                                    <span>- ₹{simulatedDiscount.toLocaleString("en-IN")}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 font-bold text-sm text-foreground">
                                                    <span>Customer Pays:</span>
                                                    <span className="text-primary">₹{simulatedFinal.toLocaleString("en-IN")}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Rule Summary Checklist */}
                                <div className="space-y-2 p-3 rounded-xl border bg-muted/20 text-xs">
                                    <h4 className="font-bold text-[11px] text-muted-foreground uppercase">Rule Breakdown</h4>
                                    <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>Mode: <strong>{discountMode === "range" ? "Flexible Range (Min & Max)" : "Fixed Value"}</strong></span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>
                                                Rate:{" "}
                                                <strong>
                                                    {discountMode === "range"
                                                        ? discountType === "percentage"
                                                            ? `${parsedMinVal}% - ${parsedMaxVal}%`
                                                            : `₹${parsedMinVal.toLocaleString("en-IN")} - ₹${parsedMaxVal.toLocaleString("en-IN")}`
                                                        : discountType === "percentage"
                                                            ? `${parsedVal}% Percentage`
                                                            : `₹${parsedVal.toLocaleString("en-IN")} Flat`}
                                                </strong>
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>Scope: <strong>{discountScope === "passenger" ? "Per Passenger" : "Total Booking Group"}</strong></span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>Min Travelers: <strong>{parsedMinPax} Pax</strong></span>
                                        </li>
                                        {parsedCap && (
                                            <li className="flex items-center gap-1.5">
                                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                                <span>Max Cap: <strong>₹{parsedCap.toLocaleString("en-IN")}</strong></span>
                                            </li>
                                        )}
                                        {validUntil && (
                                            <li className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                <span>Expires: <strong>{new Date(validUntil).toLocaleDateString()}</strong></span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Actions */}
                <div className="px-6 py-4 border-t bg-card flex items-center justify-between flex-shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="batch-offer-form"
                        disabled={loading}
                        className="min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : offerToEdit ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Update Offer
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Offer
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
