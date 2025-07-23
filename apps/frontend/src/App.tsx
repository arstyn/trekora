import { Footer } from "@/components/footer";
import { CTA } from "@/components/home/cta";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
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
import CreatePackagePage from "@/pages/user/packages/create-package";
import EditPackagePage from "@/pages/user/packages/edit-package";
import Packages from "@/pages/user/packages/package-list";
import ViewPackagePage from "@/pages/user/packages/view-package";
import { Route, Routes } from "react-router-dom";
import CustomerManagement from "./pages/user/customers/customer";
import SettingsPage from "./pages/user/settings/page";
import { TeamsPage } from "./pages/user/teams/teams-table";
import { BranchPage } from "./pages/user/branch/branch-page";

function Home() {
	return (
		<main>
			<Hero />
			<Stats />
			<Features />
			<Testimonials />
			<CTA />
		</main>
	);
}

function AuthenticatedApp() {
	// Add your dashboard and other protected routes here
	return (
		<>
			<SidebarProvider>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/leads" element={<Leads />} />
						<Route path="/packages" element={<Packages />} />
						<Route path="/packages/create" element={<CreatePackagePage />} />
						<Route path="/packages/edit/:id" element={<EditPackagePage />} />
						<Route path="/packages/:id" element={<ViewPackagePage />} />
						<Route path="/customers" element={<CustomerManagement />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route path="/teams" element={<TeamsPage />} />
						<Route path="/branches" element={<BranchPage />} />
					</Routes>
				</SidebarInset>
			</SidebarProvider>
		</>
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
			</Routes>
			<Footer />
		</>
	);
}
