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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AgentListProps {
  agents: IAgent[];
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (agent: IAgent) => void;
}

export function AgentList({
  agents,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}: AgentListProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      (agent.agencyName &&
        agent.agencyName.toLowerCase().includes(search.toLowerCase())) ||
      (agent.email && agent.email.toLowerCase().includes(search.toLowerCase())) ||
      (agent.phone && agent.phone.includes(search));

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

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
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name, agency, or contact..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={AgentStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AgentStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Agent
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
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
                  No agents found matching your filters.
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
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{agent.name}</div>
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
                    <Badge variant="outline" className="font-mono text-xs">
                      {agent.commissionType === CommissionType.PERCENTAGE
                        ? `${agent.commissionValue}%`
                        : `₹${agent.commissionValue} (Fixed)`}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">
                    {agent.totalBookings || 0}
                  </TableCell>

                  <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(agent.totalCommissionEarned || 0)}
                  </TableCell>

                  <TableCell className="font-medium">
                    {(agent.pendingCommissionPayout || 0) > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {formatCurrency(agent.pendingCommissionPayout || 0)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">₹0</span>
                    )}
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
                          <Eye className="mr-2 h-4 w-4 text-blue-500" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenEdit(agent)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4 text-amber-500" /> Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(agent)}
                          className="cursor-pointer text-red-600 dark:text-red-400"
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
