import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertTriangle,
	Clock,
	CreditCard,
	DollarSign,
	Plus,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AddPaymentDialog } from "./_component/add-payment-dialog";
import { PaymentList } from "./_component/payment-list";

// Mock data
const dashboardStats = {
	totalPayments: 156,
	totalAmount: 245000,
	pendingPayments: 12,
	pendingAmount: 18500,
	completedPayments: 144,
	completedAmount: 226500,
	refundedPayments: 3,
	refundedAmount: 2850,
};

const recentPayments = [
	{
		id: "PAY001",
		bookingId: "BK001",
		customerName: "John Smith",
		packageName: "Himalayan Adventure",
		amount: 1200,
		paymentType: "advance",
		paymentMethod: "Bank Transfer",
		status: "completed",
		paymentDate: "2024-01-20",
		reference: "TXN123456789",
	},
	{
		id: "PAY002",
		bookingId: "BK002",
		customerName: "Sarah Johnson",
		packageName: "Beach Paradise",
		amount: 800,
		paymentType: "advance",
		paymentMethod: "Credit Card",
		status: "pending",
		paymentDate: "2024-01-21",
		reference: "CC987654321",
	},
	{
		id: "PAY003",
		bookingId: "BK001",
		customerName: "John Smith",
		packageName: "Himalayan Adventure",
		amount: 1200,
		paymentType: "balance",
		paymentMethod: "Cash",
		status: "completed",
		paymentDate: "2024-01-22",
		reference: "CASH001",
	},
];

const overduePayments = [
	{
		id: "BK004",
		customerName: "Mike Wilson",
		packageName: "Cultural Heritage Tour",
		dueAmount: 475,
		dueDate: "2024-01-15",
		daysOverdue: 8,
	},
	{
		id: "BK005",
		customerName: "Emily Davis",
		packageName: "Mountain Trek",
		dueAmount: 1100,
		dueDate: "2024-01-18",
		daysOverdue: 5,
	},
];

export default function PaymentsPage() {
	const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);

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
						<div className="text-2xl font-bold">
							{dashboardStats.totalPayments}
						</div>
						<p className="text-xs text-muted-foreground">
							${dashboardStats.totalAmount.toLocaleString()} total
						</p>
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
						<div className="text-2xl font-bold">
							{dashboardStats.pendingPayments}
						</div>
						<p className="text-xs text-muted-foreground">
							${dashboardStats.pendingAmount.toLocaleString()} pending
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.completedPayments}
						</div>
						<p className="text-xs text-muted-foreground">
							${dashboardStats.completedAmount.toLocaleString()} received
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Refunded</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.refundedPayments}
						</div>
						<p className="text-xs text-muted-foreground">
							${dashboardStats.refundedAmount.toLocaleString()} refunded
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Overdue Payments Alert */}
			{overduePayments.length > 0 && (
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
									key={payment.id}
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
											${payment.dueAmount}
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
			)}

			{/* Recent Payments */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Payments</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentPayments.map((payment) => (
							<div
								key={payment.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="font-semibold">
											{payment.id} - {payment.customerName}
										</h3>
										<Badge
											variant={
												payment.status === "completed"
													? "default"
													: "secondary"
											}
										>
											{payment.status}
										</Badge>
										<Badge variant="outline">
											{payment.paymentType}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{payment.packageName} • {payment.paymentMethod}
									</p>
									<div className="flex items-center gap-4">
										<span className="text-sm">
											Amount: ${payment.amount}
										</span>
										<span className="text-sm text-muted-foreground">
											Ref: {payment.reference}
										</span>
										<span className="text-sm text-muted-foreground">
											Date:{" "}
											{new Date(
												payment.paymentDate
											).toLocaleDateString()}
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
					<TabsTrigger value="archived">Archived</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<PaymentList status="all" />
				</TabsContent>

				<TabsContent value="pending">
					<PaymentList status="pending" />
				</TabsContent>

				<TabsContent value="completed">
					<PaymentList status="completed" />
				</TabsContent>

				<TabsContent value="failed">
					<PaymentList status="failed" />
				</TabsContent>

				<TabsContent value="refunded">
					<PaymentList status="refunded" />
				</TabsContent>

				<TabsContent value="archived">
					<PaymentList status="archived" />
				</TabsContent>
			</Tabs>

			<AddPaymentDialog
				open={addPaymentDialogOpen}
				onOpenChange={setAddPaymentDialogOpen}
			/>
		</div>
	);
}
