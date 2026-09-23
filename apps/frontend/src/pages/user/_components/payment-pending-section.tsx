import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { PaymentPendingItem } from "@/services/dashboard.service";
import {
	AlertCircle,
	Clock,
	CreditCard,
	PhoneCall,
	Send,
	User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PaymentPendingSectionProps {
	items: PaymentPendingItem[];
	loading: boolean;
}

export function PaymentPendingSection({
	items,
	loading,
}: PaymentPendingSectionProps) {
	const navigate = useNavigate();

	const handleSendReminder = (customerName: string, bookingNumber: string) => {
		toast.success(`Payment reminder sent to ${customerName} (${bookingNumber})`);
	};

	const formatINR = (val: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(val);
	};

	if (loading) {
		return (
			<Card className="shadow-xs border-border/80">
				<CardHeader className="pb-3">
					<div className="h-6 w-48 bg-muted animate-pulse rounded" />
					<div className="h-4 w-72 bg-muted animate-pulse rounded mt-1" />
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-28 bg-muted/50 animate-pulse rounded-xl" />
					))}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-xs border-border/80 flex flex-col">
			<CardHeader className="pb-4 border-b border-border/40">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
							<CreditCard className="h-5 w-5" />
						</div>
						<div>
							<CardTitle className="text-lg font-bold tracking-tight">
								Payment Pending Bookings
							</CardTitle>
							<CardDescription className="text-xs mt-0.5">
								Follow up on balance payments and outstanding customer dues
							</CardDescription>
						</div>
					</div>
					<Badge
						variant="outline"
						className="text-xs px-2.5 py-1 bg-rose-500/10 text-rose-500 border-rose-500/20 font-semibold shrink-0"
					>
						{items.length} Outstanding
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-4 flex-1 flex flex-col min-h-0">
				<div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-dashboard-scroll flex-1">
					{items.length === 0 ? (

						<div className="py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl flex items-center justify-center">
							No pending balance bookings found!
						</div>
					) : (
						items.map((item) => {
							const isOverdue = item.status.toLowerCase().includes("overdue");
							return (
								<div
									key={item.id}
									className={`p-4 rounded-xl border transition-all ${
										isOverdue
											? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
											: "bg-card hover:bg-muted/40 border-border/80"
									}`}
								>
									{/* Top Header Row */}
									<div className="flex items-center justify-between gap-2 pb-2">
										<div className="flex items-center gap-2">
											<span className="font-extrabold text-xs text-primary tabular-nums">
												{item.bookingNumber}
											</span>
											<Badge
												variant="secondary"
												className={`text-[11px] font-semibold gap-1 px-2 py-0.5 ${
													isOverdue
														? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
														: "bg-amber-500/15 text-amber-400 border border-amber-500/30"
												}`}
											>
												{isOverdue && <AlertCircle className="h-3 w-3 shrink-0" />}
												{item.status}
											</Badge>
										</div>

										{/* Balance Due */}
										<div className="text-right">
											<div className="font-extrabold text-sm text-rose-500 tabular-nums">
												{formatINR(item.balanceAmount)}
											</div>
											<div className="text-[10px] text-muted-foreground font-normal">
												Paid: {formatINR(item.advancePaid)}
											</div>
										</div>
									</div>

									{/* Main Item Body */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
										<div className="space-y-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="font-bold text-xs text-foreground flex items-center gap-1">
													<User className="h-3 w-3 text-muted-foreground" />
													{item.customerName}
												</span>
												<span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
													<PhoneCall className="h-2.5 w-2.5 text-muted-foreground" />
													{item.customerPhone}
												</span>
											</div>
											<p className="text-xs text-muted-foreground truncate max-w-[280px]">
												{item.packageName}
											</p>
										</div>

										{/* Due Date & Action Buttons */}
										<div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
											<span
												className={`inline-flex items-center gap-1 text-xs font-medium ${
													isOverdue ? "text-rose-400 font-bold" : "text-muted-foreground"
												}`}
											>
												<Clock className="h-3.5 w-3.5" />
												Due: {item.dueDate}
											</span>

											<div className="flex items-center gap-1.5">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSendReminder(item.customerName, item.bookingNumber)}
													className="h-8 px-2.5 text-xs gap-1 font-medium"
													title="Send Payment Reminder"
												>
													<Send className="h-3 w-3 text-blue-400 shrink-0" />
													Remind
												</Button>
												<Button
													size="sm"
													onClick={() => navigate(`/user/payments?bookingId=${item.id}`)}
													className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
												>
													Record
												</Button>
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
