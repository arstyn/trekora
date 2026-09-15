import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DashboardNotificationItem } from "@/services/dashboard.service";
import {
	AlertTriangle,
	Bell,
	CheckCheck,
	CheckCircle2,
	Info,
	ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardNotificationsSectionProps {
	items: DashboardNotificationItem[];
	loading: boolean;
}

export function DashboardNotificationsSection({
	items: initialItems,
	loading,
}: DashboardNotificationsSectionProps) {
	const [notifications, setNotifications] =
		useState<DashboardNotificationItem[]>(initialItems);
	const [filter, setFilter] = useState<"all" | "unread">("all");

	if (notifications.length === 0 && initialItems.length > 0) {
		setNotifications(initialItems);
	}

	const handleMarkAllRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		toast.success("All notifications marked as read");
	};

	const handleToggleRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
		);
	};

	if (loading) {
		return (
			<Card className="shadow-sm">
				<CardHeader>
					<div className="h-6 w-40 bg-muted animate-pulse rounded" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-16 bg-muted/60 animate-pulse rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const filteredNotifications = notifications.filter((n) => {
		if (filter === "unread") return !n.isRead;
		return true;
	});

	const getIcon = (type: DashboardNotificationItem["type"]) => {
		switch (type) {
			case "warning":
				return <AlertTriangle className="h-4 w-4 text-amber-500" />;
			case "action_required":
				return <ShieldAlert className="h-4 w-4 text-rose-500" />;
			case "success":
				return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
			default:
				return <Info className="h-4 w-4 text-blue-500" />;
		}
	};

	return (
		<Card className="shadow-sm border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5 text-blue-500" />
						<CardTitle className="text-xl font-bold">New Notifications</CardTitle>
					</div>
					{unreadCount > 0 && (
						<Badge variant="default" className="text-xs bg-blue-600 font-semibold">
							{unreadCount} New
						</Badge>
					)}
				</div>
				<CardDescription className="flex items-center justify-between mt-1">
					<span>Real-time system updates & alerts</span>
					{unreadCount > 0 && (
						<Button
							variant="link"
							size="sm"
							onClick={handleMarkAllRead}
							className="h-auto p-0 text-xs text-primary gap-1"
						>
							<CheckCheck className="h-3 w-3" /> Mark all read
						</Button>
					)}
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1 space-y-3">
				<div className="flex items-center gap-1 mb-2 border-b pb-2">
					<Button
						variant={filter === "all" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setFilter("all")}
						className="h-7 text-xs"
					>
						All Alerts ({notifications.length})
					</Button>
					<Button
						variant={filter === "unread" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setFilter("unread")}
						className="h-7 text-xs"
					>
						Unread ({unreadCount})
					</Button>
				</div>

				<div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
					{filteredNotifications.length === 0 ? (
						<div className="py-6 text-center text-muted-foreground text-xs border border-dashed rounded-lg">
							No notifications to show.
						</div>
					) : (
						filteredNotifications.map((item) => (
							<div
								key={item.id}
								onClick={() => handleToggleRead(item.id)}
								className={`p-3 rounded-lg border flex items-start gap-3 transition-all cursor-pointer ${
									!item.isRead
										? "bg-blue-500/5 border-blue-200 dark:border-blue-900"
										: "bg-card border-border opacity-75"
								}`}
							>
								<div className="mt-0.5">{getIcon(item.type)}</div>
								<div className="flex-1 space-y-0.5">
									<div className="flex items-center justify-between">
										<h5 className="text-xs font-semibold text-foreground">
											{item.title}
										</h5>
										<span className="text-[10px] text-muted-foreground">
											{item.createdAt}
										</span>
									</div>
									<p className="text-xs text-muted-foreground">{item.message}</p>
								</div>
								{!item.isRead && (
									<span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
								)}
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
