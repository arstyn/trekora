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
import Dashboard from "@/pages/user/dashboard";
import { Leads } from "@/pages/user/leads/page";
import LeadDetailsPage from "@/pages/user/leads/[id]/page";
import CreatePackagePage from "@/pages/user/packages/create-package";
import EditPackagePage from "@/pages/user/packages/edit-package";
import Packages from "@/pages/user/packages/package-list";
import ViewPackagePage from "@/pages/user/packages/view-package";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/general/home";
import BatchesPage from "./pages/user/batches/batches-pages";
import EditBatchPage from "./pages/user/batches/edit-batch";
import BatchDetailsPage from "./pages/user/batches/view-batch";
import BookingsPage from "./pages/user/bookings/bookings.page";
import EditBookingPage from "./pages/user/bookings/edit-booking.page";
import BookingDetailsPage from "./pages/user/bookings/view-booking.page";
import { BranchPage } from "./pages/user/branch/branch-page";
import CustomerManagement from "./pages/user/customers/customer";
import EditPaymentPage from "./pages/user/payments/edit-payment.page";
import PaymentsPage from "./pages/user/payments/payments.page";
import PaymentDetailsPage from "./pages/user/payments/view-payment.page";
import SettingsPage from "./pages/user/settings/page";
import ImportPage from "./pages/user/import/page";
import ActivatePage from "./pages/auth/activate-account";
import ResendActivationPage from "./pages/auth/resend-activation";
import ActivateUserPage from "./pages/auth/activate-user-account";
import { EmployeesPage } from "./pages/user/employees/employees-table";
import PreBookingsPage from "./pages/user/pre-bookings/pre-bookings.page";
import GoogleCallbackPage from "./pages/auth/google-callback";

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
                    <Route path="/pre-bookings" element={<PreBookingsPage />} />
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
                    <Route path="/employees" element={<EmployeesPage />} />
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
                </Routes>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function App() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
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
