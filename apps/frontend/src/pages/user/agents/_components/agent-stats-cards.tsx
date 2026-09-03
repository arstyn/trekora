import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IAgent } from "@/types/agent.types";
import { Banknote, CheckCircle2, Clock, Users } from "lucide-react";

interface AgentStatsCardsProps {
  agents: IAgent[];
}

export function AgentStatsCards({ agents }: AgentStatsCardsProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === "active").length;

  const totalEarned = agents.reduce(
    (sum, a) => sum + (a.totalCommissionEarned || 0),
    0
  );
  const totalPaid = agents.reduce(
    (sum, a) => sum + (a.totalCommissionPaid || 0),
    0
  );
  const totalPending = agents.reduce(
    (sum, a) => sum + (a.pendingCommissionPayout || 0),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAgents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeAgents} active agents
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Generated across all referred bookings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting payout confirmation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Settled to agents
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

