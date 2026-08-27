import { Button } from "@/components/ui/button";
import AgentService from "@/services/agent.service";
import type { IAgent } from "@/types/agent.types";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentFormDialog } from "./_components/agent-form-dialog";
import { AgentList } from "./_components/agent-list";
import { AgentStatsCards } from "./_components/agent-stats-cards";

export default function AgentsPage() {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await AgentService.getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenCreate = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (agent: IAgent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Directory & Commissions</h2>
          <p className="text-muted-foreground">
            Manage external agents, referral partners, commission rates, and payout statuses.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAgents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Agent
          </Button>
        </div>
      </div>

      <AgentStatsCards agents={agents} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AgentList
          agents={agents}
          onRefresh={fetchAgents}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
        />
      )}

      <AgentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSaved={fetchAgents}
      />
    </div>
  );
}
