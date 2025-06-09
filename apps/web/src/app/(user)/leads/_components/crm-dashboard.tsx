'use client';

import { Button } from '@/components/ui/button';
import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { KanbanBoard } from './kanban-board';
import { LeadFilter } from './lead-filter';
import { LeadSheet } from './lead-sheet';
import { LeadTable } from './lead-table';
import { ViewToggle } from './view-toggle';
import { createLead } from '../action';

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [error, setError] = useState<string>();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLeads(query, statusFilter);
  };

  const handleStatusFilter = (status: ILeadStatus | 'all') => {
    setStatusFilter(status);
    filterLeads(searchQuery, status);
  };

  const filterLeads = (query: string, status: ILeadStatus | 'all') => {
    let filtered = leads;

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

  const updateLeadStatus = (leadId: string, newStatus: ILeadStatus) => {
    const updatedLeads = leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead,
    );
    setLeads(updatedLeads);
    filterLeads(searchQuery, statusFilter);
  };

  const handleLeadClick = (lead: ILead) => {
    setSelectedLead(lead);
    setIsCreatingLead(false);
    setIsSheetOpen(true);
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setIsCreatingLead(true);
    setIsSheetOpen(true);
  };

  const handleSaveLead = async (lead: ILead) => {
    console.log('🚀 ~ crm-dashboard.tsx:79 ~ handleSaveLead ~ lead:', lead);
    if (isCreatingLead) {
      const { lead: newLead, error } = await createLead(lead);

      if (newLead) {
        setLeads([...leads, newLead]);
      } else {
        setError(error);
      }
    } else {
      // Update existing lead
      const updatedLeads = leads.map((l) => (l.id === lead.id ? lead : l));
      setLeads(updatedLeads);
    }

    filterLeads(searchQuery, statusFilter);
    setIsSheetOpen(false);
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

      <LeadSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        lead={selectedLead}
        isCreating={isCreatingLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}
