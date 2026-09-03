import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BookingService from "@/services/booking.service";
import type { IAgent } from "@/types/agent.types";
import { CommissionType } from "@/types/agent.types";
import {
  UserCheck,
  Search,
  Check,
  ChevronsUpDown,
  RotateCcw,
  Percent,
  IndianRupee,
  Phone,
  X,
} from "lucide-react";

export interface AgentSelectorValue {
  agentId?: string;
  commissionType?: "percentage" | "fixed";
  commissionValue?: number;
  commissionAmount?: number;
}

interface AgentSelectorProps {
  agents: IAgent[];
  value: AgentSelectorValue;
  bookingTotalAmount: number;
  onChange: (val: AgentSelectorValue) => void;
  disabled?: boolean;
}

export function AgentSelector({
  agents,
  value,
  bookingTotalAmount,
  onChange,
  disabled = false,
}: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === value.agentId),
    [agents, value.agentId]
  );

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase().trim();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.agencyName?.toLowerCase().includes(query) ||
        agent.phone?.toLowerCase().includes(query) ||
        agent.email?.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  // Determine if current commission is overridden compared to agent default
  const isCommissionOverridden = useMemo(() => {
    if (!selectedAgent) return false;
    const defaultType = selectedAgent.commissionType || CommissionType.PERCENTAGE;
    const defaultValue = Number(selectedAgent.commissionValue || 0);

    const currentType = value.commissionType || defaultType;
    const currentValue = value.commissionValue !== undefined ? value.commissionValue : defaultValue;

    const expectedAmount =
      currentType === CommissionType.PERCENTAGE
        ? Math.round((bookingTotalAmount * currentValue) / 100)
        : currentValue;

    return (
      currentType !== defaultType ||
      currentValue !== defaultValue ||
      (value.commissionAmount !== undefined && value.commissionAmount !== expectedAmount)
    );
  }, [selectedAgent, value, bookingTotalAmount]);

  const handleSelectAgent = (agentId?: string) => {
    if (!agentId) {
      onChange({
        agentId: undefined,
        commissionType: undefined,
        commissionValue: undefined,
        commissionAmount: 0,
      });
      setOpen(false);
      return;
    }

    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const commType = agent.commissionType || CommissionType.PERCENTAGE;
    const commVal = Number(agent.commissionValue || 0);
    const commAmt =
      commType === CommissionType.PERCENTAGE
        ? Math.round((bookingTotalAmount * commVal) / 100)
        : commVal;

    onChange({
      agentId: agent.id,
      commissionType: commType as "percentage" | "fixed",
      commissionValue: commVal,
      commissionAmount: commAmt,
    });
    setOpen(false);
  };

  const handleResetToDefault = () => {
    if (!selectedAgent) return;
    const commType = selectedAgent.commissionType || CommissionType.PERCENTAGE;
    const commVal = Number(selectedAgent.commissionValue || 0);
    const commAmt =
      commType === CommissionType.PERCENTAGE
        ? Math.round((bookingTotalAmount * commVal) / 100)
        : commVal;

    onChange({
      ...value,
      commissionType: commType as "percentage" | "fixed",
      commissionValue: commVal,
      commissionAmount: commAmt,
    });
  };

  const handleTypeChange = (type: "percentage" | "fixed") => {
    const currentVal = value.commissionValue || 0;
    const newAmt =
      type === "percentage"
        ? Math.round((bookingTotalAmount * currentVal) / 100)
        : currentVal;

    onChange({
      ...value,
      commissionType: type,
      commissionAmount: newAmt,
    });
  };

  const handleValueChange = (val: number) => {
    const type = value.commissionType || selectedAgent?.commissionType || "percentage";
    const newAmt =
      type === "percentage"
        ? Math.round((bookingTotalAmount * val) / 100)
        : val;

    onChange({
      ...value,
      commissionValue: val,
      commissionAmount: newAmt,
    });
  };

  const handleAmountChange = (amount: number) => {
    onChange({
      ...value,
      commissionAmount: amount,
    });
  };

  // Recalculate amount automatically when booking total amount changes if commission is percentage
  useEffect(() => {
    if (selectedAgent && value.commissionType === "percentage" && value.commissionValue !== undefined) {
      const recalculated = Math.round((bookingTotalAmount * value.commissionValue) / 100);
      if (value.commissionAmount !== recalculated && !isCommissionOverridden) {
        onChange({
          ...value,
          commissionAmount: recalculated,
        });
      }
    }
  }, [bookingTotalAmount]);

  return (
    <div className="space-y-4">
      {/* Searchable Agent Selector Dropdown Trigger */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold flex items-center justify-between">
          <span>Select Agent</span>
          {selectedAgent && (
            <button
              type="button"
              onClick={() => handleSelectAgent(undefined)}
              className="text-[11px] text-destructive hover:underline flex items-center gap-1 font-normal"
            >
              <X className="w-3 h-3" /> Clear Agent
            </button>
          )}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full justify-between bg-background h-11 px-3 text-left font-normal border-input hover:bg-accent/50"
            >
              {selectedAgent ? (
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedAgent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {selectedAgent.name}
                      {selectedAgent.agencyName ? ` (${selectedAgent.agencyName})` : ""}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Default: {selectedAgent.commissionType === CommissionType.PERCENTAGE ? `${selectedAgent.commissionValue}%` : `₹${selectedAgent.commissionValue} flat`}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span>No Agent (Direct Booking)</span>
                </div>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[340px] sm:w-[400px] p-0 shadow-lg" align="start">
            {/* Search Input Box */}
            <div className="p-3 border-b flex items-center gap-2 bg-muted/20">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search agent name, agency, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs bg-background border-none shadow-none focus-visible:ring-0"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* List of Agents */}
            <div className="max-h-64 overflow-y-auto p-1 divide-y divide-border/30">
              {/* Option for Direct Booking (No Agent) */}
              <div
                onClick={() => handleSelectAgent(undefined)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-md cursor-pointer text-xs transition-colors",
                  !value.agentId
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>No Agent (Direct Booking)</span>
                </div>
                {!value.agentId && <Check className="w-4 h-4 text-primary" />}
              </div>

              {/* Filtered Agents List */}
              {filteredAgents.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No agents found matching "{searchQuery}"
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const isSelected = agent.id === value.agentId;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent.id)}
                      className={cn(
                        "p-2.5 rounded-md cursor-pointer text-xs transition-colors flex items-center justify-between gap-2",
                        isSelected
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "hover:bg-accent/60 text-foreground"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                          <span>{agent.name}</span>
                          {agent.agencyName && (
                            <span className="text-[10px] text-muted-foreground font-normal truncate">
                              ({agent.agencyName})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          {agent.phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-3 h-3" /> {agent.phone}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[9px] py-0 h-4 font-normal">
                            Default: {agent.commissionType === CommissionType.PERCENTAGE ? `${agent.commissionValue}%` : `₹${agent.commissionValue}`}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editable Commission Configuration Section */}
      {selectedAgent && (
        <Card className="p-4 bg-card border space-y-4 rounded-xl">
          <div className="flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Commission for {selectedAgent.name}
              </span>
              {isCommissionOverridden ? (
                <Badge variant="secondary" className="text-[10px]">
                  Custom Rate for Booking
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Agent Default Rate
                </Badge>
              )}
            </div>

            {isCommissionOverridden && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetToDefault}
                className="h-7 text-[11px] hover:bg-accent px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset to Default
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Commission Type Selector Toggle */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Commission Type
              </Label>
              <div className="inline-flex w-full items-center bg-background border p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => handleTypeChange("percentage")}
                  className={cn(
                    "flex-1 py-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1 text-xs",
                    (value.commissionType || selectedAgent.commissionType) === "percentage"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Percent className="w-3 h-3" /> Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("fixed")}
                  className={cn(
                    "flex-1 py-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1 text-xs",
                    (value.commissionType || selectedAgent.commissionType) === "fixed"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <IndianRupee className="w-3 h-3" /> Flat Amount (₹)
                </button>
              </div>
            </div>

            {/* Commission Rate / Value Input */}
            <div className="space-y-1.5">
              <Label htmlFor="commissionValue" className="text-[11px] font-semibold text-muted-foreground">
                {(value.commissionType || selectedAgent.commissionType) === "percentage"
                  ? "Commission Rate (%)"
                  : "Commission Rate (₹)"}
              </Label>
              <div className="relative">
                <Input
                  id="commissionValue"
                  type="number"
                  min="0"
                  step={(value.commissionType || selectedAgent.commissionType) === "percentage" ? "0.1" : "1"}
                  value={value.commissionValue ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                    handleValueChange(val);
                  }}
                  placeholder="0"
                  className="h-9 bg-background font-semibold text-xs pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {(value.commissionType || selectedAgent.commissionType) === "percentage" ? "%" : "₹"}
                </span>
              </div>
            </div>

            {/* Final Total Commission Amount Input (Overridable) */}
            <div className="space-y-1.5">
              <Label htmlFor="commissionAmount" className="text-[11px] font-semibold text-muted-foreground">
                Total Commission (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                <Input
                  id="commissionAmount"
                  type="number"
                  min="0"
                  value={value.commissionAmount ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                    handleAmountChange(val);
                  }}
                  placeholder="0"
                  className="h-9 pl-7 bg-background font-semibold text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
            <div>
              Agent Standard Profile:{" "}
              <span className="font-semibold text-foreground">
                {selectedAgent.commissionType === CommissionType.PERCENTAGE
                  ? `${selectedAgent.commissionValue}%`
                  : `₹${selectedAgent.commissionValue} flat`}
              </span>
            </div>
            <div className="font-semibold text-foreground text-xs">
              Booking Commission: {BookingService.formatCurrency(value.commissionAmount || 0)}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
