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
			<Card className="shadow-xs border-border/80 h-full flex flex-col">
				<CardHeader className="pb-3">
					<div className="h-6 w-40 bg-muted animate-pulse rounded" />
					<div className="h-4 w-52 bg-muted animate-pulse rounded mt-1" />
				</CardHeader>
				<CardContent className="flex-1 space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl" />
					))}
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
				return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
			case "action_required":
				return <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />;
			case "success":
				return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
			default:
				return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
		}
	};

	return (
		<Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
							<Bell className="h-4 w-4 shrink-0" />
						</div>
						<CardTitle className="text-base font-bold tracking-tight">New Notifications</CardTitle>
					</div>
					{unreadCount > 0 ? (
						<Badge variant="default" className="text-xs px-2.5 py-0.5 bg-blue-600 font-semibold shrink-0">
							{unreadCount} New
						</Badge>
					) : (
						<Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-medium shrink-0">
							All Read
						</Badge>
					)}
				</div>
				<div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
					<span>Real-time system updates & alerts</span>
					{unreadCount > 0 && (
						<Button
							variant="link"
							size="sm"
							onClick={handleMarkAllRead}
							className="h-auto p-0 text-xs text-primary font-semibold gap-1 shrink-0"
						>
							<CheckCheck className="h-3 w-3" /> Mark all read
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className="p-4 flex-1 flex flex-col space-y-3 min-h-0">
				{/* Filter Tabs */}
				<div className="flex items-center gap-1.5 border-b border-border/40 pb-2 shrink-0">
					<Button
						variant={filter === "all" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setFilter("all")}
						className="h-7 px-2.5 text-xs font-semibold"
					>
						All ({notifications.length})
					</Button>
					<Button
						variant={filter === "unread" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setFilter("unread")}
						className="h-7 px-2.5 text-xs font-semibold"
					>
						Unread ({unreadCount})
					</Button>
				</div>

				{/* Scrollable Notification Items */}
				<div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 custom-dashboard-scroll flex-1">
					{filteredNotifications.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground text-xs border border-dashed rounded-xl flex items-center justify-center">
							No notifications to show.
						</div>
					) : (
						filteredNotifications.map((item) => (
							<div
								key={item.id}
								onClick={() => handleToggleRead(item.id)}
								className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
									!item.isRead
										? "bg-blue-500/5 border-blue-500/30 hover:bg-blue-500/10"
										: "bg-card border-border/80 opacity-75 hover:opacity-100 hover:border-border"
								}`}
							>
								<div className="mt-0.5 p-1 rounded-md bg-muted/60">{getIcon(item.type)}</div>
								<div className="flex-1 min-w-0 space-y-1">
									<div className="flex items-center justify-between gap-2">
										<h5 className="text-xs font-bold text-foreground truncate">
											{item.title}
										</h5>
										<span className="text-[10px] font-medium text-muted-foreground shrink-0 tabular-nums">
											{item.createdAt}
										</span>
									</div>
									<p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
								</div>
								{!item.isRead && (
									<span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
								)}
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

