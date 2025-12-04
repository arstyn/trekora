import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { preBookingService } from "@/services/pre-booking.service";
import type { ILead } from "@/types/lead/lead.entity";
import { format } from "date-fns";
import { ArrowLeft, Building, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LeadForm } from "../_components/lead-form";
import { LeadUpdates } from "../_components/lead-updates";
import { ReminderTab } from "../_components/reminder-tab";

export default function LeadDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lead, setLead] = useState<ILead | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [note, setNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);

    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            try {
                const res = await axiosInstance.get<ILead>(`/lead/${id}`);
                setLead(res.data);
                setNote(res.data.notes || "");
            } catch (error) {
                console.error("Failed to fetch lead:", error);
                toast.error("Failed to load lead details");
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    const handleEdit = (_isCreating: boolean, updatedLead: ILead) => {
        setLead(updatedLead);
        setNote(updatedLead.notes || "");
        setShowEditForm(false);
        toast.success("Lead updated successfully");
    };

    const handleConvert = async () => {
        if (!lead) return;
        try {
            setIsConverting(true);
            const preBooking = await preBookingService.convertLeadToPreBooking({
                leadId: lead.id,
            });
            toast.success("Lead converted to pre-booking successfully!");
            navigate(`/pre-bookings?selected=${preBooking.id}`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to convert lead");
            }
        } finally {
            setIsConverting(false);
        }
    };

    const handleSaveNote = async () => {
        if (!lead) return;
        try {
            setSavingNote(true);
            // We update the whole lead, but only change notes.
            // Ideally backend should support partial updates or we send all fields.
            // LeadForm sends all fields. Here we might need to be careful.
            // Let's assume PUT /lead/:id accepts partial updates or we just send notes.
            // Looking at LeadController.update, it takes Partial<Lead>.
            const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, {
                notes: note,
            });
            if (res.data) {
                setLead((prev) =>
                    prev ? { ...prev, notes: res.data.notes } : null
                );
                toast.success("Note saved");
            }
        } catch (error) {
            console.error("Failed to save note:", error);
            toast.error("Failed to save note");
        } finally {
            setSavingNote(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!lead) return <div className="p-8">Lead not found</div>;

    return (
        <div className="container mx-auto px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {lead.name}
                        <Badge
                            variant={
                                lead.status === "converted"
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {lead.status}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Created on {format(new Date(lead.createdAt), "PPP")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowEditForm(true)}
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={handleConvert}
                        disabled={isConverting || lead.status === "converted"}
                    >
                        {isConverting ? "Converting..." : "Convert"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium">Email</p>
                                    <p
                                        className="text-sm text-muted-foreground truncate"
                                        title={lead.email}
                                    >
                                        {lead.email || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">
                                        {lead.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Company
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {lead.company || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Package Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Passengers
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {lead.numberOfPassengers}
                                    </p>
                                </div>
                            </div>
                            {lead.preferredPackage && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Preferred Package
                                    </p>
                                    <div className="p-2 bg-secondary rounded-md">
                                        <p className="text-sm font-medium">
                                            {lead.preferredPackage.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ₹{lead.preferredPackage.price}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Activity & Notes */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="activity">
                                Activity Log
                            </TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="reminders">
                                Reminders
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="activity" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity History</CardTitle>
                                    <CardDescription>
                                        Recent updates and interactions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LeadUpdates
                                        leadId={lead.id}
                                        listClassName="max-h-[500px]"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="notes" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                    <CardDescription>
                                        Private notes about this lead
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                        placeholder="Add a note..."
                                        rows={6}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSaveNote}
                                            disabled={savingNote}
                                        >
                                            {savingNote
                                                ? "Saving..."
                                                : "Save Note"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="reminders" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reminders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ReminderTab leadId={lead.id} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                    </DialogHeader>
                    <LeadForm
                        lead={lead}
                        isCreating={false}
                        onSave={handleEdit}
                        onClose={() => setShowEditForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
