import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { ILeadUpdate } from "@/types/lead/lead-update.entity";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LeadUpdatesProps {
    leadId: string;
    listClassName?: string;
}

export function LeadUpdates({ leadId, listClassName }: LeadUpdatesProps) {
    const [updates, setUpdates] = useState<ILeadUpdate[]>([]);
    const [newUpdate, setNewUpdate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<ILeadUpdate | null>(
        null
    );
    const [editText, setEditText] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;

        setIsLoading(true);

        try {
            const res = await axiosInstance.post<ILeadUpdate>("/lead-updates", {
                text: newUpdate,
                leadId,
                type: "note",
            });

            if (res.data) {
                setUpdates([res.data, ...updates]);
                setNewUpdate("");
                setShowForm(false);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load updates");
            }
        }
        setIsLoading(false);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUpdate || !editText.trim()) return;

        setIsLoading(true);

        try {
            const res = await axiosInstance.patch<ILeadUpdate>(
                `/lead-updates/${leadId}`,
                {
                    text: editText,
                }
            );
            if (res.data) {
                setUpdates(
                    updates.map((update) =>
                        update.id === editingUpdate.id ? res.data : update
                    )
                );
                setEditingUpdate(null);
                setEditText("");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load updates");
            }
        }

        setIsLoading(false);
    };

    // Fetch updates when component mounts
    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await axiosInstance.get<ILeadUpdate[]>(
                    `/lead-updates/lead/${leadId}`
                );

                if (res) {
                    setUpdates(res.data);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("Failed to load updates");
                }
            }
        };

        fetchUpdates();
    }, [leadId]);

    return (
        <div className="space-y-4 ">
            {/* New Update Form */}
            {showForm && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card space-y-5 p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
                        <h1>Add a new update</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Textarea
                                placeholder="Add a new update..."
                                value={newUpdate}
                                onChange={(e) => setNewUpdate(e.target.value)}
                                className="min-h-[100px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !newUpdate.trim()}
                                >
                                    {isLoading ? "Adding..." : "Add Update"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Update Form */}
            {editingUpdate && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 space-y-5 rounded-lg shadow-lg w-full max-w-lg mx-4">
                        <h1>Edit the update</h1>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Textarea
                                placeholder="Edit update..."
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-[100px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingUpdate(null);
                                        setEditText("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !editText.trim()}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Updates List */}
            <div
                className={cn(
                    "space-y-4 max-h-56 overflow-y-auto pr-2 relative",
                    listClassName
                )}
            >
                {updates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No updates yet
                    </p>
                ) : (
                    updates.map((update) => (
                        <div
                            key={update.id}
                            className="pl-4 pr-2 pb-3 pt-1 border rounded-md space-y-2 bg-card"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                    {update.createdBy?.name || "Unknown User"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                        {format(
                                            new Date(update.createdAt),
                                            "PPp"
                                        )}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            setEditingUpdate(update);
                                            setEditText(update.text);
                                        }}
                                    >
                                        <Pencil />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                                {update.text}
                            </p>
                            {update.type !== "note" && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                    {update.type}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)}>
                    Add Update
                    <Plus />
                </Button>
            </div>
        </div>
    );
}
