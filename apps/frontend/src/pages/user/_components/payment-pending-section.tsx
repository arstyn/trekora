import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { PaymentPendingItem } from "@/services/dashboard.service";
import {
	AlertCircle,
	ArrowUpRight,
	Clock,
	CreditCard,
	DollarSign,
	PhoneCall,
	Send,
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
		toast.success(`Payment reminder sent via SMS/WhatsApp to ${customerName} (${bookingNumber})`);
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
			<Card className="shadow-sm">
				<CardHeader>
					<div className="h-6 w-48 bg-muted animate-pulse rounded" />
				</CardHeader>
				<CardContent>
					<div className="h-48 bg-muted/60 animate-pulse rounded-lg" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-sm border-border/80 h-full flex flex-col justify-between">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<CreditCard className="h-5 w-5 text-rose-500" />
						<CardTitle className="text-xl font-bold">
							Payment Pending Bookings
						</CardTitle>
					</div>
					<Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-200">
						{items.length} Pending Actions
					</Badge>
				</div>
				<CardDescription>
					Follow up on balance payments and outstanding customer dues
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1 space-y-4">
				<div className="rounded-lg border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead>Booking #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Package</TableHead>
								<TableHead className="text-right">Balance Due</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">
										No pending balance bookings found!
									</TableCell>
								</TableRow>
							) : (
								items.map((item) => {
									const isOverdue = item.status.toLowerCase().includes("overdue");
									return (
										<TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
											<TableCell className="font-semibold text-xs text-primary">
												{item.bookingNumber}
											</TableCell>
											<TableCell>
												<div className="font-medium text-xs text-foreground">
													{item.customerName}
												</div>
												<div className="text-[11px] text-muted-foreground flex items-center gap-1">
													<PhoneCall className="h-2.5 w-2.5" />
													{item.customerPhone}
												</div>
											</TableCell>
											<TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
												{item.packageName}
											</TableCell>
											<TableCell className="text-right font-bold text-xs text-rose-600 dark:text-rose-400 tabular-nums">
												{formatINR(item.balanceAmount)}
												<div className="text-[10px] text-muted-foreground font-normal">
													Paid: {formatINR(item.advancePaid)}
												</div>
											</TableCell>
											<TableCell className="text-xs">
												<span className={`inline-flex items-center gap-1 ${isOverdue ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
													<Clock className="h-3 w-3" />
													{item.dueDate}
												</span>
											</TableCell>
											<TableCell>
												<Badge
													variant="secondary"
													className={`text-[11px] font-medium gap-1 ${
														isOverdue
															? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200"
															: "bg-amber-500/15 text-amber-700 dark:text-amber-300"
													}`}
												>
													{isOverdue && <AlertCircle className="h-3 w-3" />}
													{item.status}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleSendReminder(item.customerName, item.bookingNumber)}
														className="h-7 text-xs gap-1"
														title="Send Payment Reminder"
													>
														<Send className="h-3 w-3 text-blue-500" />
														Remind
													</Button>
													<Button
														size="sm"
														onClick={() => navigate(`/user/payments?bookingId=${item.id}`)}
														className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
													>
														Record
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
