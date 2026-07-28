import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, Save, ShieldAlert, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function BlockSlotsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [defaultBlockDays, setDefaultBlockDays] = useState<number>(3);
  const [initialValue, setInitialValue] = useState<number>(3);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const employeeRes = await axiosInstance.get(`/employee/profile`);
        const organizationId = employeeRes.data.organizationId;
        const permissionSets = employeeRes.data.permissionSets || [];
        const isAdminSet = permissionSets.some((ps: any) =>
          ps.name?.toLowerCase().includes("admin")
        );
        setIsAdmin(isAdminSet);
        setOrgId(organizationId);

        if (organizationId) {
          const orgRes = await axiosInstance.get(`/organization/${organizationId}`);
          const blockDays = orgRes.data.defaultBlockDays ?? 3;
          setDefaultBlockDays(blockDays);
          setInitialValue(blockDays);
        }
      } catch (error) {
        toast.error("Failed to load organization settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  const handleSave = async () => {
    if (!orgId) return;
    if (defaultBlockDays < 1) {
      toast.error("Default block days must be at least 1 day");
      return;
    }
    setIsSaving(true);
    try {
      await axiosInstance.put(`/organization/${orgId}`, {
        defaultBlockDays,
      });
      setInitialValue(defaultBlockDays);
      toast.success("Default block days updated successfully");
      navigate("/defaults");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const isModified = defaultBlockDays !== initialValue;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/defaults")}
          className="rounded-full hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Timer className="h-8 w-8 text-primary animate-pulse" /> Block Slots Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure defaults for temporary batch slot blocking
          </p>
        </div>
      </div>

      <Card className="border border-muted bg-card/40 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle>Block Duration Configuration</CardTitle>
          <CardDescription>
            Specify the default number of days batch slots remain temporarily blocked before automatically expiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="blockDays">Default Expiry Duration (Days)</Label>
            <div className="relative max-w-[200px]">
              <Input
                id="blockDays"
                type="number"
                min={1}
                value={defaultBlockDays}
                disabled={!isAdmin || isSaving}
                onChange={(e) => setDefaultBlockDays(parseInt(e.target.value) || 0)}
                className="pr-16 text-lg font-semibold"
              />
              <div className="absolute right-3 top-2.5 text-sm text-muted-foreground font-medium pointer-events-none">
                Days
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This setting applies to all batches under your organization. Changes will not affect currently active blocks.
            </p>
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-lg text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Only Organization Administrators can change this configuration setting.</span>
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-end gap-3 pt-4 border-t border-muted">
              <Button
                variant="outline"
                onClick={() => navigate("/defaults")}
                disabled={isSaving}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !isModified}
                className="cursor-pointer bg-primary min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 mr-2 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
