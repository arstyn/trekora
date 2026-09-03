import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardOverviewGrids } from "@/components/dashboard-overview-grids";
import { SectionCards } from "@/components/section-cards";
import { DashboardActiveOffers } from "@/components/dashboard-active-offers";

export default function Dashboard() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-6 py-4 md:py-6">
					<SectionCards />
					<DashboardActiveOffers />
					<div className="px-4 lg:px-6">
						<ChartAreaInteractive />
					</div>
					<DashboardOverviewGrids />
				</div>
			</div>
		</div>
	);
}
