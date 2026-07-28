import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Clock,
  History,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Timer
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BlockSlotLog {
  id: string;
  action: string;
  details: string;
  metadata?: {
    previousValue?: number;
    newValue?: number;
  };
  performedBy?: {
    id: string;
    name?: string;
    email?: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

export default function BlockSlotsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [defaultBlockDays, setDefaultBlockDays] = useState<number>(3);
  const [initialValue, setInitialValue] = useState<number>(3);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<BlockSlotLog[]>([]);

  const fetchLogs = async (organizationId: string) => {
    setIsLoadingLogs(true);
    try {
      const res = await axiosInstance.get<BlockSlotLog[]>(
        `/organization/${organizationId}/block-slots-logs`
      );
      setLogs(res.data || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

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
          await fetchLogs(organizationId);
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
      toast.error("Default block duration must be at least 1 day");
      return;
    }
    setIsSaving(true);
    try {
      await axiosInstance.put(`/organization/${orgId}`, {
        defaultBlockDays,
      });
      setInitialValue(defaultBlockDays);
      toast.success("Default block duration updated successfully");
      await fetchLogs(orgId);
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDefaultBlockDays(initialValue);
  };

  const isModified = defaultBlockDays !== initialValue;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Button
              variant="link"
              onClick={() => navigate("/defaults")}
              className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Defaults
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">Block Duration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Timer className="h-7 w-7" />
            </div>
            Block Duration Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure default hold timeframe (in days) for temporary batch slot reservations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <Button
            variant="outline"
            onClick={() => navigate("/defaults")}
            className="cursor-pointer gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Defaults
          </Button>
          <Badge
            variant="outline"
            className="px-3.5 py-1.5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Hold Timeframe: {defaultBlockDays} Days
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-muted bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Default Hold Duration
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {defaultBlockDays} {defaultBlockDays === 1 ? "Day" : "Days"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Initial hold duration on new blocks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hold Expiry Rule
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">Auto Release</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Expired blocks return to available seats
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Scope & Permissions
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {isAdmin ? "Admin Access" : "Read Only"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applies to all organization tour batches
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Configuration + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Card */}
        <Card className="lg:col-span-5 border border-muted bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" /> Block Duration Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Specify the default number of days batch slots stay temporarily reserved before auto-release.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="blockDays" className="text-sm font-semibold">
                Default Expiry Duration (Days)
              </Label>
              <div className="relative">
                <Input
                  id="blockDays"
                  type="number"
                  min={1}
                  max={90}
                  value={defaultBlockDays}
                  disabled={!isAdmin || isSaving}
                  onChange={(e) => setDefaultBlockDays(parseInt(e.target.value) || 0)}
                  className="pr-16 text-lg font-semibold h-11"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold pointer-events-none bg-muted/60 px-2 py-0.5 rounded">
                  Days
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Updating this setting configures future temporary blocks. Active blocks maintain their current expiry date.
              </p>
            </div>

            {!isAdmin && (
              <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">
                  Only Organization Administrators can modify this setting.
                </AlertDescription>
              </Alert>
            )}

            {isAdmin && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                {isModified && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSaving}
                    className="cursor-pointer gap-1.5 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !isModified}
                  className="cursor-pointer bg-primary min-w-[130px] gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Trail & History Logs Card */}
        <Card className="lg:col-span-7 border border-muted bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Configuration Audit Trail
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Logs of all changes made to slot block duration settings in your organization.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              {logs.length} {logs.length === 1 ? "Entry" : "Entries"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLogs ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-muted rounded-full">
                  <History className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium">No configuration logs recorded yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Modifications to default block days will be tracked and displayed here in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y max-h-[420px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex items-start gap-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="h-9 w-9 border shrink-0 mt-0.5">
                      <AvatarImage src={log.performedBy?.profilePhoto} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {log.performedBy?.name
                          ? log.performedBy.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {log.performedBy?.name || "System Administrator"}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {log.createdAt
                            ? format(new Date(log.createdAt), "MMM d, yyyy · h:mm a")
                            : "Recently"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">{log.details}</p>

                      {log.metadata?.previousValue !== undefined &&
                        log.metadata?.newValue !== undefined && (
                          <div className="flex items-center gap-2 mt-1 pt-1">
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-muted rounded border text-muted-foreground">
                              Was: {log.metadata.previousValue} {log.metadata.previousValue === 1 ? "day" : "days"}
                            </span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20">
                              Now: {log.metadata.newValue} {log.metadata.newValue === 1 ? "day" : "days"}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

