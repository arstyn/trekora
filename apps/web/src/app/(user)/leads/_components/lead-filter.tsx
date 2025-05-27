'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ILeadStatus } from '@repo/api/lead/lead.entity';
import { Search } from 'lucide-react';

interface LeadFilterProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: ILeadStatus | 'all') => void;
  currentStatus: ILeadStatus | 'all';
  view: 'table' | 'kanban';
}

export function LeadFilter({
  onSearch,
  onStatusFilter,
  currentStatus,
  view,
}: LeadFilterProps) {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
      <div className="flex w-full sm:w-auto items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search leads..."
          className=""
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {view === 'table' && (
        <Select
          defaultValue={currentStatus}
          onValueChange={(value) =>
            onStatusFilter(value as ILeadStatus | 'all')
          }
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
