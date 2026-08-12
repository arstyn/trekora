import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PaymentService from "@/services/payment.service";
import type { OverduePayment, Payment, PaymentStats } from "@/types/payment.types";
import {
	AlertTriangle,
	Clock,
	CreditCard,
	DollarSign,
	Loader2,
	Plus,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AddPaymentDialog } from "./_components/add-payment-dialog";
import { PaymentList } from "./_components/payment-list";
import { RecentPaymentsSlider } from "./_components/recent-payments-slider";

export default function PaymentsPage() {
	const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
	const [dashboardStats, setDashboardStats] = useState<PaymentStats | null>(null);
	const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
	const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
	const [loading, setLoading] = useState({
		stats: true,
		recent: true,
		overdue: true,
	});
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	// Load dashboard data
	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setError(null);

			// Load all data in parallel
			const [statsResponse, recentResponse, overdueResponse] =
				await Promise.allSettled([
					PaymentService.getPaymentStats(),
					PaymentService.getPayments({
						limit: 5,
						sortBy: "createdAt",
						sortOrder: "DESC",
					}),
					PaymentService.getOverduePayments(),
				]);

			// Handle stats
			if (statsResponse.status === "fulfilled") {
				setDashboardStats(statsResponse.value);
			} else {
				console.error("Failed to load stats:", statsResponse.reason);
			}
			setLoading((prev) => ({ ...prev, stats: false }));

			// Handle recent payments
			if (recentResponse.status === "fulfilled") {
				setRecentPayments(recentResponse.value.data);
			} else {
				console.error("Failed to load recent payments:", recentResponse.reason);
			}
			setLoading((prev) => ({ ...prev, recent: false }));

			// Handle overdue payments
			if (overdueResponse.status === "fulfilled") {
				setOverduePayments(overdueResponse.value);
			} else {
				console.error("Failed to load overdue payments:", overdueResponse.reason);
			}
			setLoading((prev) => ({ ...prev, overdue: false }));
		} catch (error) {
			console.error("Error loading dashboard data:", error);
			setError("Failed to load dashboard data. Please try again.");
			setLoading({ stats: false, recent: false, overdue: false });
			toast({
				title: "Error",
				description: "Failed to load dashboard data. Please refresh the page.",
				variant: "destructive",
			});
		}
	};

	const handlePaymentAdded = () => {
		// Refresh dashboard data when a new payment is added
		loadDashboardData();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Payment Management</h1>
					<p className="text-muted-foreground">
						Track and manage all tour package payments
					</p>
				</div>
				<Button onClick={() => setAddPaymentDialogOpen(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Add Payment
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				<RecentPaymentsSlider payments={recentPayments} loading={loading.recent} />

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Payments
						</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading.stats ? (
							<div className="space-y-2">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{dashboardStats?.totalPayments || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{formatCurrency(dashboardStats?.totalAmount || 0)}{" "}
									total
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Payments
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading.stats ? (
							<div className="space-y-2">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{dashboardStats?.pendingPayments || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{formatCurrency(dashboardStats?.pendingAmount || 0)}{" "}
									pending
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading.stats ? (
							<div className="space-y-2">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{dashboardStats?.completedPayments || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{formatCurrency(dashboardStats?.completedAmount || 0)}{" "}
									received
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Refunded</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading.stats ? (
							<div className="space-y-2">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{dashboardStats?.refundedPayments || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{formatCurrency(dashboardStats?.refundedAmount || 0)}{" "}
									refunded
								</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Overdue Payments Alert */}
			{loading.overdue ? (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							Loading overdue payments...
						</CardTitle>
					</CardHeader>
				</Card>
			) : overduePayments.length > 0 ? (
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-800">
							<AlertTriangle className="w-5 h-5" />
							Overdue Payments ({overduePayments.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{overduePayments.map((payment) => (
								<div
									key={payment.bookingId}
									className="flex items-center justify-between p-3 bg-white rounded-lg border"
								>
									<div>
										<p className="font-medium">
											{payment.customerName}
										</p>
										<p className="text-sm text-muted-foreground">
											{payment.packageName} • Due:{" "}
											{new Date(
												payment.dueDate
											).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-red-600">
											{formatCurrency(payment.dueAmount)}
										</p>
										<p className="text-xs text-red-500">
											{payment.daysOverdue} days overdue
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : null}


			{/* Payment Tabs */}
			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Payments</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="completed">Completed</TabsTrigger>
					<TabsTrigger value="failed">Failed</TabsTrigger>
					<TabsTrigger value="refunded">Refunded</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<PaymentList status="all" onPaymentUpdate={handlePaymentAdded} />
				</TabsContent>

				<TabsContent value="pending">
					<PaymentList status="pending" onPaymentUpdate={handlePaymentAdded} />
				</TabsContent>

				<TabsContent value="completed">
					<PaymentList
						status="completed"
						onPaymentUpdate={handlePaymentAdded}
					/>
				</TabsContent>

				<TabsContent value="failed">
					<PaymentList status="failed" onPaymentUpdate={handlePaymentAdded} />
				</TabsContent>

				<TabsContent value="refunded">
					<PaymentList status="refunded" onPaymentUpdate={handlePaymentAdded} />
				</TabsContent>
			</Tabs>

			<AddPaymentDialog
				open={addPaymentDialogOpen}
				onOpenChange={setAddPaymentDialogOpen}
				onPaymentAdded={handlePaymentAdded}
			/>
		</div>
	);
}
