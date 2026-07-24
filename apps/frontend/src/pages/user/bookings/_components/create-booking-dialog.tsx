import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { FileUploader } from "@/components/file-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    X,
    User,
    PersonStanding,
    Baby
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
    paymentStructureId: string;
    isPaymentOverridden: boolean;
    paymentOverrideReason: string;
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
    const [packageSearch, setPackageSearch] = useState("");
    const [packagePage, setPackagePage] = useState(1);
    const [customerPagination, setCustomerPagination] = useState({
        offset: 0,
        limit: 10,
        hasMore: true,
        total: 0,
    });
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [passportOverrides, setPassportOverrides] = useState<Record<string, boolean>>({});

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
        paymentStructureId: "",
        isPaymentOverridden: false,
        paymentOverrideReason: "",
    });

    const selectedPackage = packages.find((p) => p.id === formData.packageId);
    const paymentStructure = selectedPackage?.paymentStructure || [];
    const selectedBatch = availableBatches.find((b) => b.id === formData.batchId);

    const checkPassportStatus = (customer: ICustomer) => {
        if (!selectedPackage || selectedPackage.packageLocation?.type !== 'international') {
            return { hasWarning: false, isMissingDetails: false, isExpirySoon: false };
        }

        const isMissingDetails = !customer.passportNumber?.trim() || !customer.passportExpiryDate;

        let isExpirySoon = false;
        if (!isMissingDetails && customer.passportExpiryDate && selectedBatch?.startDate) {
            const batchDate = new Date(selectedBatch.startDate);
            const expiryDate = new Date(customer.passportExpiryDate);
            const sixMonthsAfterBatch = new Date(batchDate);
            sixMonthsAfterBatch.setMonth(sixMonthsAfterBatch.getMonth() + 6);
            isExpirySoon = expiryDate < sixMonthsAfterBatch;
        }

        return {
            hasWarning: isMissingDetails || isExpirySoon,
            isMissingDetails,
            isExpirySoon,
        };
    };
    const syncCustomerDetails = async (customerId: string) => {
        try {
            const response = await BookingService.getCustomerById(customerId);
            if (response) {
                setFormData(prev => {
                    const newCustomers = prev.customers.map(c => c.id === customerId ? response : c);
                    return {
                        ...prev,
                        customers: newCustomers
                    };
                });
                toast.success("Traveler details synced successfully");
            }
        } catch (error) {
            console.error("Failed to sync customer details:", error);
            toast.error("Failed to sync traveler details");
        }
    };
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
            } else if (selectedPackage?.packageLocation?.type === 'international') {
                const pendingWarnings = formData.customers.some(c => {
                    const status = checkPassportStatus(c);
                    return status.hasWarning && !passportOverrides[c.id];
                });
                if (pendingWarnings) {
                    newErrors.passport = "Please resolve or override all traveler passport warnings before proceeding.";
                }
            }
        }

        if (currentStep === 3) {
            if (formData.advanceAmount > 0 && !formData.paymentMethod) {
                newErrors.paymentMethod = "Please select a payment method for advance payment";
            }
            if (formData.isPaymentOverridden && !formData.paymentOverrideReason.trim()) {
                newErrors.paymentOverrideReason = "Please provide a reason for overriding the payment amount";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
            setError(null);
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

    // Sync default milestone and advance amount when selected package or total amount changes
    useEffect(() => {
        if (!selectedPackage) return;
        const paymentStructure = selectedPackage.paymentStructure || [];
        if (paymentStructure.length === 0) return;

        setFormData((prev) => {
            // If payment structure is overridden, don't change anything
            if (prev.isPaymentOverridden) return prev;

            // Find current active milestone or default to the first one (order = 1)
            let activeMilestone = paymentStructure.find(m => m.id === prev.paymentStructureId);
            if (!activeMilestone) {
                // Default to the first one (order = 1)
                activeMilestone = paymentStructure[0];
            }

            // Calculate cumulative percent up to this milestone
            const milestoneIdx = paymentStructure.findIndex(m => m.id === activeMilestone.id);
            const cumulativePercent = paymentStructure
                .slice(0, milestoneIdx + 1)
                .reduce((sum, m) => sum + Number(m.amount || 0), 0);

            const newAdvanceAmount = Math.round((prev.totalAmount * cumulativePercent) / 100);

            // Only update state if values actually changed to avoid infinite loop
            if (prev.paymentStructureId === activeMilestone.id && prev.advanceAmount === newAdvanceAmount) {
                return prev;
            }

            return {
                ...prev,
                paymentStructureId: activeMilestone.id || "",
                advanceAmount: newAdvanceAmount,
            };
        });
    }, [selectedPackage, formData.totalAmount, formData.isPaymentOverridden]);

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
                    const adultCost = Number(tier.adultCost || 0);

                    if (ageCategory === 'adult') {
                        total += adultCost;
                    } else if (ageCategory === 'child') {
                        if (tier.childCostType === 'percentage') {
                            total += adultCost * (Number(tier.childCostValue || 0) / 100);
                        } else {
                            total += Number(tier.childCostValue || 0);
                        }
                    } else if (ageCategory === 'infant') {
                        if (tier.infantCostType === 'percentage') {
                            total += adultCost * (Number(tier.infantCostValue || 0) / 100);
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

        setError(null);
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

        setError(null);
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
        pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
        pkg.destination?.toLowerCase().includes(packageSearch.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(packageSearch.toLowerCase())
    );

    const packageLimit = 3;
    const totalPackagePages = Math.ceil(filteredPackages.length / packageLimit) || 1;
    const currentPackagePage = Math.min(packagePage, totalPackagePages);
    const paginatedPackages = filteredPackages.slice(
        (currentPackagePage - 1) * packageLimit,
        currentPackagePage * packageLimit
    );

    const handleFileUpload = (files: File[]) => {
        const file = files[0];
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
            setError(null);
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
                paymentStructureId: formData.paymentStructureId || undefined,
                isPaymentOverridden: formData.isPaymentOverridden,
                paymentOverrideReason: formData.paymentOverrideReason || undefined,
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
            paymentStructureId: "",
            isPaymentOverridden: false,
            paymentOverrideReason: "",
        });
        setStep(1);
        setCustomerSearch("");
        setCustomerPagination({
            offset: 0,
            limit: 10,
            hasMore: true,
            total: 0,
        });
        setLoadingCustomers(false);
        setPassportOverrides({});
        setError(null);
        setErrors({});
        setPackageSearch("");
        setPackagePage(1);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
            <DialogContent className="responsive-dialog sm:max-w-6xl w-[95vw] h-[85vh] max-lg:h-auto max-lg:max-h-[90vh] overflow-hidden max-lg:overflow-y-auto p-0 flex gap-0 flex-col rounded-xl border bg-background shadow-2xl">
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
                    <div className="responsive-layout flex-1 flex overflow-hidden max-lg:overflow-visible min-h-0 p-0 m-0">
                        {/* Left Side: Step View */}
                        <div className="responsive-left flex-1 flex flex-col overflow-hidden max-lg:overflow-visible min-h-0 bg-background">
                            {error && (
                                <div className="px-6 pt-4 flex-shrink-0">
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <div className="responsive-scroll flex-1 overflow-y-auto px-6 py-4 max-lg:h-auto max-lg:overflow-visible">
                                {/* STEP 1: PACKAGE & BATCH SELECTION */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        {!formData.packageId ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="packageSearch" className="text-sm font-semibold">1. Search and Select Tour Package</Label>
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
                                                        <p className="text-xs text-destructive font-medium">
                                                            {errors.packageId}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Packages list */}
                                                {paginatedPackages.length > 0 ? (
                                                    <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                                                        {paginatedPackages.map((pkg) => {
                                                            const isSelected = formData.packageId === pkg.id;
                                                            const thumbnailSrc = pkg.thumbnail || "/placeholder.svg";
                                                            return (
                                                                <div
                                                                    key={pkg.id}
                                                                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 flex gap-4 items-center hover:border-primary/50 hover:shadow-xs ${isSelected
                                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                        : "bg-card border-border"
                                                                        }`}
                                                                    onClick={() => handlePackageSelect(pkg)}
                                                                >
                                                                    {/* Package Thumbnail Image */}
                                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                                                        {pkg.thumbnail ? (
                                                                            <img
                                                                                src={thumbnailSrc}
                                                                                alt={pkg.name}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <PackageIcon className="h-6 w-6 text-muted-foreground/60" />
                                                                        )}
                                                                    </div>
                                                                    {/* Package Details */}
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
                                                                    {/* Selected Indicator */}
                                                                    {isSelected && (
                                                                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2">
                                                                            <Check className="h-3 w-3 text-primary-foreground" />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Pagination Controls */}
                                                        {totalPackagePages > 1 && (
                                                            <div className="flex justify-between items-center mt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setPackagePage((p) => Math.max(p - 1, 1))}
                                                                    disabled={currentPackagePage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <span className="text-sm text-muted-foreground">Page {currentPackagePage} of {totalPackagePages}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
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
                                                        <PackageIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                                        <p className="text-sm font-semibold text-muted-foreground">No tour packages found</p>
                                                        <p className="text-xs text-muted-foreground/80 mt-1">
                                                            {packageSearch ? `No packages matched "${packageSearch}".` : "No packages available."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">1. Selected Tour Package</h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFormData((prev) => ({ ...prev, packageId: "", batchId: "" }));
                                                        }}
                                                        className="text-xs h-8 border-dashed hover:border-destructive hover:text-destructive"
                                                    >
                                                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                                        Change Package
                                                    </Button>
                                                </div>

                                                <Card className="border border-muted/80 bg-muted/10 shadow-none">
                                                    <CardContent className="p-4 flex gap-4 items-center text-xs">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                                            {selectedPackage?.thumbnail ? (
                                                                <img
                                                                    src={selectedPackage.thumbnail}
                                                                    alt={selectedPackage.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <PackageIcon className="h-6 w-6 text-muted-foreground/60" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-sm text-foreground">{selectedPackage?.name}</p>
                                                            {selectedPackage?.destination && (
                                                                <p className="text-xs text-muted-foreground font-medium">Destination: {selectedPackage.destination}</p>
                                                            )}
                                                            {selectedPackage?.duration && (
                                                                <p className="text-xs text-muted-foreground font-medium">Duration: {selectedPackage.duration} Days</p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="space-y-4 pt-2">
                                                    <Label className="text-sm font-semibold">2. Select Travel Batch</Label>
                                                    {availableBatches.length > 0 ? (
                                                        <div className="grid gap-3 grid-cols-1">
                                                            {availableBatches.map((batch) => {
                                                                const availableSeats = batch.totalSeats - batch.bookedSeats;
                                                                const isSelected = formData.batchId === batch.id;
                                                                return (
                                                                    <div
                                                                        key={batch.id}
                                                                        className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between hover:border-primary/50 hover:shadow-xs ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card border-border"}`}
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, batchId: batch.id }));
                                                                            setError(null);
                                                                            if (errors.batchId) setErrors(prev => ({ ...prev, batchId: "" }));
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Calendar className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                                                                            <div className="space-y-0.5">
                                                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Travel Dates</p>
                                                                                <p className="text-sm font-bold text-foreground">
                                                                                    {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                    <span className="text-xs font-semibold text-muted-foreground mx-1.5">to</span>
                                                                                    {new Date(batch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="text-right">
                                                                                <p className="text-[10px] font-medium text-muted-foreground">Seats Available</p>
                                                                                <Badge variant={availableSeats > 5 ? "secondary" : "destructive"} className="text-[10px] font-bold mt-0.5">
                                                                                    {availableSeats} left
                                                                                </Badge>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                                                </span>
                                                                            )}
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
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: TRAVELERS & PRICING SELECTION */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customerSearch" className="text-sm font-semibold">1. Search and Select Travelers</Label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="customerSearch"
                                                        placeholder="Search travelers by name, email, or phone..."
                                                        value={customerSearch}
                                                        onChange={(e) => {
                                                            setCustomerSearch(e.target.value);
                                                            searchCustomers(e.target.value);
                                                        }}
                                                        className="pl-10 h-10 border-input bg-background"
                                                    />
                                                </div>
                                                {errors.customers && <p className="text-xs text-destructive mt-1 font-medium">{errors.customers}</p>}
                                                {errors.passport && (
                                                    <Alert variant="destructive" className="mt-2 py-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>{errors.passport}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            <ScrollArea
                                                className="h-60 border rounded-xl bg-card p-3"
                                                onScrollCapture={(e) => {
                                                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                                    if (scrollHeight - scrollTop <= clientHeight + 10) {
                                                        loadMoreCustomers();
                                                    }
                                                }}
                                            >
                                                <div className="space-y-1">
                                                    {customers.length > 0 ? (
                                                        customers.map((c) => {
                                                            const isChecked = formData.customers.some((x) => x.id === c.id);
                                                            return (
                                                                <div
                                                                    key={c.id}
                                                                    className={`flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors ${isChecked ? 'bg-accent/40' : ''}`}
                                                                    onClick={() => handleCustomerSelect(c)}
                                                                >
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={() => handleCustomerSelect(c)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <Avatar className="h-9 w-9">
                                                                        <AvatarImage src={c.profilePhoto} alt={`${c.firstName} ${c.lastName}`} />
                                                                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                                                            {c.firstName[0]}{c.lastName?.[0] || ''}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold truncate text-foreground">{c.firstName} {c.lastName}</p>
                                                                        {(c.email || c.phone) ? (
                                                                            <p className="text-xs text-muted-foreground truncate">
                                                                                {c.email}
                                                                                {c.email && c.phone ? " • " : ""}
                                                                                {c.phone}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center py-8 text-sm text-muted-foreground">
                                                            {loadingCustomers ? "Loading customers..." : "No customers found"}
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>

                                        {formData.customers.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">2. Traveler Pricing & Configurations</h4>
                                                    {selectedPackage?.packageTiers && selectedPackage.packageTiers.length > 1 && (
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
                                                        <Label className="text-xs font-bold text-muted-foreground">Package Price Tier</Label>
                                                        {selectedPackage.packageTiers.length === 1 ? (
                                                            (() => {
                                                                const tier = selectedPackage.packageTiers[0];
                                                                const adultCost = Number(tier.adultCost || 0);
                                                                const childCost = tier.childCostType === 'percentage'
                                                                    ? adultCost * (Number(tier.childCostValue || 0) / 100)
                                                                    : Number(tier.childCostValue || 0);
                                                                const infantCost = tier.infantCostType === 'percentage'
                                                                    ? adultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                    : Number(tier.infantCostValue || 0);
                                                                return (
                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-background border rounded-xl gap-3">
                                                                        <span className="font-semibold text-sm text-foreground">{tier.name}</span>
                                                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                                            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-slate-500" /> {BookingService.formatCurrency(adultCost)}</span>
                                                                            <span className="flex items-center gap-1.5"><PersonStanding className="w-4 h-4 text-slate-500" /> {BookingService.formatCurrency(childCost)}</span>
                                                                            <span className="flex items-center gap-1.5"><Baby className="w-4 h-4 text-slate-500" /> {BookingService.formatCurrency(infantCost)}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()
                                                        ) : (
                                                            <Select
                                                                value={formData.packageTierId}
                                                                onValueChange={handleTierSelect}
                                                            >
                                                                <SelectTrigger className="h-10 bg-background">
                                                                    <SelectValue placeholder="Select common tier" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {selectedPackage.packageTiers.map(tier => {
                                                                        const adultCost = Number(tier.adultCost || 0);

                                                                        const childCost = tier.childCostType === 'percentage'
                                                                            ? adultCost * (Number(tier.childCostValue || 0) / 100)
                                                                            : Number(tier.childCostValue || 0);

                                                                        const infantCost = tier.infantCostType === 'percentage'
                                                                            ? adultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                            : Number(tier.infantCostValue || 0);

                                                                        return (
                                                                            <SelectItem key={tier.id} value={tier.id!}>
                                                                                <span className="flex items-center gap-3">
                                                                                    <span className="font-semibold">{tier.name}</span>
                                                                                    <span className="text-muted-foreground">|</span>
                                                                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {BookingService.formatCurrency(adultCost)}</span>
                                                                                    <span className="flex items-center gap-1"><PersonStanding className="w-3.5 h-3.5" /> {BookingService.formatCurrency(childCost)}</span>
                                                                                    <span className="flex items-center gap-1"><Baby className="w-3.5 h-3.5" /> {BookingService.formatCurrency(infantCost)}</span>
                                                                                </span>
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {formData.customers.map((c, index) => {
                                                        const selection = formData.customerSelections[c.id] || { tierId: formData.packageTierId, ageCategory: 'adult' };
                                                        return (
                                                            <div key={c.id} className="flex flex-col p-3 bg-card border rounded-xl hover:shadow-xs transition-shadow gap-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={c.profilePhoto} alt={`${c.firstName} ${c.lastName}`} />
                                                                            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                                                                                {c.firstName[0]}{c.lastName?.[0] || ''}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold truncate text-foreground">{c.firstName} {c.lastName}</p>
                                                                            {(c.email || c.phone) ? (
                                                                                <p className="text-xs text-muted-foreground truncate">
                                                                                    {c.email}
                                                                                    {c.email && c.phone ? " • " : ""}
                                                                                    {c.phone}
                                                                                </p>
                                                                            ) : null}
                                                                        </div>
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
                                                                                        const adultCost = Number(tier.adultCost || 0);

                                                                                        const childCost = tier.childCostType === 'percentage'
                                                                                            ? adultCost * (Number(tier.childCostValue || 0) / 100)
                                                                                            : Number(tier.childCostValue || 0);

                                                                                        const infantCost = tier.infantCostType === 'percentage'
                                                                                            ? adultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                                            : Number(tier.infantCostValue || 0);

                                                                                        return (
                                                                                            <SelectItem key={tier.id} value={tier.id!}>
                                                                                                <span className="flex items-center gap-2">
                                                                                                    <span className="font-semibold">{tier.name}</span>
                                                                                                    <span className="text-muted-foreground">|</span>
                                                                                                    <span className="flex items-center gap-0.5"><User className="w-3 h-3 text-slate-500" /> {BookingService.formatCurrency(adultCost)}</span>
                                                                                                    <span className="flex items-center gap-0.5"><PersonStanding className="w-3 h-3 text-slate-500" /> {BookingService.formatCurrency(childCost)}</span>
                                                                                                    <span className="flex items-center gap-0.5"><Baby className="w-3 h-3 text-slate-500" /> {BookingService.formatCurrency(infantCost)}</span>
                                                                                                </span>
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
                                                                {selectedPackage?.packageLocation?.type === 'international' && (() => {
                                                                    const status = checkPassportStatus(c);
                                                                    if (!status.hasWarning) return null;

                                                                    const isOverridden = !!passportOverrides[c.id];

                                                                    return (
                                                                        <div className={`p-2.5 rounded-lg border text-xs space-y-2 ${isOverridden ? 'bg-muted/50 border-muted' : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'}`}>
                                                                            <div className="flex items-start gap-2">
                                                                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                                <div className="flex-1">
                                                                                    {status.isMissingDetails ? (
                                                                                        <p className="font-medium">Missing passport details (passport number/expiry date not updated in customer profile).</p>
                                                                                    ) : (
                                                                                        <p className="font-medium">
                                                                                            Passport expires within 6 months of batch start date (Expires: {c.passportExpiryDate ? new Date(c.passportExpiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}).
                                                                                        </p>
                                                                                    )}
                                                                                    <div className="mt-2 flex items-center gap-3">
                                                                                        <a
                                                                                            href={`/customers/${c.id}?edit=true`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                                                                                        >
                                                                                            Edit Customer Profile ↗
                                                                                        </a>
                                                                                        <span className="text-muted-foreground/30">•</span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => syncCustomerDetails(c.id)}
                                                                                            className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                                                                                        >
                                                                                            Sync Details ↻
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/10">
                                                                                <Checkbox
                                                                                    id={`override-passport-${c.id}`}
                                                                                    checked={isOverridden}
                                                                                    onCheckedChange={(checked) => {
                                                                                        setPassportOverrides(prev => ({
                                                                                            ...prev,
                                                                                            [c.id]: !!checked
                                                                                        }));
                                                                                        if (errors.passport) {
                                                                                            setErrors(prev => ({ ...prev, passport: "" }));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <Label htmlFor={`override-passport-${c.id}`} className="text-[11px] font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                                                                                    Acknowledge and override this warning
                                                                                </Label>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
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
                                    <div className="space-y-6">
                                        {/* Summary & Breakdown Card */}
                                        <div className="rounded-xl border border-primary/10 bg-primary/[0.02] overflow-hidden">
                                            <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-foreground">Total Booking Cost</h4>
                                                    <p className="text-[11px] text-muted-foreground">Calculated based on selected traveler tiers and age categories</p>
                                                </div>
                                                <div className="text-2xl font-extrabold text-primary">
                                                    {BookingService.formatCurrency(formData.totalAmount)}
                                                </div>
                                            </div>

                                            {/* Pricing Breakdown inside the same card */}
                                            {selectedPackage && formData.customers.length > 0 && (
                                                <div className="p-4 bg-card space-y-3">
                                                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Traveler Price Details</h5>
                                                    <div className="space-y-2 divide-y divide-muted/30">
                                                        {formData.customers.map((c) => {
                                                            const selection = formData.customerSelections[c.id] || { tierId: formData.packageTierId, ageCategory: 'adult' };
                                                            const effectiveTierId = formData.isCommonTier ? formData.packageTierId : selection.tierId;
                                                            const ageCategory = selection.ageCategory || 'adult';
                                                            const tier = selectedPackage.packageTiers?.find((t) => t.id === effectiveTierId);

                                                            let cost = 0;
                                                            if (tier) {
                                                                const adultCost = Number(tier.adultCost || 0);
                                                                if (ageCategory === 'adult') {
                                                                    cost = adultCost;
                                                                } else if (ageCategory === 'child') {
                                                                    cost = tier.childCostType === 'percentage'
                                                                        ? adultCost * (Number(tier.childCostValue || 0) / 100)
                                                                        : Number(tier.childCostValue || 0);
                                                                } else if (ageCategory === 'infant') {
                                                                    cost = tier.infantCostType === 'percentage'
                                                                        ? adultCost * (Number(tier.infantCostValue || 0) / 100)
                                                                        : Number(tier.infantCostValue || 0);
                                                                }
                                                            }

                                                            return (
                                                                <div key={c.id} className="flex justify-between items-center text-xs py-2 first:pt-0">
                                                                    <div className="space-y-0.5">
                                                                        <p className="font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">{ageCategory} • {tier?.name || 'No tier'}</p>
                                                                    </div>
                                                                    <span className="font-semibold text-foreground">{BookingService.formatCurrency(cost)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Select Payment Structure */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Select Payment Structure</Label>
                                            {paymentStructure.length > 0 ? (
                                                <div className="space-y-2.5">
                                                    {paymentStructure.map((milestone, idx) => {
                                                        const milestonePercent = Number(milestone.amount || 0);
                                                        const cumulativePercent = paymentStructure
                                                            .slice(0, idx + 1)
                                                            .reduce((sum, m) => sum + Number(m.amount || 0), 0);
                                                        const calculatedCost = Math.round((formData.totalAmount * cumulativePercent) / 100);
                                                        const isSelected = formData.paymentStructureId === milestone.id;

                                                        return (
                                                            <div
                                                                key={milestone.id}
                                                                className={`p-3.5 border rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between hover:border-primary/50 hover:shadow-xs ${isSelected && !formData.isPaymentOverridden
                                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                        : "bg-card border-border"
                                                                    }`}
                                                                onClick={() => {
                                                                    if (!formData.isPaymentOverridden) {
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            paymentStructureId: milestone.id || "",
                                                                            advanceAmount: calculatedCost,
                                                                        }));
                                                                        if (errors.paymentOverrideReason) {
                                                                            setErrors(prev => ({ ...prev, paymentOverrideReason: "" }));
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected && !formData.isPaymentOverridden ? "border-primary text-primary" : "border-muted-foreground/30"}`}>
                                                                            {isSelected && !formData.isPaymentOverridden && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                                        </span>
                                                                        <p className="text-sm font-bold text-foreground">
                                                                            {milestone.dueDate?.replace(/_/g, " ") || "Payment Option"}
                                                                        </p>
                                                                        <Badge variant="secondary" className="text-[10px] font-semibold py-0 px-1.5">
                                                                            {idx > 0 ? `${milestonePercent}% (Total: ${cumulativePercent}%)` : `${milestonePercent}%`}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="font-bold text-base text-primary mr-1">
                                                                    {BookingService.formatCurrency(calculatedCost)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-dashed text-center">
                                                    No payment structure milestones defined for this package. Turn on override to enter custom advance payment.
                                                </p>
                                            )}
                                        </div>

                                        {/* Override Options */}
                                        <div className="flex items-center justify-between border rounded-xl p-4 bg-muted/10">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="override-payment" className="text-sm font-semibold cursor-pointer">Override Payment Amount</Label>
                                                <p className="text-xs text-muted-foreground">Allows entering a custom advance payment and override reason.</p>
                                            </div>
                                            <Switch
                                                id="override-payment"
                                                checked={formData.isPaymentOverridden}
                                                onCheckedChange={(checked) => {
                                                    setFormData((prev) => {
                                                        let newAdvanceAmount = prev.advanceAmount;
                                                        if (!checked && prev.paymentStructureId && paymentStructure.length > 0) {
                                                            const milestoneIdx = paymentStructure.findIndex(m => m.id === prev.paymentStructureId);
                                                            if (milestoneIdx !== -1) {
                                                                const cumulativePercent = paymentStructure
                                                                    .slice(0, milestoneIdx + 1)
                                                                    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
                                                                newAdvanceAmount = Math.round((prev.totalAmount * cumulativePercent) / 100);
                                                            }
                                                        }
                                                        return {
                                                            ...prev,
                                                            isPaymentOverridden: checked,
                                                            advanceAmount: checked ? prev.advanceAmount : newAdvanceAmount,
                                                            paymentOverrideReason: checked ? prev.paymentOverrideReason : "",
                                                        };
                                                    });
                                                    if (!checked && errors.paymentOverrideReason) {
                                                        setErrors(prev => ({ ...prev, paymentOverrideReason: "" }));
                                                    }
                                                }}
                                            />
                                        </div>

                                        {formData.isPaymentOverridden && (
                                            <div className="grid sm:grid-cols-2 gap-4 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl animate-in fade-in duration-200">
                                                <div className="space-y-2">
                                                    <Label htmlFor="customAdvanceAmount" className="text-xs font-bold text-muted-foreground">Custom Advance Amount *</Label>
                                                    <Input
                                                        id="customAdvanceAmount"
                                                        type="number"
                                                        min="0"
                                                        max={formData.totalAmount}
                                                        value={formData.advanceAmount || ""}
                                                        onChange={(e) => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                advanceAmount: Number.parseInt(e.target.value) || 0,
                                                            }));
                                                            setError(null);
                                                        }}
                                                        placeholder="Enter custom amount..."
                                                        className="h-10 bg-background border-amber-500/20 focus-visible:ring-amber-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentOverrideReason" className="text-xs font-bold text-muted-foreground">Reason for Override *</Label>
                                                    <Input
                                                        id="paymentOverrideReason"
                                                        value={formData.paymentOverrideReason}
                                                        onChange={(e) => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                paymentOverrideReason: e.target.value,
                                                            }));
                                                            setError(null);
                                                            if (errors.paymentOverrideReason) {
                                                                setErrors(prev => ({ ...prev, paymentOverrideReason: "" }));
                                                            }
                                                        }}
                                                        placeholder="Why is this custom amount used?"
                                                        className="h-10 bg-background border-amber-500/20 focus-visible:ring-amber-500"
                                                        required
                                                    />
                                                    {errors.paymentOverrideReason && (
                                                        <p className="text-xs text-destructive font-medium">
                                                            {errors.paymentOverrideReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rest of the payment functionality */}
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
                                                        <FileUploader
                                                            value={formData.paymentScreenshot ? [formData.paymentScreenshot] : []}
                                                            onChange={handleFileUpload}
                                                            onRemoveNew={() => {
                                                                setFormData((prev) => ({ ...prev, paymentScreenshot: null }));
                                                            }}
                                                            accept="image/*,application/pdf"
                                                            maxFiles={1}
                                                        />
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
