import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import {
    createDefaultCostSheet,
    type IBatchCostSheet,
} from "@/types/cost-sheet.types";
import type { IEmployee } from "@/types/employee.types";
import type { IPackages } from "@/types/package.schema";
import {
    ArrowLeft,
    Calendar,
    Layers,
    Loader2,
    MapPin,
    Receipt,
    Save,
    Sparkles,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BatchCostSheetEditor } from "./_components/batch-cost-sheet-editor";

export default function EditBatchPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [packages, setPackages] = useState<IPackages[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        packageId: "",
        packageName: "",
        startDate: "",
        endDate: "",
        totalSeats: "",
        coordinators: [] as IEmployee[],
    });

    const [costSheet, setCostSheet] = useState<IBatchCostSheet | null>(null);
    const [previousBatchCostSheet, setPreviousBatchCostSheet] =
        useState<IBatchCostSheet | null>(null);
    const [packageTemplateCostSheet, setPackageTemplateCostSheet] =
        useState<IBatchCostSheet | null>(null);

    const selectedPackage = packages.find((p) => p.id === formData.packageId);

    const toggleCoordinator = (employee: IEmployee) => {
        setFormData((prev) => {
            const alreadySelected = prev.coordinators.some(
                (c) => c.id === employee.id
            );
            return {
                ...prev,
                coordinators: alreadySelected
                    ? prev.coordinators.filter((c) => c.id !== employee.id)
                    : [...prev.coordinators, employee],
            };
        });
    };

    const removeCoordinator = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            coordinators: prev.coordinators.filter((_, i) => i !== index),
        }));
    };

    const handlePackageChange = async (newPackageId: string) => {
        const pkg = packages.find((p) => p.id === newPackageId);
        setFormData((prev) => ({
            ...prev,
            packageId: newPackageId,
            packageName: pkg?.name || "",
        }));

        try {
            const res = await axiosInstance.get(
                `/batches/previous-cost-sheet/${newPackageId}`
            );
            if (res.data?.costSheet) {
                setPreviousBatchCostSheet(res.data.costSheet);
            } else if (res.data?.tiers) {
                setPreviousBatchCostSheet(res.data);
            }
            if (res.data?.packageTemplateCostSheet) {
                setPackageTemplateCostSheet(res.data.packageTemplateCostSheet);
            }
        } catch {
            // Ignore error
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload: Record<string, any> = {
                packageId: formData.packageId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalSeats: parseInt(String(formData.totalSeats), 10),
                coordinators: formData.coordinators.map((c) => c.id),
                costSheet: costSheet || undefined,
            };

            await axiosInstance.patch(`/batches/${id}`, payload);
            toast.success("Batch updated successfully");
            navigate(`/batches/${id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update batch");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const [batchRes, packagesRes, employeesRes] = await Promise.all([
                    axiosInstance.get(`/batches/${id}`),
                    axiosInstance.get(`/packages?status=published`),
                    axiosInstance.get(`/employee`),
                ]);

                const batchData = batchRes.data;
                setFormData({
                    packageId: batchData.packageId || "",
                    packageName: batchData.package?.name || "",
                    startDate: batchData.startDate
                        ? batchData.startDate.split("T")[0]
                        : "",
                    endDate: batchData.endDate
                        ? batchData.endDate.split("T")[0]
                        : "",
                    totalSeats: batchData.totalSeats?.toString() || "",
                    coordinators: batchData.coordinators || [],
                });

                setPackages(packagesRes.data);
                setEmployees(employeesRes.data);

                // Initialize cost sheet
                if (batchData.costSheet && batchData.costSheet.tiers?.length > 0) {
                    setCostSheet(batchData.costSheet);
                } else {
                    setCostSheet(createDefaultCostSheet());
                }

                // Fetch previous cost sheet reference
                if (batchData.packageId) {
                    try {
                        const prevRes = await axiosInstance.get(
                            `/batches/previous-cost-sheet/${batchData.packageId}`
                        );
                        if (prevRes.data?.costSheet) {
                            setPreviousBatchCostSheet(prevRes.data.costSheet);
                        } else if (prevRes.data?.tiers) {
                            setPreviousBatchCostSheet(prevRes.data);
                        }
                        if (prevRes.data?.packageTemplateCostSheet) {
                            setPackageTemplateCostSheet(prevRes.data.packageTemplateCostSheet);
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to load batch data");
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card className="p-8">
                    <div className="space-y-4 animate-pulse">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Skeleton className="h-20" />
                            <Skeleton className="h-20" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <NavLink to="/batches" className="flex items-center gap-1">
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                    Batches
                                </NavLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <NavLink to={`/batches/${id}`}>
                                    {formData.packageName || "Batch Details"}
                                </NavLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-semibold text-foreground">
                                Edit Batch
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <NavLink to={`/batches/${id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                        Cancel & View Batch
                    </Button>
                </NavLink>
            </div>

            {/* Page Header */}
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Edit Batch Configuration
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Update tour schedule, total seats capacity, dynamic cost sheet pricing, and coordinators.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Tour Package Selection */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Tour Package
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Select the master tour package template associated with this batch
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="package" className="text-xs font-semibold">
                                Master Tour Package
                            </Label>
                            <Select
                                value={formData.packageId}
                                onValueChange={handlePackageChange}
                            >
                                <SelectTrigger className="h-10 text-xs font-semibold">
                                    <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map((pkg) => (
                                        <SelectItem key={pkg.id} value={pkg.id} className="text-xs">
                                            {pkg.name} {pkg.destination ? `(${pkg.destination})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedPackage && (
                            <div className="p-3.5 rounded-xl bg-muted/30 border text-xs flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <span className="font-bold text-foreground">
                                        {selectedPackage.name}
                                    </span>
                                    <p className="text-muted-foreground mt-0.5">
                                        {selectedPackage.destination || "Destination not set"} •{" "}
                                        {selectedPackage.days ? `${selectedPackage.days}D / ${selectedPackage.nights}N` : "Standard Duration"}
                                    </p>
                                </div>
                                <NavLink
                                    to={`/packages/${selectedPackage.id}`}
                                    className="text-primary hover:underline font-semibold"
                                >
                                    View Package Template
                                </NavLink>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 2: Schedule & Capacity */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Schedule & Capacity
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Departure and return dates with total seat allotment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-xs font-semibold">
                                    Departure / Start Date
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    required
                                    className="h-10 text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-xs font-semibold">
                                    Return / End Date
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    required
                                    className="h-10 text-xs font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 max-w-xs">
                            <Label htmlFor="totalSeats" className="text-xs font-semibold">
                                Total Seats Allotted
                            </Label>
                            <Input
                                id="totalSeats"
                                type="number"
                                min="1"
                                value={formData.totalSeats}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        totalSeats: e.target.value,
                                    }))
                                }
                                required
                                className="h-10 text-xs font-semibold"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Batch Cost Sheet & Dynamic Pricing */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-primary" />
                                    Batch Cost Sheet & Dynamic Pricing
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Configure itemized expenses, operator margins, custom age rates, and discount caps
                                </CardDescription>
                            </div>
                            {costSheet?.hasTiers && (
                                <Badge
                                    variant="outline"
                                    className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 self-start sm:self-auto"
                                >
                                    <Layers className="w-3 h-3 mr-1" />
                                    Multi-Tier ({costSheet.tiers.length})
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {costSheet ? (
                            <BatchCostSheetEditor
                                value={costSheet}
                                onChange={setCostSheet}
                                previousBatchCostSheet={previousBatchCostSheet}
                                packageTemplateCostSheet={packageTemplateCostSheet}
                                packageName={selectedPackage?.name}
                            />
                        ) : (
                            <div className="py-8 text-center space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    No cost sheet configured for this batch yet.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCostSheet(createDefaultCostSheet())}
                                >
                                    <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
                                    Initialize Cost Sheet
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 4: Batch Coordinators */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    Batch Coordinators
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Assign staff and trip coordinators responsible for this departure
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs font-mono">
                                {formData.coordinators.length} Assigned
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {/* Current Coordinators */}
                        {formData.coordinators.length > 0 ? (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    Assigned Staff
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {formData.coordinators.map((coordinator, index) => (
                                        <div
                                            key={coordinator.id || index}
                                            className="flex items-center justify-between p-3 border rounded-xl bg-muted/20"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="w-8 h-8 border shrink-0">
                                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                        {coordinator.name
                                                            ? coordinator.name
                                                                  .split(" ")
                                                                  .map((n) => n[0])
                                                                  .join("")
                                                                  .slice(0, 2)
                                                                  .toUpperCase()
                                                            : "CO"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-foreground truncate">
                                                        {coordinator.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {coordinator.phone || coordinator.email || "Coordinator"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCoordinator(index)}
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 text-center text-muted-foreground text-xs border rounded-xl border-dashed">
                                No coordinators assigned to this batch yet.
                            </div>
                        )}

                        {/* Add New Coordinator Popover */}
                        <div className="pt-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between text-xs font-semibold h-10"
                                    >
                                        <span>
                                            {formData.coordinators.length > 0
                                                ? `Manage Coordinators (${formData.coordinators.length} selected)`
                                                : "Select & Assign Coordinators..."}
                                        </span>
                                        <Users className="w-4 h-4 ml-2 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 max-h-64 overflow-y-auto p-2" align="start">
                                    <div className="space-y-1">
                                        {employees.map((emp) => {
                                            const isSelected = formData.coordinators.some(
                                                (c) => c.id === emp.id
                                            );
                                            return (
                                                <div
                                                    key={emp.id}
                                                    className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                                    onClick={() => toggleCoordinator(emp)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleCoordinator(emp)}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-foreground">
                                                            {emp.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {emp.email || emp.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit / Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <NavLink to={`/batches/${id}`}>
                        <Button type="button" variant="outline" className="text-xs font-semibold">
                            Cancel
                        </Button>
                    </NavLink>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="text-xs font-semibold px-6 shadow-sm"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}