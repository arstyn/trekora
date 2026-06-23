import { OptimizedImage } from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import type { IPackages } from "@/types/package.schema";
import {
    Calendar,
    CheckCircle,
    Edit,
    History,
    MapPin,
    Users,
    XCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PackageLogsModal } from "./_components/package-logs-modal";
import {
    HeroSkeleton,
    ItinerarySkeleton,
    OverviewSkeleton,
    PaymentCancellationSkeleton,
    RequirementsSkeleton,
    SidebarSkeleton,
} from "./_components/package-skeleton";

export default function ViewPackagePage() {
    const { id } = useParams<{ id: string }>();

    // Split states for progressive loading
    const [basicData, setBasicData] = useState<IPackages>();
    const [itinerary, setItinerary] = useState<IPackages["itinerary"]>();
    const [paymentsAndCancellation, setPaymentsAndCancellation] = useState<{
        paymentStructure: IPackages["paymentStructure"];
        cancellationStructure: IPackages["cancellationStructure"];
        cancellationPolicy: IPackages["cancellationPolicy"];
        packageTiers?: IPackages["packageTiers"];
        additionalCosts?: IPackages["additionalCosts"];
    }>();
    const [requirements, setRequirements] = useState<{
        documentRequirements: IPackages["documentRequirements"];
        preTripChecklist: IPackages["preTripChecklist"];
    }>();
    const [logistics, setLogistics] = useState<{
        transportation: IPackages["transportation"];
        mealsBreakdown: IPackages["mealsBreakdown"];
    }>();

    const [details, setDetails] = useState<{
        inclusions: IPackages["inclusions"];
        exclusions: IPackages["exclusions"];
    }>();

    // Loading states
    const [loadingBasic, setLoadingBasic] = useState(true);
    const [loadingItinerary, setLoadingItinerary] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [loadingRequirements, setLoadingRequirements] = useState(true);
    const [loadingLogistics, setLoadingLogistics] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(true);
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

        const fetchDetails = async () => {
            setLoadingDetails(true);
            try {
                const res = await axiosInstance.get<any>(
                    `/packages/${id}/details`,
                );
                setDetails(res.data);
            } catch (error: any) {
                toast.error(error.message || "Failed to load details");
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchBasic();
        fetchItinerary();
        fetchPayments();
        fetchRequirements();
        fetchLogistics();
        fetchDetails();
    }, [id]);

    const getTierTotalCost = (tier: any) => {
        const itineraryCost = itinerary?.reduce((sum, day: any) => {
            let dayCost = 0;
            if (day.activitiesCostType === "per_day") {
                dayCost += Number(day.activitiesTotalCost) || 0;
            } else if (day.activitiesCostType === "per_activity") {
                dayCost += (day.activities || []).reduce((s: number, act: any) => s + (Number(act.cost) || 0), 0);
            }
            dayCost += Number(day.accommodationCost) || 0;
            return sum + dayCost;
        }, 0) || 0;

        const mealsCost = Number((logistics as any)?.mealsBreakdown?.mealsCost) || 0;
        const additionalCostsSum = paymentsAndCancellation?.additionalCosts?.reduce((sum: number, cost: any) => sum + (Number(cost.cost) || 0), 0) || 0;
        const groundCost = Number((basicData as any)?.groundTransportationCost) || 0;
        
        const baseCost = itineraryCost + mealsCost + additionalCostsSum + groundCost;
        
        const transport = logistics?.transportation?.find(t => t.id === tier.transportationId);
        const transportCost = Number(transport?.cost) || 0;
        
        return baseCost + transportCost + (Number(tier.adultCost) || 0);
    };

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
                                    return basicData.thumbnail;
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
                        <p className=" flex items-center gap-2 mt-1 opacity-90">
                            <MapPin className="w-4 h-4" />
                            {basicData.destination || "Destination not set"}
                            {basicData.packageLocation?.countries && basicData.packageLocation.countries.length > 0 && ` • ${basicData.packageLocation.countries.join(", ")}`}
                            {basicData.packageLocation?.states && basicData.packageLocation.states.length > 0 && ` • ${basicData.packageLocation.states.join(", ")}`}
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                                        <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <div className="text-sm text-muted-foreground">
                                            Duration
                                        </div>
                                        <div className="font-semibold">
                                            {basicData.days ? `${basicData.days} Days / ${basicData.nights} Nights` : "Not set"}
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
                                                    <div className="w-10 h-10 bg-primary shrink-0 text-primary-foreground rounded-full flex items-center justify-center font-bold">
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
                                                                                return image;
                                                                            }
                                                                            return undefined;
                                                                        })()}
                                                                        alt={`Day ${day?.day ||
                                                                            index +
                                                                            1
                                                                            } - Image ${imageIndex +
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
                                                                                {activity?.name ||
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
                                        <CardTitle>Package Tiers & Pricing</CardTitle>
                                        <CardDescription>
                                            Base cost structure for this package
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {paymentsAndCancellation?.packageTiers &&
                                                paymentsAndCancellation.packageTiers.length > 0 ? (
                                                paymentsAndCancellation.packageTiers.map(
                                                    (tier: any, index: number) => {
                                                        const totalAdultCost = getTierTotalCost(tier);
                                                        const childCost = tier.childCostType === "flat"
                                                            ? Number(tier.childCostValue) || 0
                                                            : (totalAdultCost * Number(tier.childCostValue || 0)) / 100;

                                                        const infantCost = tier.infantCostType === "flat"
                                                            ? Number(tier.infantCostValue) || 0
                                                            : (totalAdultCost * Number(tier.infantCostValue || 0)) / 100;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg"
                                                            >
                                                                <div className="mb-2 md:mb-0">
                                                                    <h4 className="font-semibold text-lg text-primary">
                                                                        {tier?.name || "Pricing Tier"}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex flex-wrap gap-4 text-center">
                                                                    <div>
                                                                        <div className="text-sm text-muted-foreground">Adult</div>
                                                                        <div className="font-medium">₹{totalAdultCost}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm text-muted-foreground">Child</div>
                                                                        <div className="font-medium">₹{childCost}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm text-muted-foreground">Infant</div>
                                                                        <div className="font-medium">₹{infantCost}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <p>No package tiers have been defined yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        {paymentsAndCancellation?.additionalCosts && paymentsAndCancellation.additionalCosts.length > 0 && (
                                            <div className="mt-8 border-t pt-6">
                                                <h4 className="font-semibold mb-4">Additional Costs</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {paymentsAndCancellation.additionalCosts.map((cost: any, index) => (
                                                        <div key={index} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                                                            <span className="font-medium">{cost?.name}</span>
                                                            <Badge variant="outline">₹{cost?.cost}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Milestones</CardTitle>
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
                                                            className="flex flex-col gap-3 p-4 border rounded-lg bg-card"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold text-lg">
                                                                        {milestone?.name || "Payment Milestone"}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {milestone?.description || "No description"}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-primary">
                                                                        {milestone?.amount || 0}%
                                                                    </div>
                                                                    <div className="text-sm font-medium capitalize text-muted-foreground mt-1">
                                                                        {milestone?.dueDate?.replace("_", " ") || "Not specified"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {paymentsAndCancellation?.packageTiers && paymentsAndCancellation.packageTiers.length > 0 && (
                                                                <div className="bg-secondary/20 rounded-md p-3 mt-1">
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estimated Amount per Tier</div>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                        {paymentsAndCancellation.packageTiers.map((pkgTier: any, tIdx: number) => (
                                                                            <div key={tIdx} className="bg-background rounded p-2 text-sm border shadow-sm">
                                                                                <div className="text-xs text-muted-foreground truncate" title={pkgTier?.name}>{pkgTier?.name || "Tier"}</div>
                                                                                <div className="font-semibold mt-0.5">₹{Math.round(getTierTotalCost(pkgTier) * (milestone?.amount || 0) / 100).toLocaleString("en-IN")}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                            className="flex flex-col gap-3 p-4 border rounded-lg bg-card"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-lg">{tier?.timeframe || "Not specified"}</span>
                                                                        <Badge variant="destructive" className="ml-2">{tier?.amount || 0}% fee</Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mt-1">{tier?.description || "No description"}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {paymentsAndCancellation?.packageTiers && paymentsAndCancellation.packageTiers.length > 0 && (
                                                                <div className="bg-secondary/20 rounded-md p-3 mt-1">
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cancellation Fee per Tier</div>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                        {paymentsAndCancellation.packageTiers.map((pkgTier: any, tIdx: number) => (
                                                                            <div key={tIdx} className="bg-background rounded p-2 text-sm border border-destructive/10 shadow-sm">
                                                                                <div className="text-xs text-muted-foreground truncate" title={pkgTier?.name}>{pkgTier?.name || "Tier"}</div>
                                                                                <div className="font-semibold text-destructive mt-0.5">₹{Math.round(getTierTotalCost(pkgTier) * (tier?.amount || 0) / 100).toLocaleString("en-IN")}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                    {(() => {
                                                        const allDocs = requirements?.documentRequirements?.filter((doc: any) => doc?.applicableFor === "all") || [];
                                                        if (allDocs.length > 0) {
                                                            return allDocs.map((doc: any, index: number) => (
                                                                <div key={index} className="p-3 border rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h5 className="font-medium">
                                                                            {doc?.name || "Document"}
                                                                        </h5>
                                                                        {doc?.mandatory && (
                                                                            <Badge variant="destructive" className="text-xs">
                                                                                Required
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm ">
                                                                        {doc?.description || "No description available"}
                                                                    </p>
                                                                </div>
                                                            ));
                                                        }
                                                        return (
                                                            <div className="text-muted-foreground text-sm">
                                                                No document added
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-3 text-green-600">
                                                    Children Only
                                                </h4>
                                                <div className="space-y-3">
                                                    {(() => {
                                                        const childDocs = requirements?.documentRequirements?.filter((doc: any) => doc?.applicableFor === "children") || [];
                                                        if (childDocs.length > 0) {
                                                            return childDocs.map((doc: any, index: number) => (
                                                                <div key={index} className="p-3 border rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h5 className="font-medium">
                                                                            {doc?.name || "Document"}
                                                                        </h5>
                                                                        {doc?.mandatory && (
                                                                            <Badge variant="destructive" className="text-xs">
                                                                                Required
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm ">
                                                                        {doc?.description || "No description available"}
                                                                    </p>
                                                                </div>
                                                            ));
                                                        }
                                                        return (
                                                            <div className="text-muted-foreground text-sm">
                                                                No document added
                                                            </div>
                                                        );
                                                    })()}
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
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Meals Included</CardTitle>
                                            <CardDescription>
                                                What's included in each meal
                                            </CardDescription>
                                        </div>
                                        {Number((logistics as any)?.mealsBreakdown?.mealsCost) > 0 && (
                                            <div className="text-right">
                                                <span className="text-sm text-muted-foreground block">Total Meals Cost</span>
                                                <span className="font-bold text-primary text-lg">₹{(logistics as any).mealsBreakdown.mealsCost}</span>
                                            </div>
                                        )}
                                    </div>
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
                                        {(basicData as any)?.groundTransportationCost > 0 && (
                                            <div className="flex justify-between items-center p-4 bg-secondary/10 rounded-lg border border-primary/20">
                                                <span className="font-medium">Ground Transportation Cost</span>
                                                <span className="font-bold text-primary">₹{(basicData as any)?.groundTransportationCost}</span>
                                            </div>
                                        )}
                                        {logistics?.transportation && logistics.transportation.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {logistics.transportation.map((transport: any, index: number) => (
                                                    <div key={index} className="p-4 border rounded-lg">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="font-semibold text-lg">
                                                                {transport?.title || "Transportation Option"}
                                                            </h4>
                                                            <div className="text-right">
                                                                <span className="text-sm text-muted-foreground block">Option Cost</span>
                                                                <span className="font-bold text-primary">₹{transport?.cost || 0}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {transport?.segments && transport.segments.length > 0 ? (
                                                            <div className="space-y-3 mt-2">
                                                                <h5 className="text-sm font-medium text-muted-foreground">Journey Segments</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                                    {transport.segments.map((seg: any, sIdx: number) => (
                                                                        <div key={sIdx} className="bg-secondary/5 border p-3 rounded-md text-sm relative">
                                                                            <div className="flex justify-between items-center border-b border-primary/10 pb-2 mb-2">
                                                                                <span className="font-semibold capitalize flex items-center gap-1.5">
                                                                                    {seg.mode === 'flight' && '✈️ '}
                                                                                    {seg.mode === 'train' && '🚆 '}
                                                                                    {seg.mode === 'bus' && '🚌 '}
                                                                                    {seg.mode}
                                                                                </span>
                                                                                {seg.mode === 'train' && seg.coachType && seg.coachType !== 'none' && (
                                                                                    <Badge variant="secondary" className="text-[10px] h-5">{seg.coachType}</Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-medium text-foreground">{seg.from || 'Origin'}</span>
                                                                                    <span className="text-xs text-muted-foreground">{seg.departureTime || '-'}</span>
                                                                                </div>
                                                                                <div className="flex flex-col items-center justify-center px-2 opacity-50">
                                                                                    <span className="text-[10px]">{seg.number || 'No/ID'}</span>
                                                                                    <span className="text-xs">→</span>
                                                                                </div>
                                                                                <div className="flex flex-col text-right">
                                                                                    <span className="font-medium text-foreground">{seg.to || 'Dest'}</span>
                                                                                    <span className="text-xs text-muted-foreground">{seg.arrivalTime || '-'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground bg-secondary/5 p-3 rounded-md mt-2">
                                                                {transport?.details || "No details provided"}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                                <p>No transportation options have been provided yet.</p>
                                            </div>
                                        )}
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
                                        {basicData.packageLocation?.countries?.join(", ") ||
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
                                {loadingDetails ? (
                                    <div className="flex justify-center p-4">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h4 className="font-semibold text-primary mb-2">
                                                Included
                                            </h4>
                                            <div className="space-y-1">
                                                {details?.inclusions &&
                                                    details.inclusions.length > 0 ? (
                                                    details.inclusions.map(
                                                        (item: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                                                                <span className="text-sm">
                                                                    {typeof item ===
                                                                        "string"
                                                                        ? item
                                                                        : item?.item ||
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
                                                {details?.exclusions &&
                                                    details.exclusions.length > 0 ? (
                                                    details.exclusions.map(
                                                        (item: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4 text-destructive shrink-0" />
                                                                <span className="text-sm">
                                                                    {typeof item ===
                                                                        "string"
                                                                        ? item
                                                                        : item?.item ||
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
                                    </>
                                )}
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
