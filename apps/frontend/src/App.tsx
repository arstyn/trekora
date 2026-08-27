import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/authContext";
import LoginPage from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import About from "@/pages/general/about";
import Contact from "@/pages/general/contact";
import Pricing from "@/pages/general/pricing";
import Team from "@/pages/general/team";
import Dashboard from "@/pages/user/dashboard.page";
import { Leads } from "@/pages/user/leads/leads.page";
import LeadDetailsPage from "@/pages/user/leads/view-lead.page";
import CreatePackagePage from "@/pages/user/packages/create-package.page";
import EditPackagePage from "@/pages/user/packages/edit-package.page";
import Packages from "@/pages/user/packages/packages.page";
import ViewPackagePage from "@/pages/user/packages/view-package.page";
import { Route, Routes, useLocation } from "react-router-dom";
import ActivatePage from "./pages/auth/activate-account";
import ActivateUserPage from "./pages/auth/activate-user-account";
import AcceptInvitationPage from "./pages/auth/accept-invitation";
import GoogleCallbackPage from "./pages/auth/google-callback";
import OnboardingPage from "./pages/auth/onboarding";
import ResendActivationPage from "./pages/auth/resend-activation";
import { Home } from "./pages/general/home";
import ServerErrorPage from "./pages/general/server-error";
import NotFoundPage from "./pages/general/not-found";
import ActivityLogsPage from "./pages/user/admin/logs.page";
import AdminOverviewPage from "./pages/user/admin/overview.page";
import BatchesPage from "./pages/user/batches/batches.page";
import EditBatchPage from "./pages/user/batches/edit-batch.page";
import BatchDetailsPage from "./pages/user/batches/view-batch.page";
import BookingsPage from "./pages/user/bookings/bookings.page";
import EditBookingPage from "./pages/user/bookings/edit-booking.page";
import BookingDetailsPage from "./pages/user/bookings/view-booking.page";
import { BranchPage } from "./pages/user/branches/branches.page";
import CancellationTiersPage from "./pages/user/cancellation-tiers/cancellation-tiers.page";
import CreateCancellationTierPage from "./pages/user/cancellation-tiers/create-cancellation-tier.page";
import EditCancellationTierPage from "./pages/user/cancellation-tiers/edit-cancellation-tier.page";
import ViewCancellationTierPage from "./pages/user/cancellation-tiers/view-cancellation-tier.page";
import CustomerManagement from "./pages/user/customers/customers.page";
import ViewCustomerPage from "./pages/user/customers/view-customer.page";
import BlockSlotsPage from "./pages/user/defaults/block-slots.page";
import DefaultsPage from "./pages/user/defaults/defaults.page";
import { EmployeesPage } from "./pages/user/employees/employees.page";
import TeamHierarchyPage from "./pages/user/employees/team-hierarchy.page";
import ViewEmployeePage from "./pages/user/employees/view-employee.page";
import ImportPage from "./pages/user/import/import.page";
import ManagerOverviewPage from "./pages/user/manager/overview.page";
import CreateMealPage from "./pages/user/meals/create-meal.page";
import EditMealPage from "./pages/user/meals/edit-meal.page";
import MealsPage from "./pages/user/meals/meals.page";
import ViewMealPage from "./pages/user/meals/view-meal.page";
import CreatePaymentStructurePage from "./pages/user/payment-structures/create-payment-structure.page";
import EditPaymentStructurePage from "./pages/user/payment-structures/edit-payment-structure.page";
import PaymentStructuresPage from "./pages/user/payment-structures/payment-structures.page";
import ViewPaymentStructurePage from "./pages/user/payment-structures/view-payment-structure.page";
import EditPaymentPage from "./pages/user/payments/edit-payment.page";
import PaymentsPage from "./pages/user/payments/payments.page";
import PaymentDetailsPage from "./pages/user/payments/view-payment.page";
import PermissionSetsPage from "./pages/user/permissions/permission-sets.page";
import PermissionsPage from "./pages/user/permissions/permissions.page";
import SettingsPage from "./pages/user/settings/settings.page";
import TodosPage from "./pages/user/todos/todos.page";
import AgentsPage from "./pages/user/agents/agents.page";
import CreateAgentPage from "./pages/user/agents/create-agent.page";
import EditAgentPage from "./pages/user/agents/edit-agent.page";
import ViewAgentPage from "./pages/user/agents/view-agent.page";

