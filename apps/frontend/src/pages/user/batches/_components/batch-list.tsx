import DataTableFooter from "@/components/data-table-footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios";
import type { IBatches } from "@/types/batches.types";
import { format } from "date-fns";
import {
    Calendar,
    Edit,
    Eye,
    Info,
    MoreHorizontal,
    Search,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useSearchParams } from "react-router-dom";

interface BatchListProps {
    status: "active" | "upcoming" | "completed" | "archived" | "all";
    refreshKey?: number;
}

export function BatchList({ status, refreshKey }: BatchListProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialLimit = parseInt(searchParams.get("limit") || "20", 10);

    const [batches, setBatches] = useState<IBatches[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0,
    });
    const navigate = useNavigate();

    const loadBatches = async (page: number, search: string, customLimit?: number) => {
        try {
            setIsLoading(true);
            const currentLimit = customLimit ?? pagination.limit;
            const statusParam = status === "all" ? "" : status;
            const res = await axiosInstance.get(
                `/batches?status=${statusParam}&page=${page}&limit=${currentLimit}&search=${search}`,
            );
            // Check if backend returned paginated object or fallback
            if (res.data && res.data.pagination) {
                setBatches(res.data.data);
                setPagination(res.data.pagination);
            } else {
                setBatches(Array.isArray(res.data) ? res.data : []);
                setPagination({
                    page: 1,
                    limit: currentLimit,
                    total: Array.isArray(res.data) ? res.data.length : 0,
                    totalPages: 1,
                });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load batches");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            loadBatches(1, searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, status, refreshKey]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, page: newPage }));
            setSearchParams((prev) => {
                if (newPage === 1) prev.delete("page");
                else prev.set("page", newPage.toString());
                return prev;
            });
            loadBatches(newPage, searchTerm, pagination.limit);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
        setSearchParams((prev) => {
            if (newLimit === 20) prev.delete("limit");
            else prev.set("limit", newLimit.toString());
            prev.delete("page");
            return prev;
        });
        loadBatches(1, searchTerm, newLimit);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Active
                    </Badge>
                );
            case "upcoming":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Upcoming
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        Completed
                    </Badge>
                );
            case "archived":
                return (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        Archived
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleRowClick = (batchId: string, event: React.MouseEvent) => {
        // Prevent navigation if clicking on the dropdown menu
        if (
            (event.target as HTMLElement).closest(
                "[data-radix-collection-item]",
            ) ||
            (event.target as HTMLElement).closest("button")
        ) {
            return;
        }
        navigate(`/batches/${batchId}`);
    };

    const formatDate = (dateInput: string | Date) => {
        const date =
            typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getBatchDueInfo = (batch: IBatches) => {
        if (batch.status !== "upcoming") return null;

        const startDate = new Date(batch.startDate);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                highlightClass: "text-red-600 dark:text-red-400 font-semibold",
                iconClass: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300",
                tooltipText: "Batch start date has passed. Please mark this as active, completed or archived.",
            };
        } else if (diffDays === 0) {
            return {
                highlightClass: "text-orange-500 dark:text-orange-400 font-semibold",
                iconClass: "text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
                tooltipText: "Batch starts today!",
            };
        } else if (diffDays <= 3) {
            return {
                highlightClass: "text-orange-500 dark:text-orange-400 font-semibold",
                iconClass: "text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
                tooltipText: `Batch is starting soon (due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}).`,
            };
        } else if (diffDays <= 7) {
            return {
                highlightClass: "text-yellow-500 dark:text-yellow-400 font-semibold",
                iconClass: "text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300",
                tooltipText: `Batch is approaching start date (due in ${diffDays} days).`,
            };
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="capitalize">
                        {status} Batches
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search batches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-64"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Coordinators</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : batches.map((batch) => (
                            <TableRow
                                key={batch.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={(e) => handleRowClick(batch.id, e)}
                            >
                                <TableCell className="font-medium">
                                    {batch.package?.name}
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const dueInfo = getBatchDueInfo(batch);
                                        const highlightClass = dueInfo?.highlightClass || "";

                                        return (
                                            <div className={`flex items-center gap-1.5 text-sm ${highlightClass}`}>
                                                <Calendar className="w-4 h-4 shrink-0" />
                                                <span>
                                                    {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                                                </span>
                                                {dueInfo && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={`inline-flex focus:outline-none cursor-help shrink-0 ${dueInfo.iconClass}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Info className="w-3.5 h-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {dueInfo.tooltipText}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {batch.bookedSeats}/{batch.totalSeats}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                                        {batch.coordinators?.map(
                                            (coordinator, index: number) => (
                                                <HoverCard key={index}>
                                                    <HoverCardTrigger asChild>
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={
                                                                    coordinator.profilePhoto
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {coordinator.name.slice(
                                                                    0,
                                                                    2,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-80">
                                                        <div className="flex gap-4">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={
                                                                        coordinator.profilePhoto
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {coordinator.name.slice(
                                                                        0,
                                                                        2,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-semibold">
                                                                    {
                                                                        coordinator.name
                                                                    }
                                                                </h4>
                                                                <p className="text-sm">
                                                                    {
                                                                        coordinator.email
                                                                    }
                                                                </p>
                                                                <div className="text-muted-foreground text-xs">
                                                                    {coordinator.joinDate &&
                                                                        `Joined ${format(
                                                                            new Date(
                                                                                coordinator.joinDate,
                                                                            ),
                                                                            "PPP",
                                                                        )}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            ),
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(batch.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <NavLink
                                                    to={`/batches/${batch.id}`}
                                                    className="flex items-center"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </NavLink>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <NavLink
                                                    to={`/batches/edit/${batch.id}`}
                                                    className="flex items-center"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Batch
                                                </NavLink>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && batches.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                                <Calendar className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-primary mb-2">
                                No {status === "all" ? "All" : status} batches
                            </h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {status === "active"
                                    ? "There are currently no active batches running."
                                    : status === "upcoming"
                                        ? "You don't have any upcoming batches scheduled."
                                        : status === "completed"
                                            ? "No batches have been completed yet."
                                            : status === "archived"
                                                ? "No batches have been archived yet."
                                                : "No batches found."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && pagination.total > 0 && (
                    <DataTableFooter
                        page={pagination.page}
                        limit={pagination.limit}
                        total={pagination.total}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                        entityName="batches"
                    />
                )}
            </CardContent>
        </Card>
    );
}
