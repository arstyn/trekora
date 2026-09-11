export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ApprovalAction =
  | 'booking_cancel'
  | 'booking_discount'
  | 'payment_refund'
  | 'payment_delete'
  | 'agent_payout'
  | 'customer_delete'
  | 'batch_cancel';

export interface IApprovalRequest {
  id: string;
  organizationId: string;
  action: ApprovalAction;
  resource: 'booking' | 'payment' | 'agent' | 'batch' | 'customer';
  entityId: string;
  entityReference?: string;
  title: string;
  reason?: string;
  payload: Record<string, any>;
  snapshot?: Record<string, any>;
  status: ApprovalStatus;
  requestedById: string;
  requestedBy?: {
    id: string;
    name?: string;
    email: string;
    profilePhoto?: string;
  };
  reviewedById?: string | null;
  reviewedBy?: {
    id: string;
    name?: string;
    email: string;
    profilePhoto?: string;
  } | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IApprovalCounts {
  total: number;
  booking: number;
  payment: number;
  agent: number;
  batch: number;
  customer: number;
}

export interface IApprovalFilter {
  status?: ApprovalStatus;
  action?: ApprovalAction;
  resource?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IApprovalListResponse {
  data: IApprovalRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IReviewApprovalDto {
  reviewNotes?: string;
  adjustedPayload?: Record<string, any>;
}

export interface IRejectApprovalDto {
  reason: string;
}
