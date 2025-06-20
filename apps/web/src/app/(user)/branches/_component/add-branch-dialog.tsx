'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createBranch } from '../action';
import { IBranch } from '@repo/api/branch/branch.entity';

export const branchCreateSchema = z.object({
  name: z.string().min(1, { message: 'Branch name is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
});

type AddBranchModalProps = {
  open: boolean;
  branches: IBranch[];
  setBranches: Dispatch<SetStateAction<IBranch[]>>;
  onOpenChange: (open: boolean) => void;
};

export function AddBranchDialog({
  open,
  branches,
  setBranches,
  onOpenChange,
}: AddBranchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  type IBranchCreateFormValues = z.infer<typeof branchCreateSchema>;

  const form = useForm<IBranchCreateFormValues>({
    resolver: zodResolver(branchCreateSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const onSubmit = async (data: IBranchCreateFormValues) => {
    setIsSubmitting(true);

    try {
      const newBranch = {
        name: data.name,
        location: data.location,
      };

      const { branch, error } = await createBranch(newBranch);

      if (branch) {
        setBranches([branch, ...branches]);
        onOpenChange(false);
        form.reset();
      } else {
        setError(error);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Branch
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=""
            autoComplete="off"
          >
            <div className="space-y-4 overflow-auto pr-5 py-5">
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="washington dc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4 flex justify-between">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Branch'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
