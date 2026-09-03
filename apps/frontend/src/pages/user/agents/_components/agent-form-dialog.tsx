import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AgentService from "@/services/agent.service";
import {
  AgentStatus,
  CommissionType,
  type IAgent,
  type ICreateAgentRequest,
} from "@/types/agent.types";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: IAgent | null;
  onSaved?: () => void;
}

export function AgentFormDialog({
  open,
  onOpenChange,
  agent,
  onSaved,
}: AgentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateAgentRequest>({
    name: "",
    agencyName: "",
    email: "",
    phone: "",
    commissionType: CommissionType.PERCENTAGE,
    commissionValue: 10,
    status: AgentStatus.ACTIVE,
    notes: "",
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        agencyName: agent.agencyName || "",
        email: agent.email || "",
        phone: agent.phone || "",
        commissionType: agent.commissionType || CommissionType.PERCENTAGE,
        commissionValue: agent.commissionValue ?? 10,
        status: agent.status || AgentStatus.ACTIVE,
        notes: agent.notes || "",
      });
    } else {
      setFormData({
        name: "",
        agencyName: "",
        email: "",
        phone: "",
        commissionType: CommissionType.PERCENTAGE,
        commissionValue: 10,
        status: AgentStatus.ACTIVE,
        notes: "",
      });
    }
  }, [agent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    try {
      setLoading(true);
      if (agent?.id) {
        await AgentService.updateAgent(agent.id, formData);
        toast.success("Agent updated successfully");
      } else {
        await AgentService.createAgent(formData);
        toast.success("Agent created successfully");
      }
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (error: any) {
      console.error("Failed to save agent:", error);
      toast.error(
        error.response?.data?.message || "Failed to save agent. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{agent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
          <DialogDescription>
            {agent
              ? "Update referring agent profile and default commission structure."
              : "Add an external agent or referral partner to track bookings and commissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name">
                Agent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="agencyName">Agency Name / Company</Label>
              <Input
                id="agencyName"
                placeholder="e.g. Apex Travels"
                value={formData.agencyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    agencyName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="agent@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="commissionType">Commission Model</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(value: CommissionType) =>
                  setFormData((prev) => ({ ...prev, commissionType: value }))
                }
              >
                <SelectTrigger id="commissionType">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CommissionType.PERCENTAGE}>
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value={CommissionType.FIXED}>
                    Fixed Flat Amount (₹)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="commissionValue">
                Commission Rate (
                {formData.commissionType === CommissionType.PERCENTAGE
                  ? "%"
                  : "₹"}
                )
              </Label>
              <Input
                id="commissionValue"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 10"
                value={formData.commissionValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commissionValue: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Agent Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AgentStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AgentStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={AgentStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes / Bank Account Details</Label>
              <Textarea
                id="notes"
                placeholder="Add payout instructions, payment details, or background context..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {agent ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
