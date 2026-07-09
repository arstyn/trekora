import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import BookingService from "@/services/booking.service";
import type { IBatches } from "@/types/batches.types";
import type {
    ICreateBookingRequest,
    ICustomer,
    IPackage,
    PaymentMethod,
} from "@/types/booking.types";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    ChevronRight,
    Loader2,
    Package as PackageIcon,
    Plus,
    Search,
    Upload,
    UserPlus,
    X
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookingCreated?: () => void;
}

export interface ICreateBookingFormData {
    packageId: string;
    packageTierId: string;
    batchId: string;
    numberOfCustomers: number;
    customers: ICustomer[];
    totalAmount: number;
    advanceAmount: number;
    paymentMethod: PaymentMethod | "";
    paymentReference: string;
    transactionId: string;
    paymentDate: string;
    paymentScreenshot: File | null;
    specialRequests: string;
    isCommonTier: boolean;
    customerSelections: Record<string, { tierId: string, ageCategory: 'adult' | 'child' | 'infant' }>;
}

export function CreateBookingDialog({
    open,
    onOpenChange,
    onBookingCreated,
}: CreateBookingDialogProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [packages, setPackages] = useState<IPackage[]>([]);
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
    const [packageSearch, setPackageSearch] = useState("");
    const [packagePopoverOpen, setPackagePopoverOpen] = useState(false);
    const [customerPagination, setCustomerPagination] = useState({
        offset: 0,
        limit: 10,
        hasMore: true,
        total: 0,
    });
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [formData, setFormData] = useState<ICreateBookingFormData>({
        packageId: "",
        packageTierId: "",
        batchId: "",
        numberOfCustomers: 0,
        customers: [],
        totalAmount: 0,
        advanceAmount: 0,
        paymentMethod: "",
        paymentReference: "",
        transactionId: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentScreenshot: null,
        specialRequests: "",
        isCommonTier: true,
        customerSelections: {},
    });

    const selectedPackage = packages.find((p) => p.id === formData.packageId);
    const selectedBatch = availableBatches.find((b) => b.id === formData.batchId);

    // Form validation per step
    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.packageId) newErrors.packageId = "Please select a tour package";
            if (!formData.batchId) newErrors.batchId = "Please select a batch";
        }

        if (currentStep === 2) {
            if (formData.customers.length === 0) {
                newErrors.customers = "Please select at least one customer";
            }
        }

        if (currentStep === 3) {
            if (formData.advanceAmount > 0 && !formData.paymentMethod) {
                newErrors.paymentMethod = "Please select a payment method for advance payment";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
            setError(null);
        } else {
            setError("Please fill in the required fields to proceed.");
        }
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
        setError(null);
    };

    // Load initial data when dialog opens
    useEffect(() => {
        if (open) {
            loadInitialData();
        }
    }, [open]);

    // Load packages and customers when dialog opens
    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [packagesData, customersData] = await Promise.all([
                BookingService.getPackages(),
                BookingService.getCustomers({ limit: 10, offset: 0 }),
            ]);
            setPackages(packagesData);
            setCustomers(customersData.customers);
            setCustomerPagination({
                offset: 10,
                limit: 10,
                hasMore: customersData.hasMore,
                total: customersData.total,
            });
        } catch (err) {
            console.error("Error loading initial data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoadingData(false);
        }
    };

    const searchCustomers = async (query: string, reset = true) => {
        if (query.length < 2) {
            if (reset) {
                await loadInitialCustomers();
            }
            return;
        }

        try {
            setLoadingCustomers(true);
            const results = await BookingService.searchCustomers(query, {
                limit: 10,
                offset: reset ? 0 : customerPagination.offset,
            });

            if (reset) {
                setCustomers(results.data);
                setCustomerPagination({
                    offset: 10,
                    limit: 10,
                    hasMore: results.hasMore,
                    total: results.total,
                });
            } else {
                setCustomers((prev) => [...prev, ...results.data]);
                setCustomerPagination((prev) => ({
                    ...prev,
                    offset: prev.offset + 10,
                    hasMore: results.hasMore,
                }));
            }
        } catch (err) {
            console.error("Error searching customers:", err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const loadInitialCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const results = await BookingService.getCustomers({
                limit: 10,
                offset: 0,
            });
            setCustomers(results.customers);
            setCustomerPagination({
                offset: 10,
                limit: 10,
                hasMore: results.hasMore,
                total: results.total,
            });
        } catch (err) {
            console.error("Error loading customers:", err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const loadMoreCustomers = async () => {
        if (loadingCustomers || !customerPagination.hasMore) return;

        try {
            setLoadingCustomers(true);
            const results = await BookingService.getCustomers({
                limit: 10,
                offset: customerPagination.offset,
                search: customerSearch || undefined,
            });

            setCustomers((prev) => [...prev, ...results.customers]);
            setCustomerPagination((prev) => ({
                ...prev,
                offset: prev.offset + 10,
                hasMore: results.hasMore,
            }));
        } catch (err) {
            console.error("Error loading more customers:", err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    // Load batches when package is selected
    useEffect(() => {
        if (formData.packageId) {
            loadAvailableBatches(formData.packageId);
        }
    }, [formData.packageId]);

    const loadAvailableBatches = async (packageId: string) => {
        try {
            const batches = await BookingService.getAvailableBatches(packageId);
            setAvailableBatches(batches);
        } catch (err) {
            console.error("Error loading batches:", err);
            setError("Failed to load available batches.");
        }
    };

    const calculateTotalAmount = (
        pkgId: string,
        commonTierId: string,
        isCommon: boolean,
        selections: Record<string, { tierId: string, ageCategory: 'adult' | 'child' | 'infant' }>,
        currentCustomers: ICustomer[]
    ) => {
        const pkg = packages.find((p) => p.id === pkgId);
        if (!pkg) return 0;

        let total = 0;

        currentCustomers.forEach(customer => {
            const selection = selections[customer.id] || { tierId: commonTierId, ageCategory: 'adult' };
            const effectiveTierId = isCommon ? commonTierId : selection.tierId;
            const ageCategory = selection.ageCategory || 'adult';

            if (pkg.packageTiers && effectiveTierId) {
                const tier = pkg.packageTiers.find((t) => t.id === effectiveTierId);
                if (tier) {
                    const totalAdultCost = Number(tier.totalAdultCost || 0);

                    if (ageCategory === 'adult') {
                        total += totalAdultCost;
                    } else if (ageCategory === 'child') {
                        if (tier.childCostType === 'percentage') {
                            total += totalAdultCost * (Number(tier.childCostValue || 0) / 100);
                        } else {
                            total += Number(tier.childCostValue || 0);
                        }
                    } else if (ageCategory === 'infant') {
                        if (tier.infantCostType === 'percentage') {
                            total += totalAdultCost * (Number(tier.infantCostValue || 0) / 100);
                        } else {
                            total += Number(tier.infantCostValue || 0);
                        }
                    }
                }
            }
        });

        return total;
    };

    const handleCustomerSelect = (customer: ICustomer) => {
        const isAlreadySelected = formData.customers.some(
            (c) => c.id === customer.id,
        );

        if (isAlreadySelected) {
            const newCount = formData.customers.length - 1;
            setFormData((prev) => {
                const newCustomers = prev.customers.filter((c) => c.id !== customer.id);
                const newSelections = { ...prev.customerSelections };
                delete newSelections[customer.id];
                return {
                    ...prev,
                    customers: newCustomers,
                    numberOfCustomers: newCount,
                    customerSelections: newSelections,
                    totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, newCustomers),
                };
            });
        } else {
            const newCount = formData.customers.length + 1;
            setFormData((prev) => {
                const pkg = packages.find(p => p.id === prev.packageId);
                const defaultTierId = prev.packageTierId || (pkg?.packageTiers && pkg.packageTiers.length > 0 ? (pkg.packageTiers[0].id || "") : "");
                const newSelections = {
                    ...prev.customerSelections,
                    [customer.id]: { tierId: defaultTierId, ageCategory: 'adult' as const }
                };
                const newCustomers = [...prev.customers, customer];
                return {
                    ...prev,
                    customers: newCustomers,
                    numberOfCustomers: newCount,
                    customerSelections: newSelections,
                    totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, newCustomers),
                };
            });
        }

        if (errors.customers) {
            setErrors((prev) => ({
                ...prev,
                customers: "",
            }));
        }
    };

    const removeCustomer = (index: number) => {
        const customerToRemove = formData.customers[index];
        const newCustomers = formData.customers.filter((_, i) => i !== index);
        const newCount = newCustomers.length;
        setFormData((prev) => {
            const newSelections = { ...prev.customerSelections };
            if (customerToRemove) {
                delete newSelections[customerToRemove.id];
            }
            return {
                ...prev,
                customers: newCustomers,
                numberOfCustomers: newCount,
                customerSelections: newSelections,
                totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, newCustomers),
            };
        });
    };

    const handlePackageSelect = (pkg: IPackage) => {
        const defaultTierId = pkg.packageTiers && pkg.packageTiers.length > 0 ? (pkg.packageTiers[0].id || "") : "";
        setFormData((prev) => {
            const newSelections = { ...prev.customerSelections };
            prev.customers.forEach(c => {
                if (!newSelections[c.id]) {
                    newSelections[c.id] = { tierId: defaultTierId, ageCategory: 'adult' };
                } else {
                    newSelections[c.id].tierId = defaultTierId;
                }
            });
            return {
                ...prev,
                packageId: pkg.id,
                packageTierId: defaultTierId,
                batchId: "",
                customerSelections: newSelections,
                totalAmount: calculateTotalAmount(pkg.id, defaultTierId, prev.isCommonTier, newSelections, prev.customers),
            };
        });

        if (errors.packageId) {
            setErrors((prev) => ({
                ...prev,
                packageId: "",
            }));
        }
    };

    const handleTierSelect = (tierId: string) => {
        setFormData((prev) => {
            const newSelections = { ...prev.customerSelections };
            prev.customers.forEach(c => {
                if (newSelections[c.id]) {
                    newSelections[c.id].tierId = tierId;
                }
            });
            return {
                ...prev,
                packageTierId: tierId,
                customerSelections: newSelections,
                totalAmount: calculateTotalAmount(prev.packageId, tierId, prev.isCommonTier, newSelections, prev.customers),
            };
        });
    };

    const filteredPackages = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(packageSearch.toLowerCase()),
    );

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "application/pdf",
            ];
            if (!allowedTypes.includes(file.type)) {
                setError("File must be an image (JPEG, PNG) or PDF");
                return;
            }

            setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(3)) {
            setError("Please fix payment validation errors.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const customerIds = formData.customers
                .map((c) => c.id)
                .filter((id) => id);

            const bookingData: ICreateBookingRequest = {
                customerId: formData.customers[0]?.id || "",
                packageId: formData.packageId,
                packageTierId: formData.packageTierId || undefined,
                batchId: formData.batchId,
                customerIds,
                totalAmount: formData.totalAmount,
                specialRequests: formData.specialRequests,
                isCommonTier: formData.isCommonTier,
                customerSelections: Object.entries(formData.customerSelections).map(([customerId, selection]) => ({
                    customerId,
                    tierId: selection.tierId,
                    ageCategory: selection.ageCategory
                })),
                initialPayment:
                    formData.advanceAmount > 0
                        ? {
                            amount: formData.advanceAmount,
                            paymentMethod:
                                formData.paymentMethod as PaymentMethod,
                            paymentReference: formData.paymentReference || undefined,
                            transactionId: formData.transactionId || undefined,
                            paymentDate: formData.paymentDate || undefined,
                            notes: "Initial payment",
                        }
                        : undefined,
            };

            const validation = BookingService.validateBookingData(bookingData);
            if (!validation.isValid) {
                setError(validation.errors.join(", "));
                return;
            }

            if (formData.paymentScreenshot) {
                const uploadResult = await BookingService.uploadFile(
                    formData.paymentScreenshot,
                );
                if (bookingData.initialPayment) {
                    bookingData.initialPayment.receiptFilePath = uploadResult.filePath;
                }
            }

            const createdBooking =
                await BookingService.createBooking(bookingData);
            toast.success("Booking created successfully", {
                description: `Booking ${BookingService.formatBookingNumber(
                    createdBooking.bookingNumber,
                )} has been created successfully.`,
            });

            resetForm();
            onOpenChange(false);

            if (onBookingCreated) {
                onBookingCreated();
            }
        } catch (err) {
            console.error("Error creating booking:", err);
            setError(
                (err as any)?.response?.data?.message ||
                "Failed to create booking. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            packageId: "",
            packageTierId: "",
            batchId: "",
            numberOfCustomers: 0,
            customers: [],
            totalAmount: 0,
            advanceAmount: 0,
            paymentMethod: "",
            paymentReference: "",
            transactionId: "",
            paymentDate: new Date().toISOString().split('T')[0],
            paymentScreenshot: null,
            specialRequests: "",
            isCommonTier: true,
            customerSelections: {},
        });
        setStep(1);
        setCustomerSearch("");
        setCustomerPopoverOpen(false);
        setCustomerPagination({
            offset: 0,
            limit: 10,
            hasMore: true,
            total: 0,
        });
        setLoadingCustomers(false);
        setError(null);
        setErrors({});
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
            <DialogContent className="sm:max-w-6xl w-[95vw] h-[85vh] overflow-hidden p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
                {/* Stepper Header */}
                <div className="pl-6 pr-12 py-4 border-b bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Plus className="h-5 w-5 text-primary" />
                            Create New Booking
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Follow the steps to configure traveler info, pricing, and initial payment.
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
                            <span className={`text-xs hidden sm:inline font-medium ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Travelers</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-1.5">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</span>
                            <span className={`text-xs hidden sm:inline font-medium ${step === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Payment</span>
                        </div>
                    </div>
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm">Loading packages and customers...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden min-h-0 p-0 m-0">
                        {/* Left Side: Step View */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-background">
                            {error && (
                                <div className="px-6 pt-4 flex-shrink-0">
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <ScrollArea className="flex-1 px-6 py-4">
                                <div className="max-w-3xl mx-auto space-y-6 pb-6">
                                    {/* STEP 1: PACKAGE & BATCH SELECTION */}
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">1. Select Tour Package</Label>
                                                <Popover open={packagePopoverOpen} onOpenChange={setPackagePopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between h-12 px-4 text-left font-normal border-input hover:bg-accent/50 transition-colors ${errors.packageId ? "border-destructive" : ""}`}
                                                        >
                                                            <span className="flex items-center gap-2.5 truncate">
                                                                <PackageIcon className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                                                                {selectedPackage ? (
                                                                    <span className="font-medium text-foreground truncate">{selectedPackage.name}</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">Choose a tour package...</span>
                                                                )}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[min(90vw,480px)] p-0" align="start">
                                                        <div className="p-3 border-b bg-card">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search packages..."
                                                                    value={packageSearch}
                                                                    onChange={(e) => setPackageSearch(e.target.value)}
                                                                    className="pl-9 h-9"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea className="h-64">
                                                            <div className="p-2 space-y-1">
                                                                {filteredPackages.length > 0 ? (
                                                                    filteredPackages.map((pkg) => (
                                                                        <div
                                                                            key={pkg.id}
                                                                            className={`flex items-center justify-between p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors ${formData.packageId === pkg.id ? 'bg-accent/80' : ''}`}
                                                                            onClick={() => {
                                                                                handlePackageSelect(pkg);
                                                                                setPackagePopoverOpen(false);
                                                                            }}
                                                                        >
                                                                            <div className="flex-1 min-w-0 pr-4">
                                                                                <p className="text-sm font-semibold truncate text-foreground">{pkg.name}</p>
                                                                                <p className="text-xs text-muted-foreground truncate">{pkg.description || 'No description available'}</p>
                                                                            </div>
                                                                            {formData.packageId === pkg.id && (
                                                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center py-6 text-sm text-muted-foreground">No packages found</div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.packageId && <p className="text-xs text-destructive mt-1 font-medium">{errors.packageId}</p>}
                                            </div>

                                            {selectedPackage && (
                                                <div className="space-y-4">
                                                    <Label className="text-sm font-semibold">2. Select Travel Batch</Label>
                                                    {availableBatches.length > 0 ? (
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {availableBatches.map((batch) => {
                                                                const availableSeats = batch.totalSeats - batch.bookedSeats;
                                                                const isSelected = formData.batchId === batch.id;
                                                                return (
                                                                    <div
                                                                        key={batch.id}
                                                                        className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between h-32 hover:border-primary/50 hover:shadow-sm ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card border-border"}`}
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, batchId: batch.id }));
                                                                            if (errors.batchId) setErrors(prev => ({ ...prev, batchId: "" }));
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="space-y-1">
                                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Travel Dates</p>
                                                                                <p className="text-sm font-bold text-foreground">
                                                                                    {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                </p>
                                                                                <p className="text-xs font-semibold text-muted-foreground">
                                                                                    to {new Date(batch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                </p>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-auto">
                                                                            <span className="text-xs font-medium text-muted-foreground">Seats Available</span>
                                                                            <Badge variant={availableSeats > 5 ? "secondary" : "destructive"} className="text-[10px] font-bold">
                                                                                {availableSeats} left
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 text-center">
                                                            <Calendar className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                                            <p className="text-sm font-semibold text-muted-foreground">No active batches available</p>
                                                            <p className="text-xs text-muted-foreground/80 mt-1">Please select another tour package.</p>
                                                        </div>
                                                    )}
                                                    {errors.batchId && <p className="text-xs text-destructive mt-1 font-medium">{errors.batchId}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 2: TRAVELERS & PRICING SELECTION */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">1. Select Customers</Label>
                                                <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full justify-between h-12 px-4 text-left font-normal border-input hover:bg-accent/50 transition-colors ${errors.customers ? "border-destructive" : ""}`}
                                                        >
                                                            <span className="flex items-center gap-2.5 truncate">
                                                                <UserPlus className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                                                                {formData.customers.length > 0 ? (
                                                                    <span className="font-semibold text-foreground">{formData.customers.length} customer{formData.customers.length > 1 ? "s" : ""} selected</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">Search and select travelers...</span>
                                                                )}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[min(90vw,480px)] p-0" align="start">
                                                        <div className="p-3 border-b bg-card">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search customers..."
                                                                    value={customerSearch}
                                                                    onChange={(e) => {
                                                                        setCustomerSearch(e.target.value);
                                                                        searchCustomers(e.target.value);
                                                                    }}
                                                                    className="pl-9 h-9"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea
                                                            className="h-64"
                                                            onScrollCapture={(e) => {
                                                                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                                                if (scrollHeight - scrollTop <= clientHeight + 10) {
                                                                    loadMoreCustomers();
                                                                }
                                                            }}
                                                        >
                                                            <div className="p-2 space-y-1">
                                                                {customers.length > 0 ? (
                                                                    customers.map((c) => (
                                                                        <div
                                                                            key={c.id}
                                                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                                                            onClick={() => handleCustomerSelect(c)}
                                                                        >
                                                                            <Checkbox
                                                                                checked={formData.customers.some((x) => x.id === c.id)}
                                                                                onCheckedChange={() => handleCustomerSelect(c)}
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-semibold truncate text-foreground">{c.firstName} {c.lastName}</p>
                                                                                <p className="text-xs text-muted-foreground truncate">{c.email} • {c.phone}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center py-6 text-sm text-muted-foreground">
                                                                        {loadingCustomers ? "Loading customers..." : "No customers found"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.customers && <p className="text-xs text-destructive mt-1 font-medium">{errors.customers}</p>}
                                            </div>

                                            {formData.customers.length > 0 && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between border-b pb-2">
                                                        <h4 className="text-sm font-semibold text-foreground">2. Traveler Pricing & Configurations</h4>
                                                        {selectedPackage?.packageTiers && selectedPackage.packageTiers.length > 0 && (
                                                            <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border">
                                                                <Label htmlFor="common-tier-mode" className="text-xs font-semibold cursor-pointer text-muted-foreground">Use same tier for all</Label>
                                                                <Switch
                                                                    id="common-tier-mode"
                                                                    checked={formData.isCommonTier}
                                                                    onCheckedChange={(checked) => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            isCommonTier: checked,
                                                                            totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, checked, prev.customerSelections, prev.customers)
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {formData.isCommonTier && selectedPackage?.packageTiers && selectedPackage.packageTiers.length > 0 && (
                                                        <div className="p-4 bg-muted/30 border rounded-xl space-y-2">
                                                            <Label className="text-xs font-bold text-muted-foreground">Common Package Tier</Label>
                                                            <Select
                                                                value={formData.packageTierId}
                                                                onValueChange={handleTierSelect}
                                                            >
                                                                <SelectTrigger className="h-10 bg-background">
                                                                    <SelectValue placeholder="Select common tier" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {selectedPackage.packageTiers.map(tier => {
                                                                        const totalAdultCost = Number(tier.totalAdultCost || 0);

                                                                        const childCost = tier.childCostType === 'percentage'
                                                                            ? totalAdultCost * (Number(tier.childCostValue || 0) / 100)
                                                                            : Number(tier.childCostValue || 0);

                                                                        const infantCost = tier.infantCostType === 'percentage'
                                                                            ? totalAdultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                            : Number(tier.infantCostValue || 0);

                                                                        return (
                                                                            <SelectItem key={tier.id} value={tier.id!}>
                                                                                {tier.name} — A: {BookingService.formatCurrency(totalAdultCost)} | C: {BookingService.formatCurrency(childCost)} | I: {BookingService.formatCurrency(infantCost)}
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                                                        {formData.customers.map((c, index) => {
                                                            const selection = formData.customerSelections[c.id] || { tierId: formData.packageTierId, ageCategory: 'adult' };
                                                            return (
                                                                <div key={c.id} className="flex items-center justify-between p-3 bg-card border rounded-xl hover:shadow-xs transition-shadow">
                                                                    <div className="flex-1 min-w-0 pr-4">
                                                                        <p className="text-sm font-semibold truncate text-foreground">{c.firstName} {c.lastName}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!formData.isCommonTier && selectedPackage?.packageTiers && (
                                                                            <Select
                                                                                value={selection.tierId}
                                                                                onValueChange={(val) => {
                                                                                    setFormData(prev => {
                                                                                        const newSelections = { ...prev.customerSelections, [c.id]: { ...selection, tierId: val } };
                                                                                        return {
                                                                                            ...prev,
                                                                                            customerSelections: newSelections,
                                                                                            totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, prev.customers)
                                                                                        }
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-40 h-9 text-xs bg-background">
                                                                                    <SelectValue placeholder="Tier" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {selectedPackage.packageTiers.map(tier => {
                                                                                        const totalAdultCost = Number(tier.totalAdultCost || 0);

                                                                                        const childCost = tier.childCostType === 'percentage'
                                                                                            ? totalAdultCost * (Number(tier.childCostValue || 0) / 100)
                                                                                            : Number(tier.childCostValue || 0);

                                                                                        const infantCost = tier.infantCostType === 'percentage'
                                                                                            ? totalAdultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                                            : Number(tier.infantCostValue || 0);

                                                                                        return (
                                                                                            <SelectItem key={tier.id} value={tier.id!}>
                                                                                                {tier.name} — A: {BookingService.formatCurrency(totalAdultCost)} | C: {BookingService.formatCurrency(childCost)} | I: {BookingService.formatCurrency(infantCost)}
                                                                                            </SelectItem>
                                                                                        );
                                                                                    })}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                        <Select
                                                                            value={selection.ageCategory}
                                                                            onValueChange={(val: 'adult' | 'child' | 'infant') => {
                                                                                setFormData(prev => {
                                                                                    const newSelections = { ...prev.customerSelections, [c.id]: { ...selection, ageCategory: val } };
                                                                                    return {
                                                                                        ...prev,
                                                                                        customerSelections: newSelections,
                                                                                        totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, prev.customers)
                                                                                    }
                                                                                });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-24 h-9 text-xs bg-background">
                                                                                <SelectValue placeholder="Age" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="adult">Adult</SelectItem>
                                                                                <SelectItem value="child">Child</SelectItem>
                                                                                <SelectItem value="infant">Infant</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                            onClick={() => removeCustomer(index)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 3: PAYMENTS & NOTES */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/15 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-foreground">Total Booking Cost</h4>
                                                    <p className="text-[11px] text-muted-foreground">Calculated based on selected traveler tiers and age categories</p>
                                                </div>
                                                <div className="text-2xl font-extrabold text-primary">
                                                    {BookingService.formatCurrency(formData.totalAmount)}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="advanceAmount" className="text-sm font-semibold">Advance Payment Made</Label>
                                                <Input
                                                    id="advanceAmount"
                                                    type="number"
                                                    min="0"
                                                    max={formData.totalAmount}
                                                    value={formData.advanceAmount || ""}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            advanceAmount: Number.parseInt(e.target.value) || 0,
                                                        }))
                                                    }
                                                    placeholder="Enter amount paid..."
                                                    className="h-10"
                                                />
                                            </div>

                                            {formData.advanceAmount > 0 && (
                                                <Card className="border border-muted/80 bg-muted/10 shadow-none">
                                                    <CardContent className="p-4 space-y-4">
                                                        <div className="grid sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="paymentMethod" className="text-xs font-bold text-muted-foreground">Payment Method *</Label>
                                                                <Select
                                                                    value={formData.paymentMethod}
                                                                    onValueChange={(value) =>
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            paymentMethod: value as PaymentMethod,
                                                                        }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-10 bg-background">
                                                                        <SelectValue placeholder="Select method" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                                                        <SelectItem value="cash">Cash</SelectItem>
                                                                        <SelectItem value="upi">UPI</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.paymentMethod && <p className="text-xs text-destructive font-medium">{errors.paymentMethod}</p>}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="paymentReference" className="text-xs font-bold text-muted-foreground">Payment Reference</Label>
                                                                <Input
                                                                    id="paymentReference"
                                                                    value={formData.paymentReference}
                                                                    onChange={(e) =>
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            paymentReference: e.target.value,
                                                                        }))
                                                                    }
                                                                    placeholder="Check #, transfer notes, etc."
                                                                    className="h-10 bg-background"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="transactionId" className="text-xs font-bold text-muted-foreground">Transaction ID / UTR</Label>
                                                                <Input
                                                                    id="transactionId"
                                                                    value={formData.transactionId}
                                                                    onChange={(e) =>
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            transactionId: e.target.value,
                                                                        }))
                                                                    }
                                                                    placeholder="UTR number, transaction reference"
                                                                    className="h-10 bg-background"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="paymentDate" className="text-xs font-bold text-muted-foreground">Payment Date</Label>
                                                                <Input
                                                                    id="paymentDate"
                                                                    type="date"
                                                                    value={formData.paymentDate}
                                                                    onChange={(e) =>
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            paymentDate: e.target.value,
                                                                        }))
                                                                    }
                                                                    className="h-10 bg-background"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-muted-foreground">Upload Receipt / Screenshot</Label>
                                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-all bg-background">
                                                                <div className="text-center p-3">
                                                                    <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground/80" />
                                                                    <p className="text-xs font-medium text-muted-foreground">
                                                                        {formData.paymentScreenshot ? (
                                                                            <span className="text-primary font-semibold truncate max-w-[200px] inline-block">{formData.paymentScreenshot.name}</span>
                                                                        ) : (
                                                                            "Drop image or pdf (Max 5MB)"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*,.pdf"
                                                                    onChange={handleFileUpload}
                                                                />
                                                            </label>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="specialRequests" className="text-sm font-semibold">Special Requests / Notes</Label>
                                                <Textarea
                                                    id="specialRequests"
                                                    value={formData.specialRequests}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            specialRequests: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter any medical requests, room preferences, food preferences, etc."
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Navigation Footer */}
                            <div className="px-6 py-4 border-t bg-card flex items-center justify-between flex-shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        onOpenChange(false);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <div className="flex items-center gap-3">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleBack}
                                            disabled={loading}
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
                                            disabled={loading}
                                            className="min-w-[120px]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Submit Booking
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Real-Time Summary Sidebar Panel */}
                        <div className="w-80 border-l bg-card/40 hidden lg:flex flex-col flex-shrink-0">
                            <div className="p-5 border-b bg-card">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Booking Summary</h3>
                            </div>
                            <ScrollArea className="flex-1 p-5">
                                <div className="space-y-6">
                                    {/* Selected Package */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Tour Package</h4>
                                        {selectedPackage ? (
                                            <div className="space-y-1.5 p-3 rounded-xl border bg-background">
                                                <p className="text-sm font-semibold text-foreground line-clamp-2">{selectedPackage.name}</p>
                                                {selectedPackage.duration && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {selectedPackage.duration} Days
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No package selected yet</p>
                                        )}
                                    </div>

                                    {/* Selected Batch */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Travel Dates</h4>
                                        {selectedBatch ? (
                                            <div className="space-y-1 p-3 rounded-xl border bg-background">
                                                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                    <span>
                                                        {new Date(selectedBatch.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(selectedBatch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No batch selected yet</p>
                                        )}
                                    </div>

                                    {/* Selected Customers */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Travelers ({formData.customers.length})</h4>
                                        {formData.customers.length > 0 ? (
                                            <div className="space-y-2 max-h-[16vh] overflow-y-auto pr-1">
                                                {formData.customers.map((c) => {
                                                    const selection = formData.customerSelections[c.id];
                                                    const tier = selectedPackage?.packageTiers?.find(t => t.id === (formData.isCommonTier ? formData.packageTierId : selection?.tierId));
                                                    return (
                                                        <div key={c.id} className="p-2 border rounded-lg bg-background text-xs space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-foreground truncate max-w-[120px]">{c.firstName} {c.lastName}</span>
                                                                <span className="capitalize font-medium text-muted-foreground text-[10px] bg-muted px-1.5 py-0.5 rounded">{selection?.ageCategory || 'Adult'}</span>
                                                            </div>
                                                            {tier && (
                                                                <p className="text-[10px] text-muted-foreground truncate">{tier.name}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No travelers selected yet</p>
                                        )}
                                    </div>

                                    {/* Pricing Summary */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Pricing Breakdown</h4>
                                        <div className="space-y-2 p-3 rounded-xl border bg-background">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Total Price:</span>
                                                <span className="font-semibold text-foreground">{BookingService.formatCurrency(formData.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Paid Advance:</span>
                                                <span className="font-semibold text-foreground">{BookingService.formatCurrency(formData.advanceAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs border-t pt-2 font-bold text-foreground">
                                                <span>Remaining Balance:</span>
                                                <span className="text-primary">{BookingService.formatCurrency(Math.max(0, formData.totalAmount - formData.advanceAmount))}</span>
                                            </div>
                                        </div>
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
