import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ICustomer } from "@/types/booking.types";
import {
    AlertCircle,
    Heart,
    Mail,
    MapPin,
    Phone,
    Shield,
    ShieldAlert,
    User,
} from "lucide-react";

import { format, isValid } from "date-fns";

interface CustomerModalProps {
    customer: ICustomer;
    batchId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reloadBatchList: () => void;
}

export function CustomerModal({
    customer,
    open,
    onOpenChange,
}: CustomerModalProps) {
    if (!customer) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return isValid(d) ? format(d, "dd-MM-yyyy") : "N/A";
    };

    const getAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const getGenderDisplay = (gender: string) => {
        switch (gender) {
            case "male":
                return "Male";
            case "female":
                return "Female";
            case "other":
                return "Other";
            case "prefer_not_to_say":
                return "Prefer not to say";
            default:
                return gender;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <User className="w-5 h-5 text-primary" />
                        Customer Details: {customer.firstName}{" "}
                        {customer.lastName}
                        {customer.isBlacklisted && (
                            <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2 py-0.5 ml-2">
                                Blacklisted
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-120px)] px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6 py-4">
                        {/* Blacklisted Warning Banner */}
                        {customer.isBlacklisted && (
                            <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-red-950/25 to-background p-4 shadow-md space-y-2 dark:border-rose-800/40">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/20 shrink-0 mt-0.5">
                                        <ShieldAlert className="w-4 h-4 animate-pulse" />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-bold tracking-wider uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                                                Blacklisted Account
                                            </span>
                                            {customer.blacklistedAt && (
                                                <span className="text-xs text-muted-foreground">
                                                    • Blacklisted on {formatDate(customer.blacklistedAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-xs">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">Reason for Blacklisting</span>
                                            <p className="font-medium text-foreground">{customer.blacklistedReason || "No reason specified"}</p>
                                        </div>
                                        {customer.blacklistedBy && (
                                            <p className="text-[11px] text-muted-foreground pt-0.5">
                                                Blacklisted by: <strong className="text-foreground font-semibold">
                                                    {[customer.blacklistedBy.firstName, customer.blacklistedBy.lastName].filter(Boolean).join(" ") || customer.blacklistedBy.email}
                                                </strong>
                                                {customer.blacklistedBy.email && (customer.blacklistedBy.firstName || customer.blacklistedBy.lastName) && (
                                                    <span className="ml-1 opacity-75">({customer.blacklistedBy.email})</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                Full Name
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {customer.firstName}{" "}
                                                {customer.middleName &&
                                                    `${customer.middleName} `}
                                                {customer.lastName}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                Age
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {customer.dateOfBirth ? getAge(customer.dateOfBirth) : "N/A"}{" "}
                                                {customer.dateOfBirth ? "years" : ""}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                Date of Birth
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {formatDate(
                                                    customer.dateOfBirth || "",
                                                )}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                Gender
                                            </label>
                                            <div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {getGenderDisplay(
                                                        customer.gender || "",
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                                <Mail className="w-3 h-3" />
                                                Email
                                            </label>
                                            <p className="text-sm font-semibold truncate">
                                                {customer.email}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                                <Phone className="w-3 h-3" />
                                                Phone
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {customer.phone}
                                            </p>
                                        </div>
                                        {customer.alternativePhone && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                    Alternative Phone
                                                </label>
                                                <p className="text-sm font-semibold">
                                                    {customer.alternativePhone}
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                                <MapPin className="w-3 h-3" />
                                                Address
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {customer.address}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Emergency Contact */}
                            {(customer.emergencyContactName ||
                                customer.emergencyContactPhone) && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-destructive" />
                                                Emergency Contact
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {customer.emergencyContactName && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Contact Name
                                                        </label>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                customer.emergencyContactName
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {customer.emergencyContactPhone && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Contact Phone
                                                        </label>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                customer.emergencyContactPhone
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {customer.emergencyContactRelation && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Relation
                                                        </label>
                                                        <div>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    customer.emergencyContactRelation
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Travel & Health Information */}
                            {(customer.specialRequests ||
                                customer.medicalConditions ||
                                customer.dietaryRestrictions) && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-pink-500" />
                                                Travel & Health Info
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {customer.specialRequests && (
                                                    <div className="space-y-2 border-l-2 border-primary/20 pl-3">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Special Requests
                                                        </label>
                                                        <p className="text-sm italic">
                                                            "
                                                            {
                                                                customer.specialRequests
                                                            }
                                                            "
                                                        </p>
                                                    </div>
                                                )}
                                                {customer.medicalConditions && (
                                                    <div className="space-y-2 border-l-2 border-destructive/20 pl-3">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Medical Conditions
                                                        </label>
                                                        <p className="text-sm">
                                                            {
                                                                customer.medicalConditions
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {customer.dietaryRestrictions && (
                                                    <div className="space-y-2 border-l-2 border-green-200 pl-3">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Dietary Restrictions
                                                        </label>
                                                        <p className="text-sm">
                                                            {
                                                                customer.dietaryRestrictions
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Identification */}
                            {(customer.passportNumber ||
                                customer.voterId ||
                                customer.aadhaarId) && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-blue-500" />
                                                Identification Documents
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {customer.passportNumber && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Passport Number
                                                        </label>
                                                        <p className="text-sm font-mono font-bold">
                                                            {
                                                                customer.passportNumber
                                                            }
                                                        </p>
                                                        {customer.passportExpiryDate && (
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Expires:{" "}
                                                                {formatDate(
                                                                    customer.passportExpiryDate,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {customer.voterId && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Voter ID
                                                        </label>
                                                        <p className="text-sm font-mono font-bold">
                                                            {customer.voterId}
                                                        </p>
                                                    </div>
                                                )}
                                                {customer.aadhaarId && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                            Aadhaar ID
                                                        </label>
                                                        <p className="text-sm font-mono font-bold">
                                                            {customer.aadhaarId}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
