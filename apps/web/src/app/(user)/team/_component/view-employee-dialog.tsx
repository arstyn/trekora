'use client';

import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IEmployee } from '@repo/api/employee/employee.entity';

type ViewEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: IEmployee | null;
  onEdit?: (employee: IEmployee) => void;
};

export function ViewEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onEdit,
}: ViewEmployeeDialogProps) {
  if (!employee) return null;

  // Format join date
  const formattedDate = employee.joinDate
    ? format(new Date(employee.joinDate), 'PPP')
    : '';

  // Status badge styles
  //   const statusStyles = {
  //     active: 'bg-green-100 text-green-800 hover:bg-green-100',
  //     'on leave': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  //     terminated: 'bg-red-100 text-red-800 hover:bg-red-100',
  //   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Employee Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee header with avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={employee.avatar || '/placeholder.svg'}
                alt={employee.name}
              />
              <AvatarFallback className="text-lg">
                {employee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>

          {/* Employee details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Employee ID
              </p>
              <p>{employee.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                // className={statusStyles[employee.status]}
                variant="outline"
              >
                {employee.status.charAt(0).toUpperCase() +
                  employee.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Department
              </p>
              <p>{employee.department}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p>{employee.role.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Join Date
              </p>
              <p>{formattedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Employment Duration
              </p>
              <p>{employee.joinDate && calculateDuration(employee.joinDate)}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && employee && (
              <Button
                onClick={() => {
                  onEdit(employee);
                  onOpenChange(false);
                }}
              >
                Edit Employee
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate employment duration
function calculateDuration(joinDate: Date): string {
  const start = new Date(joinDate);
  const now = new Date();

  const yearDiff = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();

  if (yearDiff > 0) {
    return `${yearDiff} ${yearDiff === 1 ? 'year' : 'years'}, ${monthDiff < 0 ? 12 + monthDiff : monthDiff} ${Math.abs(monthDiff) === 1 ? 'month' : 'months'}`;
  } else {
    return `${monthDiff} ${monthDiff === 1 ? 'month' : 'months'}`;
  }
}