function AuthenticatedApp() {
    // Add your dashboard and other protected routes here
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/leads/:id" element={<LeadDetailsPage />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route
                        path="/packages/create"
                        element={<CreatePackagePage />}
                    />
                    <Route
                        path="/packages/edit/:id"
                        element={<EditPackagePage />}
                    />
                    <Route path="/packages/:id" element={<ViewPackagePage />} />
                    <Route path="/customers" element={<CustomerManagement />} />
                    <Route path="/customers/:id" element={<ViewCustomerPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route
                        path="/permission-sets"
                        element={<PermissionSetsPage />}
                    />
                    <Route path="/permissions" element={<PermissionsPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/employees/:id" element={<ViewEmployeePage />} />
                    <Route
                        path="/employees/hierarchy"
                        element={<TeamHierarchyPage />}
                    />
                    <Route
                        path="/admin/overview"
                        element={<AdminOverviewPage />}
                    />
                    <Route
                        path="/admin/logs"
                        element={<ActivityLogsPage />}
                    />
                    <Route
                        path="/manager/overview"
                        element={<ManagerOverviewPage />}
                    />
                    <Route path="/branches" element={<BranchPage />} />
                    <Route path="/batches" element={<BatchesPage />} />
                    <Route path="/batches/:id" element={<BatchDetailsPage />} />
                    <Route
                        path="/batches/edit/:id"
                        element={<EditBatchPage />}
                    />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route
                        path="/bookings/:id"
                        element={<BookingDetailsPage />}
                    />
                    <Route
                        path="/bookings/:id/edit"
                        element={<EditBookingPage />}
                    />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route
                        path="/payments/:id"
                        element={<PaymentDetailsPage />}
                    />
                    <Route
                        path="/payments/:id/edit"
                        element={<EditPaymentPage />}
                    />
                    <Route path="/import" element={<ImportPage />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/agents/create" element={<CreateAgentPage />} />
                    <Route path="/agents/edit/:id" element={<EditAgentPage />} />
                    <Route path="/agents/:id" element={<ViewAgentPage />} />
                    <Route path="/todos" element={<TodosPage />} />
                    <Route path="/defaults/meals" element={<MealsPage />} />
                    <Route path="/defaults/meals/create" element={<CreateMealPage />} />
                    <Route path="/defaults/meals/edit/:id" element={<EditMealPage />} />
                    <Route path="/defaults/meals/:id" element={<ViewMealPage />} />
                    <Route path="/defaults" element={<DefaultsPage />} />
                    <Route path="/defaults/payment-structures" element={<PaymentStructuresPage />} />
                    <Route path="/defaults/payment-structures/create" element={<CreatePaymentStructurePage />} />
                    <Route path="/defaults/payment-structures/edit/:id" element={<EditPaymentStructurePage />} />
                    <Route path="/defaults/payment-structures/:id" element={<ViewPaymentStructurePage />} />
                    <Route path="/defaults/cancellation-tiers" element={<CancellationTiersPage />} />
                    <Route path="/defaults/cancellation-tiers/create" element={<CreateCancellationTierPage />} />
                    <Route path="/defaults/cancellation-tiers/edit/:id" element={<EditCancellationTierPage />} />
                    <Route path="/defaults/cancellation-tiers/:id" element={<ViewCancellationTierPage />} />
                    <Route path="/defaults/block-slots" element={<BlockSlotsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function App() {
    const { isAuthenticated, user, loading, isBackendDown, refresh } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isBackendDown) {
        const hasToken = !!localStorage.getItem("accessToken") || !!localStorage.getItem("refreshToken");
        const isPublicStatic = ["/", "/about", "/pricing", "/team", "/contact"].includes(location.pathname);
        if (!isPublicStatic || hasToken) {
            return <ServerErrorPage onRetry={refresh} />;
        }
    }

    // Standalone routes that shouldn't render inside sidebar/app layout or public navbar/footer
    const isStandaloneRoute = location.pathname.startsWith("/accept-invitation/") ||
        location.pathname.startsWith("/activate-account/") ||
        location.pathname.startsWith("/activate-user-account/");

    if (isStandaloneRoute) {
        return (
            <Routes>
                <Route path="/accept-invitation/:id" element={<AcceptInvitationPage />} />
                <Route path="/activate-account/:id" element={<ActivatePage />} />
                <Route path="/activate-user-account/:id" element={<ActivateUserPage />} />
            </Routes>
        );
    }

    if (isAuthenticated) {
        if (user && user.isOnboarded === false) {
            return (
                <Routes>
                    <Route path="*" element={<OnboardingPage />} />
                </Routes>
            );
        }
        return <AuthenticatedApp />;
    }

    return (
        <>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/activate-account/:id"
                    element={<ActivatePage />}
                />
                <Route
                    path="/activate-user-account/:id"
                    element={<ActivateUserPage />}
                />
                <Route
                    path="/accept-invitation/:id"
                    element={<AcceptInvitationPage />}
                />
                <Route
                    path="/resend-activation"
                    element={<ResendActivationPage />}
                />
                <Route
                    path="/google-callback"
                    element={<GoogleCallbackPage />}
                />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
        </>
    );
}
