import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import {
    History,
    Plus,
    Edit,
    Send,
    Archive,
    Trash2,
    RotateCcw,
    Package,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PackageActivity {
    id: string;
    action: string;
    createdAt: string;
    details: any;
    user: {
        name: string;
        avatar?: string;
    };
}

interface PackageLogsModalProps {
    packageId: string;
    isOpen: boolean;
    onClose: () => void;
    packageName?: string;
}

export function PackageLogsModal({
    packageId,
    isOpen,
    onClose,
    packageName,
}: PackageLogsModalProps) {
    const [activities, setActivities] = useState<PackageActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && packageId) {
            fetchActivities();
        }
    }, [isOpen, packageId]);

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get(
                `/packages/${packageId}/logs`,
                { params: { page: 1, limit: 100 } }
            );
            const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setActivities(list);
        } catch (error) {
            toast.error("Failed to load activity logs");
        } finally {
            setIsLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case "create":
                return <Plus className="w-4 h-4 text-green-500" />;
            case "update":
                return <Edit className="w-4 h-4 text-blue-500" />;
            case "edit_draft":
                return <Edit className="w-4 h-4 text-amber-500" />;
            case "publish":
                return <Send className="w-4 h-4 text-indigo-500" />;
            case "publish_update":
                return <Send className="w-4 h-4 text-indigo-700" />;
            case "archive":
                return <Archive className="w-4 h-4 text-gray-500" />;
            case "unpublish":
                return <RotateCcw className="w-4 h-4 text-orange-500" />;
            case "discard_changes":
                return <Trash2 className="w-4 h-4 text-red-500" />;
            case "delete":
                return <Trash2 className="w-4 h-4 text-red-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActionLabel = (action: string) => {
        return action
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl sm:max-w-2xl w-[95vw] h-[80vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-5 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <DialogTitle>Activity Logs</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Audit trail for {packageName || "this package"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col gap-4 py-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 animate-pulse"
                                >
                                    <div className="w-10 h-10 bg-muted rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-3 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="relative border-l-2 border-muted ml-5 pb-4 pl-8 space-y-8 mt-2">
                            {activities.map((activity) => (
                                <div key={activity.id} className="relative">
                                    <div className="absolute -left-[45px] top-0 flex items-center justify-center">
                                        <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                                                {activity.user?.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm">
                                                    {activity.user?.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-5 py-0 px-1.5 flex gap-1 items-center bg-muted/30"
                                                >
                                                    {getActionIcon(
                                                        activity.action,
                                                    )}
                                                    {getActionLabel(
                                                        activity.action,
                                                    )}
                                                </Badge>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(
                                                    new Date(
                                                        activity.createdAt,
                                                    ),
                                                    { addSuffix: true },
                                                )}
                                            </span>
                                        </div>
                                        {activity.details?.toStatus && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <span>Transitioned to</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[9px] h-4 py-0 px-1 uppercase"
                                                >
                                                    {activity.details.toStatus}
                                                </Badge>
                                            </div>
                                        )}
                                        {activity.details?.reason && (
                                            <p className="text-xs bg-muted/40 p-2 rounded-md italic">
                                                "{activity.details.reason}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="w-10 h-10 mb-4 opacity-20" />
                            <p className="text-sm">No activity records found</p>
                        </div>
                    )}
                </div>
                <div className="p-3 px-5 border-t bg-muted/10 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="text-xs font-medium hover:underline px-4 py-1.5"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
