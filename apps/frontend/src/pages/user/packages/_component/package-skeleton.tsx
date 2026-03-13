import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <section className="relative">
            <div className="h-96 w-full bg-muted/20">
                <Skeleton className="w-full h-full rounded-none" />
            </div>
            <div className="absolute bottom-6 left-6 space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-64 md:w-96" />
                <Skeleton className="h-6 w-48" />
            </div>
        </section>
    );
}

export function OverviewSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ItinerarySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-full md:w-[400px]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[1, 2, 3].map((j) => (
                                <Skeleton key={j} className="h-40 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function PaymentCancellationSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export function RequirementsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export function PackageDetailsSkeleton() {
    return (
        <div className="min-h-screen animate-in fade-in duration-500">
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
