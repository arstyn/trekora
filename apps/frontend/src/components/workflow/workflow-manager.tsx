import { useState, useEffect } from "react";
import {
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    History,
    AlertCircle,
    MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import WorkflowService, {
    type IWorkflow,
    type IWorkflowStep,
    type IWorkflowLog,
} from "@/services/workflow.service";
import { format } from "date-fns";

interface WorkflowManagerProps {
    workflowId: string;
}

export function WorkflowManager({ workflowId }: WorkflowManagerProps) {
    const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
    const [logs, setLogs] = useState<IWorkflowLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogs, setShowLogs] = useState(false);
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [newStep, setNewStep] = useState<Partial<IWorkflowStep>>({
        label: "",
        description: "",
        isMandatory: true,
    });

    useEffect(() => {
        loadWorkflow();
    }, [workflowId]);

    const loadWorkflow = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflow(workflowId);
            setWorkflow(data);
        } catch (error) {
            toast.error("Failed to load workflow");
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const data = await WorkflowService.getHistory(workflowId);
            setLogs(data);
            setShowLogs(true);
        } catch (error) {
            toast.error("Failed to load history");
        }
    };

    const toggleStepStatus = async (step: IWorkflowStep) => {
        try {
            const newStatus =
                step.status === "completed" ? "pending" : "completed";
            await WorkflowService.updateStep(step.id, { status: newStatus });
            toast.success(`Step marked as ${newStatus}`);
            loadWorkflow();
        } catch (error) {
            toast.error("Failed to update step");
        }
    };

    const handleAddStep = async () => {
        if (!newStep.label) return;
        try {
            await WorkflowService.addStep(workflowId, newStep);
            toast.success("Step added successfully");
            setIsAddingStep(false);
            setNewStep({ label: "", description: "", isMandatory: true });
            loadWorkflow();
        } catch (error) {
            toast.error("Failed to add step");
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        if (!confirm("Are you sure you want to delete this step?")) return;
        try {
            await WorkflowService.deleteStep(stepId);
            toast.success("Step deleted");
            loadWorkflow();
        } catch (error) {
            toast.error("Failed to delete step");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading flow...</div>;
    if (!workflow)
        return (
            <div className="p-8 text-center text-muted-foreground">
                No active flow found.
            </div>
        );

    const completedSteps = workflow.steps.filter(
        (s) => s.status === "completed",
    ).length;
    const progress = Math.round((completedSteps / workflow.steps.length) * 100);

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            {workflow.name}
                            <Badge
                                variant="outline"
                                className="ml-2 capitalize"
                            >
                                {workflow.type}
                            </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {completedSteps} of {workflow.steps.length} steps
                            completed ({progress}%)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={loadLogs}>
                            <History className="w-4 h-4 mr-2" />
                            View History
                        </Button>
                        <Dialog
                            open={isAddingStep}
                            onOpenChange={setIsAddingStep}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Step
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Flow Step</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="label">Label</Label>
                                        <Input
                                            id="label"
                                            value={newStep.label}
                                            onChange={(e) =>
                                                setNewStep({
                                                    ...newStep,
                                                    label: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Finance Check"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="desc"
                                            value={newStep.description}
                                            onChange={(e) =>
                                                setNewStep({
                                                    ...newStep,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Optional details..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsAddingStep(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddStep}>
                                        Create Step
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {workflow.steps.map((step) => (
                            <div
                                key={step.id}
                                className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                                    step.status === "completed"
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card border-border hover:border-primary/30"
                                }`}
                            >
                                <button
                                    onClick={() => toggleStepStatus(step)}
                                    className="mt-1 transition-transform active:scale-95"
                                >
                                    {step.status === "completed" ? (
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary/50" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4
                                            className={`font-semibold truncate ${step.status === "completed" ? "line-through opacity-70" : ""}`}
                                        >
                                            {step.label}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {step.isMandatory && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] h-4"
                                                >
                                                    Mandatory
                                                </Badge>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleDeleteStep(
                                                                step.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Step
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    {step.description && (
                                        <p
                                            className={`text-sm text-muted-foreground mt-1 line-clamp-2 ${step.status === "completed" ? "opacity-50" : ""}`}
                                        >
                                            {step.description}
                                        </p>
                                    )}
                                    {step.status === "completed" &&
                                        step.completedBy && (
                                            <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                Completed by{" "}
                                                {step.completedBy.name} on{" "}
                                                {format(
                                                    new Date(step.completedAt!),
                                                    "MMM d, h:mm a",
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showLogs} onOpenChange={setShowLogs}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Workflow Audit Trail
                        </DialogTitle>
                    </DialogHeader>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="relative flex items-center justify-between gap-4 pl-12 pt-1"
                            >
                                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm">
                                    {log.action === "create" && (
                                        <Plus className="w-4 h-4 text-green-500" />
                                    )}
                                    {log.action === "update" && (
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                    )}
                                    {log.action === "delete" && (
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm underline decoration-primary/30">
                                            {log.changedBy.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {log.action}d
                                            <span className="font-medium text-foreground mx-1">
                                                "
                                                {log.newData?.label ||
                                                    log.previousData?.label}
                                                "
                                            </span>
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        {format(
                                            new Date(log.createdAt),
                                            "EEEE, MMM d @ h:mm a",
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No activity logged yet.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
