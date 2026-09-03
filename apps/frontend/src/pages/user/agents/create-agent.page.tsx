import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AgentService from "@/services/agent.service";
import { AgentStatus, CommissionType, type ICreateAgentRequest } from "@/types/agent.types";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateAgentRequest>({
    name: "",
    agencyName: "",
    email: "",
    phone: "",
    commissionType: CommissionType.PERCENTAGE,
    commissionValue: 10,
    status: AgentStatus.ACTIVE,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    try {
      setLoading(true);
      await AgentService.createAgent(formData);
      toast.success("Agent created successfully");
      navigate("/agents");
    } catch (error: any) {
      console.error("Failed to create agent:", error);
      toast.error(error.response?.data?.message || "Failed to create agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Agent</h1>
          <p className="text-muted-foreground">
            Register a new referring agent or agency partner.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>
            Enter contact information and default commission settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">
                  Agent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Jane Smith"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  placeholder="e.g. Horizon Travels"
                  value={formData.agencyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agencyName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@domain.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="commissionType">Commission Model</Label>
                <Select
                  value={formData.commissionType}
                  onValueChange={(val: CommissionType) =>
                    setFormData((prev) => ({ ...prev, commissionType: val }))
                  }
                >
                  <SelectTrigger id="commissionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CommissionType.PERCENTAGE}>
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value={CommissionType.FIXED}>
                      Fixed Flat Amount (₹)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="commissionValue">Commission Rate</Label>
                <Input
                  id="commissionValue"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.commissionValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commissionValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: AgentStatus) =>
                    setFormData((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AgentStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={AgentStatus.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes / Payout Instructions</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agents")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Agent
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
