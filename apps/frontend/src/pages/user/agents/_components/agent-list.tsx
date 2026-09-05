import DataTableFooter from "@/components/data-table-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface AgentListProps {
  agents: IAgent[];
  status?: string;
  loading?: boolean;
  onRefresh: () => void;
  onOpenEdit: (agent: IAgent) => void;
}

export function AgentList({
  agents,
  status = "all",
  loading = false,
  onRefresh,
  onOpenEdit,
}: AgentListProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "20", 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
  });

  // Filter agents based on search and status
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.agencyName &&
        agent.agencyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agent.email &&
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agent.phone && agent.phone.includes(searchTerm));

    const matchesStatus = status === "all" || agent.status === status;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalItems = filteredAgents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.limit));
  const currentPage = Math.min(pagination.page, totalPages);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * pagination.limit,
    currentPage * pagination.limit
  );

  // Reset to page 1 on search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, status]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      setSearchParams((prev) => {
        if (newPage === 1) prev.delete("page");
        else prev.set("page", newPage.toString());
        return prev;
      });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({ limit: newLimit, page: 1 });
    setSearchParams((prev) => {
      if (newLimit === 20) prev.delete("limit");
      else prev.set("limit", newLimit.toString());
      prev.delete("page");
      return prev;
    });
  };

  const handleRowClick = (agentId: string, event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest("[data-radix-collection-item]") ||
      (event.target as HTMLElement).closest("button") ||
      (event.target as HTMLElement).closest("a")
    ) {
      return;
    }
    navigate(`/agents/${agentId}`);
  };

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
      toast.error(error.response?.data?.message || "Failed to delete agent.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (agentStatus: AgentStatus | string) => {
    switch (agentStatus) {
      case "active":
      case AgentStatus.ACTIVE:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        );
      case "inactive":
      case AgentStatus.INACTIVE:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="secondary">{agentStatus}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="capitalize">
            {status === "all" ? "All" : status} Agents
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <TableCell key={`skeleton-cell-${index}-${i}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedAgents.length > 0 ? (
              paginatedAgents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => handleRowClick(agent.id, e)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <NavLink
                          to={`/agents/${agent.id}`}
                          className="hover:underline text-primary cursor-pointer font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {agent.name}
                        </NavLink>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {agent.agencyName ? (
                      <span className="text-sm">{agent.agencyName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      {agent.email && (
                        <div className="text-sm text-muted-foreground">
                          {agent.email}
                        </div>
                      )}
                      {agent.phone && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {agent.phone}
                        </div>
                      )}
                      {!agent.email && !agent.phone && (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs font-normal"
                    >
                      {agent.commissionType === CommissionType.PERCENTAGE
                        ? `${agent.commissionValue}%`
                        : `₹${agent.commissionValue} (Fixed)`}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {agent.totalBookings || 0}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-sm">
                    {formatCurrency(agent.totalCommissionEarned || 0)}
                  </TableCell>

                  <TableCell className="font-medium text-sm">
                    <span
                      className={
                        (agent.pendingCommissionPayout || 0) > 0
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : ""
                      }
                    >
                      {formatCurrency(agent.pendingCommissionPayout || 0)}
                    </span>
                  </TableCell>

                  <TableCell>{getStatusBadge(agent.status)}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <NavLink
                            to={`/agents/${agent.id}`}
                            className="flex items-center cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenEdit(agent)}
                          className="flex items-center cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                          onClick={() => handleDelete(agent)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        No agents found
                      </h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        {searchTerm
                          ? `No agents matching "${searchTerm}".`
                          : `No ${status === "all" ? "" : status} agents found.`}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!loading && totalItems > 0 && (
          <DataTableFooter
            page={currentPage}
            limit={pagination.limit}
            total={totalItems}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            entityName="agents"
          />
        )}
      </CardContent>
    </Card>
  );
}
