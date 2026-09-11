import { useEffect, useState } from 'react';
import type { IApprovalRequest } from '@/types/approval.types';
import { ApprovalService } from '@/services/approval.service';
import { useHasPermission } from '@/hooks/use-permissions';
import { ApprovalReviewDialog } from '@/pages/user/approvals/_components/approval-review-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ShieldAlert, Sparkles } from 'lucide-react';

interface BookingPendingApprovalBannerProps {
  bookingId: string;
  onResolved?: () => void;
}

export function BookingPendingApprovalBanner({
  bookingId,
  onResolved,
}: BookingPendingApprovalBannerProps) {
  const [pendingRequest, setPendingRequest] = useState<IApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { hasPermission: canManageApprovals } = useHasPermission('approval', 'manage');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const req = await ApprovalService.getPendingForEntity(bookingId);
      setPendingRequest(req);
    } catch (err) {
      console.error('Failed to fetch pending approval for booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchPending();
    }
  }, [bookingId]);

  if (loading || !pendingRequest) {
    return null;
  }

  const requesterName =
    pendingRequest.requestedBy?.name ||
    pendingRequest.requestedBy?.email ||
    'An employee';

  return (
    <>
      <div className="rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 p-4 shadow-sm relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                  {pendingRequest.title}
                </h4>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-amber-200/50 text-amber-800 border-amber-400 dark:bg-amber-900/50 dark:text-amber-200"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting Review
                </Badge>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1">
                Requested by{' '}
                <span className="font-semibold text-foreground">
                  {requesterName}
                </span>{' '}
                on {new Date(pendingRequest.createdAt).toLocaleDateString()} at{' '}
                {new Date(pendingRequest.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {pendingRequest.reason && (
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 italic mt-0.5">
                  "{pendingRequest.reason}"
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 sm:self-center">
            {canManageApprovals ? (
              <Button
                size="sm"
                onClick={() => setReviewDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Review & Decide
              </Button>
            ) : (
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-2.5 py-1 rounded-md border border-amber-300/50">
                Pending Manager Review
              </span>
            )}
          </div>
        </div>
      </div>

      <ApprovalReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        request={pendingRequest}
        onSuccess={() => {
          fetchPending();
          onResolved?.();
        }}
      />
    </>
  );
}
