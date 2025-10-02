import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import type { ILead, ILeadStatus } from "@/types/lead/lead.entity";
import { format } from "date-fns";
import { toast } from "sonner";
import { LeadForm } from "./lead-form";
import { LeadUpdates } from "./lead-updates";
import { ReminderTab } from "./reminder-tab";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ICustomer } from "@/types/customer.type";

// Dummy Components for demo
// function CustomerForm({ lead }: { lead: ILead }) {
//   return (
//     <div className="p-4 border rounded-md space-y-2">
//       <h3 className="font-semibold text-sm">Customer Details</h3>
//       <p className="text-xs text-muted-foreground">[Customer creation form here]</p>
//     </div>
//   );
// }
function BookingRequestForm() {
  return (
    <div className="p-4 border rounded-md space-y-2">
      <h3 className="font-semibold text-sm">Booking Request</h3>
      <p className="text-xs text-muted-foreground">
        [Booking request form here]
      </p>
    </div>
  );
}

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

  // New state for converted options
  const [isConverted, setIsConverted] = useState(false);
  const [convertToCustomer, setConvertToCustomer] = useState(false);
  const [createBookingRequest, setCreateBookingRequest] = useState(false);
  const [formData, setFormData] = useState<ICustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    status: "active",
  });

  if (!lead) return null;

  // Helper for empty fields
  const display = (value?: string | number | boolean | null) =>
    value !== undefined && value !== null && value !== "" ? (
      value
    ) : (
      <span className="text-muted-foreground italic">N/A</span>
    );

  const updateLeadStatus = async (status: ILeadStatus) => {
    if (status === "converted") {
      setIsConverted(true); // show checkboxes
      return;
    }
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(on) => {
        onOpenChange(on);
        setShowEditForm(false);
        setIsConverted(false);
        setConvertToCustomer(false);
        setCreateBookingRequest(false);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Lead Details
          </DialogTitle>
        </DialogHeader>

        {!showEditForm && (
          <div className="space-y-8">
            {/* Lead details */}
            <div className="max-h-[50vh] overflow-auto space-y-5">
              <div className="grid grid-cols-2 gap-6 ">
                {/* Left column */}
                <div className="space-y-3">
                  <Detail label="Name" value={display(lead.name)} />
                  <Detail label="Company" value={display(lead.company)} />
                  <Detail label="Email" value={display(lead.email)} />
                </div>
                {/* Right column */}
                <div className="space-y-3">
                  <Detail label="Phone" value={display(lead.phone)} />
                  <Detail label="Status" value={display(lead.status)} />
                  <Detail
                    label="Created At"
                    value={format(new Date(lead.createdAt), "PPP")}
                  />
                </div>
              </div>
            </div>

            {/* Status Strip */}
            <div className="flex items-center w-full rounded-lg overflow-hidden shadow-sm border border-gray-300 text-sm font-medium mt-6">
              {["new", "contacted", "qualified", "lost", "converted"].map(
                (status, index) => {
                  const statusOrder = [
                    "new",
                    "contacted",
                    "qualified",
                    "lost",
                    "converted",
                  ];
                  const currentIndex = statusOrder.indexOf(lead.status);
                  const isUpcoming = index > currentIndex;

                  return (
                    <Button
                      key={status}
                      className="rounded-none flex-1 cursor-pointer"
                      variant={`${isUpcoming ? "ghost" : "default"}`}
                      onClick={() => updateLeadStatus(status as ILeadStatus)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  );
                }
              )}
            </div>

            {/* Converted extra options */}
            {isConverted && (
              <div className="space-y-4 p-4 border rounded-md">
                <p className="font-medium text-sm">
                  Choose actions after conversion:
                </p>
                <div className="flex items-center gap-3">
                  <input
                    id="convertToCustomer"
                    type="checkbox"
                    checked={convertToCustomer}
                    onChange={(e) => setConvertToCustomer(e.target.checked)}
                  />
                  <label htmlFor="convertToCustomer" className="text-sm">
                    Convert to Customer
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="createBookingRequest"
                    type="checkbox"
                    checked={createBookingRequest}
                    onChange={(e) => setCreateBookingRequest(e.target.checked)}
                  />
                  <label htmlFor="createBookingRequest" className="text-sm">
                    Create Booking Request
                  </label>
                </div>

                {convertToCustomer && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                {createBookingRequest && <BookingRequestForm />}
              </div>
            )}

            {/* Tabs for Chat and Updates */}
            <Tabs defaultValue="chat">
              <TabsList className="flex justify-center">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Chat messages go here...
                  </p>
                  <p className="text-sm italic">[Dummy data]</p>
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setShowEditForm(true)}>Edit Lead</Button>
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
