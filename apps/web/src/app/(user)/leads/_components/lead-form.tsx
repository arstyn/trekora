'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeadFormDTO, leadSchema } from '@repo/api/lead/lead-create.dto';
import { ILead } from '@repo/api/lead/lead.entity';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createLead, updateLead } from '../action';

interface LeadFormProps {
  lead?: ILead;
  isCreating: boolean;
  onSave: (isCreating: boolean, lead: ILead) => void;
  onClose?: (open: boolean) => void;
}

export function LeadForm({ lead, isCreating, onSave, onClose }: LeadFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormDTO>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      company: '',
      email: undefined,
      phone: '',
      status: 'new',
      notes: '',
    },
  });

  useEffect(() => {
    if (lead && !isCreating) {
      reset(lead);
    } else if (isCreating) {
      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'new',
        notes: '',
      });
    }
  }, [lead, isCreating, reset]);

  const onSubmit = async (data: LeadFormDTO) => {
    setLoading(true);
    if (isCreating) {
      const { lead: newLead, error } = await createLead(data);

      if (newLead) {
        onSave(isCreating, newLead);
        if (onClose) {
          onClose(false);
        }
      }
      setError(error);
    } else if (lead) {
      const { lead: updatedLead, error } = await updateLead(lead.id, data);

      if (updatedLead) {
        onSave(isCreating, { ...lead, ...updatedLead });
        if (onClose) {
          onClose(false);
        }
      } else {
        setError(error);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} />}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => <Input id="company" {...field} />}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input id="email" type="email" {...field} />
              )}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input id="phone" {...field} />}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <Textarea id="notes" rows={5} {...field} />}
          />
        </div>
      </div>
      <div className="pt-4 pr-4 flex justify-end gap-2 border-t">
        <Button
          variant="outline"
          onClick={(e) => {
            if (onClose) {
              onClose(false);
            }
          }}
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isCreating ? 'Create Lead' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
