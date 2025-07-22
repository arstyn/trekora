import { User } from 'src/database/entity/user.entity';

export interface ILeadUpdate {
  id: string;
  text: string;
  leadId: string;
  createdById: string;
  createdBy?: User;
  type: 'note' | 'status_change' | 'email' | 'call' | 'meeting';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
export interface ILeadUpdateCreateDTO {
  text: string;
  leadId: string;
  type: 'note' | 'status_change' | 'email' | 'call' | 'meeting';
  metadata?: Record<string, any>;
}
