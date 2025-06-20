'use client';

import { Button } from '@/components/ui/button';
import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { KanbanBoard } from './kanban-board';
import { CreateLeadModal } from './lead-create-modal';
import { LeadFilter } from './lead-filter';
import { LeadTable } from './lead-table';
import { ViewLeadDialog } from './lead-view-modal';
import { ViewToggle } from './view-toggle';
import { updateLead } from '../action';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  leadsData: ILead[];
}

export function CrmDashboard({ leadsData }: Props) {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [leads, setLeads] = useState<ILead[]>(leadsData);
  const [filteredLeads, setFilteredLeads] = useState<ILead[]>(leadsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ILeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (leadId) {
      const foundLead = leads.find((l) => l.id === leadId);
      if (foundLead) {
        setSelectedLead(foundLead);
        setIsCreatingLead(false);
        setIsViewModalOpen(true);
      }
    } else {
      setIsViewModalOpen(false);
      setSelectedLead(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, leads]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLeads(query, statusFilter);
  };

  const handleStatusFilter = (status: ILeadStatus | 'all') => {
    setStatusFilter(status);
    filterLeads(searchQuery, status);
  };

  const filterLeads = (
    query: string,
    status: ILeadStatus | 'all',
    leadsToFilter: ILead[] = leads,
  ) => {
    let filtered = leadsToFilter; // Use the passed leads instead of state

    if (query) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query.toLowerCase()) ||
          lead.company.toLowerCase().includes(query.toLowerCase()) ||
          lead.email.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((lead) => lead.status === status);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: ILeadStatus) => {
    const { lead: updatedLead, error } = await updateLead(leadId, {
      status: newStatus,
    });
    if (updatedLead) {
      const updatedLeads = leads.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead,
      );
      setLeads(updatedLeads);
      filterLeads(searchQuery, statusFilter);
    }
  };

  const handleLeadClick = (lead: ILead) => {
    router.push(`?lead=${lead.id}`);
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setIsCreatingLead(true);
    setIsViewModalOpen(true);
    router.push('?');
  };

  const handleSaveLead = (isCreating: boolean, leadData: ILead) => {
    let updatedLeads;

    if (isCreating) {
      updatedLeads = [leadData, ...leads];
    } else {
      updatedLeads = leads.map((l) => (l.id === leadData.id ? leadData : l));
    }

    setLeads(updatedLeads);

    // ✅ Update filtered leads
    filterLeads(searchQuery, statusFilter, updatedLeads);

    // ✅ Fix: Update selectedLead if this is the one being viewed
    if (selectedLead?.id === leadData.id) {
      setSelectedLead(leadData);
    }

    if (isCreating) {
      setIsViewModalOpen(false);
    }
  };

  return (
    <div className="h-full">
      <div className="container mx-auto px-6 py-5">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-1 flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <LeadFilter
                onSearch={handleSearch}
                onStatusFilter={handleStatusFilter}
                currentStatus={statusFilter}
                view={view}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateLead}>
                <Plus className="mr-2 h-4 w-4" /> New Lead
              </Button>
              <ViewToggle currentView={view} onViewChange={setView} />
            </div>
          </div>

          <div>
            {view === 'table' ? (
              <LeadTable
                leads={filteredLeads}
                onStatusChange={updateLeadStatus}
                onLeadClick={handleLeadClick}
              />
            ) : (
              <KanbanBoard
                leads={filteredLeads}
                onLeadMove={updateLeadStatus}
                onLeadClick={handleLeadClick}
              />
            )}
          </div>
        </div>
      </div>

      <ViewLeadDialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            router.push('?');
            setSelectedLead(null);
          }
        }}
        lead={selectedLead}
        onEdit={handleSaveLead}
      />

      <CreateLeadModal
        open={isCreatingLead}
        onOpenChange={setIsCreatingLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}
