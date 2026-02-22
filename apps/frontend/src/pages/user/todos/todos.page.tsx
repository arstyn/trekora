import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingService from "@/services/booking.service";
import type { ChecklistItemResponse } from "@/services/booking.service";
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    FileCheck,
    LayoutList,
    Search,
    User,
    Check,
    Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import type { IBookingListItem } from "@/types/booking.types";
import type { IEmployee } from "@/types/employee.types";

export default function TodosPage() {
    const [userData, setUserData] = useState<IEmployee | null>(null);
    const [myTasks, setMyTasks] = useState<ChecklistItemResponse[]>([]);
    const [pendingDocs, setPendingDocs] = useState<IBookingListItem[]>([]);
    const [pendingPayments, setPendingPayments] = useState<IBookingListItem[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProfileData = async () => {
        try {
            const res = await axiosInstance.get<IEmployee>(`/employee/profile`);
            setUserData(res.data);
            return res.data;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const fetchData = async (userId?: string) => {
        try {
            setLoading(true);

            const currentUserId = userId || userData?.id;
            if (!currentUserId) return;

            // Fetch my tasks
            const tasks = await BookingService.getAllChecklists({
                assignedToId: currentUserId,
                completed: false,
            });
            setMyTasks(tasks);

            // Fetch pending verification bookings
            const allBookings = await BookingService.getAllBookings();

            // In a real app, you'd have specific endpoints for these filters
            const docs = allBookings.filter((b) => b.status === "pending");
            setPendingDocs(docs);
            setPendingPayments(docs);
        } catch (error) {
            console.error("Error fetching todos:", error);
            toast.error("Failed to load todos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadPage = async () => {
            const profile = await fetchProfileData();
            if (profile) {
                fetchData(profile.id);
            }
        };
        loadPage();
    }, []);

    const handleToggleTask = async (taskId: string) => {
        try {
            await BookingService.toggleChecklistItem(taskId);
            setMyTasks((prev) => prev.filter((t) => t.id !== taskId));
            toast.success("Task completed!");
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const handleVerifyDocs = async (bookingId: string) => {
        try {
            await BookingService.verifyDocumentation(bookingId);
            setPendingDocs((prev) => prev.filter((b) => b.id !== bookingId));
            toast.success("Documentation verified");
        } catch (error) {
            toast.error("Failed to verify documentation");
        }
    };

    const handleVerifyPayment = async (bookingId: string) => {
        try {
            await BookingService.verifyPayment(bookingId);
            setPendingPayments((prev) =>
                prev.filter((b) => b.id !== bookingId),
            );
            toast.success("Payment verified");
        } catch (error) {
            toast.error("Failed to verify payment");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
                    <p className="text-muted-foreground">
                        Manage your assigned tasks and verifications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchData()}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Clock className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="tasks" className="flex gap-2">
                        <LayoutList className="h-4 w-4" />
                        My Tasks
                        {myTasks.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-1 text-[10px] h-4 min-w-[16px] px-1"
                            >
                                {myTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="ops" className="flex gap-2">
                        <FileCheck className="h-4 w-4" />
                        Operations
                    </TabsTrigger>
                    <TabsTrigger value="finance" className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Finance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                Tasks Assigned to Me
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {myTasks.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                                            <Check className="h-8 w-8" />
                                        </div>
                                        <p>No pending tasks assigned to you.</p>
                                    </div>
                                ) : (
                                    myTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                                        >
                                            <Checkbox
                                                id={task.id}
                                                checked={false}
                                                onCheckedChange={() =>
                                                    handleToggleTask(task.id)
                                                }
                                                className="mt-1 h-5 w-5"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <label
                                                        htmlFor={task.id}
                                                        className="font-medium cursor-pointer"
                                                    >
                                                        {task.item}
                                                    </label>
                                                    {task.mandatory && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="h-5 scale-90"
                                                        >
                                                            Required
                                                        </Badge>
                                                    )}
                                                </div>
                                                {task.notes && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {task.notes}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        Created by{" "}
                                                        {task.createdBy?.name ||
                                                            "System"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        Due:{" "}
                                                        {new Date(
                                                            task.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {task.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ops" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-primary" />
                                Documentation Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingDocs.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>
                                            No bookings pending documentation
                                            verification.
                                        </p>
                                    </div>
                                ) : (
                                    pendingDocs.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-bold">
                                                    {booking.bookingNumber}
                                                </p>
                                                <p className="text-sm">
                                                    {booking.customerName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.packageName}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    View Docs
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleVerifyDocs(
                                                            booking.id,
                                                        )
                                                    }
                                                >
                                                    Verify
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Payment Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingPayments.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>
                                            No bookings pending payment
                                            verification.
                                        </p>
                                    </div>
                                ) : (
                                    pendingPayments.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-bold text-lg">
                                                    {booking.bookingNumber}
                                                </p>
                                                <p className="font-medium">
                                                    {booking.customerName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Amount:{" "}
                                                    {BookingService.formatCurrency(
                                                        booking.totalAmount,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    View Payments
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() =>
                                                        handleVerifyPayment(
                                                            booking.id,
                                                        )
                                                    }
                                                >
                                                    Verify Payment
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
