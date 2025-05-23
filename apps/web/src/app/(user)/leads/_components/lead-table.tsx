'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { ILead, ILeadStatus } from '@repo/api/lead/lead.entity';
import { Edit, MoreHorizontal } from 'lucide-react';
import { LeadStatusBadge } from './lead-status-badge';

interface LeadTableProps {
  leads: ILead[];
  onStatusChange: (leadId: string, status: ILeadStatus) => void;
  onLeadClick: (lead: ILead) => void;
}

export function LeadTable({
  leads,
  onStatusChange,
  onLeadClick,
}: LeadTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => onLeadClick(lead)}
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadClick(lead);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(lead.id, 'new');
                        }}
                      >
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(lead.id, 'contacted');
                        }}
                      >
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(lead.id, 'qualified');
                        }}
                      >
                        Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(lead.id, 'lost');
                        }}
                      >
                        Mark as Lost
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(lead.id, 'converted');
                        }}
                      >
                        Mark as Converted
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
