import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import BookingService from "@/services/booking.service";
import type { IBatchCostSheet, ICostSheetTier } from "@/types/cost-sheet.types";
import {
    BarChart3,
    Layers,
    Receipt,
    ShieldCheck,
    Tag,
    TrendingUp,
    Users
} from "lucide-react";
import { useState } from "react";

interface BatchCostBreakdownModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    costSheet?: IBatchCostSheet | null;
    packageName?: string;
}

export function BatchCostBreakdownModal({
    open,
    onOpenChange,
    costSheet,
    packageName,
}: BatchCostBreakdownModalProps) {
    const tiers: ICostSheetTier[] = costSheet?.tiers || [];
    const [selectedTierId, setSelectedTierId] = useState<string>(
        tiers[0]?.id || ""
    );
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Active tier resolution
    const activeTier =
        tiers.find((t) => t.id === selectedTierId) || tiers[0] || null;

    // Active age category resolution
    const ageCategories = activeTier?.ageCategories || [];
    const activeCategory =
        ageCategories.find(
            (c) => (c.id || c.categoryKey || c.name) === selectedCategoryId
        ) ||
        ageCategories[0] ||
        null;

    if (!costSheet || tiers.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Receipt className="w-5 h-5 text-primary" />
                            Cost Sheet Breakdown
                        </DialogTitle>
                        <DialogDescription>
                            No cost breakdown details are available for this batch.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 text-center text-muted-foreground text-xs">
                        This batch might be using legacy package tiers or lacks an itemized cost sheet.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Active category items & totals
    const items = activeCategory?.items || [];
    const expenseItems = items.filter((i) => !i.isMargin);
    const marginItem = items.find((i) => i.isMargin);

    const baseExpensesSubtotal = expenseItems.reduce(
        (sum, item) => sum + (Number(item.cost) || 0),
        0
    );
    const operatorMarginCost = marginItem ? Number(marginItem.cost) || 0 : 0;
    const finalSellingPrice = baseExpensesSubtotal + operatorMarginCost;

    const effectiveMarginPercent =
        finalSellingPrice > 0
            ? Number(((operatorMarginCost / finalSellingPrice) * 100).toFixed(1))
            : 0;

    const baseExpensePercent =
        finalSellingPrice > 0
            ? Number(((baseExpensesSubtotal / finalSellingPrice) * 100).toFixed(1))
            : 0;

    // Max discount policy calculations
    const isDiscountActive = !!costSheet.maxDiscountEnabled;
    const discountType = costSheet.maxDiscountType || "amount";
    const discountScope = costSheet.maxDiscountScope || "group";
    const discountVal =
        discountType === "percentage"
            ? costSheet.maxDiscountPercentage ?? costSheet.maxDiscountValue ?? 0
            : costSheet.maxDiscountValue ?? 0;

    // Per-passenger maximum discount cap
    const maxDiscountPerPerson = isDiscountActive
        ? discountType === "percentage"
            ? Math.round((finalSellingPrice * discountVal) / 100)
            : discountScope === "passenger"
                ? discountVal
                : discountVal // for group scope, display the total pool
        : 0;

    const floorAfterDiscount = Math.max(0, finalSellingPrice - (discountScope === "passenger" ? maxDiscountPerPerson : (discountType === "percentage" ? maxDiscountPerPerson : 0)));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
                {/* Modal Top Header with KPI Strip */}
                <div className="border-b bg-gradient-to-r from-muted/50 via-muted/20 to-background">
                    {/* Title & Tier Selector Bar */}
                    <div className="p-5 sm:p-6 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                                        Itemized Batch Cost Sheet Breakdown
                                        {costSheet.hasTiers && (
                                            <Badge
                                                variant="outline"
                                                className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 ml-1"
                                            >
                                                <Layers className="w-3 h-3 mr-1" />
                                                Multi-Tier ({tiers.length})
                                            </Badge>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        {packageName ? (
                                            <span className="font-semibold text-foreground">
                                                {packageName} •{" "}
                                            </span>
                                        ) : (
                                            ""
                                        )}
                                        Comprehensive expense line items, operator margin schedule, and traveler demographics
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        {/* Tier Switcher Pills if Multi-Tier */}
                        {costSheet.hasTiers && tiers.length > 1 && (
                            <div className="flex items-center gap-2 pt-4 mt-4 border-t overflow-x-auto pb-1">
                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0 uppercase tracking-wider">
                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                    Pricing Tiers:
                                </span>
                                {tiers.map((tier) => {
                                    const isSelected =
                                        (activeTier?.id || tiers[0]?.id) === tier.id;
                                    return (
                                        <button
                                            key={tier.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTierId(tier.id);
                                                setSelectedCategoryId("");
                                            }}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${isSelected
                                                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                                                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                        >
                                            <span>{tier.name}</span>
                                            {tier.isDefault && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[9px] px-1 py-0 bg-background/30 text-inherit"
                                                >
                                                    Default
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Executive KPI Stat Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-t divide-x divide-border/60 bg-muted/20">
                        <div className="p-4 px-5">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                Direct Logistics Base
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">
                                    {BookingService.formatCurrency(baseExpensesSubtotal)}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    ({baseExpensePercent}%)
                                </span>
                            </div>
                        </div>

                        <div className="p-4 px-5 bg-emerald-500/5">
                            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                                Operator Margin
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                                    +{BookingService.formatCurrency(operatorMarginCost)}
                                </span>
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                                    ({effectiveMarginPercent}%)
                                </span>
                            </div>
                        </div>

                        <div className="p-4 px-5 bg-primary/5">
                            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                                Total Floor Rate ({activeCategory?.label || activeCategory?.name || "Adult"})
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xl sm:text-2xl font-extrabold font-mono text-primary">
                                    {BookingService.formatCurrency(finalSellingPrice)}
                                </span>
                                <span className="text-[10px] text-primary/70 font-semibold">
                                    / pax
                                </span>
                            </div>
                        </div>

                        <div className="p-4 px-5 bg-amber-500/5">
                            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                                Floor After Max Discount
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-700 dark:text-amber-400">
                                    {BookingService.formatCurrency(floorAfterDiscount)}
                                </span>
                                <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 font-semibold">
                                    {isDiscountActive ? `(Min Price)` : "(No Cap)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Body: 12-Column Responsive Dashboard Layout */}
                <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Main Area: Age Category Tabs & Full Itemized Table (7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Age Category Selector Grid */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        Traveler Age Categories
                                    </label>
                                    <span className="text-[11px] text-muted-foreground">
                                        Click to inspect category costs
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {ageCategories.map((cat) => {
                                        const catKey =
                                            cat.id || cat.categoryKey || cat.name;
                                        const isCatSelected =
                                            (activeCategory?.id ||
                                                activeCategory?.categoryKey ||
                                                activeCategory?.name) === catKey;
                                        const catTotal = cat.items.reduce(
                                            (sum, i) => sum + (Number(i.cost) || 0),
                                            0
                                        );
                                        const catMargin = cat.items.find(
                                            (i) => i.isMargin
                                        );

                                        return (
                                            <button
                                                key={catKey}
                                                type="button"
                                                onClick={() => setSelectedCategoryId(catKey)}
                                                className={`p-3.5 rounded-xl border text-left transition-all relative ${isCatSelected
                                                    ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                                                    : "border-border/80 bg-card hover:bg-muted/40 hover:border-border"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <span className="text-xs font-bold text-foreground block">
                                                            {cat.label || cat.name}
                                                        </span>
                                                        {cat.ageDescription && (
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {cat.ageDescription}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isCatSelected && (
                                                        <span className="w-2 h-2 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                                <div className="text-base font-extrabold text-foreground font-mono mt-1">
                                                    {BookingService.formatCurrency(catTotal)}
                                                </div>
                                                {catMargin && (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                                                        +₹{Number(catMargin.cost).toLocaleString("en-IN")} margin
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Comprehensive Itemized Expenses Table */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-primary" />
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Itemized Expenses:{" "}
                                            <span className="text-foreground">
                                                {activeCategory?.label || activeCategory?.name || "Adult"}
                                            </span>
                                        </h4>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {expenseItems.length} direct expense{expenseItems.length !== 1 ? "s" : ""}
                                    </Badge>
                                </div>

                                <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="text-xs font-bold w-12 text-center">
                                                    #
                                                </TableHead>
                                                <TableHead className="text-xs font-bold">
                                                    Expense Item
                                                </TableHead>
                                                <TableHead className="text-xs font-bold w-32">
                                                    Share of Base
                                                </TableHead>
                                                <TableHead className="text-xs font-bold text-right">
                                                    Cost (₹)
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenseItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="text-center py-6 text-xs text-muted-foreground"
                                                    >
                                                        No individual expense items recorded for this age category.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                expenseItems.map((item, index) => {
                                                    const itemCost = Number(item.cost) || 0;
                                                    const itemShare =
                                                        baseExpensesSubtotal > 0
                                                            ? Math.round(
                                                                (itemCost / baseExpensesSubtotal) * 100
                                                            )
                                                            : 0;

                                                    return (
                                                        <TableRow
                                                            key={item.id || index}
                                                            className="hover:bg-muted/20"
                                                        >
                                                            <TableCell className="text-xs text-center text-muted-foreground font-mono">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-semibold text-foreground">
                                                                {item.title}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary/70 rounded-full"
                                                                            style={{
                                                                                width: `${Math.min(100, itemShare)}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                                        {itemShare}%
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                                                                {BookingService.formatCurrency(itemCost)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}

                                            {/* Base Expenses Subtotal Row */}
                                            <TableRow className="bg-muted/30 font-semibold border-t-2">
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-xs text-foreground font-bold"
                                                >
                                                    Direct Operations Subtotal
                                                </TableCell>
                                                <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                                                    {BookingService.formatCurrency(baseExpensesSubtotal)}
                                                </TableCell>
                                            </TableRow>

                                            {/* Operator Margin Row Highlight */}
                                            <TableRow className="bg-emerald-500/10 border-emerald-500/20">
                                                <TableCell className="text-center">
                                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                    Operator Margin (Profit)
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold"
                                                    >
                                                        {effectiveMarginPercent}% of Total
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-right font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                                                    + {BookingService.formatCurrency(operatorMarginCost)}
                                                </TableCell>
                                            </TableRow>

                                            {/* Grand Total Selling Price Row */}
                                            <TableRow className="bg-primary/5 font-extrabold text-sm border-t-2 border-primary/20">
                                                <TableCell colSpan={3} className="text-foreground">
                                                    Total Floor Selling Price (
                                                    {activeCategory?.label || activeCategory?.name || "Adult"}
                                                    )
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-primary text-base font-extrabold">
                                                    {BookingService.formatCurrency(finalSellingPrice)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Right Area: Financial Intelligence, Cross-Category Comparison & Discount Policy (5 Cols) */}
                        <div className="lg:col-span-5 space-y-5">
                            {/* Proportional Cost Breakdown Card */}
                            <div className="p-4 rounded-xl border bg-card space-y-3 shadow-2xs">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                                    Cost vs Profit Distribution
                                </h4>

                                {/* Stacked Visual Bar */}
                                <div className="space-y-1.5">
                                    <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden flex border">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
                                            style={{ width: `${baseExpensePercent}%` }}
                                            title={`Base Expenses: ${baseExpensePercent}%`}
                                        />
                                        <div
                                            className="bg-emerald-500 h-full transition-all"
                                            style={{ width: `${effectiveMarginPercent}%` }}
                                            title={`Operator Margin: ${effectiveMarginPercent}%`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                        <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                                            Logistics: {baseExpensePercent}%
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                            Margin: {effectiveMarginPercent}%
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-2.5 rounded-lg bg-muted/30 border space-y-0.5">
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                            Direct Expenses
                                        </span>
                                        <p className="text-sm font-bold font-mono text-foreground">
                                            {BookingService.formatCurrency(baseExpensesSubtotal)}
                                        </p>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-semibold">
                                            Profit Retained
                                        </span>
                                        <p className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                                            {BookingService.formatCurrency(operatorMarginCost)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Cross-Age Categories Quick Comparison Table */}
                            <div className="p-4 rounded-xl border bg-card space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        All Age Rates Comparison
                                    </h4>
                                    <Badge variant="outline" className="text-[10px]">
                                        {ageCategories.length} Categories
                                    </Badge>
                                </div>

                                <div className="rounded-lg border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30 text-[11px]">
                                            <TableRow>
                                                <TableHead className="py-2 text-[11px] font-bold">Category</TableHead>
                                                <TableHead className="py-2 text-[11px] font-bold text-right">Margin</TableHead>
                                                <TableHead className="py-2 text-[11px] font-bold text-right">Selling Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ageCategories.map((cat) => {
                                                const catKey =
                                                    cat.id || cat.categoryKey || cat.name;
                                                const isCurrent =
                                                    (activeCategory?.id ||
                                                        activeCategory?.categoryKey ||
                                                        activeCategory?.name) === catKey;
                                                const catTotal = cat.items.reduce(
                                                    (sum, i) => sum + (Number(i.cost) || 0),
                                                    0
                                                );
                                                const catMargin = cat.items.find(
                                                    (i) => i.isMargin
                                                );

                                                return (
                                                    <TableRow
                                                        key={catKey}
                                                        onClick={() => setSelectedCategoryId(catKey)}
                                                        className={`cursor-pointer transition-colors ${isCurrent
                                                            ? "bg-primary/10 font-bold"
                                                            : "hover:bg-muted/30"
                                                            }`}
                                                    >
                                                        <TableCell className="py-2 text-xs">
                                                            <span className="font-semibold text-foreground">
                                                                {cat.label || cat.name}
                                                            </span>
                                                            {cat.ageDescription && (
                                                                <span className="text-[10px] text-muted-foreground block">
                                                                    {cat.ageDescription}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            {catMargin ? `+₹${Number(catMargin.cost).toLocaleString("en-IN")}` : "₹0"}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-right font-mono font-bold text-foreground">
                                                            {BookingService.formatCurrency(catTotal)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Maximum Discount Policy Card */}
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                                        <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-xs font-bold">
                                            Max Discount Ceiling Policy
                                        </span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold"
                                    >
                                        {isDiscountActive ? "Policy Active" : "No Cap"}
                                    </Badge>
                                </div>

                                {isDiscountActive ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-lg bg-background/60 border border-amber-500/20">
                                                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                                    Discount Limit
                                                </span>
                                                <span className="font-extrabold text-foreground font-mono">
                                                    {discountType === "percentage"
                                                        ? `${discountVal}% Off`
                                                        : `₹${discountVal.toLocaleString("en-IN")} Off`}
                                                </span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-background/60 border border-amber-500/20">
                                                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                                    Enforcement Scope
                                                </span>
                                                <span className="font-bold text-foreground capitalize">
                                                    {discountScope === "passenger" ? "Per Passenger" : "Group Total"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                                            Booking discounts cannot push the traveler selling price below{" "}
                                            <strong>{BookingService.formatCurrency(floorAfterDiscount)}</strong>, ensuring that direct operational costs and minimum margin thresholds remain protected.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span>No automated discount ceiling is configured. Sales operators can offer custom promotional discounts.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="p-4 px-6 border-t bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                        All line items reflect unit economics for departure #{costSheet ? "BS" : ""}. Selling rates automatically populate in the booking engine.
                    </p>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
