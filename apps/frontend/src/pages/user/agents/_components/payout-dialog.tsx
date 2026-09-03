import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AgentService from "@/services/agent.service";
import { AgentPayoutStatus } from "@/types/agent.types";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface PayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber: string;
  currentStatus: AgentPayoutStatus;
  commissionAmount: number;
  onUpdated?: () => void;
}

export function PayoutDialog({
  open,
  onOpenChange,
  bookingId,
  bookingNumber,
  currentStatus,
  commissionAmount,
  onUpdated,
}: PayoutDialogProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AgentPayoutStatus>(currentStatus);

  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus, open]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await AgentService.updatePayoutStatus(bookingId, status);
      toast.success("Payout status updated successfully");
      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (error: any) {
      console.error("Failed to update payout status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update payout status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Update Commission Payout Status</DialogTitle>
          <DialogDescription>
            Booking #{bookingNumber} — Commission:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(commissionAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Payout Status</label>
            <Select
              value={status}
              onValueChange={(val: AgentPayoutStatus) => setStatus(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payout status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AgentPayoutStatus.PENDING}>
                  Pending (Unpaid)
                </SelectItem>
                <SelectItem value={AgentPayoutStatus.PAID}>
                  Paid (Settled)
                </SelectItem>
                <SelectItem value={AgentPayoutStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
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
              Save Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
