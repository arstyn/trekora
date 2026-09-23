import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ApprovalRequestItem } from "@/services/dashboard.service";
import {
	Check,
	FileCheck2,
	User,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ApprovalRequestsSectionProps {
	items: ApprovalRequestItem[];
	loading: boolean;
}

export function ApprovalRequestsSection({
	items: initialItems,
	loading,
}: ApprovalRequestsSectionProps) {
	const [requests, setRequests] = useState<ApprovalRequestItem[]>(initialItems);

	if (requests.length === 0 && initialItems.length > 0) {
		setRequests(initialItems);
	}

	const handleAction = (id: string, action: "approved" | "rejected") => {
		setRequests((prev) =>
			prev.map((r) => (r.id === id ? { ...r, status: action } : r))
		);
		if (action === "approved") {
			toast.success("Approval request approved successfully!");
		} else {
			toast.info("Approval request rejected.");
		}
	};

	if (loading) {
		return (
			<Card className="shadow-xs border-border/80 h-full flex flex-col">
				<CardHeader className="pb-3">
					<div className="h-6 w-44 bg-muted animate-pulse rounded" />
					<div className="h-4 w-56 bg-muted animate-pulse rounded mt-1" />
				</CardHeader>
				<CardContent className="flex-1 space-y-3">
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="h-28 bg-muted/50 animate-pulse rounded-xl" />
					))}
				</CardContent>
			</Card>
		);
	}

	const pendingItems = requests.filter((r) => r.status === "pending");

	return (
		<Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
							<FileCheck2 className="h-4 w-4 shrink-0" />
						</div>
						<CardTitle className="text-base font-bold tracking-tight">
							Approval Requests
						</CardTitle>
					</div>
					<Badge
						variant="outline"
						className="text-xs px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold shrink-0"
					>
						{pendingItems.length} Pending
					</Badge>
				</div>
				<CardDescription className="text-xs mt-0.5">
					Review and act on pending discount & quote approval requests
				</CardDescription>
			</CardHeader>

			<CardContent className="p-4 flex-1 flex flex-col min-h-0">
				<div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-dashboard-scroll flex-1">
					{requests.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground text-xs border border-dashed rounded-xl flex items-center justify-center">
							No pending approval requests.
						</div>
					) : (
						requests.map((item) => (
							<div
								key={item.id}
								className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
									item.status === "approved"
										? "bg-emerald-500/5 border-emerald-500/30"
										: item.status === "rejected"
										? "bg-rose-500/5 border-rose-500/30"
										: "bg-card border-border/80 hover:border-purple-500/30"
								}`}
							>
								{/* Header Tag & Title */}
								<div className="flex items-start justify-between gap-2">
									<div className="space-y-1 min-w-0 flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<Badge
												variant="secondary"
												className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-purple-500/15 text-purple-600 dark:text-purple-300"
											>
												{item.requestType.replace("_", " ")}
											</Badge>
											{item.amount && (
												<Badge
													variant="outline"
													className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
												>
													₹{item.amount.toLocaleString("en-IN")}
												</Badge>
											)}
										</div>
										<h5 className="font-bold text-xs text-foreground leading-snug">
											{item.title}
										</h5>
									</div>

									{item.status !== "pending" && (
										<Badge
											variant="secondary"
											className={`text-[10px] font-bold capitalize gap-1 px-2 py-0.5 shrink-0 ${
												item.status === "approved"
													? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
													: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
											}`}
										>
											{item.status === "approved" ? (
												<Check className="h-3 w-3" />
											) : (
												<X className="h-3 w-3" />
											)}
											{item.status}
										</Badge>
									)}
								</div>

								{/* Details snippet */}
								<p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-2 rounded-lg border border-border/30">
									{item.details}
								</p>

								{/* Info & Action Footer */}
								<div className="flex items-center justify-between gap-2 pt-1">
									<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 truncate">
										<User className="h-3 w-3 text-muted-foreground shrink-0" />
										<span className="font-medium text-foreground truncate">
											{item.requestedBy}
										</span>
										<span>•</span>
										<span className="truncate">{item.customerName}</span>
									</div>

									{item.status === "pending" && (
										<div className="flex items-center gap-1.5 shrink-0">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleAction(item.id, "rejected")}
												className="h-7 px-2.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 font-semibold"
											>
												<X className="h-3 w-3 mr-0.5" /> Reject
											</Button>
											<Button
												size="sm"
												onClick={() => handleAction(item.id, "approved")}
												className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
											>
												<Check className="h-3 w-3 mr-0.5" /> Approve
											</Button>
										</div>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

