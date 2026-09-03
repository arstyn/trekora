import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentService from "@/services/agent.service";
import type { IAgent } from "@/types/agent.types";
import { AlertCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentFormDialog } from "./_components/agent-form-dialog";
import { AgentList } from "./_components/agent-list";
import { AgentStatsCards } from "./_components/agent-stats-cards";

export default function AgentsPage() {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AgentService.getAllAgents();
      setAgents(data);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Failed to load agent directory. Please try again.");
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">
            Manage external agents, referral partners, commission rates, and payouts
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={fetchAgents}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <AgentStatsCards agents={agents} />
      )}

      {/* Agent Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AgentList
            status="all"
            agents={agents}
            onRefresh={fetchAgents}
            onOpenEdit={handleOpenEdit}
          />
        </TabsContent>

        <TabsContent value="active">
          <AgentList
            status="active"
            agents={agents}
            onRefresh={fetchAgents}
            onOpenEdit={handleOpenEdit}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <AgentList
            status="inactive"
            agents={agents}
            onRefresh={fetchAgents}
            onOpenEdit={handleOpenEdit}
          />
        </TabsContent>
      </Tabs>

      <AgentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSaved={fetchAgents}
      />
    </div>
  );
}

