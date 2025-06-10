'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeadForm } from './lead-form';
import { ILead } from '@repo/api/lead/lead.entity';

type CreateLeadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lead: ILead) => Promise<void>;
};

export function CreateLeadModal({
  open,
  onOpenChange,
  onSave,
}: CreateLeadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Lead Details
          </DialogTitle>
        </DialogHeader>
        <LeadForm isCreating={true} onSave={onSave} onClose={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
