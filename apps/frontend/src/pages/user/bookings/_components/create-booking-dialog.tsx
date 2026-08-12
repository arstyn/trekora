import { FileUploader } from "@/components/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import EnhancedCustomerForm from "@/pages/user/customers/_components/enhanced-customer-form";
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
    Baby,
    Calendar,
    Check,
    ChevronRight,
    DollarSign,
    Info,
    Loader2,
    Package as PackageIcon,
    PersonStanding,
    Plus,
    Search,
    ShieldAlert,
    Tag,
    User,
    UserPlus,
    Users,
    X
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookingCreated?: () => void;
    preselectedBatchId?: string;
    preselectedPackageId?: string;
    preselectedBlockId?: string;
    preselectedBlockSlots?: number;
}

export interface ICreateBookingFormData {
    packageId: string;
    packageTierId: string;
    batchId: string;
    numberOfCustomers: number;
    customers: ICustomer[];
    totalAmount: number;
    discountAmount: number;
    adjustmentAmount: number;
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
    batchBlockId?: string;
    overrideCapacityLimit: boolean;
}

export function CreateBookingDialog({
    open,
    onOpenChange,
    onBookingCreated,
    preselectedBatchId,
    preselectedPackageId,
    preselectedBlockId,
    preselectedBlockSlots,
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
    const [customerMode, setCustomerMode] = useState<"select" | "create">("select");
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
    const [duplicateCustomerOverrides, setDuplicateCustomerOverrides] = useState<Record<string, boolean>>({});
    const [batchBookedOverrides, setBatchBookedOverrides] = useState<Record<string, boolean>>({});
    const [customerExistingBookings, setCustomerExistingBookings] = useState<Record<string, any[]>>({});
    const [discountInputType, setDiscountInputType] = useState<"amount" | "percentage">("amount");
    const [perPassengerDiscountValue, setPerPassengerDiscountValue] = useState<number>(0);

    const [formData, setFormData] = useState<ICreateBookingFormData>({
        packageId: preselectedPackageId || "",
        packageTierId: "",
        batchId: preselectedBatchId || "",
        numberOfCustomers: 0,
        customers: [],
        totalAmount: 0,
        discountAmount: 0,
        adjustmentAmount: 0,
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
        batchBlockId: preselectedBlockId || "",
        overrideCapacityLimit: false,
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

    const getDuplicateCustomerCount = (customer: ICustomer) => {
        const custId = customer.id || customer.email || customer.phone || customer.firstName;
        if (!custId) return 0;
        return formData.customers.filter(c => (c.id || c.email || c.phone || c.firstName) === custId).length;
    };

    const fetchCustomerBookings = async (customer: ICustomer) => {
        if (!customer.id) return;
        const custId = customer.id;
        if (customerExistingBookings[custId] !== undefined) return;
        try {
            const bookings = await BookingService.getBookingsByCustomer(custId);
            setCustomerExistingBookings(prev => ({
                ...prev,
                [custId]: Array.isArray(bookings) ? bookings : []
            }));
        } catch (err) {
            console.error(`Failed to fetch bookings for customer ${custId}`, err);
        }
    };

    const getExistingBatchBookings = (customer: ICustomer, batchId: string) => {
        if (!customer.id || !batchId) return [];
        const bookings = customerExistingBookings[customer.id] || [];
        return bookings.filter(b => b.batchId === batchId || b.batch?.id === batchId);
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
    const getAvailableSeats = (batchObj: IBatches | undefined) => {
        if (!batchObj) return 0;
        const total = batchObj.totalSeats || 0;
        const booked = batchObj.bookedSeats || 0;
        const blocked = batchObj.blockedSeats || 0;

        if (formData.batchBlockId && batchObj.id === formData.batchId) {
            return total - booked - blocked + (preselectedBlockSlots || 0);
        }
        return total - booked - blocked;
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
            } else {
                if (selectedPackage?.packageLocation?.type === 'international') {
                    const pendingWarnings = formData.customers.some(c => {
                        const status = checkPassportStatus(c);
                        return status.hasWarning && !(c.id && passportOverrides[c.id]);
                    });
                    if (pendingWarnings) {
                        newErrors.passport = "Please resolve or override all traveler passport warnings before proceeding.";
                    }
                }
                const pendingDuplicateWarnings = formData.customers.some(c => {
                    const custId = c.id || c.email || c.phone || c.firstName;
                    const count = getDuplicateCustomerCount(c);
                    return count > 1 && !(custId && duplicateCustomerOverrides[custId]);
                });
                if (pendingDuplicateWarnings) {
                    newErrors.duplicateCustomer = "A customer is selected multiple times for this booking. Please acknowledge the duplicate customer warning to proceed.";
                }
                const pendingBatchBookedWarnings = formData.customers.some(c => {
                    const custId = c.id || c.email || c.phone || c.firstName;
                    const existingBookings = getExistingBatchBookings(c, formData.batchId);
                    return existingBookings.length > 0 && !(custId && batchBookedOverrides[custId]);
                });
                if (pendingBatchBookedWarnings) {
                    newErrors.batchBookedCustomer = "A selected customer has an existing booking in this travel batch. Please acknowledge the existing batch booking warning to proceed.";
                }
                const availableSeats = getAvailableSeats(selectedBatch);
                if (selectedBatch && formData.customers.length > availableSeats && !formData.overrideCapacityLimit) {
                    newErrors.capacity = `Selected travelers (${formData.customers.length}) exceed batch capacity (${availableSeats} seats left). Check override option to proceed.`;
                }
            }
        }

        if (currentStep === 3) {
            if (formData.advanceAmount > 0 && !formData.paymentMethod) {
                newErrors.paymentMethod = "Please select a payment method for advance payment";
            }
            const availableSeats = getAvailableSeats(selectedBatch);
            if (selectedBatch && formData.customers.length > availableSeats && !formData.overrideCapacityLimit) {
                newErrors.capacity = `Selected travelers (${formData.customers.length}) exceed batch capacity (${availableSeats} seats left). Check override option to submit.`;
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

    // Automatically fetch existing bookings for selected customers
    useEffect(() => {
        formData.customers.forEach(c => {
            if (c.id && customerExistingBookings[c.id] === undefined) {
                fetchCustomerBookings(c);
            }
        });
    }, [formData.customers]);

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
            if (prev.isPaymentOverridden) return prev;

            let activeMilestone = paymentStructure.find(m => m.id === prev.paymentStructureId);
            if (!activeMilestone) {
                activeMilestone = paymentStructure[0];
            }

            const milestoneIdx = paymentStructure.findIndex(m => m.id === activeMilestone.id);
            const cumulativePercent = paymentStructure
                .slice(0, milestoneIdx + 1)
                .reduce((sum, m) => sum + Number(m.amount || 0), 0);

            const baseTotal = calculateBaseTotal(
                prev.packageId,
                prev.packageTierId,
                prev.isCommonTier,
                prev.customerSelections,
                prev.customers
            );

            const newAdvanceAmount = Math.round((baseTotal * cumulativePercent) / 100);

            if (prev.paymentStructureId === activeMilestone.id && prev.advanceAmount === newAdvanceAmount) {
                return prev;
            }

            return {
                ...prev,
                paymentStructureId: activeMilestone.id || "",
                advanceAmount: newAdvanceAmount,
            };
        });
    }, [selectedPackage, formData.totalAmount, formData.discountAmount, formData.adjustmentAmount, formData.isPaymentOverridden]);

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
        currentCustomers: ICustomer[],
        discount: number = formData.discountAmount || 0,
        adjustment: number = formData.adjustmentAmount || 0
    ) => {
        const pkg = packages.find((p) => p.id === pkgId);
        if (!pkg) return 0;

        let total = 0;

        currentCustomers.forEach(customer => {
            const custId = customer.id || customer.email || customer.phone || customer.firstName;
            const selection = selections[custId] || { tierId: commonTierId, ageCategory: 'adult' };
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

        return Math.max(0, total + adjustment - discount);
    };

    const calculateBaseTotal = (
        pkgId: string,
        commonTierId: string,
        isCommon: boolean,
        selections: Record<string, { tierId: string, ageCategory: 'adult' | 'child' | 'infant' }>,
        currentCustomers: ICustomer[]
    ) => {
        return calculateTotalAmount(pkgId, commonTierId, isCommon, selections, currentCustomers, 0, 0);
    };

    const handleCustomerSelect = (customer: ICustomer) => {
        const custId = customer.id || customer.email || customer.phone || customer.firstName;
        const isAlreadySelected = formData.customers.some(
            (c) => (c.id || c.email || c.phone || c.firstName) === custId,
        );

        if (isAlreadySelected) {
            const newCount = formData.customers.length - 1;
            setFormData((prev) => {
                const newCustomers = prev.customers.filter((c) => (c.id || c.email || c.phone || c.firstName) !== custId);
                const newSelections = { ...prev.customerSelections };
                delete newSelections[custId];
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
                    [custId]: { tierId: defaultTierId, ageCategory: 'adult' as const }
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
                const custId = customerToRemove.id || customerToRemove.email || customerToRemove.phone || customerToRemove.firstName;
                delete newSelections[custId];
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
                const custId = c.id || c.email || c.phone || c.firstName;
                if (!newSelections[custId]) {
                    newSelections[custId] = { tierId: defaultTierId, ageCategory: 'adult' };
                } else {
                    newSelections[custId].tierId = defaultTierId;
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
                const custId = c.id || c.email || c.phone || c.firstName;
                if (newSelections[custId]) {
                    newSelections[custId].tierId = tierId;
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
                .filter((id): id is string => Boolean(id));

            const bookingData: ICreateBookingRequest = {
                customerId: formData.customers[0]?.id || "",
                packageId: formData.packageId,
                packageTierId: formData.packageTierId || undefined,
                batchId: formData.batchId,
                customerIds,
                totalAmount: formData.totalAmount,
                discountAmount: formData.discountAmount || 0,
                adjustmentAmount: formData.adjustmentAmount || 0,
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
                batchBlockId: formData.batchBlockId || undefined,
                overrideCapacityLimit: formData.overrideCapacityLimit,
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
            discountAmount: 0,
            adjustmentAmount: 0,
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
            overrideCapacityLimit: false,
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
        setDuplicateCustomerOverrides({});
        setBatchBookedOverrides({});
        setCustomerExistingBookings({});
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
                                                                const availableSeats = getAvailableSeats(batch);
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
                                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-background"}`}>
                                                                                {isSelected && (
                                                                                    <Check className="h-3 w-3 text-primary-foreground" />
                                                                                )}
                                                                            </div>
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
                                         {formData.customers.some(c => c.isBlacklisted) && (
                                             <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-red-950/20 to-background p-4 shadow-md space-y-3 dark:border-rose-800/40">
                                                 <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                                                     <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                                                     <span>Warning: Blacklisted Customer Selected</span>
                                                 </div>
                                                 <div className="space-y-2">
                                                     {formData.customers.filter(c => c.isBlacklisted).map((c, bIdx) => (
                                                         <div key={c.id || `bl-${bIdx}`} className="p-3 bg-background/70 border border-rose-500/20 rounded-lg text-xs space-y-1">
                                                             <div className="flex items-center justify-between font-bold text-foreground">
                                                                 <span>{c.firstName} {c.lastName}</span>
                                                                 <Badge variant="destructive" className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30">Blacklisted</Badge>
                                                             </div>
                                                             <p className="text-muted-foreground">
                                                                 Reason: <span className="font-semibold text-rose-300">{c.blacklistedReason || "No description provided"}</span>
                                                             </p>
                                                             {c.blacklistedBy && (
                                                                 <p className="text-[11px] text-muted-foreground/80">
                                                                     Blacklisted by: {[c.blacklistedBy.firstName, c.blacklistedBy.lastName].filter(Boolean).join(" ") || c.blacklistedBy.email}
                                                                     {c.blacklistedAt && ` on ${new Date(c.blacklistedAt).toLocaleDateString()}`}
                                                                 </p>
                                                             )}
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-end">
                                                </div>

                                                {customerMode === "select" ? (
                                                    <>

                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-full">
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
                                                            <Button
                                                                type="button"

                                                                onClick={() => setCustomerMode("create")}
                                                            >
                                                                <UserPlus className="w-3.5 h-3.5 mr-1" />
                                                                Create New
                                                            </Button>
                                                        </div>
                                                        {errors.customers && <p className="text-xs text-destructive mt-1 font-medium">{errors.customers}</p>}
                                                        {errors.passport && (
                                                            <Alert variant="destructive" className="mt-2 py-2">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{errors.passport}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {errors.duplicateCustomer && (
                                                            <Alert variant="destructive" className="mt-2 py-2">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{errors.duplicateCustomer}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {errors.batchBookedCustomer && (
                                                            <Alert variant="destructive" className="mt-2 py-2">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{errors.batchBookedCustomer}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {selectedBatch && formData.customers.length > getAvailableSeats(selectedBatch) && (
                                                            <Alert className="mt-2 border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 py-3">
                                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                                <AlertDescription className="space-y-2">
                                                                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-500">
                                                                        Capacity Warning: Travelers ({formData.customers.length}) exceed available seats ({getAvailableSeats(selectedBatch)} left).
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id="overrideCapacityLimit"
                                                                            checked={formData.overrideCapacityLimit}
                                                                            onCheckedChange={(checked) => {
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    overrideCapacityLimit: !!checked
                                                                                }));
                                                                                if (errors.capacity) {
                                                                                    setErrors(prev => ({ ...prev, capacity: "" }));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Label htmlFor="overrideCapacityLimit" className="text-xs font-semibold cursor-pointer text-foreground">
                                                                            Override batch capacity limit
                                                                        </Label>
                                                                    </div>
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {errors.capacity && (
                                                            <Alert variant="destructive" className="mt-2 py-2">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{errors.capacity}</AlertDescription>
                                                            </Alert>
                                                        )}
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
                                                                    customers.map((c, idx) => {
                                                                        const custId = c.id || c.email || c.phone || c.firstName;
                                                                        const isChecked = formData.customers.some((x) => (x.id || x.email || x.phone || x.firstName) === custId);
                                                                        return (
                                                                            <div
                                                                                key={c.id || `cust-${idx}`}
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
                                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                                        <p className="text-sm font-semibold truncate text-foreground">{c.firstName} {c.lastName}</p>
                                                                                        {c.isBlacklisted && (
                                                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-bold">
                                                                                                Blacklisted
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    {c.isBlacklisted ? (
                                                                                        <p className="text-xs font-semibold text-destructive truncate">
                                                                                            Reason: {c.blacklistedReason || "No reason specified"}
                                                                                        </p>
                                                                                    ) : (c.email || c.phone) ? (
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
                                                    </>
                                                ) : (
                                                    <div className="border rounded-xl p-4 bg-muted/20">
                                                        <EnhancedCustomerForm
                                                            onSave={(newCust) => {
                                                                setCustomers((prev) => [newCust, ...prev]);
                                                                handleCustomerSelect(newCust);
                                                                setCustomerMode("select");
                                                                toast.success(`Customer ${newCust.firstName} created & added to booking`);
                                                            }}
                                                            onCancel={() => setCustomerMode("select")}
                                                        />
                                                    </div>
                                                )}
                                            </div>
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
                                                        const selection = formData.customerSelections[c.id!] || { tierId: formData.packageTierId, ageCategory: 'adult' };
                                                        return (
                                                            <div key={c.id || index} className="flex flex-col p-3 bg-card border rounded-xl hover:shadow-xs transition-shadow gap-3">
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
                                                                                        const customerKey = c.id || '';
                                                                                        const newSelections = { ...prev.customerSelections, [customerKey]: { ...selection, tierId: val } };
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
                                                                            value={selection.ageCategory || 'adult'}
                                                                            onValueChange={(val: 'adult' | 'child' | 'infant') => {
                                                                                if (!c.id) return;
                                                                                setFormData(prev => {
                                                                                    const newSelections = { ...prev.customerSelections, [c.id!]: { ...selection, ageCategory: val } };
                                                                                    return {
                                                                                        ...prev,
                                                                                        customerSelections: newSelections,
                                                                                        totalAmount: calculateTotalAmount(prev.packageId, prev.packageTierId, prev.isCommonTier, newSelections, prev.customers)
                                                                                    };
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

                                                                    const isOverridden = !!(c.id && passportOverrides[c.id]);

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
                                                                                            onClick={() => c.id && syncCustomerDetails(c.id)}
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
                                                                                        if (!c.id) return;
                                                                                        setPassportOverrides(prev => ({
                                                                                            ...prev,
                                                                                            [c.id!]: !!checked
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
                                                                {(() => {
                                                                    const custId = c.id || c.email || c.phone || c.firstName;
                                                                    const dupCount = getDuplicateCustomerCount(c);
                                                                    if (dupCount <= 1) return null;

                                                                    const isDupOverridden = !!(custId && duplicateCustomerOverrides[custId]);

                                                                    return (
                                                                        <div className={`p-2.5 rounded-lg border text-xs space-y-2 ${isDupOverridden ? 'bg-muted/50 border-muted' : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'}`}>
                                                                            <div className="flex items-start gap-2">
                                                                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium">
                                                                                        Duplicate customer selection ({c.firstName} {c.lastName} is selected {dupCount} times for this booking).
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/10">
                                                                                <Checkbox
                                                                                    id={`override-duplicate-${custId}-${index}`}
                                                                                    checked={isDupOverridden}
                                                                                    onCheckedChange={(checked) => {
                                                                                        if (!custId) return;
                                                                                        setDuplicateCustomerOverrides(prev => ({
                                                                                            ...prev,
                                                                                            [custId]: !!checked
                                                                                        }));
                                                                                        if (errors.duplicateCustomer) {
                                                                                            setErrors(prev => ({ ...prev, duplicateCustomer: "" }));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <Label htmlFor={`override-duplicate-${custId}-${index}`} className="text-[11px] font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                                                                                    Acknowledge duplicate customer selection
                                                                                </Label>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                                {(() => {
                                                                    const custId = c.id || c.email || c.phone || c.firstName;
                                                                    const existingBookings = getExistingBatchBookings(c, formData.batchId);
                                                                    if (existingBookings.length === 0) return null;

                                                                    const isBatchBookedOverridden = !!(custId && batchBookedOverrides[custId]);

                                                                    return (
                                                                        <div className={`p-2.5 rounded-lg border text-xs space-y-2 ${isBatchBookedOverridden ? 'bg-muted/50 border-muted' : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'}`}>
                                                                            <div className="flex items-start gap-2">
                                                                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium">
                                                                                        Existing batch booking warning ({c.firstName} {c.lastName} is already booked in this batch — Booking #{existingBookings.map(b => b.bookingNumber).join(', ')}).
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/10">
                                                                                <Checkbox
                                                                                    id={`override-batch-booked-${custId}-${index}`}
                                                                                    checked={isBatchBookedOverridden}
                                                                                    onCheckedChange={(checked) => {
                                                                                        if (!custId) return;
                                                                                        setBatchBookedOverrides(prev => ({
                                                                                            ...prev,
                                                                                            [custId]: !!checked
                                                                                        }));
                                                                                        if (errors.batchBookedCustomer) {
                                                                                            setErrors(prev => ({ ...prev, batchBookedCustomer: "" }));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <Label htmlFor={`override-batch-booked-${custId}-${index}`} className="text-[11px] font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                                                                                    Acknowledge existing batch booking
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
                                        {selectedBatch && formData.customers.length > getAvailableSeats(selectedBatch) && (
                                            <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 py-3">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                <AlertDescription className="space-y-2">
                                                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-500">
                                                        Capacity Warning: Travelers ({formData.customers.length}) exceed available seats ({getAvailableSeats(selectedBatch)} left).
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="overrideCapacityLimitStep3"
                                                            checked={formData.overrideCapacityLimit}
                                                            onCheckedChange={(checked) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    overrideCapacityLimit: !!checked
                                                                }));
                                                                if (errors.capacity) {
                                                                    setErrors(prev => ({ ...prev, capacity: "" }));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor="overrideCapacityLimitStep3" className="text-xs font-semibold cursor-pointer text-foreground">
                                                            Override batch capacity limit and book anyway
                                                        </Label>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        {errors.capacity && (
                                            <Alert variant="destructive" className="py-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.capacity}</AlertDescription>
                                            </Alert>
                                        )}
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
                                                            const selection = formData.customerSelections[c.id!] || { tierId: formData.packageTierId, ageCategory: 'adult' };
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

                                        {/* Discount Section */}
                                        {(() => {
                                            const baseTotal = calculateBaseTotal(
                                                formData.packageId,
                                                formData.packageTierId,
                                                formData.isCommonTier,
                                                formData.customerSelections,
                                                formData.customers
                                            );
                                            const pkgDiscountType = selectedPackage?.maxDiscountType || (selectedPackage?.maxDiscountPercentage ? "percentage" : "amount");
                                            const pkgDiscountScope = selectedPackage?.maxDiscountScope || "group";
                                            const effectiveDiscountScope = pkgDiscountScope === "passenger" ? "individual" : "group";
                                            const pkgMaxVal = selectedPackage?.maxDiscountValue ?? selectedPackage?.maxDiscountPercentage ?? 0;
                                            const travelerCount = formData.customers.length || 1;

                                            const maxDiscountAmount = pkgDiscountScope === "passenger"
                                                ? (pkgDiscountType === "percentage" ? Math.round((baseTotal * pkgMaxVal) / 100) : pkgMaxVal * travelerCount)
                                                : (pkgDiscountType === "percentage" ? Math.round((baseTotal * pkgMaxVal) / 100) : pkgMaxVal);

                                            const isDiscountExceeded = (formData.discountAmount || 0) > maxDiscountAmount && maxDiscountAmount > 0;

                                            const discountPercentageValue = baseTotal > 0 && formData.discountAmount
                                                ? Number(((formData.discountAmount / baseTotal) * 100).toFixed(2))
                                                : "";

                                            return (
                                                <div className="p-4 rounded-xl border bg-card space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                                                        <div>
                                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                Booking Discount
                                                            </Label>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {pkgDiscountScope === "passenger"
                                                                    ? "Discount is configured per passenger for this package."
                                                                    : "Discount is configured for the entire booking group."}
                                                                {maxDiscountAmount > 0 && (
                                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                                                                        Max allowed: {pkgDiscountScope === "passenger"
                                                                            ? `${pkgDiscountType === "percentage" ? `${pkgMaxVal}%` : `₹${pkgMaxVal}`} / passenger × ${travelerCount} travelers = ${BookingService.formatCurrency(maxDiscountAmount)} Max`
                                                                            : `${pkgDiscountType === "percentage" ? `${pkgMaxVal}%` : `₹${pkgMaxVal}`} Total (${BookingService.formatCurrency(maxDiscountAmount)})`}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* Discount Scope Indicator (Locked to Package Configuration) */}
                                                        {pkgDiscountScope === "passenger" ? (
                                                            <div className="inline-flex items-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-semibold gap-1.5 self-start sm:self-auto">
                                                                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                Per Passenger Discount
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs font-semibold gap-1.5 self-start sm:self-auto">
                                                                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                Group Discount
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Calculation Type Header & Amount / Percentage Toggle */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                            {effectiveDiscountScope === "group" ? "Total Group Discount Input" : `Per-Passenger Discount Input (${travelerCount} Travelers)`}
                                                        </span>
                                                        <div className="inline-flex items-center bg-muted p-0.5 rounded-lg border text-xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => setDiscountInputType("amount")}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-md transition-all font-medium",
                                                                    discountInputType === "amount"
                                                                        ? "bg-background text-foreground shadow-xs"
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                Amount (₹)
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDiscountInputType("percentage")}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-md transition-all font-medium",
                                                                    discountInputType === "percentage"
                                                                        ? "bg-background text-foreground shadow-xs"
                                                                        : "text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                Percent (%)
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {effectiveDiscountScope === "group" ? (
                                                        /* Group Discount Input */
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {discountInputType === "amount" ? (
                                                                <Input
                                                                    id="discountAmount"
                                                                    type="number"
                                                                    min="0"
                                                                    max={baseTotal}
                                                                    value={formData.discountAmount || ""}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value;
                                                                        const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                                                                        setFormData((prev) => {
                                                                            const newTotal = Math.max(0, baseTotal + (prev.adjustmentAmount || 0) - val);
                                                                            return {
                                                                                ...prev,
                                                                                discountAmount: val,
                                                                                totalAmount: newTotal,
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder="Enter group discount in ₹..."
                                                                    className="h-10 max-w-xs bg-background font-semibold"
                                                                />
                                                            ) : (
                                                                <Input
                                                                    id="discountPercentage"
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={discountPercentageValue}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value;
                                                                        const pct = raw === "" ? 0 : Math.max(0, Math.min(100, Number(raw) || 0));
                                                                        const val = Math.round((baseTotal * pct) / 100);
                                                                        setFormData((prev) => {
                                                                            const newTotal = Math.max(0, baseTotal + (prev.adjustmentAmount || 0) - val);
                                                                            return {
                                                                                ...prev,
                                                                                discountAmount: val,
                                                                                totalAmount: newTotal,
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder="Enter group discount in %..."
                                                                    className="h-10 max-w-xs bg-background font-semibold"
                                                                />
                                                            )}

                                                            {formData.discountAmount > 0 && (
                                                                <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-2.5">
                                                                    - {BookingService.formatCurrency(formData.discountAmount)} Total Group Discount
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Individual Per-Passenger Input */
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={perPassengerDiscountValue || ""}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value;
                                                                        const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                                                                        setPerPassengerDiscountValue(val);
                                                                        let totalDisc = 0;
                                                                        if (discountInputType === "amount") {
                                                                            totalDisc = val * travelerCount;
                                                                        } else {
                                                                            totalDisc = Math.round((baseTotal * val) / 100);
                                                                        }
                                                                        setFormData((prev) => {
                                                                            const newTotal = Math.max(0, baseTotal + (prev.adjustmentAmount || 0) - totalDisc);
                                                                            return {
                                                                                ...prev,
                                                                                discountAmount: totalDisc,
                                                                                totalAmount: newTotal,
                                                                            };
                                                                        });
                                                                    }}
                                                                    placeholder={discountInputType === "amount" ? "Enter discount per passenger (₹)..." : "Enter discount per passenger (%)..."}
                                                                    className="h-10 max-w-xs bg-background font-semibold"
                                                                />
                                                                {formData.discountAmount > 0 && (
                                                                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-2.5">
                                                                        - {BookingService.formatCurrency(formData.discountAmount)} Total (- {discountInputType === "amount" ? BookingService.formatCurrency(perPassengerDiscountValue) : `${perPassengerDiscountValue}%`} / traveler)
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Individual passenger breakdown summary */}
                                                            {formData.customers.length > 0 && formData.discountAmount > 0 && (
                                                                <div className="p-3 bg-muted/20 border rounded-lg space-y-2">
                                                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                                                                        Per Passenger Discount Breakdown ({travelerCount} Travelers)
                                                                    </p>
                                                                    <div className="space-y-1.5 divide-y divide-border/40">
                                                                        {formData.customers.map((c, i) => {
                                                                            const perPersonDisc = Math.round(formData.discountAmount / travelerCount);
                                                                            return (
                                                                                <div key={c.id || i} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                                                                                    <span className="font-medium text-foreground">{c.firstName} {c.lastName}</span>
                                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                                                        - {BookingService.formatCurrency(perPersonDisc)}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Excess Discount Warning */}
                                                    {isDiscountExceeded && (
                                                        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 py-2.5">
                                                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                                            <AlertDescription className="text-xs font-medium">
                                                                Warning: Discount amount ({BookingService.formatCurrency(formData.discountAmount)}) exceeds maximum allowed discount of {pkgDiscountType === "percentage" ? `${pkgMaxVal}%` : BookingService.formatCurrency(pkgMaxVal)} ({BookingService.formatCurrency(maxDiscountAmount)}) for this package.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Adjustment Section */}
                                        <div className="p-4 rounded-xl border bg-card space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                                                <div>
                                                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                        <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                        Additional Charges / Rounding
                                                    </Label>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Add any additional adjustment amount or overpayment.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Input
                                                    id="adjustmentAmount"
                                                    type="number"
                                                    min="0"
                                                    value={formData.adjustmentAmount || ""}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                                                        const baseTotal = calculateBaseTotal(
                                                            formData.packageId,
                                                            formData.packageTierId,
                                                            formData.isCommonTier,
                                                            formData.customerSelections,
                                                            formData.customers
                                                        );
                                                        setFormData((prev) => {
                                                            const newTotal = Math.max(0, baseTotal + val - (prev.discountAmount || 0));
                                                            return {
                                                                ...prev,
                                                                adjustmentAmount: val,
                                                                totalAmount: newTotal,
                                                            };
                                                        });
                                                    }}
                                                    placeholder="Enter adjustment amount in ₹..."
                                                    className="h-10 max-w-xs bg-background font-semibold"
                                                />
                                                {formData.adjustmentAmount > 0 && (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1.5 px-2.5">
                                                        + {BookingService.formatCurrency(formData.adjustmentAmount)} Adjustment
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expected Payment Structure Reference */}
                                        {paymentStructure.length > 0 && (
                                            <div className="space-y-2.5 p-4 rounded-xl border bg-muted/20">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                        <Info className="w-3.5 h-3.5 text-primary" />
                                                        Expected Payment Structure (Package Reference)
                                                    </Label>
                                                    <span className="text-[11px] text-muted-foreground">Click a milestone to auto-fill</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {paymentStructure.map((milestone, idx) => {
                                                        const milestonePercent = Number(milestone.amount || 0);
                                                        const cumulativePercent = paymentStructure
                                                            .slice(0, idx + 1)
                                                            .reduce((sum, m) => sum + Number(m.amount || 0), 0);
                                                        const calculatedCost = Math.round((formData.totalAmount * cumulativePercent) / 100);
                                                        const isSelected = formData.paymentStructureId === milestone.id;

                                                        return (
                                                            <div
                                                                key={milestone.id || idx}
                                                                onClick={() => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        paymentStructureId: milestone.id || "",
                                                                        advanceAmount: calculatedCost,
                                                                    }));
                                                                }}
                                                                className={cn(
                                                                    "p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-2",
                                                                    isSelected
                                                                        ? "bg-primary/10 border-primary ring-1 ring-primary text-foreground font-semibold"
                                                                        : "bg-background border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-semibold truncate">
                                                                        {milestone.dueDate?.replace(/_/g, " ") || `Milestone ${idx + 1}`}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {idx > 0 ? `${milestonePercent}% (Cumulative ${cumulativePercent}%)` : `${milestonePercent}% target`}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-bold text-primary shrink-0">
                                                                    {BookingService.formatCurrency(calculatedCost)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Direct Advance Payment Input */}
                                        <div className="p-4 rounded-xl border bg-card space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div>
                                                    <Label htmlFor="advanceAmount" className="text-sm font-semibold flex items-center gap-1.5">
                                                        <DollarSign className="w-4 h-4 text-primary" />
                                                        Advance Payment Amount
                                                    </Label>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Enter advance payment collected now. (Advance can be zero if no payment is collected upfront).
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="relative flex-1 min-w-[200px] max-w-xs">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">₹</span>
                                                    <Input
                                                        id="advanceAmount"
                                                        type="number"
                                                        min="0"
                                                        max={formData.totalAmount}
                                                        value={formData.advanceAmount || ""}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                advanceAmount: val,
                                                                isPaymentOverridden: true,
                                                            }));
                                                            setError(null);
                                                        }}
                                                        placeholder="0"
                                                        className="h-10 pl-7 bg-background font-semibold"
                                                    />
                                                </div>
                                                {formData.advanceAmount === 0 ? (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1.5 px-2.5">
                                                        ₹0 Advance (Remaining Balance: {BookingService.formatCurrency(formData.totalAmount)})
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-2.5">
                                                        Advance: {BookingService.formatCurrency(formData.advanceAmount)} • Remaining: {BookingService.formatCurrency(Math.max(0, formData.totalAmount - formData.advanceAmount))}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

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
                                                    const selection = c.id ? formData.customerSelections[c.id] : undefined;
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
