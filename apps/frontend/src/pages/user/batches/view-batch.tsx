import NAText from "@/components/na-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios";
import BookingService from "@/services/booking.service";
import type { IBatches } from "@/types/batches.types";
import type { IBooking } from "@/types/booking.types";
import type { IEmployee } from "@/types/employee.types";
import type { IWorkflowStep } from "@/types/workflow.types";
import {
    Calendar,
    Edit,
    Mail,
    Phone,
    Users,
    ClipboardList,
    Trash2,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CoordinatorModal } from "./_component/coordinator-modal";
import { BookingModal } from "./_component/booking-modal";

export default function BatchDetailsPage() {
    const { id } = useParams<{ id: string }>();

    const [batch, setBatch] = useState<IBatches>();
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(
        null,
    );
    const [selectedCoordinator, setSelectedCoordinator] =
        useState<IEmployee | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const getBranch = async () => {
        try {
            const batchData = await axiosInstance.get<IBatches>(
                `/batches/${id}`,
            );
            setBatch(batchData.data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load batches");
            }
        }
    };

    useEffect(() => {
        getBranch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!batch || newStatus === batch.status) return;

        // Check if all active bookings have completed workflows before activating batch
        if (newStatus === 'active') {
            const incompleteBookings = activeBookings.filter(booking => {
                const completedSteps = booking.currentWorkflow?.steps?.filter(s => s.status === 'completed').length || 0;
                const totalSteps = booking.currentWorkflow?.steps?.length || 0;
                return totalSteps === 0 || completedSteps < totalSteps;
            });

            if (incompleteBookings.length > 0) {
                toast.error(`Cannot activate batch: ${incompleteBookings.length} bookings have incomplete workflows. Please move them to another batch or put them on hold.`);
                return;
            }
        }

        setIsUpdatingStatus(true);
        try {
            await axiosInstance.patch(`/batches/${id}`, { status: newStatus });
            setBatch((prev) => (prev ? { ...prev, status: newStatus } : prev));
            toast.success("Batch status updated successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to update batch status");
            }
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await BookingService.cancelBooking(bookingId);
            toast.success("Booking cancelled successfully");
            getBranch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY DELETE this booking and all related data? This action cannot be undone.")) return;
        try {
            await BookingService.deleteBooking(bookingId);
            toast.success("Booking deleted permanently");
            getBranch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete booking. You might not have permission.");
        }
    };

    const activeBookings = batch?.bookings?.filter(b => b.status !== 'cancelled') || [];
    const cancelledBookings = batch?.bookings?.filter(b => b.status === 'cancelled') || [];

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
            case "on_hold":
                return (
                    <Badge className="bg-amber-100 text-amber-800">
                        On Hold
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {batch?.package?.name}
                        </h1>
                        <p className="text-muted-foreground">Batch Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {batch && getStatusBadge(batch.status)}
                    <div className="flex items-center gap-2">
                        <Select
                            value={batch?.status}
                            onValueChange={handleStatusUpdate}
                            disabled={isUpdatingStatus}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">
                                    Upcoming
                                </SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">
                                    Completed
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <NavLink to={`/batches/edit/${id}`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Batch
                        </Button>
                    </NavLink>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Batch Overview */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Start Date
                                    </p>
                                    <p className="font-medium">
                                        {batch &&
                                            new Date(
                                                batch.startDate,
                                            ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        End Date
                                    </p>
                                    <p className="font-medium">
                                        {batch &&
                                            new Date(
                                                batch.endDate,
                                            ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Capacity
                                </p>
                                <p className="font-medium">
                                    {batch && batch.bookedSeats}/
                                    {batch && batch.totalSeats} customers
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Package Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Package Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Description
                            </p>
                            <p className="text-sm">
                                {batch && batch.package?.description}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Destinations
                            </p>
                            <div className="flex flex-wrap gap-1">
                                <Badge variant="outline">
                                    {batch && batch.package?.destination}
                                </Badge>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Price
                            </p>
                            <p className="text-lg font-bold">
                                {batch && BookingService.formatCurrency(Number(batch.package?.price || 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coordinators */}
            <Card>
                <CardHeader>
                    <CardTitle>Batch Coordinators</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Experience</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batch &&
                                batch.coordinators?.map((coordinator) => (
                                    <TableRow
                                        key={coordinator.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            setSelectedCoordinator(coordinator)
                                        }
                                    >
                                        <TableCell className="font-medium">
                                            {coordinator.name || <NAText />}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {coordinator.specialization || (
                                                    <NAText />
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Phone className="w-3 h-3" />
                                                    {coordinator.phone || (
                                                        <NAText />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Mail className="w-3 h-3" />
                                                    {coordinator.email || (
                                                        <NAText />
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coordinator.experience || (
                                                <NAText />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    {batch && batch.coordinators?.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No coordinators were added
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bookings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        Bookings & Workflow Progress (
                        {activeBookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {activeBookings.map((booking) => {
                                const completedSteps =
                                    booking.currentWorkflow?.steps?.filter(
                                        (s) => s.status === "completed",
                                    ).length || 0;
                                const totalSteps =
                                    booking.currentWorkflow?.steps?.length || 0;
                                const progress =
                                    totalSteps > 0
                                        ? Math.round(
                                              (completedSteps / totalSteps) *
                                                  100,
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={booking.id}
                                        className="border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() =>
                                            setSelectedBooking(booking)
                                        }
                                    >
                                        <div className="bg-muted/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-primary/10 text-primary w-36 h-12 rounded-lg flex items-center justify-center font-bold text-lg">
                                                    #{booking.bookingNumber}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">
                                                        {
                                                            booking
                                                                .primaryCustomer
                                                                ?.firstName
                                                        }{" "}
                                                        {
                                                            booking
                                                                .primaryCustomer
                                                                ?.lastName
                                                        }
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-3 h-3" />
                                                        {
                                                            booking
                                                                .primaryCustomer
                                                                ?.email
                                                        }
                                                        <Phone className="w-3 h-3 ml-2" />
                                                        {
                                                            booking
                                                                .primaryCustomer
                                                                ?.phone
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {booking.status}
                                                </Badge>
                                                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                                                    <div className="flex justify-between w-full text-xs font-medium">
                                                        <span>Workflow</span>
                                                        <span>
                                                            {completedSteps}/
                                                            {totalSteps} Steps
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
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
                                                        setSelectedBooking(
                                                            booking,
                                                        );
                                                    }}
                                                >
                                                    Details
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelBooking(booking.id);
                                                    }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteBooking(booking.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Customers List Under Booking */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Users className="w-3 h-3" />
                                                    Travelers (
                                                    {booking.customers?.length})
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {booking.customers?.map(
                                                        (c) => (
                                                            <div
                                                                key={c.id}
                                                                className="flex items-center gap-2 p-2 rounded-lg bg-background border text-sm"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                                                    {
                                                                        c
                                                                            .firstName[0]
                                                                    }
                                                                    {
                                                                        c
                                                                            .lastName[0]
                                                                    }
                                                                </div>
                                                                <span className="truncate">
                                                                    {
                                                                        c.firstName
                                                                    }{" "}
                                                                    {c.lastName}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            {/* Workflow Tasks Preview */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <ClipboardList className="w-3 h-3" />
                                                    Workflow Status
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.currentWorkflow?.steps
                                                        ?.slice(0, 5)
                                                        .map(
                                                            (
                                                                step: IWorkflowStep,
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        step.id
                                                                    }
                                                                    variant={
                                                                        step.status ===
                                                                        "completed"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                    className="text-[10px] flex items-center gap-1"
                                                                >
                                                                    {step.status ===
                                                                    "completed" ? (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                                    ) : (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                                    )}
                                                                    {step.label}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    {totalSteps > 5 && (
                                                        <span className="text-[10px] text-muted-foreground flex items-center px-2">
                                                            +{totalSteps - 5}{" "}
                                                            more...
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
                    {activeBookings.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted">
                                <Users className="w-12 h-12 text-muted/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No active bookings found
                                </p>
                            </div>
                        )}
                </CardContent>
            </Card>

            {/* Cancelled Bookings */}
            {cancelledBookings.length > 0 && (
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <XCircle className="w-5 h-5" />
                            Cancelled Bookings ({cancelledBookings.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 opacity-70">
                            {cancelledBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="p-4 border rounded-xl bg-background flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted text-muted-foreground w-36 h-12 rounded-lg flex items-center justify-center font-bold text-lg line-through">
                                            #{booking.bookingNumber}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-muted-foreground line-through">
                                                {booking.primaryCustomer?.firstName} {booking.primaryCustomer?.lastName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{booking.primaryCustomer?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="destructive" className="uppercase">
                                            {booking.status}
                                        </Badge>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => handleDeleteBooking(booking.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            {selectedBooking && batch && (
                <BookingModal
                    booking={selectedBooking}
                    open={!!selectedBooking}
                    onOpenChange={(open) => !open && setSelectedBooking(null)}
                    onUpdate={getBranch}
                />
            )}

            {selectedCoordinator && (
                <CoordinatorModal
                    coordinator={selectedCoordinator}
                    open={!!selectedCoordinator}
                    onOpenChange={(open) =>
                        !open && setSelectedCoordinator(null)
                    }
                />
            )}
        </div>
    );
}
