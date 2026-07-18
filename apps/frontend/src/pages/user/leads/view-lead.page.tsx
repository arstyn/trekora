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
import type { ILead } from "@/types/lead/lead.entity";
import { format } from "date-fns";
import { ArrowLeft, Building, Mail, Phone, User, Globe, Briefcase, UserCheck, Users, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LeadForm } from "./_components/lead-form";
import { LeadUpdates } from "./_components/lead-updates";
import { ReminderTab } from "./_components/reminder-tab";

export default function LeadDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lead, setLead] = useState<ILead | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
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

    const isCompany = lead.leadType === "company" || (lead.leadType !== "individual" && !!lead.company);

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
                        {isCompany ? (
                            <Building className="h-6 w-6 text-purple-500 shrink-0" />
                        ) : (
                            <User className="h-6 w-6 text-blue-500 shrink-0" />
                        )}
                        <span>{lead.name || lead.company || "Unnamed Lead"}</span>
                        <Badge
                            variant={
                                lead.status === "converted"
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {lead.status}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={
                                isCompany
                                    ? "text-purple-500 border-purple-500/30"
                                    : "text-blue-500 border-blue-500/30"
                            }
                        >
                            {isCompany ? "Company" : "Individual"}
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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {isCompany && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Company Name</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lead.company || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium">Website</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {lead.companyWebsite ? (
                                                    <a
                                                        href={lead.companyWebsite.startsWith('http') ? lead.companyWebsite : `https://${lead.companyWebsite}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {lead.companyWebsite}
                                                    </a>
                                                ) : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Industry</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lead.companyIndustry || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Company Size</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lead.companySize || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Contact Designation</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lead.contactDesignation || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Package Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                {lead.isCustomPackage && lead.budget !== undefined && lead.budget !== null && (
                                    <div className="flex items-center gap-3">
                                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Client Budget
                                            </p>
                                            <p className="text-sm text-muted-foreground font-semibold text-primary">
                                                ₹{Number(lead.budget).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {lead.isCustomPackage ? (
                                <div className="space-y-3 pt-2 border-t">
                                    <p className="text-sm font-medium">Custom Package Details</p>
                                    <div className="p-3 bg-secondary/50 border rounded-md space-y-2">
                                        {lead.customPackageName && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Package Name</p>
                                                <p className="text-sm font-medium">{lead.customPackageName}</p>
                                            </div>
                                        )}
                                        {lead.customPackageDestination && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Destination</p>
                                                <p className="text-sm font-medium">{lead.customPackageDestination}</p>
                                            </div>
                                        )}
                                        {(lead.customPackageDays !== undefined || lead.customPackageNights !== undefined) && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Duration</p>
                                                <p className="text-sm font-medium">
                                                    {lead.customPackageDays || 0} Days / {lead.customPackageNights || 0} Nights
                                                </p>
                                            </div>
                                        )}
                                        {lead.customPackagePrice !== undefined && lead.customPackagePrice !== null && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Estimated Budget</p>
                                                <p className="text-sm font-medium flex items-center gap-0.5">
                                                    <IndianRupee className="h-3 w-3" />
                                                    {Number(lead.customPackagePrice).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {lead.customPackageDescription && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Requirements</p>
                                                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed mt-1">
                                                    {lead.customPackageDescription}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {lead.customPackagePrice && lead.numberOfPassengers ? (
                                        <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium">Estimated Total:</span>
                                                <span className="font-semibold flex items-center gap-0.5 text-primary text-sm">
                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                    {(Number(lead.customPackagePrice) * lead.numberOfPassengers).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                lead.preferredPackage && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            Preferred Package
                                        </p>
                                        <div className="border border-muted/80 bg-muted/10 rounded-lg overflow-hidden flex flex-col shadow-none">
                                            {/* Photo Header */}
                                            <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden">
                                                {lead.preferredPackage.thumbnail ? (
                                                    <img
                                                        src={lead.preferredPackage.thumbnail}
                                                        alt={lead.preferredPackage.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
                                                        <Briefcase className="h-8 w-8" />
                                                        <span className="text-[10px]">No package image</span>
                                                    </div>
                                                )}
                                                {lead.preferredPackage.destination && (
                                                    <Badge className="absolute bottom-2 left-2 bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-xs text-[10px]">
                                                        {lead.preferredPackage.destination}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Package Title & Duration */}
                                            <div className="p-3 space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-bold text-sm text-foreground leading-tight">
                                                        {lead.preferredPackage.name}
                                                    </p>
                                                    {(lead.preferredPackage.days !== undefined || lead.preferredPackage.nights !== undefined) && (
                                                        <Badge variant="secondary" className="shrink-0 text-[10px] py-0 px-1.5 h-5 flex items-center">
                                                            {lead.preferredPackage.days || 0}D / {lead.preferredPackage.nights || 0}N
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Pricing Tiers Section */}
                                                {lead.preferredPackage.packageTiers && lead.preferredPackage.packageTiers.length > 0 ? (
                                                    <div className="pt-2 border-t space-y-1.5">
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Pricing Tiers
                                                        </p>
                                                        <div className="space-y-1">
                                                            {lead.preferredPackage.packageTiers.map((tier) => {
                                                                 const adultCost = Number(tier.adultCost || 0);
                                                                return (
                                                                    <div key={tier.id || tier.name} className="flex justify-between items-center text-xs py-1 px-2 rounded-md bg-secondary/50 border border-border/40">
                                                                        <span className="font-medium text-muted-foreground">{tier.name}</span>
                                                                        <span className="font-semibold text-foreground">
                                                                            ₹{adultCost.toLocaleString("en-IN")}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="pt-2 border-t text-[10px] text-muted-foreground italic text-center">
                                                        No pricing tiers defined
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
            </div>

            {/* Bottom Section - Activity, Notes & Reminders */}
            <div className="w-full">
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
