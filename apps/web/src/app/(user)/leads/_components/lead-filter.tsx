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
}

export function LeadFilter({
  onSearch,
  onStatusFilter,
  currentStatus,
}: LeadFilterProps) {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search leads..."
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Select
        defaultValue={currentStatus}
        onValueChange={(value) => onStatusFilter(value as ILeadStatus | 'all')}
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
    </div>
  );
}
