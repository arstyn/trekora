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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axios";
import { SalarySlipService } from "@/services/salary-slip.service";
import type { ISalarySlipFieldsConfig } from "@/types/salary.types";
import {
    Building,
    Calendar,
    Check,
    Eye,
    FileSpreadsheet,
    FileText,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Paintbrush,
    Save,
    Stamp,
    Trash2,
    Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const PRESET_COLORS = [
    { name: "Default Blue", value: "#2563eb" },
    { name: "Indigo", value: "#4f46e5" },
    { name: "Emerald Green", value: "#059669" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Rose Crimson", value: "#e11d48" },
    { name: "Orange Amber", value: "#ea580c" },
    { name: "Slate Grey", value: "#475569" },
];

const DEFAULT_LAYOUT_ORDER = [
    "employeeInfo",
    "attendance",
    "earningsDeductions",
    "netPay",
    "seal",
    "footer",
];

const SECTION_LABELS: Record<string, string> = {
    employeeInfo: "Employee, Bank & Statutory Info",
    attendance: "Working Days & Leave Summary",
    earningsDeductions: "Earnings & Deductions Breakdown",
    netPay: "Net Salary Payable Highlight",
    seal: "Authorised Signatory & Seal",
    footer: "Required Disclaimer / Footer Text",
};

export default function SalarySlipSettingsPage() {
    const { refresh } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);

    const [salarySlipColor, setSalarySlipColor] = useState("#2563eb");
    const [fields, setFields] = useState<ISalarySlipFieldsConfig>({
        companyHeaderText: "",
        companyAddressText: "",
        customFooterText:
            "This is a computer-generated salary slip and does not require a physical signature.",
        showLogo: true,
        showSeal: true,
        showBankDetails: true,
        showStatutoryDetails: true,
        showAttendanceSummary: true,
        showNetInWords: true,
        showFooter: true,
        sealAlign: "right",
        layoutOrder: DEFAULT_LAYOUT_ORDER,
        casualLeaveQuota: 12,
        sickLeaveQuota: 10,
        paidLeaveQuota: 15,
    });

    const [layoutOrder, setLayoutOrder] =
        useState<string[]>(DEFAULT_LAYOUT_ORDER);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Logo upload state
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);

    // Seal upload state
    const [existingSealUrl, setExistingSealUrl] = useState<string | null>(null);
    const [sealFile, setSealFile] = useState<File | null>(null);
    const [sealPreviewUrl, setSealPreviewUrl] = useState<string | null>(null);
    const [shouldRemoveSeal, setShouldRemoveSeal] = useState(false);

    useEffect(() => {
        const fetchOrgSettings = async () => {
            setIsLoading(true);
            try {
                const profileRes = await axiosInstance.get("/employee/profile");
                const activeOrgId = profileRes.data?.organizationId;
                if (activeOrgId) {
                    setOrgId(activeOrgId);
                    const orgRes = await axiosInstance.get(
                        `/organization/${activeOrgId}`
                    );
                    if (orgRes.data) {
                        const org = orgRes.data;
                        setSalarySlipColor(org.salarySlipColor || "#2563eb");
                        setExistingLogoUrl(
                            SalarySlipService.resolveAssetUrl(org.salarySlipLogo)
                        );
                        setExistingSealUrl(
                            SalarySlipService.resolveAssetUrl(
                                org.salarySlipSeal || org.invoiceSeal
                            )
                        );

                        const parsed = SalarySlipService.parseFields(org);
                        setFields(parsed);
                        setLayoutOrder(
                            parsed.layoutOrder || DEFAULT_LAYOUT_ORDER
                        );
                    }
                }
            } catch (err) {
                console.error("Failed to load salary slip settings", err);
                toast.error("Failed to load salary slip customization settings");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrgSettings();
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG/JPG) for the logo.");
            return;
        }
        setLogoFile(file);
        setShouldRemoveLogo(false);
        setLogoPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreviewUrl(null);
        setExistingLogoUrl(null);
        setShouldRemoveLogo(true);
    };

    const handleSealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG/JPG) for the seal.");
            return;
        }
        setSealFile(file);
        setShouldRemoveSeal(false);
        setSealPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveSeal = () => {
        setSealFile(null);
        setSealPreviewUrl(null);
        setExistingSealUrl(null);
        setShouldRemoveSeal(true);
    };

    const toggleBooleanField = (key: keyof ISalarySlipFieldsConfig) => {
        setFields((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = "move";
        setDraggedId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const nextOrder = [...layoutOrder];
        const fromIdx = nextOrder.indexOf(draggedId);
        const toIdx = nextOrder.indexOf(targetId);

        if (fromIdx !== -1 && toIdx !== -1) {
            nextOrder.splice(fromIdx, 1);
            nextOrder.splice(toIdx, 0, draggedId);
            setLayoutOrder(nextOrder);
            setFields((prev) => ({ ...prev, layoutOrder: nextOrder }));
        }
        setDraggedId(null);
    };

    const handleSave = async () => {
        if (!orgId) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("salarySlipColor", salarySlipColor);

            const updatedFields: ISalarySlipFieldsConfig = {
                ...fields,
                layoutOrder,
            };
            formData.append("salarySlipFields", JSON.stringify(updatedFields));

            if (logoFile) {
                formData.append("salarySlipLogo", logoFile);
            } else if (shouldRemoveLogo) {
                formData.append("salarySlipLogo", "");
            }

            if (sealFile) {
                formData.append("salarySlipSeal", sealFile);
            } else if (shouldRemoveSeal) {
                formData.append("salarySlipSeal", "");
            }

            const res = await axiosInstance.put(
                `/organization/${orgId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.data) {
                setExistingLogoUrl(
                    SalarySlipService.resolveAssetUrl(res.data.salarySlipLogo)
                );
                setExistingSealUrl(
                    SalarySlipService.resolveAssetUrl(
                        res.data.salarySlipSeal || res.data.invoiceSeal
                    )
                );
                setLogoFile(null);
                setSealFile(null);
                setLogoPreviewUrl(null);
                setSealPreviewUrl(null);
                setShouldRemoveLogo(false);
                setShouldRemoveSeal(false);
                toast.success("Salary slip layout & leave settings saved");
                await refresh();
            }
        } catch (err: any) {
            console.error("Failed to save salary slip settings", err);
            toast.error(
                err.response?.data?.message ||
                    "Failed to save salary slip settings"
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">
                    Loading salary slip configuration...
                </p>
            </div>
        );
    }

    const displayedLogo = logoPreviewUrl || existingLogoUrl;
    const displayedSeal = sealPreviewUrl || existingSealUrl;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-7 h-7 text-primary" />
                        Salary Slip Layout & Leave Policy
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Configure your company logo, signatory seal, required text, section order, and default annual leave quotas.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 cursor-pointer"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Configuration
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Controls */}
                <div className="lg:col-span-6 space-y-6">
                    {/* 1. Brand Color & Text */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Paintbrush className="w-4 h-4 text-primary" />
                                Brand Theme & Required Company Text
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Customize header title, corporate address, accent color, and mandatory footer disclaimer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">
                                    Accent Color
                                </Label>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() =>
                                                setSalarySlipColor(c.value)
                                            }
                                            className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-105 cursor-pointer"
                                            style={{
                                                backgroundColor: c.value,
                                                borderColor:
                                                    salarySlipColor === c.value
                                                        ? "#111827"
                                                        : "transparent",
                                            }}
                                            title={c.name}
                                        >
                                            {salarySlipColor === c.value && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                    ))}
                                    <div className="flex items-center gap-2 ml-2">
                                        <Input
                                            type="color"
                                            value={salarySlipColor}
                                            onChange={(e) =>
                                                setSalarySlipColor(
                                                    e.target.value
                                                )
                                            }
                                            className="w-10 h-8 p-0.5 cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {salarySlipColor.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Company Header Title
                                    </Label>
                                    <Input
                                        placeholder="e.g., Trekora Travel Pvt. Ltd."
                                        value={fields.companyHeaderText || ""}
                                        onChange={(e) =>
                                            setFields((prev) => ({
                                                ...prev,
                                                companyHeaderText:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Registered Office Address / Sub-header Text
                                    </Label>
                                    <Textarea
                                        rows={2}
                                        placeholder="e.g., 2nd Floor, Tech Park, MG Road, Bengaluru, Karnataka - 560001 • CIN: U63040KA2026PTC00000"
                                        value={fields.companyAddressText || ""}
                                        onChange={(e) =>
                                            setFields((prev) => ({
                                                ...prev,
                                                companyAddressText:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Required Footer / Disclaimer Text
                                    </Label>
                                    <Textarea
                                        rows={2}
                                        placeholder="e.g., This is a computer-generated salary slip and does not require a physical signature."
                                        value={fields.customFooterText || ""}
                                        onChange={(e) =>
                                            setFields((prev) => ({
                                                ...prev,
                                                customFooterText:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Logo & Authorised Signatory Seal Upload */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                Company Logo & Signatory Seal
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Upload your organization logo for the top header and official stamp/signature for the bottom of the salary slip.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Logo Box */}
                            <div className="border rounded-lg p-3.5 space-y-3 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-primary" />
                                        Company Logo
                                    </Label>
                                    {displayedLogo && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveLogo}
                                            className="h-7 px-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                {displayedLogo ? (
                                    <div className="h-24 flex items-center justify-center bg-background border rounded-md p-2">
                                        <img
                                            src={displayedLogo}
                                            alt="Company Logo"
                                            className="max-h-20 max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <label className="h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/40 transition-colors">
                                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">
                                            Upload Logo (PNG/JPG)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Seal Box */}
                            <div className="border rounded-lg p-3.5 space-y-3 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Stamp className="w-3.5 h-3.5 text-primary" />
                                        Signatory Seal / Stamp
                                    </Label>
                                    {displayedSeal && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveSeal}
                                            className="h-7 px-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                {displayedSeal ? (
                                    <div className="h-24 flex items-center justify-center bg-background border rounded-md p-2">
                                        <img
                                            src={displayedSeal}
                                            alt="Official Seal"
                                            className="max-h-20 max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <label className="h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/40 transition-colors">
                                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">
                                            Upload Seal (PNG/JPG)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSealChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] text-muted-foreground">
                                        Seal Alignment:
                                    </span>
                                    <div className="flex gap-1">
                                        {(["left", "center", "right"] as const).map(
                                            (align) => (
                                                <Button
                                                    key={align}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        fields.sealAlign ===
                                                        align
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="h-6 px-2 text-[11px] capitalize cursor-pointer"
                                                    onClick={() =>
                                                        setFields((prev) => ({
                                                            ...prev,
                                                            sealAlign: align,
                                                        }))
                                                    }
                                                >
                                                    {align}
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Section Visibility & Drag-and-Drop Order */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Payslip Sections & Ordering
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Toggle which sections appear on the salary slip and drag rows below to reorder them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    {
                                        key: "showLogo",
                                        label: "Show Company Logo",
                                    },
                                    {
                                        key: "showBankDetails",
                                        label: "Show Bank Account Details",
                                    },
                                    {
                                        key: "showStatutoryDetails",
                                        label: "Show PAN / UAN / PF / ESI",
                                    },
                                    {
                                        key: "showAttendanceSummary",
                                        label: "Show Working Days & Leaves",
                                    },
                                    {
                                        key: "showNetInWords",
                                        label: "Show Net Salary in Words",
                                    },
                                    {
                                        key: "showSeal",
                                        label: "Show Signatory Seal",
                                    },
                                    {
                                        key: "showFooter",
                                        label: "Show Footer Disclaimer",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
                                    >
                                        <span className="text-xs font-medium">
                                            {item.label}
                                        </span>
                                        <Switch
                                            checked={Boolean(
                                                fields[
                                                    item.key as keyof ISalarySlipFieldsConfig
                                                ]
                                            )}
                                            onCheckedChange={() =>
                                                toggleBooleanField(
                                                    item.key as keyof ISalarySlipFieldsConfig
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-semibold">
                                    Drag to Reorder Payslip Sections
                                </Label>
                                <div className="space-y-1.5">
                                    {layoutOrder.map((secId, idx) => (
                                        <div
                                            key={secId}
                                            draggable
                                            onDragStart={(e) =>
                                                handleDragStart(e, secId)
                                            }
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, secId)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-md border bg-background text-xs font-medium cursor-grab active:cursor-grabbing transition-colors ${
                                                draggedId === secId
                                                    ? "opacity-50 border-primary"
                                                    : "hover:bg-muted/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground font-mono">
                                                    {idx + 1}.
                                                </span>
                                                <span>
                                                    {SECTION_LABELS[secId] ||
                                                        secId}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase">
                                                Drag
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Default Annual Leave Quotas */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Default Annual Leave Quotas (Organization-Wide)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Set standard yearly paid leave allowances per employee (can also be overridden per employee in their salary structure).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Casual Leave (Days/Yr)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={fields.casualLeaveQuota ?? 12}
                                    onChange={(e) =>
                                        setFields((prev) => ({
                                            ...prev,
                                            casualLeaveQuota: Number(
                                                e.target.value
                                            ),
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Sick Leave (Days/Yr)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={fields.sickLeaveQuota ?? 10}
                                    onChange={(e) =>
                                        setFields((prev) => ({
                                            ...prev,
                                            sickLeaveQuota: Number(
                                                e.target.value
                                            ),
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Paid / Earned Leave (Days/Yr)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={fields.paidLeaveQuota ?? 15}
                                    onChange={(e) =>
                                        setFields((prev) => ({
                                            ...prev,
                                            paidLeaveQuota: Number(
                                                e.target.value
                                            ),
                                        }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Interactive Salary Slip Preview */}
                <div className="lg:col-span-6 lg:sticky lg:top-6">
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-primary" />
                                    Live Salary Slip Preview
                                </CardTitle>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                    Sample: November 2026
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 bg-white text-slate-900 rounded-b-xl">
                            <div className="border border-slate-200 rounded-lg p-5 space-y-4 text-xs shadow-2xs">
                                {/* Header */}
                                <div
                                    className="flex items-start justify-between pb-3 border-b-2"
                                    style={{
                                        borderBottomColor: salarySlipColor,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        {fields.showLogo && displayedLogo && (
                                            <img
                                                src={displayedLogo}
                                                alt="Logo"
                                                className="h-11 max-w-[110px] object-contain"
                                            />
                                        )}
                                        <div>
                                            <h3
                                                className="text-base font-extrabold"
                                                style={{
                                                    color: salarySlipColor,
                                                }}
                                            >
                                                {fields.companyHeaderText ||
                                                    "Trekora Travel Pvt. Ltd."}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 whitespace-pre-line">
                                                {fields.companyAddressText ||
                                                    "Registered Office • India"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            Salary Slip
                                        </div>
                                        <div
                                            className="text-sm font-extrabold"
                                            style={{ color: salarySlipColor }}
                                        >
                                            November 2026
                                        </div>
                                        <div className="font-mono text-[11px] text-slate-500">
                                            #SAL-202611-0001
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Ordered Sections */}
                                {layoutOrder.map((secId) => {
                                    if (secId === "employeeInfo") {
                                        return (
                                            <div
                                                key={secId}
                                                className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px]"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">
                                                            Employee:
                                                        </span>
                                                        <span className="font-semibold">
                                                            Aarav Sharma
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">
                                                            Designation:
                                                        </span>
                                                        <span className="font-semibold">
                                                            Senior Travel Consultant
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {fields.showBankDetails && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">
                                                                Bank / A/C:
                                                            </span>
                                                            <span className="font-mono font-semibold">
                                                                HDFC ••••4821
                                                            </span>
                                                        </div>
                                                    )}
                                                    {fields.showStatutoryDetails && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">
                                                                PAN / UAN:
                                                            </span>
                                                            <span className="font-mono font-semibold">
                                                                ABCDE1234F / 10092831
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (
                                        secId === "attendance" &&
                                        fields.showAttendanceSummary
                                    ) {
                                        return (
                                            <div
                                                key={secId}
                                                className="grid grid-cols-5 gap-2 text-center"
                                            >
                                                <div className="border border-slate-200 rounded p-2">
                                                    <div className="text-[9px] uppercase text-slate-500 font-semibold">
                                                        Working Days
                                                    </div>
                                                    <div className="font-mono font-bold text-sm">
                                                        30
                                                    </div>
                                                </div>
                                                <div className="border border-slate-200 rounded p-2">
                                                    <div className="text-[9px] uppercase text-slate-500 font-semibold">
                                                        Worked
                                                    </div>
                                                    <div className="font-mono font-bold text-sm">
                                                        27
                                                    </div>
                                                </div>
                                                <div className="border border-slate-200 rounded p-2">
                                                    <div className="text-[9px] uppercase text-slate-500 font-semibold">
                                                        Paid Leave
                                                    </div>
                                                    <div className="font-mono font-bold text-sm text-emerald-600">
                                                        2
                                                    </div>
                                                </div>
                                                <div className="border border-slate-200 rounded p-2">
                                                    <div className="text-[9px] uppercase text-slate-500 font-semibold">
                                                        LOP Days
                                                    </div>
                                                    <div className="font-mono font-bold text-sm text-rose-600">
                                                        1
                                                    </div>
                                                </div>
                                                <div
                                                    className="border rounded p-2 bg-slate-50"
                                                    style={{
                                                        borderColor:
                                                            salarySlipColor,
                                                    }}
                                                >
                                                    <div
                                                        className="text-[9px] uppercase font-semibold"
                                                        style={{
                                                            color: salarySlipColor,
                                                        }}
                                                    >
                                                        Payable Days
                                                    </div>
                                                    <div
                                                        className="font-mono font-bold text-sm"
                                                        style={{
                                                            color: salarySlipColor,
                                                        }}
                                                    >
                                                        29
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (secId === "earningsDeductions") {
                                        return (
                                            <div
                                                key={secId}
                                                className="border border-slate-200 rounded overflow-hidden"
                                            >
                                                <div
                                                    className="grid grid-cols-4 text-white font-bold text-[10px] uppercase px-3 py-2"
                                                    style={{
                                                        backgroundColor:
                                                            salarySlipColor,
                                                    }}
                                                >
                                                    <span>Earnings</span>
                                                    <span className="text-right pr-2">
                                                        Amount
                                                    </span>
                                                    <span className="pl-2">
                                                        Deductions
                                                    </span>
                                                    <span className="text-right">
                                                        Amount
                                                    </span>
                                                </div>
                                                <div className="divide-y divide-slate-200 text-[11px]">
                                                    <div className="grid grid-cols-4 px-3 py-1.5">
                                                        <span>Basic Salary</span>
                                                        <span className="text-right font-mono pr-2 border-r border-slate-200">
                                                            ₹30,000.00
                                                        </span>
                                                        <span className="pl-2">
                                                            Provident Fund (EPF)
                                                        </span>
                                                        <span className="text-right font-mono">
                                                            ₹1,800.00
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 px-3 py-1.5 bg-slate-50">
                                                        <span>HRA</span>
                                                        <span className="text-right font-mono pr-2 border-r border-slate-200">
                                                            ₹12,000.00
                                                        </span>
                                                        <span className="pl-2">
                                                            Professional Tax (PT)
                                                        </span>
                                                        <span className="text-right font-mono">
                                                            ₹200.00
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 px-3 py-1.5">
                                                        <span>
                                                            Special & Medical
                                                        </span>
                                                        <span className="text-right font-mono pr-2 border-r border-slate-200">
                                                            ₹8,000.00
                                                        </span>
                                                        <span className="pl-2">
                                                            Loss of Pay (LOP)
                                                        </span>
                                                        <span className="text-right font-mono">
                                                            ₹1,666.67
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 px-3 py-1.5 bg-emerald-50/50">
                                                        <span className="text-emerald-700 font-semibold">
                                                            Additional Incentive
                                                        </span>
                                                        <span className="text-right font-mono font-semibold text-emerald-700 pr-2 border-r border-slate-200">
                                                            ₹5,000.00
                                                        </span>
                                                        <span className="pl-2">
                                                            TDS
                                                        </span>
                                                        <span className="text-right font-mono">
                                                            ₹1,000.00
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 px-3 py-2 bg-slate-100 font-bold">
                                                        <span>
                                                            Gross Earnings
                                                        </span>
                                                        <span className="text-right font-mono pr-2 border-r border-slate-200">
                                                            ₹55,000.00
                                                        </span>
                                                        <span className="pl-2">
                                                            Total Deductions
                                                        </span>
                                                        <span className="text-right font-mono text-rose-600">
                                                            ₹4,666.67
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (secId === "netPay") {
                                        return (
                                            <div
                                                key={secId}
                                                className="flex items-center justify-between p-3 rounded-lg border-2 bg-slate-50"
                                                style={{
                                                    borderColor:
                                                        salarySlipColor,
                                                }}
                                            >
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-slate-500">
                                                        Net Salary Payable
                                                    </div>
                                                    {fields.showNetInWords && (
                                                        <div className="text-[11px] italic text-slate-600">
                                                            Rupees Fifty Thousand Three Hundred and Thirty Three Only
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className="text-lg font-extrabold font-mono"
                                                    style={{
                                                        color: salarySlipColor,
                                                    }}
                                                >
                                                    ₹50,333.33
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (
                                        secId === "seal" &&
                                        fields.showSeal &&
                                        displayedSeal
                                    ) {
                                        return (
                                            <div
                                                key={secId}
                                                style={{
                                                    textAlign:
                                                        fields.sealAlign ||
                                                        "right",
                                                }}
                                                className="pt-2"
                                            >
                                                <div className="inline-block text-center">
                                                    <img
                                                        src={displayedSeal}
                                                        alt="Seal"
                                                        className="h-14 max-w-[130px] object-contain mx-auto"
                                                    />
                                                    <div className="text-[10px] font-semibold text-slate-500 border-t border-slate-300 pt-1 mt-1">
                                                        Authorised Signatory
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (
                                        secId === "footer" &&
                                        fields.showFooter &&
                                        fields.customFooterText
                                    ) {
                                        return (
                                            <div
                                                key={secId}
                                                className="text-center text-[10px] text-slate-500 border-t border-slate-200 pt-2.5 whitespace-pre-line"
                                            >
                                                {fields.customFooterText}
                                            </div>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

