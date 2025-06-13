'use client';

import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';
import type React from 'react';
import { LeadCard } from './lead-card';

interface KanbanBoardProps {
  leads: ILead[];
  onLeadMove: (leadId: string, status: ILeadStatus) => void;
  onLeadClick: (lead: ILead) => void;
}

export function KanbanBoard({
  leads,
  onLeadMove,
  onLeadClick,
}: KanbanBoardProps) {
  const statuses: ILeadStatus[] = [
    'new',
    'contacted',
    'qualified',
    'lost',
    'converted',
  ];

  const statusColors: Record<ILeadStatus, string> = {
    new: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    contacted:
      'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    qualified:
      'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    lost: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    converted:
      'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
  };

  const statusHeaderColors: Record<ILeadStatus, string> = {
    new: 'text-blue-700 dark:text-blue-400',
    contacted: 'text-purple-700 dark:text-purple-400',
    qualified: 'text-amber-700 dark:text-amber-400',
    lost: 'text-red-700 dark:text-red-400',
    converted: 'text-green-700 dark:text-green-400',
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ILeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    onLeadMove(leadId, status);
  };

  return (
    <div className="grid grid-cols-1 gap-60 p-2 md:grid-cols-5 overflow-x-auto">
      {statuses.map((status) => (
        <div
          key={status}
          className={`flex h-[90vh] min-w-[280px] flex-col rounded-lg border`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b p-3">
            <h3
              className={`font-semibold capitalize ${statusHeaderColors[status]}`}
            >
              {status}
            </h3>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-medium shadow-sm dark:bg-slate-800">
              {leads.filter((lead) => lead.status === status).length}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
            {leads
              .filter((lead) => lead.status === status)
              .map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => onLeadClick(lead)}
                >
                  <LeadCard lead={lead} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
