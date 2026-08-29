import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axios";
import {
    Check,
    Eye,
    Loader2,
    Paintbrush,
    Receipt,
    Save,
    Upload,
    Building,
    FileText,
    Trash2
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceFieldsConfig {
    showLogo: boolean;
    showSeal: boolean;
    showBillingTo: boolean;
    showTripDetails: boolean;
    showPaymentHistory: boolean;
    showBalanceDue: boolean;
    showFooter: boolean;
    customTerms?: string;
    layoutOrder?: string[];
}

const PRESET_COLORS = [
    { name: "Default Blue", value: "#2563eb" },
    { name: "Indigo", value: "#4f46e5" },
    { name: "Emerald Green", value: "#059669" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Rose Crimson", value: "#e11d48" },
    { name: "Orange Amber", value: "#ea580c" },
    { name: "Slate Grey", value: "#475569" },
];

export default function InvoiceSettingsPage() {
    const { user, refresh } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);

    // Invoice Customization States
    const [invoiceColor, setInvoiceColor] = useState("#2563eb");
    const [invoiceFields, setInvoiceFields] = useState<InvoiceFieldsConfig>({
        showLogo: true,
        showSeal: true,
        showBillingTo: true,
        showTripDetails: true,
        showPaymentHistory: true,
        showBalanceDue: true,
        showFooter: true,
        customTerms: "",
        layoutOrder: ["billing", "tripDetails", "itemsTable", "seal", "totals", "payments", "terms"],
    });

    const [layoutOrder, setLayoutOrder] = useState<string[]>([
        "billing",
        "tripDetails",
        "itemsTable",
        "seal",
        "totals",
        "payments",
        "terms",
    ]);

    const [existingSealUrl, setExistingSealUrl] = useState<string | null>(null);
    const [sealFile, setSealFile] = useState<File | null>(null);
    const [sealPreviewUrl, setSealPreviewUrl] = useState<string | null>(null);
    const [shouldRemoveSeal, setShouldRemoveSeal] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    // Layout drag and drop states
    const [draggedId, setDraggedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgSettings = async () => {
            setIsLoading(true);
            try {
                const profileRes = await axiosInstance.get("/employee/profile");
                const activeOrgId = profileRes.data?.organizationId;
                if (activeOrgId) {
                    setOrgId(activeOrgId);
                    const orgRes = await axiosInstance.get(`/organization/${activeOrgId}`);
                    if (orgRes.data) {
                        setInvoiceColor(orgRes.data.invoiceColor || "#2563eb");
                        setExistingSealUrl(orgRes.data.invoiceSeal || null);
                        
                        if (orgRes.data.invoiceFields) {
                            const fields = typeof orgRes.data.invoiceFields === 'string'
                                ? JSON.parse(orgRes.data.invoiceFields)
                                : orgRes.data.invoiceFields;
                            
                            const loadedOrder = fields.layoutOrder || [
                                "billing",
                                "tripDetails",
                                "itemsTable",
                                "seal",
                                "totals",
                                "payments",
                                "terms",
                            ];
                            
                            setInvoiceFields({
                                showLogo: fields.showLogo !== false,
                                showSeal: fields.showSeal !== false,
                                showBillingTo: fields.showBillingTo !== false,
                                showTripDetails: fields.showTripDetails !== false,
                                showPaymentHistory: fields.showPaymentHistory !== false,
                                showBalanceDue: fields.showBalanceDue !== false,
                                showFooter: fields.showFooter !== false,
                                customTerms: fields.customTerms || "",
                                layoutOrder: loadedOrder,
                            });
                            setLayoutOrder(loadedOrder);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load invoice settings", err);
                toast.error("Failed to load invoice customization settings");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrgSettings();
    }, []);

    // Seal file drag & drop handlers
    const handleDragOverFile = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleDragLeaveFile = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
    };

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type !== "image/png") {
                toast.error("Only PNG files are allowed for the official seal.");
                return;
            }
            setSealFile(file);
            setShouldRemoveSeal(false);
            const preview = URL.createObjectURL(file);
            setSealPreviewUrl(preview);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "image/png") {
                toast.error("Only PNG files are allowed for the official seal.");
                return;
            }
            setSealFile(file);
            setShouldRemoveSeal(false);
            const preview = URL.createObjectURL(file);
            setSealPreviewUrl(preview);
        }
    };

    const handleRemoveSeal = () => {
        setSealFile(null);
        setSealPreviewUrl(null);
        setShouldRemoveSeal(true);
        setExistingSealUrl(null);
    };

    const handleSave = async () => {
        if (!orgId) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("invoiceColor", invoiceColor);
            
            // Sync current layoutOrder to invoiceFields config
            const updatedFields = {
                ...invoiceFields,
                layoutOrder,
            };
            formData.append("invoiceFields", JSON.stringify(updatedFields));

            if (sealFile) {
                formData.append("seal", sealFile);
            } else if (shouldRemoveSeal) {
                formData.append("invoiceSeal", "");
            }

            const res = await axiosInstance.put(`/organization/${orgId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data) {
                setExistingSealUrl(res.data.invoiceSeal || null);
                setSealFile(null);
                setSealPreviewUrl(null);
                setShouldRemoveSeal(false);
                toast.success("Invoice settings saved successfully");
                await refresh(); // Refresh active user context
            }
        } catch (err: any) {
            console.error("Failed to save settings", err);
            toast.error(err.response?.data?.message || "Failed to save invoice customization");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleField = (key: keyof InvoiceFieldsConfig) => {
        setInvoiceFields((prev) => ({
            ...prev,
            [key]: !prev[key] as any,
        }));
    };

    // Layout drag and drop handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = "move";
        setDraggedId(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const newOrder = [...layoutOrder];
        const draggedIndex = newOrder.indexOf(draggedId);
        const targetIndex = newOrder.indexOf(targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, draggedId);
            
            setLayoutOrder(newOrder);
            setInvoiceFields((prev) => ({
                ...prev,
                layoutOrder: newOrder,
            }));
        }
        setDraggedId(null);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading invoice settings...</p>
            </div>
        );
    }

    const displayedSeal = sealPreviewUrl || existingSealUrl;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Receipt className="w-8 h-8 text-primary" />
                        Invoice Customization
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Tailor the look, brand color, and data structures of your organization's downloadable invoices.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Settings Controls */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Color Customization */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Paintbrush className="w-5 h-5 text-primary" />
                                Brand Identity & Accent Color
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Set the header border, status badges, and highlighting accents of your invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2.5">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setInvoiceColor(c.value)}
                                        className="h-10 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-border/50 hover:bg-muted/40 transition-all cursor-pointer relative"
                                        style={{ borderLeft: `4px solid ${c.value}` }}
                                    >
                                        {c.name}
                                        {invoiceColor === c.value && (
                                            <Check className="w-3.5 h-3.5 text-primary ml-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Label htmlFor="customColor" className="text-xs font-medium shrink-0">Custom Color:</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="customColor"
                                        type="color"
                                        value={invoiceColor}
                                        onChange={(e) => setInvoiceColor(e.target.value)}
                                        className="w-12 h-9 p-0.5 rounded-lg cursor-pointer border"
                                    />
                                    <span className="font-mono text-xs font-semibold bg-muted px-2 py-1 rounded border">
                                        {invoiceColor.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Seal / Stamp Upload */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary" />
                                Official Seal & Signature Stamp
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Upload a PNG or JPEG stamp seal (max 2MB) to print at the bottom of customer invoices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full">
                                    <Label
                                        htmlFor="seal-upload"
                                        onDragOver={handleDragOverFile}
                                        onDragLeave={handleDragLeaveFile}
                                        onDrop={handleDropFile}
                                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                                            isDraggingFile 
                                                ? "border-primary bg-primary/10 scale-[0.98]" 
                                                : "border-border/70 hover:border-primary/60 bg-muted/20 hover:bg-muted/40"
                                        }`}
                                    >
                                        <Upload className={`w-8 h-8 text-muted-foreground ${isDraggingFile ? 'text-primary scale-110' : 'animate-pulse'}`} />
                                        <span className="text-xs font-semibold">
                                            {isDraggingFile ? "Drop PNG file here" : "Click or drag & drop to select seal image"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">Only PNG format is accepted (max 2MB)</span>
                                        <input
                                            id="seal-upload"
                                            type="file"
                                            accept="image/png"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </Label>
                                </div>

                                {displayedSeal && (
                                    <div className="flex flex-col items-center justify-center gap-2 bg-muted/30 border p-4 rounded-xl shrink-0 w-36">
                                        <div className="w-24 h-24 rounded-lg border bg-white flex items-center justify-center overflow-hidden p-1">
                                            <img
                                                src={displayedSeal}
                                                alt="Official Seal Preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveSeal}
                                            className="text-rose-500 hover:bg-rose-500/10 h-7 text-xs px-2 gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {displayedSeal && (
                                <div className="space-y-4 pt-4 border-t w-full">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Position & Alignment (Move Seal Left/Right/Up/Down)</h4>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Alignment */}
                                        <div className="space-y-1.5 flex-1">
                                            <Label className="text-[10px] text-muted-foreground dark:text-slate-400 font-semibold">Horizontal Alignment (Left / Right)</Label>
                                            <div className="flex rounded-lg border p-0.5 bg-muted/20 w-fit">
                                                {(["left", "center", "right"] as const).map((align) => (
                                                    <button
                                                        key={align}
                                                        type="button"
                                                        onClick={() => setInvoiceFields(prev => ({ ...prev, sealAlign: align }))}
                                                        className={`text-[10px] px-3 py-1 font-semibold rounded capitalize transition-all cursor-pointer ${
                                                            (invoiceFields.sealAlign || "right") === align
                                                                ? "bg-white border shadow-sm text-slate-900 font-bold"
                                                                : "text-muted-foreground hover:text-slate-300"
                                                        }`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vertical Offset */}
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex justify-between items-center max-w-[200px]">
                                                <Label className="text-[10px] text-muted-foreground dark:text-slate-400 font-semibold">Vertical Spacing (Up / Down)</Label>
                                            </div>
                                            <div className="flex items-center gap-2 max-w-[250px]">
                                                <Input
                                                    type="range"
                                                    min="-50"
                                                    max="50"
                                                    step="5"
                                                    value={invoiceFields.sealOffset || 0}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        setInvoiceFields(prev => ({ ...prev, sealOffset: val }));
                                                    }}
                                                    className="h-6 py-0 px-1 border-none bg-transparent cursor-pointer flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setInvoiceFields(prev => ({ ...prev, sealOffset: 0 }))}
                                                    className="h-6 px-1.5 text-[9px] rounded"
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Field Layout Configuration */}
                    <Card className="border border-border/60 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Data Structuring & Fields Selection
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure which information columns should print on the generated invoice document.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showLogo}
                                        onChange={() => toggleField("showLogo")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Company Header/Logo</p>
                                        <p className="text-[10px] text-muted-foreground">Print organization name and web domain at top</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showSeal}
                                        onChange={() => toggleField("showSeal")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Official Seal & Signature Stamp</p>
                                        <p className="text-[10px] text-muted-foreground">Print official stamp on top of totals</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showBillingTo}
                                        onChange={() => toggleField("showBillingTo")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Billing Details (Bill To)</p>
                                        <p className="text-[10px] text-muted-foreground">Render customer contact address & phone</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showTripDetails}
                                        onChange={() => toggleField("showTripDetails")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Trip & Dates Summary</p>
                                        <p className="text-[10px] text-muted-foreground">Show destinations, dates, and passengers</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showPaymentHistory}
                                        onChange={() => toggleField("showPaymentHistory")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Transaction History</p>
                                        <p className="text-[10px] text-muted-foreground">Render detailed logs of successful payments</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showBalanceDue}
                                        onChange={() => toggleField("showBalanceDue")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Balance Due Panel</p>
                                        <p className="text-[10px] text-muted-foreground">Show outstanding amounts and highlight due balances</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 cursor-pointer hover:bg-muted/35">
                                    <input
                                        type="checkbox"
                                        checked={invoiceFields.showFooter}
                                        onChange={() => toggleField("showFooter")}
                                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                                    />
                                    <div className="text-left">
                                        <p className="text-xs font-semibold">Show Custom Footer Note</p>
                                        <p className="text-[10px] text-muted-foreground">Print custom policies or bank info at bottom</p>
                                    </div>
                                </label>
                            </div>

                            {invoiceFields.showFooter && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="customTerms" className="text-xs font-semibold">Invoice Terms & Bank Details Note:</Label>
                                    <Textarea
                                        id="customTerms"
                                        placeholder="Enter Bank Account info, payment instructions, cancellation terms, etc..."
                                        className="text-xs rounded-xl"
                                        value={invoiceFields.customTerms || ""}
                                        onChange={(e) =>
                                            setInvoiceFields((prev) => ({
                                                ...prev,
                                                customTerms: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Save Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl px-6 gap-2 text-xs font-semibold h-11"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Configuration
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Panel: Live Mockup Invoice Preview */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 self-start">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        Live Mockup Invoice Preview
                    </div>

                    <Card className="border border-border/80 shadow-md rounded-2xl bg-white text-slate-800 text-[11px] max-h-[85vh] flex flex-col font-sans leading-relaxed select-none overflow-hidden">
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {/* Mock Invoice Header */}
                            {invoiceFields.showLogo && (
                                <div
                                    className="flex justify-between items-start pb-4 border-b-2"
                                    style={{ borderBottomColor: invoiceColor }}
                                >
                                    <div>
                                        <h3 className="text-sm font-extrabold" style={{ color: invoiceColor }}>
                                            {user?.organization?.name || "YOUR AGENCY"}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {user?.organization?.domain || "www.youragency.com"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-xs font-bold text-slate-700">INVOICE</h4>
                                        <p className="text-slate-500 mt-0.5 font-semibold">INV-2026-0001</p>
                                    </div>
                                </div>
                            )}

                            {/* Dynamically ordered layout sections */}
                            {layoutOrder.map((sectionId, idx) => {
                                if (sectionId === "billing" && invoiceFields.showBillingTo) {
                                    return (
                                        <div
                                            key="billing"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "billing")}
                                            onDragOver={(e) => handleDragOver(e, "billing")}
                                            onDrop={(e) => handleDrop(e, "billing")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-500 mb-2 pb-1 border-b border-slate-100">Bill To:</p>
                                                <p className="font-semibold">Jane Doe (Customer)</p>
                                                <p className="text-[10px] text-slate-500">jane.doe@gmail.com</p>
                                                <p className="text-[10px] text-slate-500">123 Street Road, Bangalore</p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (sectionId === "tripDetails" && invoiceFields.showTripDetails) {
                                    return (
                                        <div
                                            key="tripDetails"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "tripDetails")}
                                            onDragOver={(e) => handleDragOver(e, "tripDetails")}
                                            onDrop={(e) => handleDrop(e, "tripDetails")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-500 mb-2 pb-1 border-b border-slate-100">Trip Details:</p>
                                                <p className="font-semibold">Goa Beach Retreat</p>
                                                <p className="text-[10px] text-slate-500">Dates: 09/10/2026 - 15/10/2026</p>
                                                <p className="text-[10px] text-slate-500">Passengers: 2 Adults</p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (sectionId === "itemsTable") {
                                    return (
                                        <div
                                            key="itemsTable"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "itemsTable")}
                                            onDragOver={(e) => handleDragOver(e, "itemsTable")}
                                            onDrop={(e) => handleDrop(e, "itemsTable")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr
                                                        className="text-white font-bold"
                                                        style={{ backgroundColor: invoiceColor }}
                                                    >
                                                        <th className="p-1.5 rounded-l-md">Description</th>
                                                        <th className="p-1.5 text-center">Qty</th>
                                                        <th className="p-1.5 text-right rounded-r-md">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-1.5">
                                                            <p className="font-bold">Goa Beach Retreat</p>
                                                            <p className="text-[9px] text-slate-400">Premium packages</p>
                                                        </td>
                                                        <td className="p-1.5 text-center">2</td>
                                                        <td className="p-1.5 text-right">₹25,000.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                }

                                if (sectionId === "seal" && invoiceFields.showSeal && displayedSeal) {
                                    const align = invoiceFields.sealAlign || "right";
                                    const offset = invoiceFields.sealOffset || 0;
                                    const justifyClass = 
                                        align === "left" ? "justify-start text-left" :
                                        align === "center" ? "justify-center text-center" :
                                        "justify-end text-right";
                                    
                                    return (
                                        <div
                                            key="seal"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "seal")}
                                            onDragOver={(e) => handleDragOver(e, "seal")}
                                            onDrop={(e) => handleDrop(e, "seal")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                            style={{
                                                marginTop: `${offset}px`,
                                            }}
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div className={`flex ${justifyClass}`}>
                                                <div className="text-center w-fit">
                                                    <img
                                                        src={displayedSeal}
                                                        alt="Seal stamp preview"
                                                        className="h-14 w-auto object-contain mx-auto mix-blend-multiply"
                                                    />
                                                    <p className="text-[7px] text-slate-400 mt-0.5 tracking-wider uppercase font-semibold">
                                                        Authorized Stamp
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (sectionId === "totals") {
                                    return (
                                        <div
                                            key="totals"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "totals")}
                                            onDragOver={(e) => handleDragOver(e, "totals")}
                                            onDrop={(e) => handleDrop(e, "totals")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div className="flex justify-between items-start gap-4 pb-2 border-b">
                                                <div className="flex-1" />

                                                <div className="w-40 space-y-1 text-right">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Subtotal:</span>
                                                        <span className="font-semibold">₹50,000.00</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Tax:</span>
                                                        <span className="font-semibold">₹0.00</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-1 font-bold">
                                                        <span>Total:</span>
                                                        <span>₹50,000.00</span>
                                                    </div>
                                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                                        <span>Paid:</span>
                                                        <span>₹25,000.00</span>
                                                    </div>
                                                    {invoiceFields.showBalanceDue && (
                                                        <div className="flex justify-between text-red-600 font-bold border-t pt-1 mt-1">
                                                            <span>Outstanding Balance:</span>
                                                            <span>₹25,000.00</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (sectionId === "payments" && invoiceFields.showPaymentHistory) {
                                    return (
                                        <div
                                            key="payments"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "payments")}
                                            onDragOver={(e) => handleDragOver(e, "payments")}
                                            onDrop={(e) => handleDrop(e, "payments")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-500 mb-1.5">Completed Transactions</p>
                                                <table className="w-full text-left text-[9px] border">
                                                    <thead>
                                                        <tr className="bg-slate-50 border-b">
                                                            <th className="p-1 font-bold">Date</th>
                                                            <th className="p-1 font-bold">Method</th>
                                                            <th className="p-1 font-bold text-right">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b">
                                                            <td className="p-1">08/22/2026</td>
                                                            <td className="p-1">UPI</td>
                                                            <td className="p-1 text-right">₹25,000.00</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                }

                                if (sectionId === "terms" && invoiceFields.showFooter && invoiceFields.customTerms) {
                                    return (
                                        <div
                                            key="terms"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, "terms")}
                                            onDragOver={(e) => handleDragOver(e, "terms")}
                                            onDrop={(e) => handleDrop(e, "terms")}
                                            className="cursor-move border border-dashed border-transparent hover:border-primary/40 hover:bg-muted/10 p-2 -m-2 rounded-lg relative group transition-all duration-200"
                                        >
                                            <div className="absolute top-1 right-2 bg-primary/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 font-sans">
                                                Drag to reorder
                                            </div>
                                            <div className="bg-slate-50 border p-2 rounded-lg text-slate-500 text-[9px] break-words whitespace-pre-line">
                                                <p className="font-bold mb-1 text-slate-600">Terms & Payment Instructions:</p>
                                                {invoiceFields.customTerms}
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
