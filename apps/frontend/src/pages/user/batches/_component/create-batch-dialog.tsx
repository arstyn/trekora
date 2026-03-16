import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { IPackages } from "@/types/package.schema";
import {
    CalendarIcon,
    X,
    Users,
    Calendar,
    UserPlus,
    Package,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Plus,
    Search,
} from "lucide-react";
import type React from "react";
import { useLayoutEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateBatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBatchDialog({
    open,
    onOpenChange,
}: CreateBatchDialogProps) {
    const [packages, setPackages] = useState<IPackages[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coordinatorSearch, setCoordinatorSearch] = useState("");
    const [packageSearch, setPackageSearch] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        packageId: "",
        startDate: "",
        endDate: "",
        totalSeats: "",
        coordinators: [] as IEmployee[],
    });

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
                        .includes(packageSearch.toLowerCase())),
        );
    }, [packages, packageSearch]);

    // Form validation
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.packageId)
            newErrors.packageId = "Please select a tour package";
        if (!formData.startDate)
            newErrors.startDate = "Please select a start date";
        if (!formData.endDate) newErrors.endDate = "Please select an end date";
        if (!formData.totalSeats || parseInt(formData.totalSeats) < 1) {
            newErrors.totalSeats = "Please enter a valid number of seats";
        }
        if (
            formData.startDate &&
            formData.endDate &&
            new Date(formData.startDate) >= new Date(formData.endDate)
        ) {
            newErrors.endDate = "End date must be after start date";
        }
        if (formData.coordinators.length === 0) {
            newErrors.coordinators = "Please select at least one coordinator";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        }
    }, [open]);

    const removeCoordinator = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            coordinators: prev.coordinators.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                coordinators: formData.coordinators.map((c) => c.id),
            };
            await axiosInstance.post(`/batches`, payload);

            toast.success("Batch created successfully!");
            onOpenChange(false);

            // Reset form
            setFormData({
                packageId: "",
                startDate: "",
                endDate: "",
                totalSeats: "",
                coordinators: [],
            });
            setErrors({});
            setPackageSearch("");
            setCoordinatorSearch("");
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to create batch");
            }
        } finally {
            setIsSubmitting(false);
        }
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
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-4xl w-full max-h-[95vh] p-0 flex flex-col">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Batch
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading data...
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="space-y-6 p-5 overflow-auto grid grid-cols-2 gap-5">
                            <div className="space-y-5">
                                {/* Tour Package Selection */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <Package className="h-4 w-4 text-primary" />
                                            Tour Package
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Select the tour package for this
                                            batch
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {/* Package Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Select Package
                                                </Label>
                                                <Popover>
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
                                                                {(() => {
                                                                    const selectedPackage =
                                                                        packages.find(
                                                                            (
                                                                                pkg,
                                                                            ) =>
                                                                                pkg.id ===
                                                                                formData.packageId,
                                                                        );
                                                                    return (
                                                                        selectedPackage?.name ||
                                                                        "Select a tour package"
                                                                    );
                                                                })()}
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
                                                                    ) =>
                                                                        setPackageSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="pl-8"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea className="max-h-60">
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
                                                                                    onClick={() => {
                                                                                        setFormData(
                                                                                            (
                                                                                                prev,
                                                                                            ) => ({
                                                                                                ...prev,
                                                                                                packageId:
                                                                                                    pkg.id,
                                                                                            }),
                                                                                        );
                                                                                        // Clear error when user selects
                                                                                        if (
                                                                                            errors.packageId
                                                                                        ) {
                                                                                            setErrors(
                                                                                                (
                                                                                                    prev,
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    packageId:
                                                                                                        "",
                                                                                                }),
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            formData.packageId ===
                                                                                            pkg.id
                                                                                        }
                                                                                        onCheckedChange={() => {
                                                                                            setFormData(
                                                                                                (
                                                                                                    prev,
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    packageId:
                                                                                                        pkg.id,
                                                                                                }),
                                                                                            );
                                                                                            // Clear error when user selects
                                                                                            if (
                                                                                                errors.packageId
                                                                                            ) {
                                                                                                setErrors(
                                                                                                    (
                                                                                                        prev,
                                                                                                    ) => ({
                                                                                                        ...prev,
                                                                                                        packageId:
                                                                                                            "",
                                                                                                    }),
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium truncate">
                                                                                            {
                                                                                                pkg.name
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            {pkg.description ||
                                                                                                "No description available"}
                                                                                        </p>
                                                                                    </div>
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
                                                                        {selectedPackage.maxGuests && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                Max:{" "}
                                                                                {
                                                                                    selectedPackage.maxGuests
                                                                                }{" "}
                                                                                people
                                                                            </Badge>
                                                                        )}
                                                                        {selectedPackage.category && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                Category:{" "}
                                                                                {
                                                                                    selectedPackage.category
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

                                {/* Date and Capacity Information */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Schedule & Capacity
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Set the batch schedule and total
                                            capacity
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Start Date */}
                                            <div className="space-y-2 pb-5">
                                                <Label
                                                    htmlFor="startDate"
                                                    className="text-sm font-medium"
                                                >
                                                    Start Date
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full justify-start text-left font-normal ${
                                                                !formData.startDate
                                                                    ? "text-muted-foreground"
                                                                    : ""
                                                            } ${
                                                                errors.startDate
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {formData.startDate &&
                                                            !isNaN(
                                                                new Date(
                                                                    formData.startDate,
                                                                ).getTime(),
                                                            ) ? (
                                                                format(
                                                                    new Date(
                                                                        formData.startDate,
                                                                    ),
                                                                    "MMM dd, yyyy",
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Select start
                                                                    date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={
                                                                formData.startDate
                                                                    ? new Date(
                                                                          formData.startDate,
                                                                      )
                                                                    : undefined
                                                            }
                                                            onSelect={(
                                                                date,
                                                            ) => {
                                                                if (date) {
                                                                    // Use local date to avoid timezone issues
                                                                    const year =
                                                                        date.getFullYear();
                                                                    const month =
                                                                        String(
                                                                            date.getMonth() +
                                                                                1,
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        );
                                                                    const day =
                                                                        String(
                                                                            date.getDate(),
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        );
                                                                    const localDateString = `${year}-${month}-${day}`;

                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            startDate:
                                                                                localDateString,
                                                                        }),
                                                                    );

                                                                    // Clear error when user selects
                                                                    if (
                                                                        errors.startDate
                                                                    ) {
                                                                        setErrors(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                startDate:
                                                                                    "",
                                                                            }),
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            disabled={(date) =>
                                                                date <
                                                                new Date(
                                                                    new Date().setHours(
                                                                        0,
                                                                        0,
                                                                        0,
                                                                        0,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.startDate && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.startDate}
                                                    </p>
                                                )}
                                            </div>

                                            {/* End Date */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="endDate"
                                                    className="text-sm font-medium"
                                                >
                                                    End Date
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full justify-start text-left font-normal ${
                                                                !formData.endDate
                                                                    ? "text-muted-foreground"
                                                                    : ""
                                                            } ${
                                                                errors.endDate
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {formData.endDate &&
                                                            !isNaN(
                                                                new Date(
                                                                    formData.endDate,
                                                                ).getTime(),
                                                            ) ? (
                                                                format(
                                                                    new Date(
                                                                        formData.endDate,
                                                                    ),
                                                                    "MMM dd, yyyy",
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Select end
                                                                    date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={
                                                                formData.endDate
                                                                    ? new Date(
                                                                          formData.endDate,
                                                                      )
                                                                    : undefined
                                                            }
                                                            onSelect={(
                                                                date,
                                                            ) => {
                                                                if (date) {
                                                                    // Use local date to avoid timezone issues
                                                                    const year =
                                                                        date.getFullYear();
                                                                    const month =
                                                                        String(
                                                                            date.getMonth() +
                                                                                1,
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        );
                                                                    const day =
                                                                        String(
                                                                            date.getDate(),
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        );
                                                                    const localDateString = `${year}-${month}-${day}`;

                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            endDate:
                                                                                localDateString,
                                                                        }),
                                                                    );

                                                                    // Clear error when user selects
                                                                    if (
                                                                        errors.endDate
                                                                    ) {
                                                                        setErrors(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                endDate:
                                                                                    "",
                                                                            }),
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            disabled={(
                                                                date,
                                                            ) => {
                                                                const today =
                                                                    new Date(
                                                                        new Date().setHours(
                                                                            0,
                                                                            0,
                                                                            0,
                                                                            0,
                                                                        ),
                                                                    );
                                                                const startDate =
                                                                    formData.startDate
                                                                        ? new Date(
                                                                              formData.startDate,
                                                                          )
                                                                        : today;
                                                                return (
                                                                    date <
                                                                    startDate
                                                                );
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.endDate && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.endDate}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Total Seats */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="totalSeats"
                                                className="text-sm font-medium"
                                            >
                                                Total Seats
                                            </Label>
                                            <Input
                                                id="totalSeats"
                                                type="number"
                                                min="1"
                                                placeholder="Enter number of seats"
                                                value={formData.totalSeats}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        totalSeats:
                                                            e.target.value,
                                                    }));
                                                    // Clear error when user types
                                                    if (errors.totalSeats) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            totalSeats: "",
                                                        }));
                                                    }
                                                }}
                                                className={
                                                    errors.totalSeats
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                                required
                                            />
                                            {errors.totalSeats && (
                                                <p className="text-sm text-destructive">
                                                    {errors.totalSeats}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                {/* Coordinators Selection */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <Users className="h-4 w-4 text-primary" />
                                            Coordinators
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Select team members to coordinate
                                            this batch
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {/* Search and Select Coordinators */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Add Coordinators
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={`w-full justify-between ${
                                                                errors.coordinators
                                                                    ? "border-destructive"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <UserPlus className="h-4 w-4" />
                                                                {formData
                                                                    .coordinators
                                                                    .length > 0
                                                                    ? `${
                                                                          formData
                                                                              .coordinators
                                                                              .length
                                                                      } coordinator${
                                                                          formData
                                                                              .coordinators
                                                                              .length >
                                                                          1
                                                                              ? "s"
                                                                              : ""
                                                                      } selected`
                                                                    : "Select coordinators"}
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
                                                                    placeholder="Search coordinators..."
                                                                    value={
                                                                        coordinatorSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setCoordinatorSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="pl-8"
                                                                />
                                                            </div>
                                                        </div>
                                                        <ScrollArea className="max-h-60">
                                                            <div className="p-2">
                                                                {filteredEmployees.length >
                                                                0 ? (
                                                                    <div className="space-y-1">
                                                                        {filteredEmployees.map(
                                                                            (
                                                                                emp,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        emp.id
                                                                                    }
                                                                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                                                    onClick={() =>
                                                                                        toggleCoordinator(
                                                                                            emp,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={formData.coordinators.some(
                                                                                            (
                                                                                                c,
                                                                                            ) =>
                                                                                                c.id ===
                                                                                                emp.id,
                                                                                        )}
                                                                                        onCheckedChange={() =>
                                                                                            toggleCoordinator(
                                                                                                emp,
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-medium truncate">
                                                                                            {
                                                                                                emp.name
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            {
                                                                                                emp.email
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4 text-muted-foreground">
                                                                        No
                                                                        coordinators
                                                                        found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.coordinators && (
                                                    <Alert
                                                        variant="destructive"
                                                        className="py-2"
                                                    >
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            {
                                                                errors.coordinators
                                                            }
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            {/* Selected Coordinators */}
                                            {formData.coordinators.length >
                                                0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Selected Coordinators (
                                                        {
                                                            formData
                                                                .coordinators
                                                                .length
                                                        }
                                                        )
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {formData.coordinators.map(
                                                            (
                                                                coordinator,
                                                                index,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        coordinator.id
                                                                    }
                                                                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <span className="text-sm font-medium text-primary">
                                                                                {coordinator.name
                                                                                    .charAt(
                                                                                        0,
                                                                                    )
                                                                                    .toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm">
                                                                                {
                                                                                    coordinator.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {
                                                                                    coordinator.phone
                                                                                }{" "}
                                                                                •{" "}
                                                                                {
                                                                                    coordinator.email
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            removeCoordinator(
                                                                                index,
                                                                            )
                                                                        }
                                                                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-background flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {formData.coordinators.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            {formData.coordinators.length}{" "}
                                            coordinator
                                            {formData.coordinators.length > 1
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
                                        onClick={() => onOpenChange(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[120px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Batch
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
