import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingService from "@/services/booking.service";
import type { IBooking } from "@/types/booking.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import {
    CheckCircle2,
    Circle,
    ClipboardList,
    DollarSign,
    GitMerge,
    LayoutGrid,
    LayoutList,
    Mail,
    Phone,
    RotateCcw,
    Users,
    UserX,
    XCircle,
} from "lucide-react";
import React from "react";

const getRefundInfo = (booking: IBooking) => {
    const refundPayments =
        booking.payments?.filter(
            (p) => p.paymentType === "refund" && p.status !== "failed",
        ) || [];

    const totalRefund = refundPayments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
    );

    const pendingRefund = refundPayments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const completedRefund = refundPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
        refundPayments,
        totalRefund,
        pendingRefund,
        completedRefund,
    };
};

export interface BatchBookingsCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    bookings: IBooking[];
    viewMode: "detailed" | "table" | "workflow";
    onViewModeChange: (mode: "detailed" | "table" | "workflow") => void;
    onSelectBooking: (booking: IBooking) => void;
    onCancelBooking?: (booking: IBooking, customerId?: string) => void;
    isCancelled?: boolean;
    emptyText?: string;
}

export const BatchBookingsCard: React.FC<BatchBookingsCardProps> = ({
    title,
    count,
    icon,
    bookings,
    viewMode,
    onViewModeChange,
    onSelectBooking,
    onCancelBooking,
    isCancelled = false,
    emptyText = "No bookings found",
}) => {
    return (
        <Card className={isCancelled ? "border-destructive/20" : ""}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <CardTitle className={`flex items-center gap-2 ${isCancelled ? "text-destructive" : ""}`}>
                    {icon}
                    {title} ({count})
                </CardTitle>
                <Tabs
                    value={viewMode}
                    onValueChange={(v) => onViewModeChange(v as any)}
                    className="w-full sm:w-auto"
                >
                    <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                        <TabsTrigger value="table" className="flex items-center gap-1.5">
                            <LayoutList className="w-3.5 h-3.5" />
                            <span>Table</span>
                        </TabsTrigger>
                        <TabsTrigger value="detailed" className="flex items-center gap-1.5">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Detailed</span>
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="flex items-center gap-1.5">
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>Workflow</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {bookings.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted">
                        <Users className="w-12 h-12 text-muted/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">{emptyText}</p>
                    </div>
                ) : (
                    <>
                        {/* Detailed View */}
                        {viewMode === "detailed" && (
                            <div className="space-y-6">
                                {bookings.map((booking) => {
                                    const completedSteps =
                                        booking.currentWorkflow?.steps?.filter(
                                            (s) => s.status === "completed",
                                        ).length || 0;
                                    const totalSteps =
                                        booking.currentWorkflow?.steps?.length || 0;
                                    const progress =
                                        totalSteps > 0
                                            ? Math.round(
                                                  (completedSteps / totalSteps) * 100,
                                              )
                                            : 0;

                                    const { refundPayments, totalRefund, pendingRefund } =
                                        getRefundInfo(booking);

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`border rounded-xl overflow-hidden transition-colors cursor-pointer ${
                                                isCancelled
                                                    ? "hover:border-destructive/40 bg-card"
                                                    : "hover:border-primary/50"
                                            }`}
                                            onClick={() => onSelectBooking(booking)}
                                        >
                                            <div className="bg-muted/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`${
                                                            isCancelled
                                                                ? "bg-destructive/10 text-destructive"
                                                                : "bg-primary/10 text-primary"
                                                        } w-36 h-12 rounded-lg flex items-center justify-center font-bold text-lg`}
                                                    >
                                                        #{booking.bookingNumber}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">
                                                            {booking.primaryCustomer?.firstName}{" "}
                                                            {booking.primaryCustomer?.lastName}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Mail className="w-3 h-3" />
                                                            {booking.primaryCustomer?.email}
                                                            {booking.primaryCustomer?.phone && (
                                                                <>
                                                                    <Phone className="w-3 h-3 ml-2" />
                                                                    {booking.primaryCustomer?.phone}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge
                                                        variant={isCancelled ? "destructive" : "outline"}
                                                        className="capitalize"
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                    <div className="flex flex-col items-end gap-1 min-w-[120px]">
                                                        <div className="flex justify-between w-full text-xs font-medium">
                                                            <span>Workflow</span>
                                                            <span>
                                                                {completedSteps}/{totalSteps} Steps
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${
                                                                    isCancelled ? "bg-destructive" : "bg-primary"
                                                                }`}
                                                                style={{
                                                                    width: `${progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelectBooking(booking);
                                                        }}
                                                    >
                                                        Details
                                                    </Button>
                                                    {!isCancelled && onCancelBooking && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onCancelBooking(booking);
                                                            }}
                                                            title="Cancel Booking"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1.5" />
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Additional Travelers */}
                                                {(() => {
                                                    const travelers =
                                                        booking.customers?.filter(
                                                            (c) => c.id !== booking.primaryCustomer?.id,
                                                        ) || [];
                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                                <Users className="w-3 h-3" />
                                                                Additional Travelers ({travelers.length})
                                                            </div>
                                                            {travelers.length > 0 ? (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {travelers.map((c) => {
                                                                        const isTravelerCancelled =
                                                                            isCancelled || c.status === "cancelled";
                                                                        return (
                                                                            <div
                                                                                key={c.id}
                                                                                className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-sm ${
                                                                                    isTravelerCancelled && !isCancelled
                                                                                        ? "bg-muted/40 opacity-60 line-through"
                                                                                        : "bg-background"
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                                        {c.firstName[0]}
                                                                                        {c?.lastName?.[0] ?? ""}
                                                                                    </div>
                                                                                    <span className="truncate">
                                                                                        {c.firstName}{" "}
                                                                                        {c?.lastName ?? ""}
                                                                                    </span>
                                                                                    {c.status === "cancelled" && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-[10px] text-destructive border-destructive/30 shrink-0"
                                                                                        >
                                                                                            Cancelled
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                {!isCancelled &&
                                                                                    !isTravelerCancelled &&
                                                                                    onCancelBooking && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                                                            title="Cancel Traveler"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onCancelBooking(
                                                                                                    booking,
                                                                                                    c.id,
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <UserX className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground italic">
                                                                    No additional travelers
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Financial / Refund Details */}
                                                {isCancelled ? (
                                                    <div className="space-y-3 border-t pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6 border-muted">
                                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                            <RotateCcw className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                            Refund Information
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Amount Refunded:</span>
                                                                <span className="font-bold text-base text-purple-700 dark:text-purple-400">
                                                                    {BookingService.formatCurrency(totalRefund)}
                                                                </span>
                                                            </div>
                                                            {totalRefund > 0 ? (
                                                                <>
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-muted-foreground">Settlement Status:</span>
                                                                        {pendingRefund > 0 ? (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 font-medium"
                                                                            >
                                                                                Pending Settlement
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 font-medium"
                                                                            >
                                                                                Completed
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {refundPayments[0]?.paymentMethod && (
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-muted-foreground">Refund Method:</span>
                                                                            <span className="font-medium text-foreground capitalize">
                                                                                {refundPayments[0].paymentMethod.replace(/_/g, " ")}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground italic">
                                                                    No refund was issued for this booking
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 border-t pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6 border-muted">
                                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                            <DollarSign className="w-3 h-3 text-primary" />
                                                            Payment Status
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Total:</span>
                                                                <span className="font-semibold text-foreground">
                                                                    {BookingService.formatCurrency(booking.totalAmount)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Paid:</span>
                                                                <span className="font-semibold text-emerald-600">
                                                                    {BookingService.formatCurrency(booking.advancePaid)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Remaining:</span>
                                                                <span
                                                                    className={`font-semibold ${
                                                                        booking.balanceAmount > 0
                                                                            ? "text-amber-600"
                                                                            : "text-emerald-600"
                                                                    }`}
                                                                >
                                                                    {BookingService.formatCurrency(booking.balanceAmount)}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${
                                                                        booking.balanceAmount === 0
                                                                            ? "bg-emerald-500"
                                                                            : "bg-amber-500"
                                                                    }`}
                                                                    style={{
                                                                        width: `${
                                                                            booking.totalAmount > 0
                                                                                ? Math.min(
                                                                                      100,
                                                                                      Math.round(
                                                                                          (booking.advancePaid /
                                                                                              booking.totalAmount) *
                                                                                              100,
                                                                                      ),
                                                                                  )
                                                                                : 0
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Workflow Status */}
                                                <div className="space-y-3 border-t pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6 border-muted">
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <ClipboardList className="w-3 h-3" />
                                                        Workflow Status
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {booking.currentWorkflow?.steps
                                                            ?.slice(0, 5)
                                                            .map((step: IWorkflowStep) => (
                                                                <Badge
                                                                    key={step.id}
                                                                    variant={
                                                                        step.status === "completed"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                    className="text-[10px] flex items-center gap-1"
                                                                >
                                                                    {step.status === "completed" ? (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                                    ) : (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                                    )}
                                                                    {step.label}
                                                                </Badge>
                                                            ))}
                                                        {totalSteps > 5 && (
                                                            <span className="text-[10px] text-muted-foreground flex items-center px-2">
                                                                +{totalSteps - 5} more...
                                                            </span>
                                                        )}
                                                        {totalSteps === 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                No workflow assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === "table" && (
                            <div className="border rounded-xl overflow-x-auto bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Booking #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-center">Travelers</TableHead>
                                            {isCancelled ? (
                                                <TableHead className="text-right">Refunded Amount</TableHead>
                                            ) : (
                                                <>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-right">Paid</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                </>
                                            )}
                                            <TableHead>Workflow Progress</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => {
                                            const completedSteps =
                                                booking.currentWorkflow?.steps?.filter(
                                                    (s) => s.status === "completed",
                                                ).length || 0;
                                            const totalSteps =
                                                booking.currentWorkflow?.steps?.length || 0;
                                            const progress =
                                                totalSteps > 0
                                                    ? Math.round(
                                                          (completedSteps / totalSteps) * 100,
                                                      )
                                                    : 0;
                                            const travelers =
                                                booking.customers?.filter(
                                                    (c) => c.id !== booking.primaryCustomer?.id,
                                                ) || [];
                                            const { totalRefund, pendingRefund } =
                                                getRefundInfo(booking);

                                            return (
                                                <TableRow
                                                    key={booking.id}
                                                    className="hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => onSelectBooking(booking)}
                                                >
                                                    <TableCell
                                                        className={`font-bold ${
                                                            isCancelled ? "text-destructive" : "text-primary"
                                                        }`}
                                                    >
                                                        #{booking.bookingNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-sm">
                                                            {booking.primaryCustomer?.firstName}{" "}
                                                            {booking.primaryCustomer?.lastName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                            <span>{booking.primaryCustomer?.email}</span>
                                                            {booking.primaryCustomer?.phone && (
                                                                <>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span>{booking.primaryCustomer?.phone}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className="font-medium text-[11px]">
                                                            {travelers.length}{" "}
                                                            {travelers.length === 1 ? "traveler" : "travelers"}
                                                        </Badge>
                                                    </TableCell>
                                                    {isCancelled ? (
                                                        <TableCell className="text-right">
                                                            <div className="font-bold text-sm text-purple-700 dark:text-purple-400">
                                                                {BookingService.formatCurrency(totalRefund)}
                                                            </div>
                                                            {totalRefund > 0 ? (
                                                                <span
                                                                    className={`text-[10px] font-medium ${
                                                                        pendingRefund > 0
                                                                            ? "text-amber-600"
                                                                            : "text-emerald-600"
                                                                    }`}
                                                                >
                                                                    {pendingRefund > 0
                                                                        ? "Pending Settlement"
                                                                        : "Refunded"}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground italic">
                                                                    No refund
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    ) : (
                                                        <>
                                                            <TableCell className="text-right font-medium text-xs">
                                                                {BookingService.formatCurrency(booking.totalAmount)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-emerald-600 font-semibold text-xs">
                                                                {BookingService.formatCurrency(booking.advancePaid)}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-right font-semibold text-xs ${
                                                                    booking.balanceAmount > 0
                                                                        ? "text-amber-600"
                                                                        : "text-emerald-600"
                                                                }`}
                                                            >
                                                                {BookingService.formatCurrency(booking.balanceAmount)}
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="min-w-[150px] max-w-[200px]">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-[10px] font-semibold">
                                                                <span>
                                                                    {completedSteps}/{totalSteps} Steps
                                                                </span>
                                                                <span>{progress}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${
                                                                        isCancelled ? "bg-destructive" : "bg-primary"
                                                                    }`}
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell
                                                        className="text-right"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onSelectBooking(booking)}
                                                            >
                                                                Details
                                                            </Button>
                                                            {!isCancelled && onCancelBooking && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2.5"
                                                                    onClick={() => onCancelBooking(booking)}
                                                                    title="Cancel Booking"
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Workflow View */}
                        {viewMode === "workflow" && (
                            <div className="space-y-4">
                                {bookings.map((booking) => {
                                    const steps = booking.currentWorkflow?.steps || [];
                                    const completedSteps = steps.filter((s) => s.status === "completed").length;
                                    const totalSteps = steps.length;
                                    const progress =
                                        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`border rounded-xl p-4 transition-all bg-card/50 hover:bg-card cursor-pointer ${
                                                isCancelled ? "hover:border-destructive/40" : "hover:border-primary/50"
                                            }`}
                                            onClick={() => onSelectBooking(booking)}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-[240px]">
                                                    <div
                                                        className={`${
                                                            isCancelled
                                                                ? "bg-destructive/10 text-destructive"
                                                                : "bg-primary/10 text-primary"
                                                        } w-24 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0`}
                                                    >
                                                        #{booking.bookingNumber}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-base truncate">
                                                            {booking.primaryCustomer?.firstName}{" "}
                                                            {booking.primaryCustomer?.lastName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground uppercase">
                                                                {booking.status}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] font-bold ${
                                                                    isCancelled ? "text-destructive" : "text-primary"
                                                                }`}
                                                            >
                                                                {completedSteps}/{totalSteps} Steps ({progress}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-x-auto py-2 scrollbar-thin">
                                                    <div className="flex items-center gap-2 min-w-max">
                                                        {steps.map((step, idx) => {
                                                            const isCompleted = step.status === "completed";
                                                            const isSkipped = step.status === "skipped";
                                                            const isActive =
                                                                step.status === "pending" &&
                                                                (idx === 0 || steps[idx - 1].status === "completed");

                                                            return (
                                                                <div key={step.id} className="flex items-center">
                                                                    {idx > 0 && (
                                                                        <div
                                                                            className={`h-[2px] w-6 shrink-0 ${
                                                                                steps[idx - 1].status === "completed"
                                                                                    ? isCancelled
                                                                                        ? "bg-destructive"
                                                                                        : "bg-primary"
                                                                                    : "bg-muted"
                                                                            }`}
                                                                        />
                                                                    )}
                                                                    <div
                                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs min-w-[140px] max-w-[180px] bg-background shadow-sm transition-all ${
                                                                            isActive
                                                                                ? isCancelled
                                                                                    ? "border-destructive ring-1 ring-destructive/30 animate-pulse"
                                                                                    : "border-primary ring-1 ring-primary/30 animate-pulse"
                                                                                : isCompleted
                                                                                  ? isCancelled
                                                                                      ? "border-destructive/20 bg-destructive/5"
                                                                                      : "border-primary/20 bg-primary/5"
                                                                                  : "border-muted"
                                                                        }`}
                                                                    >
                                                                        <div className="shrink-0">
                                                                            {isCompleted ? (
                                                                                <CheckCircle2
                                                                                    className={`w-4 h-4 ${
                                                                                        isCancelled
                                                                                            ? "text-destructive"
                                                                                            : "text-primary"
                                                                                    }`}
                                                                                />
                                                                            ) : isSkipped ? (
                                                                                <XCircle className="w-4 h-4 text-muted-foreground" />
                                                                            ) : (
                                                                                <Circle
                                                                                    className={`w-4 h-4 ${
                                                                                        isActive
                                                                                            ? isCancelled
                                                                                                ? "text-destructive"
                                                                                                : "text-primary"
                                                                                            : "text-muted-foreground"
                                                                                    }`}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p
                                                                                className={`font-semibold truncate text-[11px] ${
                                                                                    isCompleted
                                                                                        ? "line-through text-muted-foreground"
                                                                                        : "text-foreground"
                                                                                }`}
                                                                            >
                                                                                {step.label}
                                                                            </p>
                                                                            <p className="text-[9px] text-muted-foreground capitalize">
                                                                                {step.status}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {steps.length === 0 && (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No workflow steps assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex items-center gap-1 shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onSelectBooking(booking)}
                                                    >
                                                        {isCancelled ? "Details" : "Update Flow"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
