import { useEffect, useState } from "react";
import {
	DashboardService,
	type ApprovalRequestItem,
	type BookingComparisonData,
	type DashboardNotificationItem,
	type DashboardTodoItem,
	type PaymentPendingItem,
	type SeatVacancyItem,
} from "@/services/dashboard.service";
import { ApprovalRequestsSection } from "./_components/approval-requests-section";
import { BookingComparisonSection } from "./_components/booking-comparison-section";
import { DashboardNotificationsSection } from "./_components/dashboard-notifications-section";
import {
	DashboardRoleSwitcher,
	type RoleType,
} from "./_components/dashboard-role-switcher";
import { PaymentPendingSection } from "./_components/payment-pending-section";
import { SeatVacancySection } from "./_components/seat-vacancy-section";
import { TodosSection } from "./_components/todos-section";

export default function Dashboard() {
	const [activeRole, setActiveRole] = useState<RoleType>("sales_executive");
	const [loading, setLoading] = useState(true);

	const [comparisonData, setComparisonData] =
		useState<BookingComparisonData | null>(null);
	const [seatVacancies, setSeatVacancies] = useState<SeatVacancyItem[]>([]);
	const [paymentPendings, setPaymentPendings] = useState<
		PaymentPendingItem[]
	>([]);
	const [todos, setTodos] = useState<DashboardTodoItem[]>([]);
	const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
	const [notifications, setNotifications] = useState<
		DashboardNotificationItem[]
	>([]);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				setLoading(true);
				const [
					comparisonRes,
					vacanciesRes,
					pendingsRes,
					todosRes,
					approvalsRes,
					notificationsRes,
				] = await Promise.all([
					DashboardService.getBookingComparison(),
					DashboardService.getSeatVacancies(),
					DashboardService.getPaymentPendings(),
					DashboardService.getTodos(),
					DashboardService.getApprovals(),
					DashboardService.getNotifications(),
				]);

				setComparisonData(comparisonRes);
				setSeatVacancies(vacanciesRes);
				setPaymentPendings(pendingsRes);
				setTodos(todosRes);
				setApprovals(approvalsRes);
				setNotifications(notificationsRes);
			} catch (err) {
				console.error("Error loading sales dashboard data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []);

	return (
		<div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
			{/* Role Switcher & Header */}
			<DashboardRoleSwitcher
				activeRole={activeRole}
				onRoleChange={setActiveRole}
			/>

			{/* Module 1: Booking Details & Period Comparison (This Month vs Last Month, Domestic vs International) */}
			<BookingComparisonSection data={comparisonData} loading={loading} />

			{/* Grid Row: Seat Vacancies (Module 2) & Payment Pendings (Module 3) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Module 2: Seat Vacancy List */}
				<SeatVacancySection items={seatVacancies} loading={loading} />

				{/* Module 3: Payment Pending Booking Lists */}
				<PaymentPendingSection items={paymentPendings} loading={loading} />
			</div>

			{/* Grid Row: Todos (Module 4), Approvals (Module 5), Notifications (Module 6) */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Module 4: Todo's to be completed */}
				<TodosSection items={todos} loading={loading} roleFilter={activeRole} />

				{/* Module 5: Approval Requests */}
				<ApprovalRequestsSection items={approvals} loading={loading} />

				{/* Module 6: New Notifications */}
				<DashboardNotificationsSection
					items={notifications}
					loading={loading}
				/>
			</div>
		</div>
	);
}
