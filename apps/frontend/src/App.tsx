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
import LeadDetailsPage from "@/pages/user/leads/view-lead.page";
import { Leads } from "@/pages/user/leads/leads.page";
import CreatePackagePage from "@/pages/user/packages/create-package.page";
import EditPackagePage from "@/pages/user/packages/edit-package.page";
import Packages from "@/pages/user/packages/packages.page";
import ViewPackagePage from "@/pages/user/packages/view-package.page";
import { Route, Routes } from "react-router-dom";
import ActivatePage from "./pages/auth/activate-account";
import ActivateUserPage from "./pages/auth/activate-user-account";
import GoogleCallbackPage from "./pages/auth/google-callback";
import ResendActivationPage from "./pages/auth/resend-activation";
import { Home } from "./pages/general/home";
import BatchesPage from "./pages/user/batches/batches.page";
import EditBatchPage from "./pages/user/batches/edit-batch.page";
import BatchDetailsPage from "./pages/user/batches/view-batch.page";
import BookingsPage from "./pages/user/bookings/bookings.page";
import EditBookingPage from "./pages/user/bookings/edit-booking.page";
import BookingDetailsPage from "./pages/user/bookings/view-booking.page";
import { BranchPage } from "./pages/user/branches/branches.page";
import CustomerManagement from "./pages/user/customers/customers.page";
import { EmployeesPage } from "./pages/user/employees/employees.page";
import TeamHierarchyPage from "./pages/user/employees/team-hierarchy.page";
import ImportPage from "./pages/user/import/import.page";
import EditPaymentPage from "./pages/user/payments/edit-payment.page";
import PaymentsPage from "./pages/user/payments/payments.page";
import PaymentDetailsPage from "./pages/user/payments/view-payment.page";
import PermissionSetsPage from "./pages/user/permissions/permission-sets.page";
import PermissionsPage from "./pages/user/permissions/permissions.page";
import AdminOverviewPage from "./pages/user/admin/overview.page";
import ActivityLogsPage from "./pages/user/admin/logs.page";
import ManagerOverviewPage from "./pages/user/manager/overview.page";
import SettingsPage from "./pages/user/settings/settings.page";
import TodosPage from "./pages/user/todos/todos.page";
import OnboardingPage from "./pages/auth/onboarding";

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
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route
                        path="/permission-sets"
                        element={<PermissionSetsPage />}
                    />
                    <Route path="/permissions" element={<PermissionsPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
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
                    <Route path="/todos" element={<TodosPage />} />
                </Routes>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function App() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
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
                    path="/resend-activation"
                    element={<ResendActivationPage />}
                />
                <Route
                    path="/google-callback"
                    element={<GoogleCallbackPage />}
                />
            </Routes>
            <Footer />
        </>
    );
}
