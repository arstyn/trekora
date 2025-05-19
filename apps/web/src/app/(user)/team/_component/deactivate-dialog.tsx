'use client';

import { AlertCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IEmployee } from '@repo/api/employee/employee.entity';

type DeactivateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: IEmployee | null;
  onDeactivate: (id: string) => void;
};

export function DeactivateDialog({
  open,
  onOpenChange,
  employee,
  onDeactivate,
}: DeactivateDialogProps) {
  if (!employee) return null;

  const handleDeactivate = () => {
    onDeactivate(employee.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Deactivate Employee
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this employee?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This will change {employee.name}'s status to "terminated" and revoke
            their access to company systems.
          </AlertDescription>
        </Alert>

        <div className="py-2">
          <h4 className="text-sm font-medium">Employee details:</h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name:</p>
              <p className="font-medium">{employee.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ID:</p>
              <p className="font-medium">{employee.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Department:</p>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role:</p>
              <p className="font-medium">{employee.role.name}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeactivate}>
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
