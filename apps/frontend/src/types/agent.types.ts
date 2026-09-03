export const CommissionType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;
export type CommissionType = (typeof CommissionType)[keyof typeof CommissionType];

export const AgentStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;
export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const AgentPayoutStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;
export type AgentPayoutStatus = (typeof AgentPayoutStatus)[keyof typeof AgentPayoutStatus];

export interface IAgent {
  id: string;
  name: string;
  agencyName?: string;
  email?: string;
  phone?: string;
  commissionType: CommissionType;
  commissionValue: number;
  status: AgentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalBookings?: number;
  totalCommissionEarned?: number;
  totalCommissionPaid?: number;
  pendingCommissionPayout?: number;
}

export interface IAgentBookingDetail {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone?: string;
  packageName: string;
  batchStartDate?: string;
  numberOfCustomers: number;
  totalAmount: number;
  status: string;
  agentCommissionType?: CommissionType;
  agentCommissionValue?: number;
  agentCommissionAmount: number;
  agentPayoutStatus: AgentPayoutStatus;
  createdAt: string;
}

export interface IAgentDetailResponse extends IAgent {
  bookings: IAgentBookingDetail[];
}

export interface ICreateAgentRequest {
  name: string;
  agencyName?: string;
  email?: string;
  phone?: string;
  commissionType: CommissionType;
  commissionValue: number;
  status?: AgentStatus;
  notes?: string;
}

export interface IUpdateAgentRequest {
  name?: string;
  agencyName?: string;
  email?: string;
  phone?: string;
  commissionType?: CommissionType;
  commissionValue?: number;
  status?: AgentStatus;
  notes?: string;
}
