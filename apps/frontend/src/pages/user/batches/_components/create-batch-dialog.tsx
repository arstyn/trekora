import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { IPackages } from "@/types/package.schema";
import { format } from "date-fns";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CalendarIcon,
    Check,
    ChevronRight,
    Loader2,
    Package,
    Plus,
    Search,
    X
} from "lucide-react";
import type React from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface CreateBatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateBatchDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateBatchDialogProps) {
    const [step, setStep] = useState(1);
    const [packages, setPackages] = useState<IPackages[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [showWarningAlert, setShowWarningAlert] = useState(false);
    const [activeWarnings, setActiveWarnings] = useState<string[]>([]);
    const [ignoredWarnings, setIgnoredWarnings] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coordinatorSearch, setCoordinatorSearch] = useState("");
    const [packageSearch, setPackageSearch] = useState("");
    const [packagePage, setPackagePage] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        packageId: "",
        startDate: "",
        endDate: "",
        totalSeats: "",
        seatChangeReason: "",
        coordinators: [] as IEmployee[],
    });
    const [changeSeats, setChangeSeats] = useState(false);

    const selectedPackage = packages.find((p) => p.id === formData.packageId);

    // Filtered employees for coordinator search
    const filteredEmployees = useMemo(() => {
        if (!coordinatorSearch) return employees;
        return employees.filter((emp) =>
            emp.name.toLowerCase().includes(coordinatorSearch.toLowerCase()),
        );
    }, [employees, coordinatorSearch]);

    // Filtered packages for package search
    const filteredPackages = useMemo(() => {
        if (!packageSearch) return packages;
        return packages.filter(
            (pkg) =>
                (pkg.name &&
                    pkg.name
                        .toLowerCase()
                        .includes(packageSearch.toLowerCase())) ||
                (pkg.description &&
                    pkg.description
                        .toLowerCase()
                        .includes(packageSearch.toLowerCase())) ||
                (pkg.destination &&
                    pkg.destination
                        .toLowerCase()
                        .includes(packageSearch.toLowerCase())),
        );
    }, [packages, packageSearch]);

    const packageLimit = 3;
    const totalPackagePages = Math.ceil(filteredPackages.length / packageLimit) || 1;
    const currentPackagePage = Math.min(packagePage, totalPackagePages);
    const paginatedPackages = filteredPackages.slice(
        (currentPackagePage - 1) * packageLimit,
        currentPackagePage * packageLimit
    );

    // Form validation per step
    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.packageId) newErrors.packageId = "Please select a tour package";
        }

        if (currentStep === 2) {
            if (!formData.startDate) newErrors.startDate = "Please select a start date";
            if (!formData.endDate) newErrors.endDate = "Please select an end date";
            if (
                formData.startDate &&
                formData.endDate &&
                new Date(formData.startDate) >= new Date(formData.endDate)
            ) {
                newErrors.endDate = "End date must be after start date";
            }
            if (changeSeats) {
                if (!formData.totalSeats || parseInt(formData.totalSeats) < 1) {
                    newErrors.totalSeats = "Please enter a valid number of seats";
                }
                if (!formData.seatChangeReason?.trim()) {
                    newErrors.seatChangeReason = "Please provide a reason for changing seats";
                }
            } else {
                if (selectedPackage && !selectedPackage.maxGuests) {
                    newErrors.totalSeats = "Selected package doesn't have a max guests limit. Please check 'Change seat number' to enter manually.";
                }
            }
        }

        if (currentStep === 3) {
            if (formData.coordinators.length === 0) {
                newErrors.coordinators = "Please select at least one coordinator";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
            setShowWarningAlert(false);
        }
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
        setShowWarningAlert(false);
    };

    useLayoutEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                const [packagesRes, employeesRes] = await Promise.all([
                    axiosInstance.get(`/packages?status=published`),
                    axiosInstance.get(`/employee`),
                ]);

                setPackages(packagesRes.data);
                setEmployees(employeesRes.data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("Failed to load data");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            getData();
            setActiveWarnings([]);
            setShowWarningAlert(false);
            setIgnoredWarnings(false);
        }
    }, [open]);

    // End date calculation based on package duration
    useEffect(() => {
        if (formData.packageId && formData.startDate) {
            if (selectedPackage?.days) {
                const startDateObj = new Date(formData.startDate);
                startDateObj.setDate(
                    startDateObj.getDate() + selectedPackage.days,
                );

                const year = startDateObj.getFullYear();
                const month = String(startDateObj.getMonth() + 1).padStart(
                    2,
                    "0",
                );
                const day = String(startDateObj.getDate()).padStart(2, "0");
                const calculatedEndDate = `${year}-${month}-${day}`;

                if (formData.endDate !== calculatedEndDate) {
                    setFormData((prev) => ({
                        ...prev,
                        endDate: calculatedEndDate,
                    }));
                    setErrors((prev) => {
                        if (prev.endDate) {
                            const newErrors = { ...prev };
                            delete newErrors.endDate;
                            return newErrors;
                        }
                        return prev;
                    });
                }
            }
        }
    }, [formData.packageId, formData.startDate, selectedPackage, formData.endDate]);

    const handlePackageSelect = (pkg: IPackages) => {
        setFormData((prev) => ({
            ...prev,
            packageId: pkg.id,
        }));
        if (errors.packageId) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.packageId;
                return newErrors;
            });
        }
    };

    const removeCoordinator = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            coordinators: prev.coordinators.filter((_, i) => i !== index),
        }));
    };

    const toggleCoordinator = (employee: IEmployee) => {
        setFormData((prev) => {
            const alreadySelected = prev.coordinators.some(
                (c) => c.id === employee.id,
            );
            return {
                ...prev,
                coordinators: alreadySelected
                    ? prev.coordinators.filter((c) => c.id !== employee.id)
                    : [...prev.coordinators, employee],
            };
        });
        if (errors.coordinators) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.coordinators;
                return newErrors;
            });
        }
    };

    const resetForm = () => {
        setFormData({
            packageId: "",
            startDate: "",
            endDate: "",
            totalSeats: "",
            seatChangeReason: "",
            coordinators: [],
        });
        setChangeSeats(false);
        setErrors({});
        setPackageSearch("");
        setCoordinatorSearch("");
        setActiveWarnings([]);
        setShowWarningAlert(false);
        setIgnoredWarnings(false);
        setStep(1);
        setPackagePage(1);
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();

        if (!validateStep(3)) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        setIsSubmitting(true);
        try {
            const finalSeats = changeSeats ? formData.totalSeats : selectedPackage?.maxGuests;
            const payload = {
                ...formData,
                totalSeats: parseInt(String(finalSeats), 10),
                seatChangeReason: changeSeats ? formData.seatChangeReason : undefined,
                coordinators: formData.coordinators.map((c) => c.id),
                ignoreConflicts: ignoredWarnings,
            };
            await axiosInstance.post(`/batches`, payload);

            toast.success("Batch created successfully!");
            onOpenChange(false);
            onSuccess?.();
            resetForm();
        } catch (error: any) {
            const responseData = error?.response?.data;
            if (responseData && Array.isArray(responseData.conflicts)) {
                setActiveWarnings(responseData.conflicts);
                setShowWarningAlert(true);
                toast.warning("Potential scheduling conflicts detected.");
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to create batch");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
            <DialogContent className="responsive-dialog sm:max-w-6xl w-[95vw] h-[85vh] max-lg:h-auto max-lg:max-h-[90vh] overflow-hidden max-lg:overflow-y-auto p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
                <DialogDescription className="sr-only">
                    Form to create a new tour package batch.
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
                {/* Stepper Header */}
                <div className="pl-6 pr-12 py-4 border-b bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Plus className="h-5 w-5 text-primary" />
                            Create New Batch
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Follow the steps to configure the package, schedule, capacity, and coordinators.
                        </DialogDescription>
                    </div>

                    {/* Stepper Steps */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="flex items-center gap-1.5">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
                            <span className={`text-xs hidden sm:inline font-medium ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Package</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-1.5">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
                            <span className={`text-xs hidden sm:inline font-medium ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Schedule & Capacity</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-1.5">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</span>
                            <span className={`text-xs hidden sm:inline font-medium ${step === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Coordinators</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm">Loading packages and employees...</p>
                        </div>
                    </div>
                ) : (
                    <div className="responsive-layout flex-1 flex overflow-hidden max-lg:overflow-visible min-h-0 p-0 m-0">
                        {/* Left Side: Step View */}
                        <div className="responsive-left flex-1 flex flex-col overflow-hidden max-lg:overflow-visible min-h-0 bg-background">
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="responsive-scroll flex-1 overflow-y-auto px-6 py-4 max-lg:h-auto max-lg:overflow-visible">

                                    {/* STEP 1: TOUR PACKAGE SELECTION */}
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="packageSearch" className="text-sm font-semibold">Search and Select Tour Package</Label>
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="packageSearch"
                                                            placeholder="Search by package name, destination, or description..."
                                                            value={packageSearch}
                                                            onChange={(e) => {
                                                                setPackageSearch(e.target.value);
                                                                setPackagePage(1);
                                                            }}
                                                            className="pl-10 h-10 border-input bg-background"
                                                        />
                                                    </div>
                                                    {errors.packageId && (
                                                        <p className="text-xs text-destructive font-medium mt-1">
                                                            {errors.packageId}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Packages list */}
                                                {paginatedPackages.length > 0 ? (
                                                    <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                                                        {paginatedPackages.map((pkg) => {
                                                            const isSelected = formData.packageId === pkg.id;
                                                            const thumbnailSrc = pkg.thumbnail || "";
                                                            return (
                                                                <div
                                                                    key={pkg.id}
                                                                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 flex gap-4 items-center hover:border-primary/50 hover:shadow-xs ${isSelected
                                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                        : "bg-card border-border"
                                                                        }`}
                                                                    onClick={() => handlePackageSelect(pkg)}
                                                                >
                                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                                                        {pkg.thumbnail ? (
                                                                            <img
                                                                                src={thumbnailSrc}
                                                                                alt={pkg.name}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).src = "";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Package className="h-6 w-6 text-muted-foreground/60" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pr-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-sm text-foreground truncate">
                                                                                {pkg.name}
                                                                            </span>
                                                                            {pkg.destination && (
                                                                                <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 capitalize">
                                                                                    {pkg.destination}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                                            {pkg.description || 'No description available'}
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2">
                                                                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Pagination Controls */}
                                                        {totalPackagePages > 1 && (
                                                            <div className="flex justify-between items-center mt-2 px-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() => setPackagePage((p) => Math.max(p - 1, 1))}
                                                                    disabled={currentPackagePage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <span className="text-sm text-muted-foreground">Page {currentPackagePage} of {totalPackagePages}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() => setPackagePage((p) => Math.min(p + 1, totalPackagePages))}
                                                                    disabled={currentPackagePage === totalPackagePages}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 text-center">
                                                        <Package className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                                        <p className="text-sm font-semibold text-muted-foreground">No tour packages found</p>
                                                        <p className="text-xs text-muted-foreground/80 mt-1">
                                                            {packageSearch ? `No packages matched "${packageSearch}".` : "No packages available."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: SCHEDULE & CAPACITY */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground mb-4">Set Batch Schedule</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Start Date */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="startDate" className="text-xs font-bold text-muted-foreground uppercase">Start Date *</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className={`w-full justify-start text-left font-normal h-10 ${!formData.startDate ? "text-muted-foreground" : ""} ${errors.startDate ? "border-destructive" : ""}`}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                                    {formData.startDate && !isNaN(new Date(formData.startDate).getTime()) ? (
                                                                        format(new Date(formData.startDate), "MMM dd, yyyy")
                                                                    ) : (
                                                                        <span>Select start date</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                                                    onSelect={(date) => {
                                                                        if (date) {
                                                                            const year = date.getFullYear();
                                                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                                                            const day = String(date.getDate()).padStart(2, "0");
                                                                            const localDateString = `${year}-${month}-${day}`;
                                                                            setFormData(prev => ({ ...prev, startDate: localDateString }));
                                                                            if (errors.startDate) setErrors(prev => ({ ...prev, startDate: "" }));
                                                                        }
                                                                    }}
                                                                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {errors.startDate && <p className="text-xs text-destructive font-medium">{errors.startDate}</p>}
                                                    </div>

                                                    {/* End Date */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="endDate" className="text-xs font-bold text-muted-foreground uppercase">End Date *</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className={`w-full justify-start text-left font-normal h-10 ${!formData.endDate ? "text-muted-foreground" : ""} ${errors.endDate ? "border-destructive" : ""}`}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                                    {formData.endDate && !isNaN(new Date(formData.endDate).getTime()) ? (
                                                                        format(new Date(formData.endDate), "MMM dd, yyyy")
                                                                    ) : (
                                                                        <span>Select end date</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                                                    onSelect={(date) => {
                                                                        if (date) {
                                                                            const year = date.getFullYear();
                                                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                                                            const day = String(date.getDate()).padStart(2, "0");
                                                                            const localDateString = `${year}-${month}-${day}`;
                                                                            setFormData(prev => ({ ...prev, endDate: localDateString }));
                                                                            if (errors.endDate) setErrors(prev => ({ ...prev, endDate: "" }));
                                                                        }
                                                                    }}
                                                                    disabled={formData.startDate ? { before: new Date(formData.startDate) } : undefined}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {errors.endDate && <p className="text-xs text-destructive font-medium">{errors.endDate}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-5">
                                                <h4 className="text-sm font-semibold text-foreground mb-4">Capacity Management</h4>

                                                <div className="flex items-center justify-between border rounded-xl p-4 bg-muted/10">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="changeSeats" className="text-sm font-semibold cursor-pointer">Change Seat Number</Label>
                                                        <p className="text-xs text-muted-foreground">Allows overriding the default seat limit defined in the tour package.</p>
                                                    </div>
                                                    <Switch
                                                        id="changeSeats"
                                                        checked={changeSeats}
                                                        onCheckedChange={(checked) => {
                                                            setChangeSeats(checked);
                                                            if (!checked) {
                                                                setErrors(prev => ({ ...prev, totalSeats: "", seatChangeReason: "" }));
                                                                setFormData(prev => ({ ...prev, totalSeats: "", seatChangeReason: "" }));
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {!changeSeats && (
                                                    <div className="mt-3 p-3 bg-muted/30 border rounded-xl flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground font-medium">Default Package Capacity:</span>
                                                        <Badge variant="secondary" className="font-bold text-xs">
                                                            {selectedPackage?.maxGuests ? `${selectedPackage.maxGuests} seats` : "Not defined"}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {changeSeats && (
                                                    <div className="grid sm:grid-cols-2 gap-4 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl mt-4 animate-in fade-in duration-200">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="totalSeats" className="text-xs font-bold text-muted-foreground uppercase">Total Seats *</Label>
                                                            <Input
                                                                id="totalSeats"
                                                                type="number"
                                                                min="1"
                                                                value={formData.totalSeats}
                                                                onChange={(e) => {
                                                                    setFormData(prev => ({ ...prev, totalSeats: e.target.value }));
                                                                    if (errors.totalSeats) setErrors(prev => ({ ...prev, totalSeats: "" }));
                                                                }}
                                                                placeholder="e.g. 25"
                                                                className={`h-10 bg-background ${errors.totalSeats ? "border-destructive" : ""}`}
                                                            />
                                                            {errors.totalSeats && <p className="text-xs text-destructive font-medium">{errors.totalSeats}</p>}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="seatChangeReason" className="text-xs font-bold text-muted-foreground uppercase">Reason for change *</Label>
                                                            <Input
                                                                id="seatChangeReason"
                                                                value={formData.seatChangeReason}
                                                                onChange={(e) => {
                                                                    setFormData(prev => ({ ...prev, seatChangeReason: e.target.value }));
                                                                    if (errors.seatChangeReason) setErrors(prev => ({ ...prev, seatChangeReason: "" }));
                                                                }}
                                                                placeholder="e.g. High demand, vehicle size change"
                                                                className={`h-10 bg-background ${errors.seatChangeReason ? "border-destructive" : ""}`}
                                                            />
                                                            {errors.seatChangeReason && <p className="text-xs text-destructive font-medium">{errors.seatChangeReason}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: COORDINATORS */}
                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="coordinatorSearch" className="text-sm font-semibold">1. Search and Assign Coordinators</Label>
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="coordinatorSearch"
                                                            placeholder="Search coordinators by name, email..."
                                                            value={coordinatorSearch}
                                                            onChange={(e) => setCoordinatorSearch(e.target.value)}
                                                            className="pl-10 h-10 border-input bg-background"
                                                        />
                                                    </div>
                                                    {errors.coordinators && <p className="text-xs text-destructive mt-1 font-medium">{errors.coordinators}</p>}
                                                </div>

                                                <ScrollArea className="h-60 border rounded-xl bg-card p-3">
                                                    <div className="space-y-1">
                                                        {filteredEmployees.length > 0 ? (
                                                            filteredEmployees.map((emp) => {
                                                                const isChecked = formData.coordinators.some((c) => c.id === emp.id);
                                                                return (
                                                                    <div
                                                                        key={emp.id}
                                                                        className={`flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors ${isChecked ? 'bg-accent/40' : ''}`}
                                                                        onClick={() => toggleCoordinator(emp)}
                                                                    >
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                        />
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-xs font-semibold text-primary">
                                                                                {emp.name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold truncate text-foreground">{emp.name}</p>
                                                                            <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                                No employees found
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>

                                            {formData.coordinators.length > 0 && (
                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-sm font-semibold">Selected Coordinators ({formData.coordinators.length})</Label>
                                                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                        {formData.coordinators.map((coordinator, index) => (
                                                            <div
                                                                key={coordinator.id}
                                                                className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-accent/30 transition-all duration-200"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-xs font-medium text-primary">
                                                                            {coordinator.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-xs text-foreground truncate">{coordinator.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground truncate">{coordinator.email}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeCoordinator(index)}
                                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>

                                {showWarningAlert && activeWarnings.length > 0 && (
                                    <div className="px-6 py-3 border-t bg-amber-50/50 dark:bg-amber-950/10 border-amber-200">
                                        <Alert className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <AlertDescription className="mt-2">
                                                <p className="font-semibold mb-1 text-sm">Scheduling Warnings:</p>
                                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                                    {activeWarnings.map((w, idx) => (
                                                        <li key={idx}>{w}</li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <Checkbox
                                                        id="ignore-warnings"
                                                        checked={ignoredWarnings}
                                                        onCheckedChange={(checked) => setIgnoredWarnings(!!checked)}
                                                    />
                                                    <Label htmlFor="ignore-warnings" className="text-xs font-medium cursor-pointer">
                                                        I understand the conflicts and want to proceed.
                                                    </Label>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {/* Navigation Footer */}
                                <div className="px-6 py-4 border-t bg-card flex items-center justify-between flex-shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            resetForm();
                                            onOpenChange(false);
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        {step > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleBack}
                                                disabled={isSubmitting}
                                                className="text-muted-foreground"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back
                                            </Button>
                                        )}

                                        {step < 3 ? (
                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                className="min-w-[100px]"
                                            >
                                                Next
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="min-w-[120px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create Batch
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Real-Time Summary Sidebar Panel */}
                        <div className="w-80 border-l bg-card/40 hidden lg:flex flex-col flex-shrink-0">
                            <div className="p-5 border-b bg-card">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Batch Summary</h3>
                            </div>
                            <ScrollArea className="flex-1 p-5">
                                <div className="space-y-6">
                                    {/* Selected Package */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tour Package</h4>
                                        {selectedPackage ? (
                                            <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                                <p className="font-bold text-foreground line-clamp-2">{selectedPackage.name}</p>
                                                {selectedPackage.destination && (
                                                    <p className="text-muted-foreground font-medium">Destination: {selectedPackage.destination}</p>
                                                )}
                                                {(selectedPackage.days || selectedPackage.nights) && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                                                        {selectedPackage.days ? `${selectedPackage.days}d` : ''}
                                                        {selectedPackage.days && selectedPackage.nights ? ' / ' : ''}
                                                        {selectedPackage.nights ? `${selectedPackage.nights}n` : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No package selected yet</p>
                                        )}
                                    </div>

                                    {/* Travel Dates */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule</h4>
                                        {formData.startDate || formData.endDate ? (
                                            <div className="p-3 rounded-xl border bg-background text-xs space-y-1">
                                                {formData.startDate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Starts:</span>
                                                        <span className="font-semibold text-foreground">
                                                            {!isNaN(new Date(formData.startDate).getTime()) ? format(new Date(formData.startDate), "MMM dd, yyyy") : formData.startDate}
                                                        </span>
                                                    </div>
                                                )}
                                                {formData.endDate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Ends:</span>
                                                        <span className="font-semibold text-foreground">
                                                            {!isNaN(new Date(formData.endDate).getTime()) ? format(new Date(formData.endDate), "MMM dd, yyyy") : formData.endDate}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No dates set yet</p>
                                        )}
                                    </div>

                                    {/* Capacity */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Capacity</h4>
                                        {formData.packageId ? (
                                            <div className="p-3 rounded-xl border bg-background text-xs space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Total Seats:</span>
                                                    <span className="font-bold text-foreground">
                                                        {changeSeats ? formData.totalSeats : (selectedPackage?.maxGuests || "Not defined")}
                                                    </span>
                                                </div>
                                                {changeSeats && (
                                                    <div className="space-y-1 border-t pt-1.5 mt-1">
                                                        <span className="text-[10px] font-bold text-amber-600 block uppercase">Custom Seat Reason</span>
                                                        <p className="text-[10px] text-muted-foreground leading-normal">{formData.seatChangeReason || "No reason entered yet"}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Select package to view capacity</p>
                                        )}
                                    </div>

                                    {/* Selected Coordinators */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coordinators ({formData.coordinators.length})</h4>
                                        {formData.coordinators.length > 0 ? (
                                            <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                                                {formData.coordinators.map((c) => (
                                                    <div key={c.id} className="p-2 border rounded-lg bg-background text-xs flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-primary">
                                                            {c.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-foreground truncate">{c.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No coordinators assigned yet</p>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
