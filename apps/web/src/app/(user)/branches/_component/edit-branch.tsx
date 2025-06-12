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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { IBranch } from '@repo/api/branch/branch.entity';
import { updateBranch } from '../action';

export const branchUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Branch name is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  isActive: z.boolean().optional(),
});

type EditBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchData?: IBranch;
  branches: IBranch[];
  setBranches: Dispatch<SetStateAction<IBranch[]>>;
};

export function EditBranchDialog({
  open,
  onOpenChange,
  branchData,
  branches,
  setBranches,
}: EditBranchDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  type IBranchUpdateFormValues = z.infer<typeof branchUpdateSchema>;

  const form = useForm<IBranchUpdateFormValues>({
    resolver: zodResolver(branchUpdateSchema),
    defaultValues: {
      name: '',
      location: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (branchData) {
      form.reset({
        name: branchData.name,
        location: branchData.location,
        isActive: branchData.isActive ?? true,
      });
    }
  }, [branchData, form]);

  const onSubmit = async (data: IBranchUpdateFormValues) => {
    if (!branchData?.id) return;

    setIsSubmitting(true);
    try {
      const { branch, error } = await updateBranch(branchData.id, data);

      if (branch) {
        const updatedList = branches.map((b) =>
          b.id === branch.id ? branch : b,
        );
        setBranches(updatedList);
        onOpenChange(false);
        form.reset();
      } else {
        setError(error);
      }
    } catch (err) {
      console.error('Error updating branch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branchData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <div className="space-y-4 overflow-auto pr-5 py-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Branch name" {...field} />
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
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Is Active</FormLabel>
                      <FormDescription>
                        Toggle to activate or deactivate this branch.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4 flex justify-between">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
