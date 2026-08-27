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
      <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Agents
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAgents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-emerald-600 font-medium">{activeAgents}</span> active agents
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Commission
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Banknote className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Generated across all referred bookings
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Payouts
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting payout confirmation
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Commission Paid
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Settled to agents
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
