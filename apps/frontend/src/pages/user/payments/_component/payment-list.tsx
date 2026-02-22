import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Archive,
    Download,
    Edit,
    Eye,
    MoreHorizontal,
    RefreshCw,
    Search,
    AlertTriangle,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import PaymentService from "@/services/payment.service";
import type {
    Payment,
    PaymentStatus,
    PaymentFilters,
    PaymentListResponse,
} from "@/types/payment.types";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

interface PaymentListProps {
    status: "all" | "pending" | "completed" | "failed" | "refunded";
    onPaymentUpdate?: () => void;
}

export function PaymentList({ status, onPaymentUpdate }: PaymentListProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
        {},
    );
    const { toast } = useToast();

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            loadPayments(1, term);
        }, 500),
        [status],
    );

    // Load payments data
    const loadPayments = async (
        page: number = pagination.page,
        search: string = searchTerm,
    ) => {
        try {
            setLoading(true);
            setError(null);

            const filters: PaymentFilters = {
                search: search || undefined,
                status:
                    status !== "all" ? (status as PaymentStatus) : undefined,
                sortBy: "paymentDate",
                sortOrder: "DESC",
            };

            const response: PaymentListResponse =
                await PaymentService.getPayments({
                    ...filters,
                    page,
                    limit: pagination.limit,
                });

            setPayments(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error loading payments:", error);
            setError("Failed to load payments. Please try again.");
            toast({
                title: "Error",
                description: "Failed to load payments. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load payments when component mounts or status changes
    useEffect(() => {
        loadPayments(1);
    }, [status]);

    // Handle search
    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Completed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Pending
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-100 text-red-800">Failed</Badge>
                );
            case "refunded":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Refunded
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPaymentTypeBadge = (type: string) => {
        switch (type.toLowerCase()) {
            case "advance":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                    >
                        Advance
                    </Badge>
                );
            case "balance":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                    >
                        Balance
                    </Badge>
                );
            case "partial":
                return (
                    <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700"
                    >
                        Partial
                    </Badge>
                );
            case "refund":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                        Refund
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const handleAction = async (paymentId: string, action: string) => {
        try {
            setActionLoading((prev) => ({ ...prev, [paymentId]: true }));

            switch (action) {
                case "complete":
                    await PaymentService.markPaymentCompleted(paymentId);
                    toast({
                        title: "Success",
                        description: "Payment marked as completed.",
                    });
                    break;
                case "fail":
                    await PaymentService.markPaymentFailed(paymentId);
                    toast({
                        title: "Success",
                        description: "Payment marked as failed.",
                    });
                    break;
                case "retry":
                    await PaymentService.retryPayment(paymentId);
                    toast({
                        title: "Success",
                        description: "Payment retry initiated.",
                    });
                    break;
                case "archive":
                    await PaymentService.archivePayment(paymentId);
                    toast({
                        title: "Success",
                        description: "Payment archived successfully.",
                    });
                    break;
                default:
                    break;
            }

            // Refresh the list and notify parent component
            loadPayments();
            onPaymentUpdate?.();
        } catch (error) {
            console.error("Error performing action:", error);
            toast({
                title: "Error",
                description: "Failed to perform action. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, [paymentId]: false }));
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadPayments(newPage);
        }
    };

    const handleExport = async () => {
        try {
            // This would typically download a CSV/Excel file
            // For now, we'll just show a success message
            toast({
                title: "Export",
                description: "Export functionality will be implemented soon.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to export data.",
                variant: "destructive",
            });
        }
    };

    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-8" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="capitalize">
                        {status === "all" ? "All" : status} Payments
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-64"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Recorded By</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableSkeleton />
                        ) : payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">
                                        {payment.paymentNumber}
                                    </TableCell>
                                    <TableCell>
                                        <NavLink
                                            to={`/bookings/${payment.booking.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {payment.booking.bookingNumber}
                                        </NavLink>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {payment.booking.customer.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {payment.booking.customer.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payment.booking.package.name}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(payment.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentTypeBadge(
                                            payment.paymentType,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payment.paymentMethod.replace(
                                            "_",
                                            " ",
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(payment.status)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(
                                            payment.paymentDate,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {payment.recordedBy ? (
                                            <span className="text-sm text-muted-foreground">
                                                {payment.recordedBy.firstName}{" "}
                                                {payment.recordedBy.lastName}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    disabled={
                                                        actionLoading[
                                                            payment.id
                                                        ]
                                                    }
                                                >
                                                    {actionLoading[
                                                        payment.id
                                                    ] ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <NavLink
                                                        to={`/payments/${payment.id}`}
                                                        className="flex items-center"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </NavLink>
                                                </DropdownMenuItem>
                                                {payment.status !==
                                                    "completed" &&
                                                    payment.status !==
                                                        "refunded" && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <NavLink
                                                                to={`/payments/${payment.id}/edit`}
                                                                className="flex items-center"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Payment
                                                            </NavLink>
                                                        </DropdownMenuItem>
                                                    )}
                                                {payment.status ===
                                                    "pending" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleAction(
                                                                payment.id,
                                                                "complete",
                                                            )
                                                        }
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Mark Completed
                                                    </DropdownMenuItem>
                                                )}
                                                {payment.status ===
                                                    "pending" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleAction(
                                                                payment.id,
                                                                "fail",
                                                            )
                                                        }
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Mark Failed
                                                    </DropdownMenuItem>
                                                )}
                                                {payment.status ===
                                                    "failed" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleAction(
                                                                payment.id,
                                                                "retry",
                                                            )
                                                        }
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Retry Payment
                                                    </DropdownMenuItem>
                                                )}
                                                {payment.status !==
                                                    "archived" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleAction(
                                                                payment.id,
                                                                "archive",
                                                            )
                                                        }
                                                    >
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No {status === "all" ? "" : status} payments
                                    found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing{" "}
                            {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.total,
                            )}{" "}
                            of {pagination.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(pagination.page - 1)
                                }
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePageChange(pagination.page + 1)
                                }
                                disabled={
                                    pagination.page >= pagination.totalPages
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
