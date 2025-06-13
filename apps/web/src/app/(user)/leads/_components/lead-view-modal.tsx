'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';
import { format } from 'date-fns';
import { useState } from 'react';
import { LeadForm } from './lead-form';
import { updateLead } from '../action';

type ViewLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: ILead | null;
  onEdit: (isCreating: boolean, leadData: ILead) => void;
};

export function ViewLeadDialog({
  open,
  onOpenChange,
  lead,
  onEdit,
}: ViewLeadDialogProps) {
  if (!lead) return null;
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string>();

  // Helper for empty fields
  const display = (value?: string | number | boolean | null) =>
    value !== undefined && value !== null && value !== '' ? (
      value
    ) : (
      <span className="text-muted-foreground italic">N/A</span>
    );

  const updateLeadStatus = async (status: ILeadStatus) => {
    const { lead: updatedLead, error } = await updateLead(lead.id, {
      name: lead.name,
      status: status,
    });

    if (updatedLead) {
      onEdit(false, { ...lead, ...updatedLead });
    } else {
      setError(error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(on) => {
        onOpenChange(on);
        setShowEditForm(false);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Lead Details
          </DialogTitle>
        </DialogHeader>

        {!showEditForm && (
          <div className="space-y-8">
            {/* Lead details */}
            <div className="max-h-[50vh] overflow-auto space-y-5">
              <div className="grid grid-cols-2 gap-6 ">
                {/* Left column */}
                <div className="space-y-3">
                  <Detail label="Name" value={display(lead.name)} />
                  <Detail label="Company" value={display(lead.company)} />
                  <Detail label="Email" value={display(lead.email)} />
                </div>
                {/* Right column */}
                <div className="space-y-3">
                  <Detail label="Phone" value={display(lead.phone)} />
                  <Detail label="Status" value={display(lead.status)} />
                  <Detail
                    label="Created At"
                    value={format(new Date(lead.createdAt), 'PPP')}
                  />
                </div>
              </div>
            </div>

            {/* Status Strip */}
            <div className="flex items-center w-full rounded-lg overflow-hidden shadow-sm border border-gray-300 text-sm font-medium mt-6">
              {['new', 'contacted', 'qualified', 'lost', 'converted'].map(
                (status, index) => {
                  const statusOrder = [
                    'new',
                    'contacted',
                    'qualified',
                    'lost',
                    'converted',
                  ];
                  const currentIndex = statusOrder.indexOf(lead.status);
                  // const isActive = index === currentIndex;
                  // const isCompleted = index < currentIndex;
                  const isUpcoming = index > currentIndex;

                  return (
                    <Button
                      key={status}
                      className="rounded-none flex-1 cursor-pointer"
                      variant={`${isUpcoming ? 'ghost' : 'default'}`}
                      onClick={() => updateLeadStatus(status as ILeadStatus)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  );
                },
              )}
            </div>

            {/* Tabs for Chat and Updates */}
            <Tabs defaultValue="chat">
              <TabsList className="flex justify-center">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Chat messages go here...
                  </p>
                  <p className="text-sm italic">[Dummy data]</p>
                </div>
              </TabsContent>
              <TabsContent value="updates">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Updates go here...
                  </p>
                  <p className="text-sm italic">[Dummy data]</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 pr-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>

              <Button onClick={() => setShowEditForm(true)}>Edit Lead</Button>
            </div>
          </div>
        )}

        {showEditForm && (
          <LeadForm
            lead={lead}
            isCreating={false}
            onSave={onEdit}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper component for details
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
