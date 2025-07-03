import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IEmployee } from '@repo/api/employee/employee.entity';

export function ActivateDialog({
  open,
  onOpenChange,
  employee,
  onActivate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: IEmployee | null;
  onActivate: (employee: IEmployee) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to activate this employee?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => employee && onActivate(employee)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
