'use client';

import StatusBadge from '@/components/status-badge';
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Branch Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="max-h-[50vh] overflow-auto space-y-5">
            <div className="grid grid-cols-2 gap-6 ">
              <div className="space-y-3">
                <Detail label="name" value={display(branch?.name)} />
                <Detail label="location" value={display(branch?.location)} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Status
                  </p>
                  {branch?.isActive === true ? (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                  ) : (
                    <LoaderIcon />
                  )}
                  {branch?.isActive === true ? "active" : "inactive"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 pr-4 flex justify-end gap-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {branch && (
              <Button
                onClick={() => {
                  onClickEdit();
                }}
              >
                Edit Branch
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
