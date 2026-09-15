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
	userRoleName = "Sales Executive",
}: DashboardRoleSwitcherProps) {
	const roles = [
		{
			id: "sales_executive" as RoleType,
			label: "Sales Executive",
			icon: UserCheck,
			description: "My Bookings, Leads & Urgent Vacancies",
		},
		{
			id: "sales_manager" as RoleType,
			label: "Sales Manager",
			icon: Briefcase,
			description: "Team MoM Comparisons & Approvals",
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
			description: "Payment Pendings & Balance Approvals",
		},
		{
			id: "admin" as RoleType,
			label: "Admin Overview",
			icon: ShieldCheck,
			description: "Holistic Multi-Branch System View",
		},
	];

	const currentRoleConfig = roles.find((r) => r.id === activeRole) || roles[0];

	return (
		<div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
			<div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Sales & Operational Dashboard
						</h1>
						<Badge variant="secondary" className="gap-1 font-medium">
							<Building2 className="h-3.5 w-3.5" />
							{currentRoleConfig.label}
						</Badge>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						{currentRoleConfig.description}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
						Switch View:
					</span>
					<div className="flex flex-wrap gap-1.5 bg-muted/60 p-1 rounded-lg border">
						{roles.map((r) => {
							const Icon = r.icon;
							const isActive = activeRole === r.id;
							return (
								<Button
									key={r.id}
									variant={isActive ? "default" : "ghost"}
									size="sm"
									onClick={() => onRoleChange(r.id)}
									className={`h-8 gap-1.5 text-xs font-medium transition-all ${
										isActive
											? "shadow-sm bg-primary text-primary-foreground font-semibold"
											: "hover:bg-background/80"
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
