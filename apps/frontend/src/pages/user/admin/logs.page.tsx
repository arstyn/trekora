import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import axiosInstance from "@/lib/axios";
import { History, RotateCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface IActivityLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    performedBy?: {
        name: string;
        email: string;
    };
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<IActivityLog[]>("/activity-log");
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
            toast.error("Failed to load activity logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadge = (action: string) => {
        switch (action) {
            case "invite_sent":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Invite Sent</Badge>;
            case "invite_resent":
                return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border-none">Invite Resent</Badge>;
            case "organization_switched":
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">Org Switched</Badge>;
            case "employee_reactivated":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Reactivated</Badge>;
            case "employee_archived":
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Archived</Badge>;
            case "employee_unarchived":
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Unarchived</Badge>;
            default:
                return <Badge variant="secondary">{action}</Badge>;
        }
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.performedBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.performedBy?.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = actionFilter === "all" || log.action === actionFilter;

        return matchesSearch && matchesAction;
    });

    return (
        <div className="space-y-6 px-6 py-5">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-8 w-8 text-primary" />
                    Activity Logs
                </h1>
                <p className="text-muted-foreground">
                    Monitor administrative actions, employee status changes, and invitations for your organization.
                </p>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-1 flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs by name, email, details..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="invite_sent">Invite Sent</SelectItem>
                                    <SelectItem value="invite_resent">Invite Resent</SelectItem>
                                    <SelectItem value="organization_switched">Org Switched</SelectItem>
                                    <SelectItem value="employee_reactivated">Reactivated</SelectItem>
                                    <SelectItem value="employee_archived">Archived</SelectItem>
                                    <SelectItem value="employee_unarchived">Unarchived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2 self-start md:self-auto">
                            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">Performed By</TableHead>
                                    <TableHead className="w-[150px]">Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="w-[200px] text-right">Date & Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell><div className="h-4 bg-muted rounded w-2/3" /></TableCell>
                                            <TableCell><div className="h-4 bg-muted rounded w-1/2" /></TableCell>
                                            <TableCell><div className="h-4 bg-muted rounded w-3/4" /></TableCell>
                                            <TableCell className="text-right"><div className="h-4 bg-muted rounded w-1/2 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No activity logs found matching the filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                {log.performedBy ? (
                                                    <div>
                                                        <div className="font-medium text-foreground">{log.performedBy.name}</div>
                                                        <div className="text-xs text-muted-foreground">{log.performedBy.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic">System</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.action)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-medium">
                                                {log.details}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                {new Date(log.createdAt).toLocaleString(undefined, {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
