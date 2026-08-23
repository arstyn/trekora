import { PermissionGuard } from "@/components/permission-guard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import type { IPackages } from "@/types/package.schema";
import {
    Calendar,
    MapPin,
    Package,
    Plus,
    Trash2,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PackageCreateModal } from "./_components/package-create-modal";

export default function Packages() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<IPackages[]>([]);
    const [totalPackages, setTotalPackages] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<IPackages | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/packages/${deleteTarget.id}`);
            setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            toast.success(`"${deleteTarget.name || "Untitled Package"}" deleted successfully`);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete package";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    useEffect(() => {
        const getPackages = async () => {
            try {
                setIsLoading(true);
                const res = await axiosInstance.get<{ packages: IPackages[], total: number, hasMore: boolean }>(`/packages?limit=${limit}&offset=${(page - 1) * limit}`);
                setPackages(res.data.packages || []);
                setTotalPackages(res.data.total || 0);
                setHasMore(res.data.hasMore || false);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load updates");
                }
            } finally {
                setIsLoading(false);
            }
        };

        getPackages();
    }, [page, limit]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-800">
                    {error ?? "Something went wrong please try later"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <main className="px-4 sm:px-6 lg:px-6 py-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="px-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium">
                                        Total Packages
                                    </p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {totalPackages}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium">
                                        Active Display
                                    </p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {
                                                packages.filter(
                                                    (pkg) =>
                                                        pkg.status ===
                                                        "published" ||
                                                        pkg.status === "edited",
                                                ).length
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium">
                                        Drafts Display
                                    </p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-16 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {
                                                packages.filter(
                                                    (pkg) => pkg.status === "draft",
                                                ).length
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    <PermissionGuard resource="package" action="create">
                        <div
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center bg-card hover:bg-secondary cursor-pointer rounded-xl border px-6 h-full"
                        >
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Plus className="w-6 h-6 text-primary" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium">
                                    Create
                                </p>
                                <p className="text-2xl font-bold">
                                    Package
                                </p>
                            </div>
                        </div>
                    </PermissionGuard>
                </div>

                {/* Package Grid / Skeletons / Empty State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={`skeleton-${i}`} className="overflow-hidden pt-0">
                                <Skeleton className="h-48 w-full rounded-none" />
                                <CardContent className="p-5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : !isLoading && packages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6">
                                <Package className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-semibold text-primary mb-2">
                                No packages yet
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md">
                                Get started by creating your first travel
                                package. Add destinations, pricing, and details
                                to attract customers.
                            </p>
                            <PermissionGuard resource="package" action="create">
                                <Button
                                    size="lg"
                                    className="gap-2 cursor-pointer"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    <Plus className="h-5 w-5" />
                                    Create Your First Package
                                </Button>
                            </PermissionGuard>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
                            >
                                <div className="relative">
                                    <img
                                        src={(() => {
                                            if (pkg?.thumbnail)
                                                return pkg.thumbnail;
                                            return "/placeholder.svg";
                                        })()}
                                        alt={pkg.name || ""}
                                        className="w-full h-48 object-cover"
                                    />
                                    <Badge
                                        className={`absolute top-2 right-2 ${pkg.status === "published"
                                            ? "bg-green-500 hover:bg-green-600"
                                            : pkg.status === "edited"
                                                ? "bg-amber-500 hover:bg-amber-600"
                                                : "bg-yellow-500 hover:bg-yellow-600"
                                            }`}
                                    >
                                        {pkg.status}
                                    </Badge>
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {pkg.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {pkg.destination}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm  mb-4">
                                        {pkg.description}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="">Duration:</span>
                                            <span className="font-medium">
                                                {pkg.days} Days / {pkg.nights} Nights
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="">Max Guests:</span>
                                            <span className="font-medium">
                                                {pkg.maxGuests} people
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <NavLink
                                                to={`/packages/edit/${pkg.id}`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                >
                                                    Edit
                                                </Button>
                                            </NavLink>
                                            <NavLink to={`/packages/${pkg.id}`}>
                                                <Button
                                                    size="sm"
                                                    className="cursor-pointer"
                                                >
                                                    View
                                                </Button>
                                            </NavLink>
                                        </div>
                                        {pkg.status === "draft" && (
                                            <PermissionGuard resource="package" action="delete">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setDeleteTarget(pkg)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </PermissionGuard>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                
                {/* Pagination Controls */}
                {!isLoading && totalPackages > 0 && (
                    <div className="flex items-center justify-between py-6">
                        <div className="text-sm text-muted-foreground">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalPackages)} of {totalPackages} packages
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={!hasMore}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <PackageCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSelect={(type) => {
                    setIsCreateModalOpen(false);
                    navigate(`/packages/create?type=${type}`);
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Draft Package?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold">"{deleteTarget?.name}"</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

