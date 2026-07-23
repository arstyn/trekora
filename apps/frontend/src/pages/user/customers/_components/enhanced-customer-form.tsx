import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { ICustomer, IRelative } from "@/types/customer.type";
import { format } from "date-fns";
import { getAllStates, getDistricts } from "india-state-district";
import {
    ArrowLeft,
    ArrowRight,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    Loader2,
    Plus,
    X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { countries } from "./countries";

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder = "Search...",
    disabled = false,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    searchPlaceholder?: string;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between h-9 text-left font-normal border bg-background hover:bg-accent hover:text-accent-foreground text-sm"
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 border shadow-md bg-popover text-popover-foreground rounded-md overflow-hidden"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
                align="start"
            >
                <div className="flex flex-col h-[200px]">
                    <div className="p-2 border-b">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 max-h-[160px]">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                                No options found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between cursor-pointer ${value === option.value
                                        ? "bg-accent font-medium text-accent-foreground"
                                        : "text-foreground"
                                        }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface EnhancedCustomerFormProps {
    customer?: ICustomer;
    onSave: (customer: ICustomer) => void;
    onCancel: () => void;
}

export default function EnhancedCustomerForm({
    customer,
    onSave,
    onCancel,
}: EnhancedCustomerFormProps) {
    const [formData, setFormData] = useState<ICustomer>(() => {
        const defaults = {
            firstName: "",
            lastName: "",
            middleName: "",
            dateOfBirth: "",
            gender: "male" as const,
            email: "",
            phone: "",
            alternativePhone: "",
            address: "",
            district: "",
            state: "Kerala",
            pinCode: "",
            country: "India",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            passportNumber: "",
            passportExpiryDate: "",
            passportIssueDate: "",
            passportCountry: "",
            passportPhotos: [],
            voterId: "",
            voterIdPhotos: [],
            aadhaarId: "",
            aadhaarIdPhotos: [],
            relatives: [],
            dietaryRestrictions: "",
            medicalConditions: "",
            specialRequests: "",
            notes: "",
        };
        return customer ? { ...defaults, ...customer } : defaults;
    });

    const [relatives, setRelatives] = useState<IRelative[]>(
        formData.relatives || [],
    );
    const [files, setFiles] = useState<{ [key: string]: File[] }>({});
    const [filePreviews, setFilePreviews] = useState<{
        [key: string]: string[];
    }>({});
    const [existingImages, setExistingImages] = useState<{
        [key: string]: string[];
    }>({
        profilePhoto: customer?.profilePhoto ? [customer.profilePhoto] : [],
        passportPhotos: customer?.passportPhotos || [],
        voterIdPhotos: customer?.voterIdPhotos || [],
        aadhaarIdPhotos: customer?.aadhaarIdPhotos || [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const stateOptions = getAllStates().map((s) => ({
        value: s.name,
        label: s.name,
    }));

    const selectedStateObj = getAllStates().find((s) => s.name === formData.state);
    const districtOptions = selectedStateObj
        ? getDistricts(selectedStateObj.code).map((d) => ({
            value: d,
            label: d,
        }))
        : [];


    const parseLocalYYYYMMDD = (dateStr: string | undefined): Date | undefined => {
        if (!dateStr) return undefined;
        const parts = dateStr.split("-");
        if (parts.length !== 3) return undefined;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    };

    const toLocalYYYYMMDD = (date: Date): string => {
        return format(date, "yyyy-MM-dd");
    };

    const formatLocalString = (dateStr: string | undefined, formatStr: string = "PPP"): string => {
        const parsed = parseLocalYYYYMMDD(dateStr);
        if (!parsed) return "Select date";
        return format(parsed, formatStr);
    };

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.firstName || !formData.firstName.trim()) {
                newErrors.firstName = "First Name is required";
            }
        }

        if (currentStep === 2) {
            const isIndia = (formData.country || "India") === "India";

            if (isIndia) {
                const hasAddressInfo = !!(
                    formData.address?.trim() ||
                    formData.state ||
                    formData.district ||
                    formData.pinCode
                );

                if (hasAddressInfo) {
                    if (!formData.state) {
                        newErrors.state = "State is required";
                    }
                    if (formData.pinCode && formData.pinCode.length !== 6) {
                        newErrors.pinCode = "PIN Code must be 6 digits";
                    }
                }
            } else {
                const hasAddressInfo = !!(
                    formData.address?.trim() ||
                    formData.pinCode ||
                    formData.country?.trim()
                );

                if (hasAddressInfo) {
                    if (!formData.country || !formData.country.trim()) {
                        newErrors.country = "Country is required";
                    }
                }
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleStateChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            state: value,
            district: "",
        }));
    };

    const handleCountryChange = (value: string) => {
        if (value === "India") {
            setFormData((prev) => ({
                ...prev,
                country: value,
                state: "Kerala",
                district: "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                country: value,
                state: "",
                district: "",
            }));
        }
    };

    const handleFileUploaderChange = (field: string, newFiles: File[], maxFiles: number) => {
        if (maxFiles === 1) {
            // Revoke old previews first
            if (filePreviews[field]) {
                filePreviews[field].forEach((url) => URL.revokeObjectURL(url));
            }
            setExistingImages((prev) => ({ ...prev, [field]: [] }));
            setFiles((prev) => ({ ...prev, [field]: newFiles }));
            setFilePreviews((prev) => ({
                ...prev,
                [field]: newFiles.map((file) => URL.createObjectURL(file)),
            }));
        } else {
            setFiles((prev) => ({
                ...prev,
                [field]: [...(prev[field] || []), ...newFiles],
            }));
            setFilePreviews((prev) => ({
                ...prev,
                [field]: [
                    ...(prev[field] || []),
                    ...newFiles.map((file) => URL.createObjectURL(file)),
                ],
            }));
        }
    };

    const handleFileUploaderRemoveExisting = (field: string, index: number) => {
        setExistingImages((prev) => ({
            ...prev,
            [field]: prev[field]?.filter((_, i) => i !== index) || [],
        }));
    };

    const handleFileUploaderRemoveNew = (field: string, index: number) => {
        setFiles((prev) => ({
            ...prev,
            [field]: prev[field]?.filter((_, i) => i !== index) || [],
        }));
        setFilePreviews((prev) => {
            const previews = prev[field] || [];
            if (previews[index]) {
                URL.revokeObjectURL(previews[index]);
            }
            return {
                ...prev,
                [field]: previews.filter((_, i) => i !== index),
            };
        });
    };

    const addRelative = () => {
        setRelatives([
            ...relatives,
            { name: "", relation: "", phone: "", address: "" },
        ]);
    };

    const removeRelative = (index: number) => {
        setRelatives(relatives.filter((_, i) => i !== index));
    };

    const updateRelative = (
        index: number,
        field: keyof IRelative,
        value: string,
    ) => {
        const updated = relatives.map((rel, i) =>
            i === index ? { ...rel, [field]: value } : rel,
        );
        setRelatives(updated);
    };

    const submitFormData = async () => {
        const formDataToSubmit = new FormData();

        // Add all form fields (filter out empty values and file fields that we handle via existingImages/files)
        Object.entries(formData).forEach(([key, value]) => {
            if (
                key === "relatives" ||
                ["profilePhoto", "passportPhotos", "voterIdPhotos", "aadhaarIdPhotos"].includes(key)
            ) {
                return; // Handle separately
            }

            // Skip empty strings, null, undefined, and empty arrays
            if (
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    formDataToSubmit.append(`${key}[${index}]`, item);
                });
            } else {
                formDataToSubmit.append(key, value.toString());
            }
        });

        // Add existing images that weren't deleted
        Object.entries(existingImages).forEach(([fieldName, urls]) => {
            if (fieldName === "profilePhoto") {
                if (urls.length > 0 && urls[0]) {
                    formDataToSubmit.append("profilePhoto", urls[0]);
                }
            } else {
                urls.forEach((url, index) => {
                    formDataToSubmit.append(`${fieldName}[${index}]`, url);
                });
            }
        });

        // Add relatives (only non-empty ones)
        const validRelatives = relatives.filter(
            (relative) =>
                relative.name.trim() !== "" ||
                relative.relation.trim() !== "" ||
                relative.phone.trim() !== "" ||
                relative.address.trim() !== "",
        );

        validRelatives.forEach((relative, index) => {
            formDataToSubmit.append(`relatives[${index}][name]`, relative.name);
            formDataToSubmit.append(
                `relatives[${index}][relation]`,
                relative.relation,
            );
            formDataToSubmit.append(
                `relatives[${index}][phone]`,
                relative.phone,
            );
            formDataToSubmit.append(
                `relatives[${index}][address]`,
                relative.address,
            );
        });

        // Add files with proper field names
        Object.entries(files).forEach(([fieldName, fileArray]) => {
            fileArray.forEach((file) => {
                // Use the correct field name that backend expects
                formDataToSubmit.append(fieldName, file);
            });
        });

        try {
            setIsLoading(true);
            setError(null);

            const response = customer
                ? await axiosInstance.put(
                    `/customers/${customer.id}`,
                    formDataToSubmit,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                )
                : await axiosInstance.post("/customers", formDataToSubmit, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            onSave(response.data);
        } catch (error: any) {
            console.error("Error saving customer:", error);

            // Handle validation errors
            if (error.response?.status === 400 && error.response?.data?.errors) {
                const validationErrors = error.response.data.errors as Record<string, string>;
                const firstError = Object.values(validationErrors)[0];
                setError(firstError || "Validation failed. Please check your inputs.");
            } else {
                const errorMessage = error.response?.data?.message || error.message || "Failed to save customer. Please try again.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step < 4) {
            handleNext();
            return;
        }

        if (!validateStep(1)) {
            setError("First name is required.");
            setStep(1);
            return;
        }

        await submitFormData();
    };

    const handleSaveEarly = async () => {
        if (!validateStep(1)) {
            setError("First name is required.");
            setStep(1);
            return;
        }

        await submitFormData();
    };



    return (
        <Dialog open={true} onOpenChange={onCancel}>
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
                            {customer ? "Edit Customer" : "Add New Customer"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            {customer
                                ? "Update customer details, documentation, and preferences."
                                : "Follow the steps to add a new customer to your database."}
                        </DialogDescription>
                    </div>

                    {/* Stepper Steps */}
                    <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
                            <span className={`text-xs hidden sm:inline font-medium flex-shrink-0 ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Personal</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
                            <span className={`text-xs hidden sm:inline font-medium flex-shrink-0 ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Contact</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</span>
                            <span className={`text-xs hidden sm:inline font-medium flex-shrink-0 ${step === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Documents</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>4</span>
                            <span className={`text-xs hidden sm:inline font-medium flex-shrink-0 ${step === 4 ? 'text-foreground' : 'text-muted-foreground'}`}>Preferences</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="responsive-layout flex-1 flex overflow-hidden max-lg:overflow-visible min-h-0 p-0 m-0">
                    {/* Left Side: Step Forms */}
                    <div className="responsive-left flex-1 flex flex-col overflow-hidden max-lg:overflow-visible min-h-0 bg-background border-r">
                        <ScrollArea className="responsive-scroll flex-1 overflow-y-auto px-6 py-6 max-lg:h-auto max-lg:overflow-visible">
                            {/* STEP 1: PERSONAL DETAILS */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                                            Personal Details
                                        </h3>
                                        <div className="space-y-6">
                                            {/* Profile Photo Section */}
                                            <div className="flex flex-col items-center">
                                                <Label className="text-sm font-medium mb-2">Profile Photo</Label>
                                                <FileUploader
                                                    value={[
                                                        ...(existingImages.profilePhoto || []),
                                                        ...(files.profilePhoto || []),
                                                    ]}
                                                    onChange={(newFiles) => handleFileUploaderChange("profilePhoto", newFiles, 1)}
                                                    onRemoveExisting={(idx) => handleFileUploaderRemoveExisting("profilePhoto", idx)}
                                                    onRemoveNew={(idx) => handleFileUploaderRemoveNew("profilePhoto", idx)}
                                                    maxFiles={1}
                                                    isCircular={true}
                                                    accept="image/*"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="text-sm font-medium">
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        className={`h-9 ${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                    />
                                                    {errors.firstName && (
                                                        <p className="text-xs text-destructive font-medium">{errors.firstName}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="middleName" className="text-sm font-medium">
                                                        Middle Name
                                                    </Label>
                                                    <Input
                                                        id="middleName"
                                                        name="middleName"
                                                        value={formData.middleName}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="text-sm font-medium">
                                                        Last Name
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="gender" className="text-sm font-medium">
                                                        Gender
                                                    </Label>
                                                    <Select
                                                        value={formData.gender}
                                                        onValueChange={(value) =>
                                                            handleSelectChange("gender", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2 flex flex-col">
                                                <Label className="text-sm font-medium mb-1">
                                                    Date of Birth
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 justify-start text-left font-normal w-full"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            {formData.dateOfBirth
                                                                ? formatLocalString(formData.dateOfBirth, "PPP")
                                                                : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                formData.dateOfBirth
                                                                    ? parseLocalYYYYMMDD(formData.dateOfBirth)
                                                                    : undefined
                                                            }
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        dateOfBirth: toLocalYYYYMMDD(date),
                                                                    });
                                                                }
                                                            }}
                                                            disabled={[
                                                                { after: new Date() },
                                                                { before: new Date("1900-01-01") }
                                                            ]}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CONTACT INFORMATION */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                                            Contact & Emergency Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-sm font-medium">
                                                        Email Address
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-sm font-medium">
                                                        Phone Number
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="alternativePhone" className="text-sm font-medium">
                                                    Alternative Phone
                                                </Label>
                                                <Input
                                                    id="alternativePhone"
                                                    name="alternativePhone"
                                                    value={formData.alternativePhone}
                                                    onChange={handleChange}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address Details</Label>

                                                <div className="space-y-4">
                                                    {/* Row 1: Country & State/Zip */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Country *</Label>
                                                            <SearchableSelect
                                                                options={countries}
                                                                value={formData.country || "India"}
                                                                onChange={handleCountryChange}
                                                                placeholder="Select Country"
                                                                searchPlaceholder="Search Country..."
                                                            />
                                                            {errors.country && (
                                                                <p className="text-[11px] text-destructive font-medium">{errors.country}</p>
                                                            )}
                                                        </div>

                                                        {(formData.country || "India") === "India" ? (
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">State {formData.address || formData.district || formData.pinCode ? "*" : ""}</Label>
                                                                <SearchableSelect
                                                                    options={stateOptions}
                                                                    value={formData.state || ""}
                                                                    onChange={handleStateChange}
                                                                    placeholder="Select State"
                                                                    searchPlaceholder="Search State..."
                                                                />
                                                                {errors.state && (
                                                                    <p className="text-[11px] text-destructive font-medium">{errors.state}</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="pinCode" className="text-sm font-medium">Zip Code</Label>
                                                                <Input
                                                                    id="pinCode"
                                                                    name="pinCode"
                                                                    type="text"
                                                                    value={formData.pinCode || ""}
                                                                    onChange={handleChange}
                                                                    placeholder="Zip / Postal Code"
                                                                    className="h-9 text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Row 2: District & PIN Code (India Only) */}
                                                    {(formData.country || "India") === "India" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">District</Label>
                                                                <SearchableSelect
                                                                    options={districtOptions}
                                                                    value={formData.district || ""}
                                                                    onChange={(val) => handleSelectChange("district", val)}
                                                                    placeholder={formData.state ? "Select District" : "Select State First"}
                                                                    searchPlaceholder="Search District..."
                                                                    disabled={!formData.state}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="pinCode" className="text-sm font-medium">PIN Code</Label>
                                                                <Input
                                                                    id="pinCode"
                                                                    name="pinCode"
                                                                    type="text"
                                                                    maxLength={6}
                                                                    value={formData.pinCode || ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, ""); // Allow digits only
                                                                        setFormData({ ...formData, pinCode: val });
                                                                    }}
                                                                    placeholder="6-digit PIN"
                                                                    className="h-9 text-sm"
                                                                />
                                                                {errors.pinCode && (
                                                                    <p className="text-[11px] text-destructive font-medium">{errors.pinCode}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Row 3: Address */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="address" className="text-sm font-medium">
                                                            Address
                                                        </Label>
                                                        <Textarea
                                                            id="address"
                                                            name="address"
                                                            value={formData.address || ""}
                                                            onChange={handleChange}
                                                            placeholder="Address, Area, Building, Apartment, etc."
                                                            rows={3}
                                                            className="resize-none text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t">
                                                <h4 className="font-semibold text-base mb-3 text-foreground">
                                                    Emergency Contact
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergencyContactName" className="text-sm font-medium">
                                                            Contact Name
                                                        </Label>
                                                        <Input
                                                            id="emergencyContactName"
                                                            name="emergencyContactName"
                                                            value={formData.emergencyContactName}
                                                            onChange={handleChange}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">
                                                            Contact Phone
                                                        </Label>
                                                        <Input
                                                            id="emergencyContactPhone"
                                                            name="emergencyContactPhone"
                                                            value={formData.emergencyContactPhone}
                                                            onChange={handleChange}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergencyContactRelation" className="text-sm font-medium">
                                                            Relation
                                                        </Label>
                                                        <Input
                                                            id="emergencyContactRelation"
                                                            name="emergencyContactRelation"
                                                            value={formData.emergencyContactRelation}
                                                            onChange={handleChange}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: IDENTIFICATION DOCUMENTS */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                                            Identification & Travel Documents
                                        </h3>

                                        {/* Passport details */}
                                        <div className="mb-6 space-y-4">
                                            <h4 className="text-base font-medium text-foreground">
                                                Passport Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="passportNumber" className="text-sm font-medium">
                                                        Passport Number
                                                    </Label>
                                                    <Input
                                                        id="passportNumber"
                                                        name="passportNumber"
                                                        value={formData.passportNumber}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="passportCountry" className="text-sm font-medium">
                                                        Issuing Country
                                                    </Label>
                                                    <Input
                                                        id="passportCountry"
                                                        name="passportCountry"
                                                        value={formData.passportCountry}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2 flex flex-col">
                                                    <Label className="text-sm font-medium mb-1">
                                                        Issue Date
                                                    </Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 justify-start text-left font-normal w-full"
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                {formData.passportIssueDate
                                                                    ? formatLocalString(formData.passportIssueDate, "PPP")
                                                                    : "Select date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    formData.passportIssueDate
                                                                        ? parseLocalYYYYMMDD(formData.passportIssueDate)
                                                                        : undefined
                                                                }
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            passportIssueDate: toLocalYYYYMMDD(date),
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={[
                                                                    { after: new Date() },
                                                                    { before: new Date("1900-01-01") }
                                                                ]}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="space-y-2 flex flex-col">
                                                    <Label className="text-sm font-medium mb-1">
                                                        Expiry Date
                                                    </Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 justify-start text-left font-normal w-full"
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                {formData.passportExpiryDate
                                                                    ? formatLocalString(formData.passportExpiryDate, "PPP")
                                                                    : "Select date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    formData.passportExpiryDate
                                                                        ? parseLocalYYYYMMDD(formData.passportExpiryDate)
                                                                        : undefined
                                                                }
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            passportExpiryDate: toLocalYYYYMMDD(date),
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={{ before: new Date() }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Label className="text-sm font-medium mb-1">Passport Photos</Label>
                                                <FileUploader
                                                    value={[
                                                        ...(existingImages.passportPhotos || []),
                                                        ...(files.passportPhotos || []),
                                                    ]}
                                                    onChange={(newFiles) => handleFileUploaderChange("passportPhotos", newFiles, 10)}
                                                    onRemoveExisting={(idx) => handleFileUploaderRemoveExisting("passportPhotos", idx)}
                                                    onRemoveNew={(idx) => handleFileUploaderRemoveNew("passportPhotos", idx)}
                                                    maxFiles={10}
                                                    accept="image/*,application/pdf"
                                                />
                                            </div>
                                        </div>

                                        {/* ID Documents */}
                                        <div className="pt-4 border-t space-y-4">
                                            <h4 className="text-base font-medium text-foreground">
                                                National IDs
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="voterId" className="text-sm font-medium">
                                                        Voter ID Number
                                                    </Label>
                                                    <Input
                                                        id="voterId"
                                                        name="voterId"
                                                        value={formData.voterId}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="aadhaarId" className="text-sm font-medium">
                                                        Aadhaar ID Number
                                                    </Label>
                                                    <Input
                                                        id="aadhaarId"
                                                        name="aadhaarId"
                                                        value={formData.aadhaarId}
                                                        onChange={handleChange}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium mb-1">Voter ID Photos</Label>
                                                    <FileUploader
                                                        value={[
                                                            ...(existingImages.voterIdPhotos || []),
                                                            ...(files.voterIdPhotos || []),
                                                        ]}
                                                        onChange={(newFiles) => handleFileUploaderChange("voterIdPhotos", newFiles, 10)}
                                                        onRemoveExisting={(idx) => handleFileUploaderRemoveExisting("voterIdPhotos", idx)}
                                                        onRemoveNew={(idx) => handleFileUploaderRemoveNew("voterIdPhotos", idx)}
                                                        maxFiles={10}
                                                        accept="image/*,application/pdf"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium mb-1">Aadhaar ID Photos</Label>
                                                    <FileUploader
                                                        value={[
                                                            ...(existingImages.aadhaarIdPhotos || []),
                                                            ...(files.aadhaarIdPhotos || []),
                                                        ]}
                                                        onChange={(newFiles) => handleFileUploaderChange("aadhaarIdPhotos", newFiles, 10)}
                                                        onRemoveExisting={(idx) => handleFileUploaderRemoveExisting("aadhaarIdPhotos", idx)}
                                                        onRemoveNew={(idx) => handleFileUploaderRemoveNew("aadhaarIdPhotos", idx)}
                                                        maxFiles={10}
                                                        accept="image/*,application/pdf"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: PREFERENCES & RELATIVES */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    {/* Relatives */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                                            <h3 className="text-lg font-semibold text-primary">
                                                Relatives Information
                                            </h3>
                                            <Button
                                                type="button"
                                                onClick={addRelative}
                                                size="sm"
                                                className="h-8 px-3"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Relative
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {relatives.map((relative, idx) => (
                                                <Card key={idx} className="border-l-4 border-l-primary/60 shadow-sm">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-semibold text-sm text-foreground">
                                                                Relative {idx + 1}
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeRelative(idx)}
                                                                className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Name</Label>
                                                                <Input
                                                                    value={relative.name}
                                                                    onChange={(e) => updateRelative(idx, "name", e.target.value)}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Relation</Label>
                                                                <Input
                                                                    value={relative.relation}
                                                                    onChange={(e) => updateRelative(idx, "relation", e.target.value)}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Phone</Label>
                                                                <Input
                                                                    value={relative.phone}
                                                                    onChange={(e) => updateRelative(idx, "phone", e.target.value)}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Address</Label>
                                                                <Input
                                                                    value={relative.address}
                                                                    onChange={(e) => updateRelative(idx, "address", e.target.value)}
                                                                    className="h-9"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {relatives.length === 0 && (
                                                <div className="text-center py-6 border border-dashed rounded-lg bg-card/20">
                                                    <p className="text-xs text-muted-foreground">No relatives added yet. Click "Add Relative" if you want to link relatives.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preferences */}
                                    <div className="pt-4 border-t">
                                        <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                                            Preferences & Notes
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="dietaryRestrictions" className="text-sm font-medium">
                                                        Dietary Restrictions
                                                    </Label>
                                                    <Textarea
                                                        id="dietaryRestrictions"
                                                        name="dietaryRestrictions"
                                                        value={formData.dietaryRestrictions}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="resize-none"
                                                        placeholder="Allergies, veg/non-veg preferences..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="medicalConditions" className="text-sm font-medium">
                                                        Medical Conditions
                                                    </Label>
                                                    <Textarea
                                                        id="medicalConditions"
                                                        name="medicalConditions"
                                                        value={formData.medicalConditions}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="resize-none"
                                                        placeholder="Any medical issues or conditions..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="specialRequests" className="text-sm font-medium">
                                                        Special Requests
                                                    </Label>
                                                    <Textarea
                                                        id="specialRequests"
                                                        name="specialRequests"
                                                        value={formData.specialRequests}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="resize-none"
                                                        placeholder="Seat preferences, wheelchair, etc..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="notes" className="text-sm font-medium">
                                                        Additional Notes
                                                    </Label>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="resize-none"
                                                        placeholder="Enter any additional notes or comments..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <div className="flex-shrink-0 pt-4 border-t px-6 py-4 bg-card/10">
                            {error && (
                                <p className="text-sm text-destructive font-medium mb-3 text-center md:text-left">{error}</p>
                            )}
                            <div className="grid grid-cols-3 items-center w-full">
                                {/* Left: Cancel */}
                                <div className="flex justify-start">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancel}
                                        className="h-9 px-4"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                {/* Center: Back & Next */}
                                <div className="flex justify-center gap-2">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            className="h-9 px-4"
                                            disabled={isLoading}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                    )}
                                    {step < 4 && (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="h-9 px-4"
                                            disabled={isLoading}
                                        >
                                            Next
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Right: Save/Submit */}
                                <div className="flex justify-end">
                                    {step < 4 ? (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleSaveEarly}
                                            className="h-9 px-4 font-semibold text-primary hover:bg-primary/10 hover:text-primary min-w-[100px]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save"
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="h-9 px-4 min-w-[120px]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    {customer ? "Update Customer" : "Add Customer"}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Customer Live Summary Preview */}
                    <div className="w-80 border-l bg-card/40 hidden lg:flex flex-col flex-shrink-0">
                        <div className="p-5 border-b bg-card">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Customer Preview</h3>
                        </div>
                        <ScrollArea className="flex-1 p-5">
                            <div className="space-y-6">
                                {/* Profile photo and Name */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center relative">
                                        {filePreviews.profilePhoto?.[0] ? (
                                            <img src={filePreviews.profilePhoto[0]} alt="Preview" className="w-full h-full object-cover" />
                                        ) : existingImages.profilePhoto?.[0] ? (
                                            <img src={existingImages.profilePhoto[0]} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-foreground truncate max-w-[220px]">
                                            {[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ") || "Unnamed Customer"}
                                        </h4>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                                            {formData.gender || "Gender unspecified"}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Summary */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Details</h4>
                                    <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                        <div className="flex justify-between gap-2">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-medium text-foreground truncate max-w-[150px]">{formData.phone || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium text-foreground truncate max-w-[150px]">{formData.email || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-muted-foreground">DOB:</span>
                                            <span className="font-medium text-foreground">
                                                {formData.dateOfBirth ? formatLocalString(formData.dateOfBirth, "PP") : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Document checklist summary */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Documents Provided</h4>
                                    <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Passport:</span>
                                            <span className={`font-semibold ${formData.passportNumber ? "text-green-600" : "text-amber-500"}`}>
                                                {formData.passportNumber ? "Yes" : "No"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Aadhaar:</span>
                                            <span className={`font-semibold ${formData.aadhaarId ? "text-green-600" : "text-amber-500"}`}>
                                                {formData.aadhaarId ? "Yes" : "No"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Voter ID:</span>
                                            <span className={`font-semibold ${formData.voterId ? "text-green-600" : "text-amber-500"}`}>
                                                {formData.voterId ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Extras Summary */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Extras</h4>
                                    <div className="space-y-1.5 p-3 rounded-xl border bg-background text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Relatives:</span>
                                            <span className="font-semibold text-foreground">{relatives.length}</span>
                                        </div>
                                        {formData.dietaryRestrictions && (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-muted-foreground">Dietary:</span>
                                                <span className="text-[10px] text-foreground bg-accent/30 p-1.5 rounded line-clamp-2">{formData.dietaryRestrictions}</span>
                                            </div>
                                        )}
                                        {formData.specialRequests && (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-muted-foreground">Special Request:</span>
                                                <span className="text-[10px] text-foreground bg-accent/30 p-1.5 rounded line-clamp-2">{formData.specialRequests}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </form>
            </DialogContent>

        </Dialog>
    );
}
