"use client";

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
    User,
} from "lucide-react";

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-120px)] px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6 py-4">
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
                                                {getAge(customer.dateOfBirth)}{" "}
                                                years
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                                                Date of Birth
                                            </label>
                                            <p className="text-sm font-semibold">
                                                {formatDate(
                                                    customer.dateOfBirth,
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
                                                        customer.gender,
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
