import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import axiosInstance from "@/lib/axios";
import { CreateBatchDialog } from "@/pages/user/batches/_components/create-batch-dialog";
import { CreateBookingDialog } from "@/pages/user/bookings/_components/create-booking-dialog";
import EnhancedCustomerForm from "@/pages/user/customers/_components/enhanced-customer-form";
import { LeadForm } from "@/pages/user/leads/_components/lead-form";
import { AddPaymentDialog } from "@/pages/user/payments/_components/add-payment-dialog";
import type { IBatches } from "@/types/batches.types";
import type { ICustomer } from "@/types/customer.type";
import type { ILead } from "@/types/lead/lead.entity";
import {
    ArrowLeft,
    Banknote,
    BookOpen,
    Building2,
    CalendarPlus,
    Lock,
    Loader2,
    Search,
    User,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Screen =
    | "home"
    | "create-lead"
    | "create-customer"
    | "block-seats-pick-batch"
    | "block-seats-form";

interface QuickCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ACTIONS = [
    {
        id: "create-batch",
        icon: CalendarPlus,
        label: "Create Batch",
        description: "Schedule a new tour batch",
        color: "text-blue-500",
        bg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    },
    {
        id: "block-seats",
        icon: Lock,
        label: "Block Batch Seats",
        description: "Temporarily reserve seats",
        color: "text-amber-500",
        bg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    },
    {
        id: "create-lead",
        icon: BookOpen,
        label: "Create Lead",
        description: "Add a new sales lead",
        color: "text-purple-500",
        bg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    },
    {
        id: "create-customer",
        icon: User,
        label: "Create Customer",
        description: "Register a new customer",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    },
    {
        id: "create-booking",
        icon: Users,
        label: "Create Booking",
        description: "Book a customer into a batch",
        color: "text-rose-500",
        bg: "bg-rose-500/10 group-hover:bg-rose-500/20",
    },
    {
        id: "create-payment",
        icon: Banknote,
        label: "Create Payment",
        description: "Record a new payment",
        color: "text-teal-500",
        bg: "bg-teal-500/10 group-hover:bg-teal-500/20",
    },
] as const;

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
    const [screen, setScreen] = useState<Screen>("home");

    // Standalone dialog states
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    // Block seats state
    const [batches, setBatches] = useState<IBatches[]>([]);
    const [batchSearch, setBatchSearch] = useState("");
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<IBatches | null>(null);
    const [blockSlots, setBlockSlots] = useState(1);
    const [blockReason, setBlockReason] = useState("");
    const [isBlocking, setIsBlocking] = useState(false);

    // Lead type
    const [leadType, setLeadType] = useState<"individual" | "company" | null>(null);

    const resetState = useCallback(() => {
        setScreen("home");
        setLeadType(null);
        setSelectedBatch(null);
        setBatchSearch("");
        setBlockSlots(1);
        setBlockReason("");
    }, []);

    const handleOpenChange = (val: boolean) => {
        if (!val) resetState();
        onOpenChange(val);
    };

    const handleAction = (id: string) => {
        if (id === "create-batch") {
            setBatchDialogOpen(true);
        } else if (id === "create-booking") {
            setBookingDialogOpen(true);
        } else if (id === "create-payment") {
            setPaymentDialogOpen(true);
        } else if (id === "block-seats") {
            setScreen("block-seats-pick-batch");
            fetchBatches("");
        } else if (id === "create-lead") {
            setScreen("create-lead");
        } else if (id === "create-customer") {
            setScreen("create-customer");
        }
    };

    const fetchBatches = useCallback(async (search: string) => {
        setLoadingBatches(true);
        try {
            const res = await axiosInstance.get<any>("/batches", {
                params: { search: search || undefined, limit: 30 },
            });
            const rawData = res.data?.data || res.data || [];
            // Filter for active/upcoming only
            const filtered = Array.isArray(rawData)
                ? rawData.filter((b: IBatches) =>
                      b.status === "upcoming" || b.status === "active",
                  )
                : [];
            setBatches(filtered);
        } catch {
            setBatches([]);
        } finally {
            setLoadingBatches(false);
        }
    }, []);

    useEffect(() => {
        if (screen !== "block-seats-pick-batch") return;
        const timer = setTimeout(() => fetchBatches(batchSearch), 400);
        return () => clearTimeout(timer);
    }, [batchSearch, screen, fetchBatches]);

    const handleBlockSeats = async () => {
        if (!selectedBatch) return;
        if (blockSlots < 1) {
            toast.error("Please enter a valid number of slots");
            return;
        }
        setIsBlocking(true);
        try {
            await axiosInstance.post(`/batches/${selectedBatch.id}/block`, {
                slots: blockSlots,
                reason: blockReason,
            });
            toast.success(`${blockSlots} seat(s) blocked successfully`);
            handleOpenChange(false);
        } catch {
            toast.error("Failed to block slots");
        } finally {
            setIsBlocking(false);
        }
    };

    const handleLeadSaved = (_isCreating: boolean, _lead: ILead) => {
        toast.success("Lead created successfully");
        handleOpenChange(false);
    };

    const handleCustomerSaved = (_customer: ICustomer) => {
        toast.success("Customer created successfully");
        handleOpenChange(false);
    };

    const getTitle = () => {
        switch (screen) {
            case "create-lead":
                return leadType ? `New ${leadType === "individual" ? "Individual" : "Company"} Lead` : "Create Lead";
            case "create-customer":
                return "Create Customer";
            case "block-seats-pick-batch":
                return "Select a Batch";
            case "block-seats-form":
                return "Block Seats";
            default:
                return "Quick Create";
        }
    };

    const filteredBatches = batches.filter((b) => {
        if (!batchSearch) return true;
        const q = batchSearch.toLowerCase();
        return (
            b.package?.name?.toLowerCase().includes(q) ||
            b.package?.destination?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className={`overflow-hidden p-0 gap-0 ${
                        screen === "create-customer"
                            ? "sm:max-w-[900px]"
                            : screen === "create-lead" && leadType
                              ? "sm:max-w-[680px]"
                              : "sm:max-w-[560px]"
                    }`}
                >
                    {/* Header */}
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            {screen !== "home" && (
                                <button
                                    onClick={() => {
                                        if (screen === "block-seats-form") {
                                            setScreen("block-seats-pick-batch");
                                        } else if (screen === "create-lead" && leadType) {
                                            setLeadType(null);
                                        } else {
                                            setScreen("home");
                                            setLeadType(null);
                                        }
                                    }}
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mr-1 cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            )}
                            {getTitle()}
                        </DialogTitle>
                    </DialogHeader>

                    {/* === HOME SCREEN === */}
                    {screen === "home" && (
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-2 gap-3">
                                {ACTIONS.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleAction(action.id)}
                                        className="group flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm hover:bg-accent/30 active:scale-[0.98] cursor-pointer"
                                    >
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${action.bg}`}
                                        >
                                            <action.icon className={`h-5 w-5 ${action.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold leading-tight">
                                                {action.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {action.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === CREATE LEAD — type picker === */}
                    {screen === "create-lead" && !leadType && (
                        <div className="px-6 py-8">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLeadType("individual")}
                                    className="flex flex-col items-center justify-center p-6 rounded-xl border hover:border-primary hover:bg-accent/40 transition-all duration-200 group text-center space-y-3 cursor-pointer"
                                >
                                    <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Individual Lead</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Solo travelers, couples, families
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setLeadType("company")}
                                    className="flex flex-col items-center justify-center p-6 rounded-xl border hover:border-primary hover:bg-accent/40 transition-all duration-200 group text-center space-y-3 cursor-pointer"
                                >
                                    <div className="p-4 rounded-full bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Company Lead</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Corporate clients, organizations
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* === LEAD FORM === */}
                    {screen === "create-lead" && leadType && (
                        <ScrollArea className="max-h-[75vh]">
                            <div className="px-6 py-4">
                                <LeadForm
                                    isCreating={true}
                                    onSave={handleLeadSaved}
                                    onClose={handleOpenChange}
                                    defaultLeadType={leadType}
                                />
                            </div>
                        </ScrollArea>
                    )}

                    {/* === CREATE CUSTOMER === */}
                    {screen === "create-customer" && (
                        <ScrollArea className="max-h-[82vh]">
                            <div className="px-6 py-4">
                                <EnhancedCustomerForm
                                    onSave={handleCustomerSaved}
                                    onCancel={() => handleOpenChange(false)}
                                />
                            </div>
                        </ScrollArea>
                    )}

                    {/* === BLOCK SEATS — pick batch === */}
                    {screen === "block-seats-pick-batch" && (
                        <div className="px-6 py-4 flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Pick an active or upcoming batch to temporarily block seats on.
                            </p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search by package or destination…"
                                    value={batchSearch}
                                    onChange={(e) => setBatchSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <ScrollArea className="h-64 rounded-xl border">
                                {loadingBatches ? (
                                    <div className="flex items-center justify-center py-14">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredBatches.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        No active or upcoming batches found.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredBatches.map((batch) => (
                                            <button
                                                key={batch.id}
                                                onClick={() => {
                                                    setSelectedBatch(batch);
                                                    setScreen("block-seats-form");
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {batch.package?.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {batch.package?.destination} ·{" "}
                                                        {new Date(batch.startDate).toLocaleDateString()} –{" "}
                                                        {new Date(batch.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-medium">
                                                        {batch.bookedSeats}/{batch.totalSeats} booked
                                                    </p>
                                                    <p
                                                        className={`text-xs capitalize font-semibold ${
                                                            batch.status === "active"
                                                                ? "text-green-600"
                                                                : "text-blue-600"
                                                        }`}
                                                    >
                                                        {batch.status}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="pb-2" />
                        </div>
                    )}

                    {/* === BLOCK SEATS — form === */}
                    {screen === "block-seats-form" && selectedBatch && (
                        <div className="px-6 py-5 flex flex-col gap-5">
                            {/* Selected batch summary */}
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-sm font-semibold">{selectedBatch.package?.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedBatch.package?.destination} ·{" "}
                                    {new Date(selectedBatch.startDate).toLocaleDateString()} –{" "}
                                    {new Date(selectedBatch.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Available:{" "}
                                    <span className="font-semibold text-foreground">
                                        {selectedBatch.totalSeats -
                                            selectedBatch.bookedSeats -
                                            (selectedBatch.blockedSeats ?? 0)}
                                    </span>{" "}
                                    of {selectedBatch.totalSeats} seats
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qc-block-slots">Number of Slots</Label>
                                <Input
                                    id="qc-block-slots"
                                    type="number"
                                    min={1}
                                    value={blockSlots}
                                    onChange={(e) =>
                                        setBlockSlots(parseInt(e.target.value) || 1)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qc-block-reason">Reason / Inquiry Details</Label>
                                <Input
                                    id="qc-block-reason"
                                    placeholder="e.g. Enquiry from John Doe – will confirm in 2 days"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pb-1">
                                <Button
                                    variant="outline"
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setScreen("block-seats-pick-batch")}
                                    disabled={isBlocking}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 cursor-pointer"
                                    onClick={handleBlockSeats}
                                    disabled={isBlocking}
                                >
                                    {isBlocking ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Blocking…
                                        </>
                                    ) : (
                                        "Confirm Block"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Standalone dialogs — open on top */}
            <CreateBatchDialog
                open={batchDialogOpen}
                onOpenChange={setBatchDialogOpen}
                onSuccess={() => {
                    setBatchDialogOpen(false);
                    handleOpenChange(false);
                }}
            />

            <CreateBookingDialog
                open={bookingDialogOpen}
                onOpenChange={setBookingDialogOpen}
                onBookingCreated={() => {
                    setBookingDialogOpen(false);
                    handleOpenChange(false);
                }}
            />

            <AddPaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                onPaymentAdded={() => {
                    setPaymentDialogOpen(false);
                    handleOpenChange(false);
                }}
            />
        </>
    );
}
