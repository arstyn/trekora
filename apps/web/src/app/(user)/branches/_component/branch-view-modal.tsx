'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2Icon, LoaderIcon } from 'lucide-react';

type ViewEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: any;
  onClickEdit: () => void;
};

export function ViewBranchDialog({
  open,
  onOpenChange,
  branch,
  onClickEdit,
}: ViewEmployeeDialogProps) {
  if (!branch) return null;

  const display = (value?: string | number | boolean | null) =>
    value !== undefined && value !== null && value !== '' ? (
      value
    ) : (
      <span className="text-muted-foreground italic">N/A</span>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            🏢 Branch Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6 border p-4 rounded-lg bg-muted/10">
            <Detail label="Name" value={display(branch?.name)} />
            <Detail label="Location" value={display(branch?.location)} />
            <div className="col-span-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Status
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                {branch?.isActive ? (
                  <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                ) : (
                  <LoaderIcon className="w-4 h-4 text-yellow-500 animate-spin" />
                )}
                <span className={branch?.isActive ? 'text-green-600' : 'text-yellow-600'}>
                  {branch?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onClickEdit}>Edit Branch</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
