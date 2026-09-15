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
	Clock,
	FileCheck2,
	Percent,
	ShieldAlert,
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
			<Card className="shadow-sm">
				<CardHeader>
					<div className="h-6 w-44 bg-muted animate-pulse rounded" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 2 }).map((_, i) => (
							<div key={i} className="h-24 bg-muted/60 animate-pulse rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const pendingItems = requests.filter((r) => r.status === "pending");

	return (
		<Card className="shadow-sm border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileCheck2 className="h-5 w-5 text-purple-500" />
						<CardTitle className="text-xl font-bold">Approval Requests</CardTitle>
					</div>
					<Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-200">
						{pendingItems.length} Pending Approval
					</Badge>
				</div>
				<CardDescription>
					Review and act on pending discount, quote & policy approval requests
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1 space-y-3">
				{requests.length === 0 ? (
					<div className="py-6 text-center text-muted-foreground text-xs border border-dashed rounded-lg">
						No pending approval requests.
					</div>
				) : (
					requests.map((item) => (
						<div
							key={item.id}
							className={`p-3.5 rounded-xl border transition-all ${
								item.status === "approved"
									? "bg-emerald-500/5 border-emerald-300 dark:border-emerald-950"
									: item.status === "rejected"
									? "bg-rose-500/5 border-rose-300 dark:border-rose-950"
									: "bg-card border-border"
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<Badge
											variant="secondary"
											className="text-[10px] uppercase font-bold tracking-wider"
										>
											{item.requestType.replace("_", " ")}
										</Badge>
										<span className="font-semibold text-xs text-foreground">
											{item.title}
										</span>
									</div>

									<p className="text-xs text-muted-foreground">{item.details}</p>

									<div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
										<span className="flex items-center gap-1 font-medium text-foreground">
											<User className="h-3 w-3 text-muted-foreground" />
											{item.requestedBy}
										</span>
										<span>•</span>
										<span>Client: {item.customerName}</span>
										{item.amount && (
											<>
												<span>•</span>
												<span className="font-semibold text-primary">
													₹{item.amount.toLocaleString("en-IN")}
												</span>
											</>
										)}
									</div>
								</div>

								{/* Actions / Status */}
								<div className="flex items-center gap-1.5 self-center">
									{item.status === "pending" ? (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleAction(item.id, "rejected")}
												className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
											>
												<X className="h-3.5 w-3.5 mr-1" /> Reject
											</Button>
											<Button
												size="sm"
												onClick={() => handleAction(item.id, "approved")}
												className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
											>
												<Check className="h-3.5 w-3.5 mr-1" /> Approve
											</Button>
										</>
									) : (
										<Badge
											variant="secondary"
											className={`text-xs font-semibold capitalize gap-1 ${
												item.status === "approved"
													? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
													: "bg-rose-500/20 text-rose-700 dark:text-rose-300"
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
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
