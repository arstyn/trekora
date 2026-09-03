import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AgentService from "@/services/agent.service";
import { AgentStatus, CommissionType, type IAgent } from "@/types/agent.types";
import {
  Edit,
  Eye,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AgentListProps {
  agents: IAgent[];
  status?: string;
  onRefresh: () => void;
  onOpenEdit: (agent: IAgent) => void;
}

export function AgentList({
  agents,
  status = "all",
  onRefresh,
  onOpenEdit,
}: AgentListProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      (agent.agencyName &&
        agent.agencyName.toLowerCase().includes(search.toLowerCase())) ||
      (agent.email && agent.email.toLowerCase().includes(search.toLowerCase())) ||
      (agent.phone && agent.phone.includes(search));

    const matchesStatus =
      status === "all" || agent.status === status;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (agent: IAgent) => {
    if (
      !confirm(
        `Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await AgentService.deleteAgent(agent.id);
      toast.success("Agent deleted successfully");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to delete agent:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete agent."
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, agency, or contact..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Pending Payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-muted-foreground"
                >
                  No agents found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-medium text-xs shrink-0">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {agent.agencyName || "—"}
                  </TableCell>

                  <TableCell className="text-sm">
                    {agent.email && (
                      <div className="text-muted-foreground">{agent.email}</div>
                    )}
                    {agent.phone && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {agent.phone}
                      </div>
                    )}
                    {!agent.email && !agent.phone && "—"}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs font-normal">
                      {agent.commissionType === CommissionType.PERCENTAGE
                        ? `${agent.commissionValue}%`
                        : `₹${agent.commissionValue} (Fixed)`}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">
                    {agent.totalBookings || 0}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatCurrency(agent.totalCommissionEarned || 0)}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatCurrency(agent.pendingCommissionPayout || 0)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        agent.status === AgentStatus.ACTIVE
                          ? "default"
                          : "secondary"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/agents/${agent.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenEdit(agent)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(agent)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

