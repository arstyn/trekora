import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertTriangle,
	Clock,
	CreditCard,
	DollarSign,
	Plus,
	TrendingUp,
	Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AddPaymentDialog } from "./_component/add-payment-dialog";
import { PaymentList } from "./_component/payment-list";
import PaymentService from "@/services/payment.service";
import type { 
	PaymentStats, 
	OverduePayment, 
	Payment,
} from "@/types/payment.types";
import { useToast } from "@/hooks/use-toast";

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
			const [statsResponse, recentResponse, overdueResponse] = await Promise.allSettled([
				PaymentService.getPaymentStats(),
				PaymentService.getPayments({ limit: 5, sortBy: "createdAt", sortOrder: "DESC" }),
				PaymentService.getOverduePayments(),
			]);

			// Handle stats
			if (statsResponse.status === "fulfilled") {
				setDashboardStats(statsResponse.value);
			} else {
				console.error("Failed to load stats:", statsResponse.reason);
			}
			setLoading(prev => ({ ...prev, stats: false }));

			// Handle recent payments
			if (recentResponse.status === "fulfilled") {
				setRecentPayments(recentResponse.value.data);
			} else {
				console.error("Failed to load recent payments:", recentResponse.reason);
			}
			setLoading(prev => ({ ...prev, recent: false }));

			// Handle overdue payments
			if (overdueResponse.status === "fulfilled") {
				setOverduePayments(overdueResponse.value);
			} else {
				console.error("Failed to load overdue payments:", overdueResponse.reason);
			}
			setLoading(prev => ({ ...prev, overdue: false }));

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
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case "failed":
				return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
			case "refunded":
				return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getPaymentTypeBadge = (type: string) => {
		switch (type.toLowerCase()) {
			case "advance":
				return (
					<Badge variant="outline" className="bg-blue-50 text-blue-700">
						Advance
					</Badge>
				);
			case "balance":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700">
						Balance
					</Badge>
				);
			case "partial":
				return (
					<Badge variant="outline" className="bg-orange-50 text-orange-700">
						Partial
					</Badge>
				);
			case "refund":
				return (
					<Badge variant="outline" className="bg-red-50 text-red-700">
						Refund
					</Badge>
				);
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
									{formatCurrency(dashboardStats?.totalAmount || 0)} total
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
									{formatCurrency(dashboardStats?.pendingAmount || 0)} pending
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
									{formatCurrency(dashboardStats?.completedAmount || 0)} received
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
									{formatCurrency(dashboardStats?.refundedAmount || 0)} refunded
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
											{new Date(payment.dueDate).toLocaleDateString()}
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

			{/* Recent Payments */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Payments</CardTitle>
				</CardHeader>
				<CardContent>
					{loading.recent ? (
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<Skeleton className="h-5 w-32" />
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-16" />
										</div>
										<Skeleton className="h-4 w-48 mb-2" />
										<div className="flex items-center gap-4">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-20" />
										</div>
									</div>
									<Skeleton className="h-9 w-24" />
								</div>
							))}
						</div>
					) : recentPayments.length > 0 ? (
						<div className="space-y-4">
							{recentPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-semibold">
												{payment.id} - {payment.booking.customer.name}
											</h3>
											{getStatusBadge(payment.status)}
											{getPaymentTypeBadge(payment.paymentType)}
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{payment.booking.package.name} • {payment.paymentMethod.replace('_', ' ')}
										</p>
										<div className="flex items-center gap-4">
											<span className="text-sm">
												Amount: {formatCurrency(payment.amount)}
											</span>
											{payment.paymentReference && (
												<span className="text-sm text-muted-foreground">
													Ref: {payment.paymentReference}
												</span>
											)}
											<span className="text-sm text-muted-foreground">
												Date: {new Date(payment.paymentDate).toLocaleDateString()}
											</span>
										</div>
									</div>
									<NavLink to={`/payments/${payment.id}`}>
										<Button variant="outline" size="sm">
											View Details
										</Button>
									</NavLink>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							No recent payments found.
						</div>
					)}
				</CardContent>
			</Card>

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
					<PaymentList status="completed" onPaymentUpdate={handlePaymentAdded} />
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
