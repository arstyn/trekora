'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { IEmployee } from '@repo/api/employee/employee.entity';
import { Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createEmployee, getDepartments, getRoles } from '../action';
import { IRole } from '@repo/api/auth/dto/role.types';
import { IDepartment } from '@repo/api/department/department.entity';

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  department: z
    .array(z.string())
    .min(1, { message: 'Please select at least one department' }),
  role: z.string().min(1, { message: 'Role is required' }),
  status: z.enum(['active', 'on leave', 'terminated'], {
    required_error: 'Please select a status',
  }),
  joinDate: z.date({
    required_error: 'Join date is required',
  }),
});

// Define the type for the form values
export type ICreateEmployeeFormValues = z.infer<typeof formSchema>;

// Define the props for the AddEmployeeModal component
type AddEmployeeModalProps = {
  table: Table<IEmployee>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: IEmployee[];
  setEmployees: Dispatch<SetStateAction<IEmployee[]>>;
};

export function AddEmployeeModal({
  table,
  open,
  onOpenChange,
  employees,
  setEmployees,
}: AddEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);

  // Fetch roles and departments from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { roles } = await getRoles();
        const { departments } = await getDepartments();

        setRoles(roles);
        setDepartments(departments);
      } catch (error) {
        console.error('Error fetching roles or departments:', error);
      }
    };

    fetchData();
  }, []);

  // Initialize the form
  const form = useForm<ICreateEmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      department: [],
      role: '',
      status: 'active',
      joinDate: new Date(),
    },
  });

  // Handle form submission
  const onSubmit = async (data: ICreateEmployeeFormValues) => {
    setIsSubmitting(true);

    try {
      // Create the new employee object
      const newEmployee = {
        name: data.name,
        email: data.email,
        department: data.department,
        role: data.role,
        status: data.status,
        joinDate: format(data.joinDate, 'yyyy-MM-dd'),
        avatar: '/placeholder.svg?height=40&width=40', // Default avatar
      };

      const { employee, error } = await createEmployee(newEmployee);
      if (employee) {
        setEmployees([employee, ...employees]);
        table.setPageIndex(0);
        table.resetColumnFilters();
        form.reset();
        onOpenChange(false);
      } else {
        setError(error);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new employee to the directory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${
                              field.value.length === 0
                                ? 'text-muted-foreground'
                                : ''
                            }`}
                          >
                            {field.value.length > 0
                              ? field.value.join(', ')
                              : 'Select departments'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-2">
                          <div className="flex flex-col space-y-2">
                            {departments.map((dept) => (
                              <div
                                key={dept.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  checked={field.value.includes(dept.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, dept.id]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (item) => item !== dept.id,
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <span>{dept.name}</span>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="capitalize">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id}
                              className="capitalize"
                            >
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="on leave" />
                        </FormControl>
                        <FormLabel className="font-normal">On Leave</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="terminated" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Terminated
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: any) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
