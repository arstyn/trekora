import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import DataTableFooter from '@/components/data-table-footer';
import { useHasPermission } from '@/hooks/use-permissions';
import { ApprovalService } from '@/services/approval.service';
import { BookingService } from '@/services/booking.service';
import type {
  ApprovalAction,
  ApprovalStatus,
  IApprovalCounts,
  IApprovalRequest,
} from '@/types/approval.types';
import { ApprovalReviewDialog } from './_components/approval-review-dialog';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<IApprovalRequest[]>([]);
  const [counts, setCounts] = useState<IApprovalCounts>({
    total: 0,
    booking: 0,
    payment: 0,
    agent: 0,
    batch: 0,
    customer: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusTab, setStatusTab] = useState<ApprovalStatus | 'all'>('pending');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request for review dialog
  const [selectedRequest, setSelectedRequest] = useState<IApprovalRequest | null>(
    null,
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { hasPermission: canManageApprovals } = useHasPermission(
    'approval',
    'manage',
  );

  const fetchCounts = async () => {
    try {
      const c = await ApprovalService.getCounts();
      setCounts(c);
    } catch (err) {
      console.error('Failed to load approval counts:', err);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApprovalService.getRequests({
        status: statusTab !== 'all' ? statusTab : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit,
      });

      setRequests(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load approval requests:', err);
      toast.error('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  }, [statusTab, resourceFilter, searchQuery, page, limit]);

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = (req: IApprovalRequest) => {
    setSelectedRequest(req);
    setReviewDialogOpen(true);
  };

  const handleCancelOwn = async (req: IApprovalRequest) => {
    if (!confirm(`Are you sure you want to withdraw your request "${req.title}"?`)) {
      return;
    }
    try {
      await ApprovalService.cancel(req.id);
      toast.success('Approval request withdrawn successfully');
      fetchRequests();
      fetchCounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-medium"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="outline"
            className="border-rose-400 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 text-[11px] font-medium"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px]">
            Withdrawn
          </Badge>
        );
    }
  };

  const getActionBadge = (action: ApprovalAction) => {
    switch (action) {
      case 'booking_cancel':
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 text-[10px]"
          >
            Booking Cancellation
          </Badge>
        );
      case 'payment_refund':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 text-[10px]"
          >
            Customer Refund
          </Badge>
        );
      case 'payment_delete':
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 text-[10px]"
          >
            Payment Void
          </Badge>
        );
      case 'agent_payout':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 text-[10px]"
          >
            Agent Payout
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {action}
          </Badge>
        );
    }
  };

  const renderImpactSummary = (req: IApprovalRequest) => {
    if (req.action === 'booking_cancel') {
      const refund = req.payload?.refundAmount;
      return (
        <span className="text-xs">
          {req.payload?.customerIds?.length
            ? `${req.payload.customerIds.length} Guest(s)`
            : 'All Guests'}
          {refund > 0 && (
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
              • {BookingService.formatCurrency(refund)} refund
            </span>
          )}
        </span>
      );
    }
    if (req.action === 'payment_refund') {
      return (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
          {BookingService.formatCurrency(req.payload?.amount || 0)}
        </span>
      );
    }
    if (req.action === 'payment_delete') {
      return (
        <span className="font-mono font-medium text-foreground text-xs">
          Void {BookingService.formatCurrency(req.snapshot?.amount || 0)}
        </span>
      );
    }
    if (req.action === 'agent_payout') {
      return <span className="text-xs text-muted-foreground">Commission Settlement</span>;
    }
    return <span className="text-xs text-muted-foreground">—</span>;
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Approvals Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review and govern privileged operations, booking cancellations, refunds, and financial adjustments.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchCounts();
            fetchRequests();
          }}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending */}
        <Card className="border-amber-200 dark:border-amber-900/50 bg-linear-to-br from-amber-50/50 via-background to-background dark:from-amber-950/10">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-between">
              Total Pending
              <Clock className="w-4 h-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground">
              {counts.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Requires managerial decision
            </p>
          </CardContent>
        </Card>

        {/* Booking Cancellations */}
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center justify-between">
              Booking Cancellations
              <XCircle className="w-4 h-4 text-rose-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground">
              {counts.booking}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Seat release & itinerary voids
            </p>
          </CardContent>
        </Card>

        {/* Financial Refunds */}
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center justify-between">
              Payment Refunds
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground">
              {counts.payment}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Customer refund authorizations
            </p>
          </CardContent>
        </Card>

        {/* Agent Payouts */}
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center justify-between">
              Agent Payouts
              <Users className="w-4 h-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground">
              {counts.agent}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Commission settlements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border w-fit overflow-x-auto">
              {[
                { key: 'pending' as const, label: 'Pending', count: counts.total },
                { key: 'approved' as const, label: 'Approved', count: undefined },
                { key: 'rejected' as const, label: 'Rejected', count: undefined },
                { key: 'all' as const, label: 'All Requests', count: undefined },
              ].map((tab) => {
                const isActive = statusTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setStatusTab(tab.key);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Search & Resource Dropdown */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <Select
                value={resourceFilter}
                onValueChange={(val) => {
                  setResourceFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search reference, title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Requests Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold">Request & Reference</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Requested By</TableHead>
                  <TableHead className="text-xs font-semibold">Impact</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                          <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">
                          No approval requests found
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {statusTab === 'pending'
                            ? 'All clear! There are no pending requests requiring your review.'
                            : 'No requests matched the specified filters.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/20 transition-colors">
                      {/* Title & Reference */}
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold text-xs text-foreground">
                            {req.title}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            #{req.entityReference || req.entityId.slice(0, 8)}
                          </p>
                          {req.reason && (
                            <p className="text-[11px] text-muted-foreground italic truncate max-w-xs mt-0.5">
                              "{req.reason}"
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell className="py-3">
                        {getActionBadge(req.action)}
                      </TableCell>

                      {/* Requester & Date */}
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground">
                            {req.requestedBy?.name || req.requestedBy?.email || 'Employee'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()} at{' '}
                            {new Date(req.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </TableCell>

                      {/* Impact */}
                      <TableCell className="py-3">
                        {renderImpactSummary(req)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        {getStatusBadge(req.status)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'pending' && canManageApprovals && (
                            <Button
                              size="sm"
                              onClick={() => handleReview(req)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 px-2.5 shadow-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}
                          {req.status === 'pending' && !canManageApprovals && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOwn(req)}
                              className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              Withdraw
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReview(req)}
                            className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DataTableFooter
            page={page}
            limit={limit}
            total={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            entityName="requests"
          />
        </CardContent>
      </Card>

      {/* Review / Details Modal */}
      <ApprovalReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        request={selectedRequest}
        onSuccess={() => {
          fetchRequests();
          fetchCounts();
        }}
      />
    </div>
  );
}
