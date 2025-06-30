'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DeleteBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
};

export function DeleteBranchDialog({
  open,
  onOpenChange,
  onConfirmDelete,
}: DeleteBranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this branch?</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            No
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirmDelete();
              onOpenChange(false);
            }}
          >
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
