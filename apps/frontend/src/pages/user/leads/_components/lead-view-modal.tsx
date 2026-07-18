import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { ILead, ILeadStatus } from "@/types/lead/lead.entity";
import type { IPackages } from "@/types/package.schema";
import { format } from "date-fns";
import {
    Check,
    ChevronsUpDown,
    IndianRupee,
    Package,
    Save,
    Search,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LeadForm } from "./lead-form";
import { LeadUpdates } from "./lead-updates";
import { ReminderTab } from "./reminder-tab";

type ViewLeadDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: ILead | null;
    onEdit: (isCreating: boolean, leadData: ILead) => void;
};

export function ViewLeadDialog({
    open,
    onOpenChange,
    lead,
    onEdit,
}: ViewLeadDialogProps) {
    const [showEditForm, setShowEditForm] = useState(false);
    const [packages, setPackages] = useState<IPackages[]>([]);
    const [isSavingPackagePreferences, setIsSavingPackagePreferences] =
        useState(false);

    // Package preferences state
    const [numberOfPassengers, setNumberOfPassengers] = useState<number | "">(1);
    const [preferredPackageId, setPreferredPackageId] = useState<
        string | undefined
    >();
    const [consideredPackageIds, setConsideredPackageIds] = useState<string[]>(
        []
    );
    const [openPackageSelect, setOpenPackageSelect] = useState(false);
    const [openConsideredSelect, setOpenConsideredSelect] = useState(false);
    const [packageSearch, setPackageSearch] = useState("");
    const [consideredSearch, setConsideredSearch] = useState("");

    // Custom package states
    const [isCustomPackage, setIsCustomPackage] = useState<boolean>(false);
    const [customPackageName, setCustomPackageName] = useState<string>("");
    const [customPackageDestination, setCustomPackageDestination] = useState<string>("");
    const [customPackageDays, setCustomPackageDays] = useState<number | "">("");
    const [customPackageNights, setCustomPackageNights] = useState<number | "">("");
    const [customPackagePrice, setCustomPackagePrice] = useState<number | "">("");
    const [customPackageDescription, setCustomPackageDescription] = useState<string>("");
    const [budget, setBudget] = useState<number | "">("");

    const getPkgPrice = (pkg: IPackages) => {
        if (!pkg) return 0;
        const tier = pkg.packageTiers?.[0];
        if (!tier) return 0;
        return Number(tier.adultCost) || 0;
    };

    const navigate = useNavigate();

    // Fetch packages if lead is qualified or converted
    useEffect(() => {
        const fetchPackages = async () => {
            if (!lead) return;

            if (lead.status === "qualified" || lead.status === "converted") {
                try {
                    const res = await axiosInstance.get<IPackages[]>(
                        "/packages"
                    );
                    setPackages(
                        res.data.filter((pkg) => pkg.status === "published")
                    );
                } catch (error) {
                    console.error("Failed to fetch packages:", error);
                    toast.error("Failed to load packages");
                }
            }
        };
        fetchPackages();
    }, [lead]);

    // Initialize package preferences from lead data
    useEffect(() => {
        if (lead) {
            setNumberOfPassengers(lead.numberOfPassengers || 1);
            setPreferredPackageId(lead.preferredPackageId);
            setConsideredPackageIds(lead.consideredPackageIds || []);
            setIsCustomPackage(lead.isCustomPackage || false);
            setCustomPackageName(lead.customPackageName || "");
            setCustomPackageDestination(lead.customPackageDestination || "");
            setCustomPackageDays(lead.customPackageDays !== undefined && lead.customPackageDays !== null ? lead.customPackageDays : "");
            setCustomPackageNights(lead.customPackageNights !== undefined && lead.customPackageNights !== null ? lead.customPackageNights : "");
            setCustomPackagePrice(lead.customPackagePrice !== undefined && lead.customPackagePrice !== null ? lead.customPackagePrice : "");
            setCustomPackageDescription(lead.customPackageDescription || "");
            setBudget(lead.budget !== undefined && lead.budget !== null ? lead.budget : "");
        }
    }, [lead]);

    if (!lead) return null;

    // Helper for empty fields
    const display = (value?: string | number | boolean | null) =>
        value !== undefined && value !== null && value !== "" ? (
            value
        ) : (
            <span className="text-muted-foreground italic">N/A</span>
        );

    const updateLeadStatus = async (status: ILeadStatus) => {
        try {
            const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, {
                name: lead.name,
                status: status,
            });
            if (res) {
                onEdit(false, { ...lead, ...res.data });
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load updates");
            }
        }
    };

    const handleSavePackagePreferences = async () => {
        try {
            setIsSavingPackagePreferences(true);
            const isCustom = isCustomPackage && lead.leadType === "company";
            const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, {
                name: lead.name,
                status: lead.status,
                numberOfPassengers: numberOfPassengers === "" ? 1 : numberOfPassengers,
                isCustomPackage: isCustom,
                preferredPackageId: isCustom ? null : (preferredPackageId || null),
                consideredPackageIds: isCustom ? [] : (consideredPackageIds || []),
                customPackageName: isCustom ? (customPackageName || null) : null,
                customPackageDestination: isCustom ? (customPackageDestination || null) : null,
                customPackageDays: isCustom ? (customPackageDays !== "" ? Number(customPackageDays) : null) : null,
                customPackageNights: isCustom ? (customPackageNights !== "" ? Number(customPackageNights) : null) : null,
                customPackagePrice: isCustom ? (customPackagePrice !== "" ? Number(customPackagePrice) : null) : null,
                customPackageDescription: isCustom ? (customPackageDescription || null) : null,
                budget: isCustom ? (budget !== "" ? Number(budget) : null) : null,
            });
            if (res) {
                onEdit(false, { ...lead, ...res.data });
                toast.success("Package preferences updated successfully!");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to update package preferences");
            }
        } finally {
            setIsSavingPackagePreferences(false);
        }
    };


    return (
        <Dialog
            open={open}
            onOpenChange={(on) => {
                onOpenChange(on);
                setShowEditForm(false);
            }}
        >
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Lead Details
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh] overflow-auto pr-5">
                    {!showEditForm && (
                        <div className="space-y-8">
                            {/* Lead details */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-6 ">
                                    {/* Left column */}
                                    <div className="space-y-3">
                                        <Detail
                                            label="Name"
                                            value={display(lead.name)}
                                        />
                                        <Detail
                                            label="Company"
                                            value={display(lead.company)}
                                        />
                                        <Detail
                                            label="Email"
                                            value={display(lead.email)}
                                        />
                                        <Detail
                                            label="Passengers"
                                            value={display(lead.numberOfPassengers)}
                                        />
                                    </div>
                                    {/* Right column */}
                                    <div className="space-y-3">
                                        <Detail
                                            label="Phone"
                                            value={display(lead.phone)}
                                        />
                                        <Detail
                                            label="Status"
                                            value={display(lead.status)}
                                        />
                                        {lead.isCustomPackage && (
                                            <Detail
                                                label="Client Budget"
                                                value={lead.budget !== undefined && lead.budget !== null ? `₹${Number(lead.budget).toLocaleString()}` : <span className="text-muted-foreground italic">N/A</span>}
                                            />
                                        )}
                                        <Detail
                                            label="Created At"
                                            value={format(
                                                new Date(lead.createdAt),
                                                "PPP"
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Package Preferences Section - Editable */}
                                {(lead.status === "qualified" ||
                                    lead.status === "converted") && (
                                        <>
                                            <Separator className="my-4" />
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between text-base">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4" />
                                                            Package Preferences
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={
                                                                handleSavePackagePreferences
                                                            }
                                                            disabled={
                                                                isSavingPackagePreferences
                                                            }
                                                            className="h-8"
                                                        >
                                                            <Save className="h-3 w-3 mr-1" />
                                                            {isSavingPackagePreferences
                                                                ? "Saving..."
                                                                : "Save"}
                                                        </Button>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Edit package selection and
                                                        travel details
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                     {lead.leadType === "company" && (
                                                         <div className="space-y-2">
                                                             <Label>Package Preference Type</Label>
                                                             <div className="flex gap-4">
                                                                 <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-md hover:bg-accent/40 w-1/2 justify-center transition-all select-none ${!isCustomPackage ? "border-primary bg-primary/5" : ""}`}>
                                                                     <input
                                                                         type="radio"
                                                                         name="packageTypeView"
                                                                         checked={!isCustomPackage}
                                                                         onChange={() => setIsCustomPackage(false)}
                                                                         className="text-primary focus:ring-primary h-4 w-4"
                                                                     />
                                                                     <span className="text-sm font-medium">Existing Package</span>
                                                                 </label>
                                                                 <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-md hover:bg-accent/40 w-1/2 justify-center transition-all select-none ${isCustomPackage ? "border-primary bg-primary/5" : ""}`}>
                                                                     <input
                                                                         type="radio"
                                                                         name="packageTypeView"
                                                                         checked={isCustomPackage}
                                                                         onChange={() => setIsCustomPackage(true)}
                                                                         className="text-primary focus:ring-primary h-4 w-4"
                                                                     />
                                                                     <span className="text-sm font-medium">Custom Package</span>
                                                                 </label>
                                                             </div>
                                                         </div>
                                                     )}

                                                     {isCustomPackage && lead.leadType === "company" ? (
                                                         <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                                             <h4 className="text-sm font-semibold text-primary">Custom Package Details</h4>
                                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="customPackageName">Package Name</Label>
                                                                     <Input
                                                                         id="customPackageName"
                                                                         placeholder="e.g. Annual Retreat Package"
                                                                         value={customPackageName}
                                                                         onChange={(e) => setCustomPackageName(e.target.value)}
                                                                     />
                                                                 </div>
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="customPackageDestination">Destination</Label>
                                                                     <Input
                                                                         id="customPackageDestination"
                                                                         placeholder="e.g. Goa, Manali"
                                                                         value={customPackageDestination}
                                                                         onChange={(e) => setCustomPackageDestination(e.target.value)}
                                                                     />
                                                                 </div>
                                                             </div>

                                                             <div className="grid grid-cols-3 gap-4">
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="customPackageDays">Days</Label>
                                                                     <Input
                                                                         id="customPackageDays"
                                                                         type="number"
                                                                         min="0"
                                                                         value={customPackageDays}
                                                                         onChange={(e) => setCustomPackageDays(e.target.value === "" ? "" : Number(e.target.value))}
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="customPackageNights">Nights</Label>
                                                                     <Input
                                                                         id="customPackageNights"
                                                                         type="number"
                                                                         min="0"
                                                                         value={customPackageNights}
                                                                         onChange={(e) => setCustomPackageNights(e.target.value === "" ? "" : Number(e.target.value))}
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="customPackagePrice">Estimated Price (₹)</Label>
                                                                     <Input
                                                                         id="customPackagePrice"
                                                                         type="number"
                                                                         min="0"
                                                                         value={customPackagePrice}
                                                                         onChange={(e) => setCustomPackagePrice(e.target.value === "" ? "" : Number(e.target.value))}
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>
                                                             </div>

                                                             <div className="space-y-2">
                                                                 <Label htmlFor="customPackageDescription">Requirements / Description</Label>
                                                                 <Textarea
                                                                     id="customPackageDescription"
                                                                     rows={4}
                                                                     placeholder="Detail what type of custom package components (accommodation, activities, dining preference etc.) the company requires."
                                                                     value={customPackageDescription}
                                                                     onChange={(e) => setCustomPackageDescription(e.target.value)}
                                                                 />
                                                             </div>

                                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                 {/* Number of Passengers */}
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="numberOfPassengers">
                                                                         <div className="flex items-center gap-2">
                                                                             <Users className="size-4" />
                                                                             Number of Passengers
                                                                         </div>
                                                                     </Label>
                                                                     <Input
                                                                         id="numberOfPassengers"
                                                                         type="number"
                                                                         min="1"
                                                                         value={numberOfPassengers}
                                                                         onChange={(e) =>
                                                                             setNumberOfPassengers(
                                                                                 e.target.value === "" ? "" : Number(e.target.value)
                                                                             )
                                                                         }
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>

                                                                 {/* Client Budget */}
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="budget">
                                                                         <div className="flex items-center gap-2">
                                                                             <IndianRupee className="size-4" />
                                                                             Client Budget (₹)
                                                                         </div>
                                                                     </Label>
                                                                     <Input
                                                                         id="budget"
                                                                         type="number"
                                                                         min="0"
                                                                         placeholder="e.g. 50000"
                                                                         value={budget}
                                                                         onChange={(e) =>
                                                                             setBudget(
                                                                                 e.target.value === "" ? "" : Number(e.target.value)
                                                                             )
                                                                         }
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>
                                                             </div>

                                                             {customPackagePrice !== "" && numberOfPassengers !== "" && (
                                                                 <div className="pt-2 border-t mt-4">
                                                                     <div className="flex items-center justify-between text-sm">
                                                                         <span className="font-medium">Estimated Total:</span>
                                                                         <span className="text-lg font-bold flex items-center gap-1">
                                                                             <IndianRupee className="h-4 w-4" />
                                                                             {(Number(customPackagePrice) * Number(numberOfPassengers)).toLocaleString()}
                                                                         </span>
                                                                     </div>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     ) : (
                                                         <>
                                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                 {/* Number of Passengers */}
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="numberOfPassengers">
                                                                         <div className="flex items-center gap-2">
                                                                             <Users className="size-4" />
                                                                             Number of Passengers
                                                                         </div>
                                                                     </Label>
                                                                     <Input
                                                                         id="numberOfPassengers"
                                                                         type="number"
                                                                         min="1"
                                                                         value={numberOfPassengers}
                                                                         onChange={(e) =>
                                                                             setNumberOfPassengers(
                                                                                 e.target.value === "" ? "" : Number(e.target.value)
                                                                             )
                                                                         }
                                                                         onWheel={(e) => e.currentTarget.blur()}
                                                                     />
                                                                 </div>

                                                                 {/* Preferred Package */}
                                                                 <div className="space-y-2">
                                                                     <Label htmlFor="preferredPackageId">Preferred Package</Label>
                                                                     <Popover
                                                                         open={openPackageSelect}
                                                                         onOpenChange={setOpenPackageSelect}
                                                                     >
                                                                         <PopoverTrigger asChild>
                                                                             <Button
                                                                                 variant="outline"
                                                                                 role="combobox"
                                                                                 aria-expanded={openPackageSelect}
                                                                                 className="w-full justify-between"
                                                                             >
                                                                                 {preferredPackageId
                                                                                     ? packages.find(
                                                                                         (pkg) => pkg.id === preferredPackageId
                                                                                     )?.name
                                                                                     : "Select package..."}
                                                                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                             </Button>
                                                                         </PopoverTrigger>
                                                                         <PopoverContent
                                                                             className="w-[400px] p-0"
                                                                             align="start"
                                                                         >
                                                                             <div className="p-3 border-b">
                                                                                 <div className="relative">
                                                                                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                                     <Input
                                                                                         placeholder="Search packages..."
                                                                                         value={packageSearch}
                                                                                         onChange={(e) => setPackageSearch(e.target.value)}
                                                                                         className="pl-8"
                                                                                     />
                                                                                 </div>
                                                                             </div>
                                                                             <ScrollArea className="h-72">
                                                                                 <div className="p-2">
                                                                                     {packages.filter((pkg) =>
                                                                                         pkg.name?.toLowerCase().includes(packageSearch.toLowerCase())
                                                                                     ).length > 0 ? (
                                                                                         <div className="space-y-1">
                                                                                             {packages
                                                                                                 .filter((pkg) =>
                                                                                                     pkg.name?.toLowerCase().includes(packageSearch.toLowerCase())
                                                                                                 )
                                                                                                 .map((pkg) => (
                                                                                                     <div
                                                                                                         key={pkg.id}
                                                                                                         className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                                                                         onClick={(e) => {
                                                                                                             e.preventDefault();
                                                                                                             e.stopPropagation();
                                                                                                             setPreferredPackageId(pkg.id);
                                                                                                             setOpenPackageSelect(false);
                                                                                                             setPackageSearch("");
                                                                                                         }}
                                                                                                     >
                                                                                                         <div className="flex-1 min-w-0">
                                                                                                             <p className="text-sm font-medium truncate">{pkg.name}</p>
                                                                                                             <p className="text-xs text-muted-foreground">₹{getPkgPrice(pkg)}</p>
                                                                                                         </div>
                                                                                                         {preferredPackageId === pkg.id && (
                                                                                                             <Check className="h-4 w-4 text-primary" />
                                                                                                         )}
                                                                                                     </div>
                                                                                                 ))}
                                                                                         </div>
                                                                                     ) : (
                                                                                         <div className="text-center py-4 text-muted-foreground">No packages found</div>
                                                                                     )}
                                                                                 </div>
                                                                             </ScrollArea>
                                                                         </PopoverContent>
                                                                     </Popover>
                                                                 </div>


                                                             </div>

                                                             {/* Considered Packages */}
                                                             <div className="space-y-2 mt-4">
                                                                 <Label htmlFor="consideredPackageIds">Considered Packages</Label>
                                                                 <Popover
                                                                     open={openConsideredSelect}
                                                                     onOpenChange={setOpenConsideredSelect}
                                                                 >
                                                                     <PopoverTrigger asChild>
                                                                         <Button
                                                                             variant="outline"
                                                                             role="combobox"
                                                                             aria-expanded={openConsideredSelect}
                                                                             className="w-full justify-between"
                                                                         >
                                                                             {consideredPackageIds && consideredPackageIds.length > 0
                                                                                 ? `${consideredPackageIds.length} package(s) selected`
                                                                                 : "Select packages..."}
                                                                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                         </Button>
                                                                     </PopoverTrigger>
                                                                     <PopoverContent
                                                                         className="w-[400px] p-0"
                                                                         align="start"
                                                                     >
                                                                         <div className="p-3 border-b">
                                                                             <div className="relative">
                                                                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                                 <Input
                                                                                     placeholder="Search packages..."
                                                                                     value={consideredSearch}
                                                                                     onChange={(e) => setConsideredSearch(e.target.value)}
                                                                                     className="pl-8"
                                                                                 />
                                                                             </div>
                                                                         </div>
                                                                         <ScrollArea className="h-72">
                                                                             <div className="p-2">
                                                                                 {packages.filter((pkg) =>
                                                                                     pkg.name?.toLowerCase().includes(consideredSearch.toLowerCase())
                                                                                 ).length > 0 ? (
                                                                                     <div className="space-y-1">
                                                                                         {packages
                                                                                             .filter((pkg) =>
                                                                                                 pkg.name?.toLowerCase().includes(consideredSearch.toLowerCase())
                                                                                             )
                                                                                             .map((pkg) => {
                                                                                                 const isSelected = consideredPackageIds?.includes(pkg.id) || false;
                                                                                                 return (
                                                                                                     <div
                                                                                                         key={pkg.id}
                                                                                                         className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                                                                         onClick={(e) => {
                                                                                                             e.preventDefault();
                                                                                                             e.stopPropagation();
                                                                                                             const newValue = isSelected
                                                                                                                 ? consideredPackageIds?.filter((id) => id !== pkg.id) || []
                                                                                                                 : [...(consideredPackageIds || []), pkg.id];
                                                                                                             setConsideredPackageIds(newValue);
                                                                                                         }}
                                                                                                     >
                                                                                                         <Checkbox checked={isSelected} onCheckedChange={() => {}} />
                                                                                                         <div className="flex-1 min-w-0">
                                                                                                             <p className="text-sm font-medium truncate">{pkg.name}</p>
                                                                                                             <p className="text-xs text-muted-foreground">₹{getPkgPrice(pkg)}</p>
                                                                                                         </div>
                                                                                                     </div>
                                                                                                 );
                                                                                             })}
                                                                                     </div>
                                                                                 ) : (
                                                                                     <div className="text-center py-4 text-muted-foreground">No packages found</div>
                                                                                 )}
                                                                             </div>
                                                                         </ScrollArea>
                                                                     </PopoverContent>
                                                                 </Popover>
                                                                 {consideredPackageIds && consideredPackageIds.length > 0 && (
                                                                     <div className="flex flex-wrap gap-2 mt-2">
                                                                         {consideredPackageIds.map((pkgId) => {
                                                                             const pkg = packages.find((p) => p.id === pkgId);
                                                                             return pkg ? (
                                                                                 <div
                                                                                     key={pkgId}
                                                                                     className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md"
                                                                                 >
                                                                                     {pkg.name}
                                                                                 </div>
                                                                             ) : null;
                                                                         })}
                                                                     </div>
                                                                 )}
                                                             </div>

                                                             {/* Estimated Total */}
                                                             {preferredPackageId && numberOfPassengers && (
                                                                 <div className="pt-2 border-t mt-4">
                                                                     <div className="flex items-center justify-between text-sm">
                                                                         <span className="font-medium">Estimated Total:</span>
                                                                         <span className="text-lg font-bold flex items-center gap-1">
                                                                             <IndianRupee className="h-4 w-4" />
                                                                             {(
                                                                                 getPkgPrice(packages.find((p) => p.id === preferredPackageId)!) * numberOfPassengers
                                                                             ).toLocaleString()}
                                                                         </span>
                                                                     </div>
                                                                     <p className="text-xs text-muted-foreground mt-1">
                                                                         Based on {numberOfPassengers} {numberOfPassengers === 1 ? "passenger" : "passengers"} × ₹
                                                                         {getPkgPrice(packages.find((p) => p.id === preferredPackageId)!)}
                                                                     </p>
                                                                 </div>
                                                             )}
                                                         </>
                                                     )}
                                                 </CardContent>
                                            </Card>
                                        </>
                                    )}
                            </div>

                            {/* Status Strip */}
                            <div className="flex items-center w-full rounded-lg overflow-hidden shadow-sm border border-gray-300 text-sm font-medium mt-6">
                                {[
                                    "new",
                                    "contacted",
                                    "qualified",
                                    "lost",
                                    "converted",
                                ].map((status, index) => {
                                    const statusOrder = [
                                        "new",
                                        "contacted",
                                        "qualified",
                                        "lost",
                                        "converted",
                                    ];
                                    const currentIndex = statusOrder.indexOf(
                                        lead.status
                                    );
                                    const isUpcoming = index > currentIndex;

                                    return (
                                        <Button
                                            key={status}
                                            className="rounded-none flex-1 cursor-pointer"
                                            variant={`${isUpcoming ? "ghost" : "default"
                                                }`}
                                            onClick={() =>
                                                updateLeadStatus(
                                                    status as ILeadStatus
                                                )
                                            }
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Tabs for Chat and Updates */}
                            <Tabs defaultValue="chat">
                                <TabsList className="flex justify-center">
                                    <TabsTrigger value="chat">Chat</TabsTrigger>
                                    <TabsTrigger value="updates">
                                        Updates
                                    </TabsTrigger>
                                    <TabsTrigger value="reminders">
                                        Reminders
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="chat">
                                    <div className="p-4 border rounded-md">
                                        <p className="text-sm text-muted-foreground">
                                            Chat messages go here...
                                        </p>
                                        <p className="text-sm italic">
                                            [Dummy data]
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="updates">
                                    <LeadUpdates leadId={lead.id} />
                                </TabsContent>
                                <TabsContent value="reminders">
                                    <ReminderTab leadId={lead.id} />
                                </TabsContent>
                            </Tabs>

                            <div className="pt-4 pr-4 flex justify-end gap-2 border-t">
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            navigate(`/leads/${lead.id}`)
                                        }
                                    >
                                        View Full Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => setShowEditForm(true)}
                                    >
                                        Edit Lead
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showEditForm && (
                        <LeadForm
                            lead={lead}
                            isCreating={false}
                            onSave={onEdit}
                            onClose={() => setShowEditForm(false)}
                        />
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

// Helper component for details
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    );
}
