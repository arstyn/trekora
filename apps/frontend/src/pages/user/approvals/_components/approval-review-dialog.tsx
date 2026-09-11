import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type {
  IApprovalRequest,
  IRejectApprovalDto,
  IReviewApprovalDto,
} from '@/types/approval.types';
import { ApprovalService } from '@/services/approval.service';
import { BookingService } from '@/services/booking.service';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: IApprovalRequest | null;
  onSuccess?: () => void;
}

export function ApprovalReviewDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ApprovalReviewDialogProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [adjustedRefundAmount, setAdjustedRefundAmount] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  // Sync state when request changes
  useEffect(() => {
    if (request && open) {
      setReviewNotes('');
      if (request.payload?.refundAmount !== undefined) {
        setAdjustedRefundAmount(request.payload.refundAmount.toString());
      } else {
        setAdjustedRefundAmount('');
      }
    }
  }, [request, open]);

  if (!request) return null;

  const isPending = request.status === 'pending';

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      const data: IReviewApprovalDto = {
        reviewNotes: reviewNotes.trim() || undefined,
      };

      // If manager adjusted refund amount, pass it
      if (
        adjustedRefundAmount !== '' &&
        request.payload?.refundAmount !== undefined &&
        Number(adjustedRefundAmount) !== Number(request.payload.refundAmount)
      ) {
        data.adjustedPayload = {
          refundAmount: Number(adjustedRefundAmount),
        };
      }

      await ApprovalService.approve(request.id, data);
      toast.success(`Request approved and executed successfully`);
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to approve request. Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please enter a rejection reason in the notes field');
      return;
    }

    setActionLoading('reject');
    try {
      const data: IRejectApprovalDto = {
        reason: reviewNotes.trim(),
      };

      await ApprovalService.reject(request.id, data);
      toast.success(`Request rejected successfully`);
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Rejection error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to reject request. Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'booking_cancel':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'payment_refund':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'payment_delete':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'agent_payout':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatActionName = (action: string) => {
    switch (action) {
      case 'booking_cancel':
        return 'Booking Cancellation';
      case 'payment_refund':
        return 'Customer Refund';
      case 'payment_delete':
        return 'Payment Void / Deletion';
      case 'agent_payout':
        return 'Agent Commission Payout';
      case 'batch_cancel':
        return 'Batch Cancellation';
      case 'customer_delete':
        return 'Customer Deletion';
      default:
        return action;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Accent Bar */}
        <div
          className={`h-1.5 w-full ${
            request.status === 'approved'
              ? 'bg-emerald-500'
              : request.status === 'rejected'
              ? 'bg-rose-500'
              : 'bg-linear-to-r from-amber-500 to-orange-500'
          }`}
        />

        <DialogHeader className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2 py-0.5 ${getActionBadgeColor(
                request.action,
              )}`}
            >
              {formatActionName(request.action)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize font-medium ${
                request.status === 'pending'
                  ? 'border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30'
                  : request.status === 'approved'
                  ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-rose-400 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30'
              }`}
            >
              {request.status}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold text-foreground mt-2">
            {request.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reference:{' '}
            <span className="font-mono font-semibold text-foreground">
              {request.entityReference || request.entityId}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4 text-xs">
          {/* Requester & Submission Metadata */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Requested By
              </Label>
              <p className="font-medium text-foreground">
                {request.requestedBy?.name || request.requestedBy?.email || 'Employee'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {request.requestedBy?.email}
              </p>
            </div>
            <div className="space-y-1 text-right sm:text-left">
              <Label className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Submitted At
              </Label>
              <p className="font-medium text-foreground">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Justification / Notes from Requester */}
          {request.reason && (
            <div className="space-y-1.5 rounded-lg border p-3 bg-muted/10">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Requester's Explanation
              </Label>
              <p className="text-foreground leading-relaxed italic">
                "{request.reason}"
              </p>
            </div>
          )}

          {/* Request Payload & Financial Impact Breakdown */}
          <div className="space-y-2 rounded-lg border p-3 bg-background">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Operation Impact & Details
            </Label>

            {request.action === 'booking_cancel' && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Scope:</span>{' '}
                    <span className="font-semibold text-foreground">
                      {request.payload?.customerIds?.length
                        ? `${request.payload.customerIds.length} Traveler(s)`
                        : 'Entire Booking'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Refund Method:</span>{' '}
                    <span className="font-semibold capitalize text-foreground">
                      {request.payload?.refundMethod?.replace('_', ' ') || 'None'}
                    </span>
                  </div>
                </div>

                {isPending && request.payload?.issueRefund && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-[11px] font-medium flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Approved Refund Amount (Manager can adjust)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adjustedRefundAmount}
                      onChange={(e) => setAdjustedRefundAmount(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Originally requested:{' '}
                      {BookingService.formatCurrency(
                        request.payload?.refundAmount || 0,
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {request.action === 'payment_refund' && (
              <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
                <div>
                  <span className="text-[11px] text-muted-foreground">Refund Amount:</span>{' '}
                  <span className="font-bold text-emerald-600 font-mono">
                    {BookingService.formatCurrency(request.payload?.amount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Method:</span>{' '}
                  <span className="font-semibold capitalize text-foreground">
                    {request.payload?.paymentMethod?.replace('_', ' ') || 'Standard'}
                  </span>
                </div>
              </div>
            )}

            {request.action === 'payment_delete' && (
              <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
                <div>
                  <span className="text-[11px] text-muted-foreground">Payment Amount:</span>{' '}
                  <span className="font-bold text-foreground font-mono">
                    {BookingService.formatCurrency(request.snapshot?.amount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Method:</span>{' '}
                  <span className="font-semibold capitalize text-foreground">
                    {request.snapshot?.paymentMethod?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>
            )}

            {request.action === 'agent_payout' && (
              <div className="p-2 rounded-md bg-muted/30">
                <span className="text-[11px] text-muted-foreground">Action:</span>{' '}
                <span className="font-semibold text-foreground">
                  Release and record Agent Commission as Paid
                </span>
              </div>
            )}
          </div>

          {/* Existing Review Outcome (if already reviewed) */}
          {!isPending && (
            <div className="space-y-1.5 rounded-lg border p-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Manager Decision
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {request.reviewedAt
                    ? new Date(request.reviewedAt).toLocaleString()
                    : ''}
                </span>
              </div>
              <p className="text-foreground">
                Reviewed by:{' '}
                <span className="font-semibold">
                  {request.reviewedBy?.name || request.reviewedBy?.email || 'Manager'}
                </span>
              </p>
              {request.reviewNotes && (
                <p className="text-muted-foreground italic text-[11px] mt-1">
                  "{request.reviewNotes}"
                </p>
              )}
            </div>
          )}

          {/* Manager Input Fields (Only if pending) */}
          {isPending && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Manager Remarks / Decision Notes
              </Label>
              <Textarea
                placeholder="Required if rejecting. Optional context if approving..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-3 border-t bg-muted/10 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={actionLoading !== null}
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>

          {isPending && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actionLoading !== null}
                onClick={handleReject}
                className="border-rose-200 text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs shadow-xs"
              >
                {actionLoading === 'reject' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Request
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={actionLoading !== null}
                onClick={handleApprove}
                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs shadow-xs"
              >
                {actionLoading === 'approve' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Approving & Executing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve & Execute
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
