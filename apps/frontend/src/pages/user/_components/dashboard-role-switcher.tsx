import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Briefcase,
	Building2,
	Calculator,
	Compass,
	ShieldCheck,
	UserCheck,
} from "lucide-react";

export type RoleType =
	| "sales_executive"
	| "sales_manager"
	| "operations"
	| "finance"
	| "admin";

interface DashboardRoleSwitcherProps {
	activeRole: RoleType;
	onRoleChange: (role: RoleType) => void;
	userRoleName?: string;
}

export function DashboardRoleSwitcher({
	activeRole,
	onRoleChange,
}: DashboardRoleSwitcherProps) {
	const roles = [
		{
			id: "sales_executive" as RoleType,
			label: "Sales Executive",
			icon: UserCheck,
			description: "My Bookings, Active Leads & Urgent Seat Vacancies",
		},
		{
			id: "sales_manager" as RoleType,
			label: "Sales Manager",
			icon: Briefcase,
			description: "Team Performance, MoM Analytics & Approvals",
		},
		{
			id: "operations" as RoleType,
			label: "Operations",
			icon: Compass,
			description: "Seat Vacancies & Departure Batch Logistics",
		},
		{
			id: "finance" as RoleType,
			label: "Finance",
			icon: Calculator,
			description: "Pending Balances & Payment Approvals",
		},
		{
			id: "admin" as RoleType,
			label: "Admin Overview",
			icon: ShieldCheck,
			description: "Holistic Multi-Branch System Dashboard",
		},
	];

	const currentRoleConfig = roles.find((r) => r.id === activeRole) || roles[0];

	return (
		<div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				{/* Title & Active Role Subtitle */}
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Sales & Operational Dashboard
						</h1>
						<Badge
							variant="secondary"
							className="gap-1.5 px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
						>
							<Building2 className="h-3.5 w-3.5" />
							{currentRoleConfig.label} View
						</Badge>
					</div>
					<p className="text-xs sm:text-sm text-muted-foreground">
						{currentRoleConfig.description}
					</p>
				</div>

				{/* Role Switcher Tabs Bar */}
				<div className="flex flex-col sm:flex-row sm:items-center gap-2">
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
						Switch View:
					</span>
					<div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/50">
						{roles.map((r) => {
							const Icon = r.icon;
							const isActive = activeRole === r.id;
							return (
								<Button
									key={r.id}
									variant={isActive ? "default" : "ghost"}
									size="sm"
									onClick={() => onRoleChange(r.id)}
									className={`h-8 px-3 gap-1.5 text-xs font-medium shrink-0 transition-all ${
										isActive
											? "shadow-xs bg-primary text-primary-foreground font-semibold"
											: "hover:bg-background/80 text-muted-foreground hover:text-foreground"
									}`}
								>
									<Icon className="h-3.5 w-3.5" />
									<span>{r.label}</span>
								</Button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

