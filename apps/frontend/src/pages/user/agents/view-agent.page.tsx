import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AgentService from "@/services/agent.service";
import {
  AgentPayoutStatus,
  AgentStatus,
  CommissionType,
  type IAgentBookingDetail,
  type IAgentDetailResponse,
} from "@/types/agent.types";
import {
  ArrowLeft,
  Banknote,
  Building,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PayoutDialog } from "./_components/payout-dialog";

export default function ViewAgentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<IAgentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [payoutModal, setPayoutModal] = useState<{
    open: boolean;
    bookingId: string;
    bookingNumber: string;
    currentStatus: AgentPayoutStatus;
    commissionAmount: number;
  }>({
    open: false,
    bookingId: "",
    bookingNumber: "",
    currentStatus: AgentPayoutStatus.PENDING,
    commissionAmount: 0,
  });

  const fetchAgent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await AgentService.getAgentById(id);
      setAgent(data);
    } catch (error) {
      console.error("Failed to fetch agent details:", error);
      toast.error("Failed to load agent details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPayoutBadge = (status: AgentPayoutStatus) => {
    switch (status) {
      case AgentPayoutStatus.PAID:
        return <Badge className="bg-emerald-600 hover:bg-emerald-700">Paid</Badge>;
      case AgentPayoutStatus.CANCELLED:
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50 dark:bg-amber-950/30">
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Agent not found.</p>
        <Button className="mt-4" onClick={() => navigate("/agents")}>
          Back to Agent Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/agents")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold tracking-tight">{agent.name}</h2>
              <Badge
                variant={
                  agent.status === AgentStatus.ACTIVE ? "default" : "secondary"
                }
              >
                {agent.status}
              </Badge>
            </div>
            {agent.agencyName && (
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                <Building className="h-3.5 w-3.5" /> {agent.agencyName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchAgent} size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/agents/edit/${agent.id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {agent.email ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{agent.email}</span>
              </div>
            ) : null}
            {agent.phone ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-xs">{agent.phone}</span>
              </div>
            ) : null}
            {!agent.email && !agent.phone && (
              <p className="text-muted-foreground text-xs">No contact provided</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Default Rate
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agent.commissionType === CommissionType.PERCENTAGE
                ? `${agent.commissionValue}%`
                : `₹${agent.commissionValue}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {agent.commissionType} model
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(agent.totalCommissionEarned || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid: {formatCurrency(agent.totalCommissionPaid || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending Payout
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(agent.pendingCommissionPayout || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across referred active bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {agent.notes && (
        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Notes & Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {agent.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bookings Ledger Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Referred Bookings Ledger</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              List of all customer bookings referred by {agent.name}.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 font-normal">
            <ShoppingBag className="h-3.5 w-3.5" />
            {agent.bookings?.length || 0} Bookings
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Total Booking Amount</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Commission Amount</TableHead>
                <TableHead>Payout Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!agent.bookings || agent.bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No bookings referred by this agent yet.
                  </TableCell>
                </TableRow>
              ) : (
                agent.bookings.map((booking: IAgentBookingDetail) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-mono text-primary"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        #{booking.bookingNumber}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.customerName}</div>
                      {booking.customerPhone && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {booking.customerPhone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{booking.packageName}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(booking.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {booking.agentCommissionType === CommissionType.PERCENTAGE
                          ? `${booking.agentCommissionValue}%`
                          : `₹${booking.agentCommissionValue}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(booking.agentCommissionAmount)}
                    </TableCell>
                    <TableCell>{getPayoutBadge(booking.agentPayoutStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          setPayoutModal({
                            open: true,
                            bookingId: booking.id,
                            bookingNumber: booking.bookingNumber,
                            currentStatus: booking.agentPayoutStatus,
                            commissionAmount: booking.agentCommissionAmount,
                          })
                        }
                      >
                        Update Payout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PayoutDialog
        open={payoutModal.open}
        onOpenChange={(open) => setPayoutModal((prev) => ({ ...prev, open }))}
        bookingId={payoutModal.bookingId}
        bookingNumber={payoutModal.bookingNumber}
        currentStatus={payoutModal.currentStatus}
        commissionAmount={payoutModal.commissionAmount}
        onUpdated={fetchAgent}
      />
    </div>
  );
}
