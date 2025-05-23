'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatusBadge } from './lead-status-badge';
import { formatDate } from '@/lib/utils';
import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';

interface LeadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ILead | null;
  isCreating: boolean;
  onSave: (lead: ILead) => void;
}

export function LeadSheet({
  isOpen,
  onClose,
  lead,
  isCreating,
  onSave,
}: LeadSheetProps) {
  const [formData, setFormData] = useState<Partial<ILead>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'new' as ILeadStatus,
    notes: '',
  });

  useEffect(() => {
    if (lead && !isCreating) {
      setFormData(lead);
    } else if (isCreating) {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'new' as ILeadStatus,
        notes: '',
      });
    }
  }, [lead, isCreating]);

  const handleChange = (field: keyof ILead, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isCreating) {
      onSave(formData as ILead);
    } else if (lead) {
      onSave({ ...lead, ...formData });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isCreating ? 'Create New Lead' : 'Lead Details'}
          </SheetTitle>
          {!isCreating && lead && (
            <div className="flex items-center justify-between">
              <LeadStatusBadge status={lead.status} />
              <span className="text-sm text-muted-foreground">
                Created: {formatDate(lead.createdAt)}
              </span>
            </div>
          )}
        </SheetHeader>
        <div className="mt-6 space-y-6 px-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleChange('status', value as ILeadStatus)
                }
              >
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={5}
                value={formData.notes || ''}
                onChange={(e: any) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isCreating ? 'Create Lead' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
