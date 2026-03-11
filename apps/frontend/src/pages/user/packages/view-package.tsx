import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OptimizedImage } from "@/components/optimized-image";
import axiosInstance from "@/lib/axios";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import type { IPackages } from "@/types/package.schema";
import {
    Calendar,
    CheckCircle,
    Edit,
    IndianRupee,
    MapPin,
    Users,
    XCircle,
    History,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PackageLogsModal } from "./_component/package-logs-modal";
import {
    HeroSkeleton,
    ItinerarySkeleton,
    OverviewSkeleton,
    PaymentCancellationSkeleton,
    RequirementsSkeleton,
    SidebarSkeleton,
} from "./_component/package-skeleton";

export default function ViewPackagePage() {
    const { id } = useParams<{ id: string }>();

    // Split states for progressive loading
    const [basicData, setBasicData] = useState<IPackages>();
    const [itinerary, setItinerary] = useState<IPackages["itinerary"]>();
    const [paymentsAndCancellation, setPaymentsAndCancellation] = useState<{
        paymentStructure: IPackages["paymentStructure"];
        cancellationStructure: IPackages["cancellationStructure"];
        cancellationPolicy: IPackages["cancellationPolicy"];
    }>();
    const [requirements, setRequirements] = useState<{
        documentRequirements: IPackages["documentRequirements"];
        preTripChecklist: IPackages["preTripChecklist"];
    }>();
    const [logistics, setLogistics] = useState<{
        transportation: IPackages["transportation"];
        mealsBreakdown: IPackages["mealsBreakdown"];
    }>();

    // Loading states
    const [loadingBasic, setLoadingBasic] = useState(true);
    const [loadingItinerary, setLoadingItinerary] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [loadingRequirements, setLoadingRequirements] = useState(true);
    const [loadingLogistics, setLoadingLogistics] = useState(true);
    const [isLogsOpen, setIsLogsOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Fetch basic info first
        const fetchBasic = async () => {
            setLoadingBasic(true);
            try {
                const res = await axiosInstance.get<IPackages>(
                    `/packages/${id}/basic`,
                );
                setBasicData(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load basic info");
            } finally {
                setLoadingBasic(false);
            }
        };

        // Other fetches can run in parallel but update independently
        const fetchItinerary = async () => {
            setLoadingItinerary(true);
            try {
                const res = await axiosInstance.get<IPackages["itinerary"]>(
                    `/packages/${id}/itinerary`,
                );
                setItinerary(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load itinerary");
            } finally {
                setLoadingItinerary(false);
            }
        };

        const fetchPayments = async () => {
            setLoadingPayments(true);
            try {
                const res = await axiosInstance.get<any>(
                    `/packages/${id}/payments-cancellation`,
                );
                setPaymentsAndCancellation(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load payments");
            } finally {
                setLoadingPayments(false);
            }
        };

        const fetchRequirements = async () => {
            setLoadingRequirements(true);
            try {
                const res = await axiosInstance.get<any>(
                    `/packages/${id}/requirements`,
                );
                setRequirements(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load requirements");
            } finally {
                setLoadingRequirements(false);
            }
        };

        const fetchLogistics = async () => {
            setLoadingLogistics(true);
            try {
                const res = await axiosInstance.get<any>(
                    `/packages/${id}/logistics`,
                );

                setLogistics(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load logistics");
            } finally {
                setLoadingLogistics(false);
            }
        };

        fetchBasic();
        fetchItinerary();
        fetchPayments();
        fetchRequirements();
        fetchLogistics();
    }, [id]);

    if (loadingBasic || !basicData) {
        return (
            <div className="min-h-screen">
                <HeroSkeleton />
                <main className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <OverviewSkeleton />
                            <ItinerarySkeleton />
                            <PaymentCancellationSkeleton />
                            <RequirementsSkeleton />
                        </div>
                        <SidebarSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            {/* Header */}
            {/* Hero Section */}
            <section className="relative">
                <div className="h-96 relative">
                    <div>
                        <OptimizedImage
                            src={(() => {
                                if (basicData?.thumbnail) {
                                    return getFileUrl(
                                        getServeFileUrl(basicData.thumbnail),
                                    );
                                }
                                return undefined;
                            })()}
                            alt={basicData.name || ""}
                            className="object-cover opacity-30 w-full h-96"
                            containerClassName="w-full h-96"
                        />
                    </div>
                    <div className="absolute inset-0 bg-opacity-40" />
                    <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Badge
                                variant={
                                    basicData.status === "published"
                                        ? "default"
                                        : "secondary"
                                }
                                className="text-sm"
                            >
                                {basicData.status}
                            </Badge>
                            <Badge
                                variant={
                                    basicData.packageLocation?.type ===
                                    "international"
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                {basicData.packageLocation?.type}
                            </Badge>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">
                            {basicData.name || "Untitled Package"}
                        </h2>
                        <p className=" flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {basicData.destination || "Destination not set"}
                        </p>
                    </div>
                </div>
                <div className="absolute top-5 right-5 flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setIsLogsOpen(true)}
                    >
                        <History className="w-4 h-4 mr-2" />
                        View Logs
                    </Button>
                    <NavLink to={`/packages/edit/${id}`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Package
                        </Button>
                    </NavLink>
                </div>
            </section>

            {/* Main Content */}
            <main className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Package Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Package Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className=" leading-relaxed">
                                    {basicData.description ||
                                        "Package description not available yet."}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                                        <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <div className="text-sm text-muted-foreground">
                                            Duration
                                        </div>
                                        <div className="font-semibold">
                                            {basicData.duration || "Not set"}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                                        <IndianRupee className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <div className="text-sm text-muted-foreground">
                                            Price
                                        </div>
                                        <div className="font-semibold">
                                            ₹{basicData.price || 0}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                                        <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <div className="text-sm text-muted-foreground">
                                            Max Guests
                                        </div>
                                        <div className="font-semibold">
                                            {basicData.maxGuests || "Not set"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Itinerary */}
                        {loadingItinerary ? (
                            <ItinerarySkeleton />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Itinerary</CardTitle>
                                    <CardDescription>
                                        {itinerary?.length ?? 0} days of amazing
                                        experiences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {itinerary && itinerary.length > 0 ? (
                                        itinerary.map((day, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-lg p-6"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                                        {day?.day || index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold">
                                                            {day?.title ||
                                                                `Day ${index + 1}`}
                                                        </h3>
                                                        <p>
                                                            {day?.description ||
                                                                "No description available"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Day Images */}
                                                {day?.images &&
                                                    day.images.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                            {day.images.map(
                                                                (
                                                                    image,
                                                                    imageIndex,
                                                                ) => (
                                                                    <OptimizedImage
                                                                        key={
                                                                            imageIndex
                                                                        }
                                                                        src={(() => {
                                                                            if (
                                                                                image
                                                                            ) {
                                                                                return getFileUrl(
                                                                                    getServeFileUrl(
                                                                                        image,
                                                                                    ),
                                                                                );
                                                                            }
                                                                            return undefined;
                                                                        })()}
                                                                        alt={`Day ${
                                                                            day?.day ||
                                                                            index +
                                                                                1
                                                                        } - Image ${
                                                                            imageIndex +
                                                                            1
                                                                        }`}
                                                                        className="rounded-lg object-cover h-48 w-full"
                                                                        containerClassName="h-48 rounded-lg"
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Activities
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {day?.activities &&
                                                            day.activities
                                                                .length > 0 ? (
                                                                day.activities.map(
                                                                    (
                                                                        activity,
                                                                        actIndex,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                actIndex
                                                                            }
                                                                            className="flex items-start gap-2"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                                            <span>
                                                                                {activity ||
                                                                                    "Activity not specified"}
                                                                            </span>
                                                                        </li>
                                                                    ),
                                                                )
                                                            ) : (
                                                                <li className="text-muted-foreground text-sm">
                                                                    No
                                                                    activities
                                                                    planned yet
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Details
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Meals:
                                                                </span>
                                                                <span>
                                                                    {day?.meals &&
                                                                    day.meals
                                                                        .length >
                                                                        0
                                                                        ? day.meals.join(
                                                                              ", ",
                                                                          )
                                                                        : "None"}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Accommodation:
                                                                </span>
                                                                <span>
                                                                    {day?.accommodation ||
                                                                        "Not specified"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>
                                                No itinerary has been created
                                                yet.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment & Cancellation Structure */}
                        {loadingPayments ? (
                            <PaymentCancellationSkeleton />
                        ) : (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Structure</CardTitle>
                                        <CardDescription>
                                            How and when to pay for this package
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {paymentsAndCancellation?.paymentStructure &&
                                            paymentsAndCancellation
                                                .paymentStructure.length > 0 ? (
                                                paymentsAndCancellation.paymentStructure.map(
                                                    (milestone: any, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-4 border rounded-lg"
                                                        >
                                                            <div>
                                                                <h4 className="font-semibold">
                                                                    {milestone?.name ||
                                                                        "Payment Milestone"}
                                                                </h4>
                                                                <p className="text-sm ">
                                                                    {milestone?.description ||
                                                                        "No description"}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-primary">
                                                                    ₹
                                                                    {milestone?.amount ||
                                                                        0}
                                                                </div>
                                                                <div className="text-sm  capitalize">
                                                                    {milestone?.dueDate?.replace(
                                                                        "_",
                                                                        " ",
                                                                    ) ||
                                                                        "Not specified"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>
                                                        No payment structure has
                                                        been defined yet.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Cancellation Policy
                                        </CardTitle>
                                        <CardDescription>
                                            Cancellation fees and terms
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold">
                                                Cancellation Fees
                                            </h4>
                                            {paymentsAndCancellation?.cancellationStructure &&
                                            paymentsAndCancellation
                                                .cancellationStructure.length >
                                                0 ? (
                                                paymentsAndCancellation.cancellationStructure.map(
                                                    (tier, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3  rounded-lg"
                                                        >
                                                            <div>
                                                                <span className="font-medium">
                                                                    {tier?.timeframe ||
                                                                        "Not specified"}
                                                                </span>
                                                                <p className="text-sm ">
                                                                    {tier?.description ||
                                                                        "No description"}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline">
                                                                ₹
                                                                {tier?.amount ||
                                                                    0}{" "}
                                                                fee
                                                            </Badge>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-muted-foreground text-sm">
                                                    <p>
                                                        No cancellation
                                                        structure has been
                                                        defined yet.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-semibold">
                                                Policy Terms
                                            </h4>
                                            <ul className="space-y-2">
                                                {paymentsAndCancellation?.cancellationPolicy &&
                                                paymentsAndCancellation
                                                    .cancellationPolicy.length >
                                                    0 ? (
                                                    paymentsAndCancellation.cancellationPolicy.map(
                                                        (point: any, index) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                                <span>
                                                                    {typeof point ===
                                                                    "string"
                                                                        ? point
                                                                        : point &&
                                                                            typeof point ===
                                                                                "object" &&
                                                                            "text" in
                                                                                point
                                                                          ? (
                                                                                point as {
                                                                                    text: string;
                                                                                }
                                                                            )
                                                                                .text
                                                                          : "Policy term not available"}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )
                                                ) : (
                                                    <li className="text-muted-foreground text-sm">
                                                        No cancellation policy
                                                        terms have been defined
                                                        yet.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Requirements & Checklist */}
                        {loadingRequirements ? (
                            <RequirementsSkeleton />
                        ) : (
                            <div className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Document Requirements
                                        </CardTitle>
                                        <CardDescription>
                                            Required documents for all travelers
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold mb-3 text-blue-600">
                                                    All Travelers
                                                </h4>
                                                <div className="space-y-3">
                                                    {requirements?.documentRequirements &&
                                                    requirements
                                                        .documentRequirements
                                                        .length > 0 ? (
                                                        requirements.documentRequirements
                                                            .filter(
                                                                (doc) =>
                                                                    doc?.applicableFor ===
                                                                    "all",
                                                            )
                                                            .map(
                                                                (
                                                                    doc,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="p-3 border rounded-lg"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h5 className="font-medium">
                                                                                {doc?.name ||
                                                                                    "Document"}
                                                                            </h5>
                                                                            {doc?.mandatory && (
                                                                                <Badge
                                                                                    variant="destructive"
                                                                                    className="text-xs"
                                                                                >
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm ">
                                                                            {doc?.description ||
                                                                                "No description available"}
                                                                        </p>
                                                                    </div>
                                                                ),
                                                            )
                                                    ) : (
                                                        <div className="text-muted-foreground text-sm">
                                                            No documents
                                                            required for all
                                                            travelers.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-3 text-green-600">
                                                    Children Only
                                                </h4>
                                                <div className="space-y-3">
                                                    {requirements?.documentRequirements &&
                                                    requirements
                                                        .documentRequirements
                                                        .length > 0 ? (
                                                        requirements.documentRequirements
                                                            .filter(
                                                                (doc) =>
                                                                    doc?.applicableFor ===
                                                                    "children",
                                                            )
                                                            .map(
                                                                (
                                                                    doc,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="p-3 border rounded-lg"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h5 className="font-medium">
                                                                                {doc?.name ||
                                                                                    "Document"}
                                                                            </h5>
                                                                            {doc?.mandatory && (
                                                                                <Badge
                                                                                    variant="destructive"
                                                                                    className="text-xs"
                                                                                >
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm ">
                                                                            {doc?.description ||
                                                                                "No description available"}
                                                                        </p>
                                                                    </div>
                                                                ),
                                                            )
                                                    ) : (
                                                        <div className="text-muted-foreground text-sm">
                                                            No specific
                                                            documents required
                                                            for children.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Meals Breakdown */}
                        {loadingLogistics ? (
                            <div className="h-40 w-full animate-pulse bg-muted rounded-lg" />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Meals Included</CardTitle>
                                    <CardDescription>
                                        What's included in each meal
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {logistics?.mealsBreakdown &&
                                        Object.keys(logistics.mealsBreakdown)
                                            .length > 0 ? (
                                            Object.entries(
                                                logistics.mealsBreakdown,
                                            ).map(([mealType, items]) => (
                                                <React.Fragment key={mealType}>
                                                    {[
                                                        "breakfast",
                                                        "lunch",
                                                        "dinner",
                                                    ].includes(
                                                        mealType?.toLowerCase(),
                                                    ) && (
                                                        <div>
                                                            <h4 className="font-semibold mb-3 capitalize text-primary">
                                                                {mealType}
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {(items as any) &&
                                                                (items as any)
                                                                    ?.length >
                                                                    0 ? (
                                                                    (
                                                                        items as any
                                                                    )?.map(
                                                                        (
                                                                            item: any,
                                                                            index: number,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-start gap-2"
                                                                            >
                                                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                                                <span className=" text-sm">
                                                                                    {item ||
                                                                                        "Item not specified"}
                                                                                </span>
                                                                            </li>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <li className="text-muted-foreground text-sm">
                                                                        No items
                                                                        specified
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-8 text-muted-foreground">
                                                <p>
                                                    No meal breakdown has been
                                                    provided yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Transportation */}
                        {loadingLogistics ? (
                            <div className="h-60 w-full animate-pulse bg-muted rounded-lg" />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transportation</CardTitle>
                                    <CardDescription>
                                        How you'll get there and around
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold mb-2">
                                                    To Destination
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Mode:</span>
                                                        <span className="capitalize">
                                                            {logistics
                                                                ?.transportation
                                                                ?.toDestination
                                                                ?.mode ||
                                                                "Not specified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Details:</span>
                                                        <span>
                                                            {logistics
                                                                ?.transportation
                                                                ?.toDestination
                                                                ?.details ||
                                                                "Not specified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Included:</span>
                                                        <Badge
                                                            variant={
                                                                logistics
                                                                    ?.transportation
                                                                    ?.toDestination
                                                                    ?.included
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {logistics
                                                                ?.transportation
                                                                ?.toDestination
                                                                ?.included
                                                                ? "Yes"
                                                                : "No"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold mb-2">
                                                    From Destination
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Mode:</span>
                                                        <span className="capitalize">
                                                            {logistics
                                                                ?.transportation
                                                                ?.fromDestination
                                                                ?.mode ||
                                                                "Not specified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Details:</span>
                                                        <span>
                                                            {logistics
                                                                ?.transportation
                                                                ?.fromDestination
                                                                ?.details ||
                                                                "Not specified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Included:</span>
                                                        <Badge
                                                            variant={
                                                                logistics
                                                                    ?.transportation
                                                                    ?.fromDestination
                                                                    ?.included
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {logistics
                                                                ?.transportation
                                                                ?.fromDestination
                                                                ?.included
                                                                ? "Yes"
                                                                : "No"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">
                                                During Trip
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Mode:</span>
                                                    <span className="capitalize">
                                                        {logistics
                                                            ?.transportation
                                                            ?.duringTrip
                                                            ?.mode ||
                                                            "Not specified"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Details:</span>
                                                    <span>
                                                        {logistics
                                                            ?.transportation
                                                            ?.duringTrip
                                                            ?.details ||
                                                            "Not specified"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Included:</span>
                                                    <Badge
                                                        variant={
                                                            logistics
                                                                ?.transportation
                                                                ?.duringTrip
                                                                ?.included
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                    >
                                                        {logistics
                                                            ?.transportation
                                                            ?.duringTrip
                                                            ?.included
                                                            ? "Yes"
                                                            : "No"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm ">
                                        Package Type:
                                    </span>
                                    <Badge
                                        variant={
                                            basicData.packageLocation?.type ===
                                            "international"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {basicData.packageLocation?.type ||
                                            "Not set"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm ">Country:</span>
                                    <span className="text-sm font-medium">
                                        {basicData.packageLocation?.country ||
                                            "Not specified"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm ">Category:</span>
                                    <span className="text-sm font-medium capitalize">
                                        {basicData.category || "Not set"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inclusions & Exclusions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What's Included</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">
                                        Included
                                    </h4>
                                    <div className="space-y-1">
                                        {basicData.inclusions &&
                                        basicData.inclusions.length > 0 ? (
                                            basicData.inclusions.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-primary" />
                                                        <span className="text-sm">
                                                            {typeof item ===
                                                            "string"
                                                                ? item
                                                                : (item as any)
                                                                      ?.item ||
                                                                  "Inclusion not specified"}
                                                        </span>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="text-muted-foreground text-sm">
                                                No inclusions specified yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-destructive mb-2">
                                        Not Included
                                    </h4>
                                    <div className="space-y-1">
                                        {basicData.exclusions &&
                                        basicData.exclusions.length > 0 ? (
                                            basicData.exclusions.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4 text-destructive" />
                                                        <span className="text-sm">
                                                            {typeof item ===
                                                            "string"
                                                                ? item
                                                                : (item as any)
                                                                      ?.item ||
                                                                  "Exclusion not specified"}
                                                        </span>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="text-muted-foreground text-sm">
                                                No exclusions specified yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Pre-trip Checklist</CardTitle>
                                <CardDescription>
                                    Tasks to complete before departure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-5">
                                    {requirements?.preTripChecklist &&
                                    requirements.preTripChecklist.length > 0 ? (
                                        requirements.preTripChecklist.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 border rounded-lg bg-secondary/5"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h5 className="font-semibold text-sm leading-tight">
                                                            {item.task}
                                                        </h5>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] uppercase font-bold px-1.5 h-4"
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                                        {item.description ||
                                                            "No description"}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <Badge className="text-[10px] capitalize h-5">
                                                            {item.category}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            Due:{" "}
                                                            {item.dueDate ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="col-span-full py-4 text-center text-muted-foreground text-sm">
                                            No checklist items defined.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <PackageLogsModal
                packageId={id!}
                packageName={basicData?.name}
                isOpen={isLogsOpen}
                onClose={() => setIsLogsOpen(false)}
            />
        </div>
    );
}
