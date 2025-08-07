import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ILead } from "@/types/lead/lead.entity";
import { LeadForm } from "./lead-form";

type CreateLeadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (handleSaveLead: boolean, lead: ILead) => void;
  setOpenCustomerCreateModal: (open: boolean) => void;
};

export function CreateLeadModal({
  open,
  onOpenChange,
  onSave,
  setOpenCustomerCreateModal,
}: CreateLeadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Lead Details
          </DialogTitle>
        </DialogHeader>
        <LeadForm
          isCreating={true}
          onSave={onSave}
          onClose={onOpenChange}
          setOpenCustomerCreateModal={setOpenCustomerCreateModal}
        />
      </DialogContent>
    </Dialog>
  );
}
