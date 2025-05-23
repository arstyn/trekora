'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ILead } from '@repo/api/lead/lead.entity';
import { Building2, Calendar, Mail, MoreHorizontal, Phone } from 'lucide-react';

interface LeadCardProps {
  lead: ILead;
}

export function LeadCard({ lead }: LeadCardProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get color based on lead status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'contacted':
        return 'bg-purple-500';
      case 'qualified':
        return 'bg-amber-500';
      case 'lost':
        return 'bg-red-500';
      case 'converted':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="group cursor-grab border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="px-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className={`h-9 w-9 `}>
                <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{lead.name}</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building2 className="mr-1 h-3 w-3" />
                  {lead.company}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-lg text-xs">
            <div className="flex items-center text-muted-foreground">
              <Mail className="mr-1 h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="mr-1 h-3 w-3" />
              {lead.phone}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(lead.createdAt)}
            </div>
          </div>

          {lead.notes && (
            <div className="relative max-h-12 overflow-hidden text-xs text-muted-foreground">
              <p className="line-clamp-2">{lead.notes}</p>
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t"></div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-muted-foreground">ID: {lead.id}</div>
            <button className="rounded-full p-1 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-slate-700">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
