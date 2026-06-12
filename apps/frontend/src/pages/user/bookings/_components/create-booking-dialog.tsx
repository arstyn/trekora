import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Calendar,
    Check,
    CheckCircle2,
    DollarSign,
    Loader2,
    Package,
    Plus,
    Search,
    Trash,
    Upload,
    UserPlus,
    Users,
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
    batchId: string;
    numberOfCustomers: number;
    customers: ICustomer[];
    totalAmount: number;
    advanceAmount: number;
    paymentMethod: PaymentMethod | "";
    paymentReference: string;
    paymentScreenshot: File | null;
    specialRequests: string;
}

export function CreateBookingDialog({
    open,
    onOpenChange,
    onBookingCreated,
}: CreateBookingDialogProps) {
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
        batchId: "",
        numberOfCustomers: 0,
        customers: [],
        totalAmount: 0,
        advanceAmount: 0,
        paymentMethod: "",
        paymentReference: "",
        paymentScreenshot: null,
        specialRequests: "",
    });

    // Form validation
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.customers.length === 0)
            newErrors.customers = "Please select at least one customer";
        if (!formData.packageId)
            newErrors.packageId = "Please select a tour package";
        if (!formData.batchId) newErrors.batchId = "Please select a batch";
        if (formData.advanceAmount > 0 && !formData.paymentMethod) {
            newErrors.paymentMethod =
                "Please select a payment method for advance payment";
        }

        // Validate customer details
        const invalidCustomers = formData.customers.some((c, index) => {
            if (!c.firstName || !c.lastName) {
                newErrors[`customer_${index}_name`] = "Full name is required";
                return true;
            }
            if (!c.email) {
                newErrors[`customer_${index}_email`] = "Email is required";
                return true;
            }
            if (!c.phone) {
                newErrors[`customer_${index}_phone`] = "Phone is required";
                return true;
            }
            if (!c.emergencyContactName || !c.emergencyContactPhone) {
                newErrors[`customer_${index}_emergency`] =
                    "Emergency contact is required";
                return true;
            }
            return false;
        });

        if (invalidCustomers) {
            newErrors.customers =
                "Please fill in all required customer details";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            // Reset to initial customers if search is too short
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

    const selectedPackage = packages.find((p) => p.id === formData.packageId);

    const handleCustomerSelect = (customer: ICustomer) => {
        // Check if customer is already selected
        const isAlreadySelected = formData.customers.some(
            (c) => c.id === customer.id,
        );

        if (isAlreadySelected) {
            // Remove customer if already selected
            setFormData((prev) => ({
                ...prev,
                customers: prev.customers.filter((c) => c.id !== customer.id),
                numberOfCustomers: prev.customers.length - 1,
                totalAmount: selectedPackage
                    ? selectedPackage.price * (prev.customers.length - 1)
                    : 0,
            }));
        } else {
            // Add customer if not selected
            setFormData((prev) => ({
                ...prev,
                customers: [...prev.customers, customer],
                numberOfCustomers: prev.customers.length + 1,
                totalAmount: selectedPackage
                    ? selectedPackage.price * (prev.customers.length + 1)
                    : 0,
            }));
        }

        // Clear any existing customer selection errors
        if (errors.customers) {
            setErrors((prev) => ({
                ...prev,
                customers: "",
            }));
        }
    };

    const removeCustomer = (index: number) => {
        const newCustomers = formData.customers.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            customers: newCustomers,
            numberOfCustomers: newCustomers.length,
            totalAmount: selectedPackage
                ? selectedPackage.price * newCustomers.length
                : 0,
        }));
    };

    const handlePackageSelect = (pkg: IPackage) => {
        setFormData((prev) => ({
            ...prev,
            packageId: pkg.id,
            batchId: "",
            totalAmount: pkg.price * prev.numberOfCustomers,
        }));

        if (errors.packageId) {
            setErrors((prev) => ({
                ...prev,
                packageId: "",
            }));
        }
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

        if (!validateForm()) {
            setError("Please fix the errors before submitting");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const customerIds = formData.customers
                .map((c) => c.id)
                .filter((id) => id);

            const bookingData: ICreateBookingRequest = {
                customerId: formData.customers[0]?.id || "", // Use first customer as primary
                packageId: formData.packageId,
                batchId: formData.batchId,
                customerIds,
                totalAmount: formData.totalAmount,
                specialRequests: formData.specialRequests,
                initialPayment:
                    formData.advanceAmount > 0
                        ? {
                              amount: formData.advanceAmount,
                              paymentMethod:
                                  formData.paymentMethod as PaymentMethod,
                              paymentReference: formData.paymentReference,
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
                    bookingData.initialPayment.filePath = uploadResult.filePath;
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            batchId: "",
            numberOfCustomers: 0,
            customers: [],
            totalAmount: 0,
            advanceAmount: 0,
            paymentMethod: "",
            paymentReference: "",
            paymentScreenshot: null,
            specialRequests: "",
        });
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-7xl w-full overflow-hidden p-0">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Booking
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Create a new tour booking and manage travelers and
                        payments.
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex items-center justify-center py-12 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading data...
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1 p-0"
                    >
                        {error && (
                            <div className="px-5 pt-5">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                        <ScrollArea className="px-5 pb-5 pt-1 max-h-[70vh]">
                            {/* Main Grid Layout */}
                            <div className="grid grid-cols-2 gap-5">
                                {/* Customer Selection */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <Users className="h-4 w-4 text-primary" />
                                            Customer Selection
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Search and select multiple customers
                                            for this booking
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {/* Customer Search */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Search Customer
                                                </Label>
                                                <Popover
                                                    open={customerPopoverOpen}
                                                    onOpenChange={
                                                        setCustomerPopoverOpen
                                                    }
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${
                                                                errors.customers
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <UserPlus className="h-4 w-4" />
                                                                {formData
                                                                    .customers
                                                                    .length > 0
                                                                    ? `${
                                                                          formData
                                                                              .customers
                                                                              .length
                                                                      } customer${
                                                                          formData
                                                                              .customers
                                                                              .length >
                                                                          1
                                                                              ? "s"
                                                                              : ""
                                                                      } selected`
                                                                    : "Select customers"}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-[400px] p-0"
                                                        align="start"
                                                    >
                                                        <div className="p-3 border-b">
                                                            <div className="relative">
                                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search customers..."
                                                                    value={
                                                                        customerSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        setCustomerSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                        searchCustomers(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }}
                                                                    className="pl-8"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea
                                                            className="h-72"
                                                            onScrollCapture={(
                                                                e,
                                                            ) => {
                                                                const {
                                                                    scrollTop,
                                                                    scrollHeight,
                                                                    clientHeight,
                                                                } =
                                                                    e.currentTarget;
                                                                if (
                                                                    scrollHeight -
                                                                        scrollTop <=
                                                                    clientHeight +
                                                                        10
                                                                ) {
                                                                    loadMoreCustomers();
                                                                }
                                                            }}
                                                        >
                                                            <div className="p-2">
                                                                {customers.length >
                                                                0 ? (
                                                                    <div className="space-y-1">
                                                                        {customers.map(
                                                                            (
                                                                                customer,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        customer.id
                                                                                    }
                                                                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        handleCustomerSelect(
                                                                                            customer,
                                                                                        );
                                                                                        if (
                                                                                            errors.customers
                                                                                        ) {
                                                                                            setErrors(
                                                                                                (
                                                                                                    prev,
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    customerId:
                                                                                                        "",
                                                                                                }),
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={formData.customers.some(
                                                                                            (
                                                                                                c,
                                                                                            ) =>
                                                                                                c.id ===
                                                                                                customer.id,
                                                                                        )}
                                                                                        onCheckedChange={() => {
                                                                                            handleCustomerSelect(
                                                                                                customer,
                                                                                            );
                                                                                            if (
                                                                                                errors.customers
                                                                                            ) {
                                                                                                setErrors(
                                                                                                    (
                                                                                                        prev,
                                                                                                    ) => ({
                                                                                                        ...prev,
                                                                                                        customerId:
                                                                                                            "",
                                                                                                    }),
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium truncate">
                                                                                            {
                                                                                                customer.firstName
                                                                                            }{" "}
                                                                                            {
                                                                                                customer.lastName
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            {
                                                                                                customer.email
                                                                                            }{" "}
                                                                                            •{" "}
                                                                                            {
                                                                                                customer.phone
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}

                                                                        {/* Loading indicator */}
                                                                        {loadingCustomers && (
                                                                            <div className="flex items-center justify-center py-4">
                                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                                <span className="text-sm text-muted-foreground">
                                                                                    Loading
                                                                                    more
                                                                                    customers...
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* End of list indicator */}
                                                                        {!customerPagination.hasMore &&
                                                                            customers.length >
                                                                                0 && (
                                                                                <div className="text-center py-2 text-xs text-muted-foreground">
                                                                                    No
                                                                                    more
                                                                                    customers
                                                                                    to
                                                                                    load
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4 text-muted-foreground">
                                                                        {loadingCustomers ? (
                                                                            <div className="flex items-center justify-center">
                                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                                Loading
                                                                                customers...
                                                                            </div>
                                                                        ) : (
                                                                            "No customers found"
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.customers && (
                                                    <Alert
                                                        variant="destructive"
                                                        className="py-2"
                                                    >
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            {errors.customers}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            {/* Selected Customers Summary */}
                                            {formData.customers.length > 0 && (
                                                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Users className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm mb-1">
                                                                {
                                                                    formData
                                                                        .customers
                                                                        .length
                                                                }{" "}
                                                                customer
                                                                {formData
                                                                    .customers
                                                                    .length > 1
                                                                    ? "s"
                                                                    : ""}{" "}
                                                                selected
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {formData.customers
                                                                    .map(
                                                                        (c) =>
                                                                            `${c.firstName} ${c.lastName}`,
                                                                    )
                                                                    .join(", ")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Package Selection */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <Package className="h-4 w-4 text-primary" />
                                            Tour Package
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Select the tour package for this
                                            booking
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Select Package
                                                </Label>
                                                <Popover
                                                    open={packagePopoverOpen}
                                                    onOpenChange={
                                                        setPackagePopoverOpen
                                                    }
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${
                                                                errors.packageId
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                {selectedPackage
                                                                    ? `${
                                                                          selectedPackage.name
                                                                      } - ${BookingService.formatCurrency(
                                                                          selectedPackage.price,
                                                                      )}`
                                                                    : "Select package"}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-[400px] p-0"
                                                        align="start"
                                                    >
                                                        <div className="p-3 border-b">
                                                            <div className="relative">
                                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search packages..."
                                                                    value={
                                                                        packageSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        setPackageSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }}
                                                                    className="pl-8"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea className="h-72">
                                                            <div className="p-2">
                                                                {filteredPackages.length >
                                                                0 ? (
                                                                    <div className="space-y-1">
                                                                        {filteredPackages.map(
                                                                            (
                                                                                pkg,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        pkg.id
                                                                                    }
                                                                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        handlePackageSelect(
                                                                                            pkg,
                                                                                        );
                                                                                        setPackagePopoverOpen(
                                                                                            false,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium truncate">
                                                                                            {
                                                                                                pkg.name
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            {BookingService.formatCurrency(
                                                                                                pkg.price,
                                                                                            )}
                                                                                        </p>
                                                                                    </div>
                                                                                    {formData.packageId ===
                                                                                        pkg.id && (
                                                                                        <Check className="h-4 w-4 text-primary" />
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4 text-muted-foreground">
                                                                        No
                                                                        packages
                                                                        found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.packageId && (
                                                    <Alert
                                                        variant="destructive"
                                                        className="py-2"
                                                    >
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            {errors.packageId}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            {/* Selected Package Details */}
                                            {(() => {
                                                const selectedPackage =
                                                    packages.find(
                                                        (pkg) =>
                                                            pkg.id ===
                                                            formData.packageId,
                                                    );
                                                return (
                                                    selectedPackage && (
                                                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                    <Package className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-sm mb-1">
                                                                        {
                                                                            selectedPackage.name
                                                                        }
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        {selectedPackage.description ||
                                                                            "No description available"}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedPackage.duration && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                Duration:{" "}
                                                                                {
                                                                                    selectedPackage.duration
                                                                                }{" "}
                                                                                days
                                                                            </Badge>
                                                                        )}
                                                                        {selectedPackage.price && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                Price:
                                                                                ₹
                                                                                {
                                                                                    selectedPackage.price
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                );
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5 mt-5">
                                {/* Batch Selection */}
                                {formData.packageId && (
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                Available Batches
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                Select a batch for your travel
                                                dates
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid gap-3">
                                                {availableBatches.map(
                                                    (batch) => (
                                                        <div
                                                            key={batch.id}
                                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                                formData.batchId ===
                                                                batch.id
                                                                    ? "border-primary bg-primary/5"
                                                                    : "hover:bg-muted/50"
                                                            } ${
                                                                errors.batchId
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        batchId:
                                                                            batch.id,
                                                                    }),
                                                                );
                                                                if (
                                                                    errors.batchId
                                                                ) {
                                                                    setErrors(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            batchId:
                                                                                "",
                                                                        }),
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {new Date(
                                                                                batch.startDate,
                                                                            ).toLocaleDateString()}{" "}
                                                                            -{" "}
                                                                            {new Date(
                                                                                batch.endDate,
                                                                            ).toLocaleDateString()}
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {batch.totalSeats -
                                                                                batch.bookedSeats}{" "}
                                                                            seats
                                                                            available
                                                                            out
                                                                            of{" "}
                                                                            {
                                                                                batch.totalSeats
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Badge
                                                                    variant={
                                                                        batch.totalSeats -
                                                                            batch.bookedSeats >
                                                                        5
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                >
                                                                    {batch.totalSeats -
                                                                        batch.bookedSeats}{" "}
                                                                    Available
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            {errors.batchId && (
                                                <Alert
                                                    variant="destructive"
                                                    className="py-2 mt-3"
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {errors.batchId}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Customer Count & Total Amount */}
                                {formData.batchId &&
                                    formData.customers.length > 0 && (
                                        <Card className="border-0 shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                                    <DollarSign className="h-4 w-4 text-primary" />
                                                    Pricing Summary
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    Total amount for selected
                                                    customers
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="p-4 bg-muted/30 rounded-lg border">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">
                                                            Total Amount:
                                                        </span>
                                                        <span className="text-xl font-bold">
                                                            {BookingService.formatCurrency(
                                                                formData.totalAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-2">
                                                        {
                                                            formData.customers
                                                                .length
                                                        }{" "}
                                                        customer
                                                        {formData.customers
                                                            .length > 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        ×{" "}
                                                        {BookingService.formatCurrency(
                                                            selectedPackage?.price ||
                                                                0,
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                            </div>

                            {/* Selected Travelers */}
                            {formData.customers.length > 0 && (
                                <div className="mt-5">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Users className="h-5 w-5 text-primary" />
                                                Selected Travelers
                                            </CardTitle>
                                            <CardDescription>
                                                Managing{" "}
                                                {formData.customers.length}{" "}
                                                traveler
                                                {formData.customers.length > 1
                                                    ? "s"
                                                    : ""}{" "}
                                                for this booking
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {formData.customers.map(
                                                (customer, index) => (
                                                    <div
                                                        key={
                                                            customer.id || index
                                                        }
                                                        className="p-3 border rounded-lg bg-muted/30"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                    <Users className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="text-sm font-semibold truncate leading-none">
                                                                        {
                                                                            customer.firstName
                                                                        }{" "}
                                                                        {
                                                                            customer.lastName
                                                                        }
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                                                                        {
                                                                            customer.email
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeCustomer(
                                                                        index,
                                                                    )
                                                                }
                                                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-5">
                                {/* Payment Details */}
                                <div className="mt-5">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                Payment Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Total Amount</Label>
                                                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                        <span className="font-bold">
                                                            {BookingService.formatCurrency(
                                                                formData.totalAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="advanceAmount">
                                                        Advance Payment
                                                    </Label>
                                                    <Input
                                                        id="advanceAmount"
                                                        type="number"
                                                        min="0"
                                                        max={
                                                            formData.totalAmount
                                                        }
                                                        value={
                                                            formData.advanceAmount ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    advanceAmount:
                                                                        Number.parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {formData.advanceAmount > 0 && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="paymentMethod">
                                                                Payment Method *
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    formData.paymentMethod
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            paymentMethod:
                                                                                value as PaymentMethod,
                                                                        }),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select payment method" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="bank_transfer">
                                                                        Bank
                                                                        Transfer
                                                                    </SelectItem>
                                                                    <SelectItem value="credit_card">
                                                                        Credit
                                                                        Card
                                                                    </SelectItem>
                                                                    <SelectItem value="debit_card">
                                                                        Debit
                                                                        Card
                                                                    </SelectItem>
                                                                    <SelectItem value="cash">
                                                                        Cash
                                                                    </SelectItem>
                                                                    <SelectItem value="upi">
                                                                        UPI
                                                                    </SelectItem>
                                                                    <SelectItem value="other">
                                                                        Other
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="paymentReference">
                                                                Payment
                                                                Reference
                                                            </Label>
                                                            <Input
                                                                id="paymentReference"
                                                                value={
                                                                    formData.paymentReference
                                                                }
                                                                onChange={(e) =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            paymentReference:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                placeholder="Transaction ID, Check number, etc."
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="paymentScreenshot">
                                                            Payment
                                                            Screenshot/Receipt
                                                        </Label>
                                                        <div className="mt-2">
                                                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
                                                                <div className="text-center">
                                                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {formData.paymentScreenshot
                                                                            ? formData
                                                                                  .paymentScreenshot
                                                                                  .name
                                                                            : "Click to upload payment proof (Max 5MB)"}
                                                                    </p>
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*,.pdf"
                                                                    onChange={
                                                                        handleFileUpload
                                                                    }
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="specialRequests">
                                                    Special Requests
                                                </Label>
                                                <Textarea
                                                    id="specialRequests"
                                                    value={
                                                        formData.specialRequests
                                                    }
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            specialRequests:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Any special arrangements or requests..."
                                                    rows={3}
                                                />
                                            </div>

                                            {formData.advanceAmount > 0 && (
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Total Amount:
                                                            </span>
                                                            <span className="font-medium">
                                                                {BookingService.formatCurrency(
                                                                    formData.totalAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Advance Payment:
                                                            </span>
                                                            <span className="font-medium">
                                                                {BookingService.formatCurrency(
                                                                    formData.advanceAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-2">
                                                            <span className="font-medium">
                                                                Balance Amount:
                                                            </span>
                                                            <span className="font-bold">
                                                                {BookingService.formatCurrency(
                                                                    formData.totalAmount -
                                                                        formData.advanceAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-background flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {formData.customers.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            {formData.customers.length} customer
                                            {formData.customers.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
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
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="min-w-[120px]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Booking
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
