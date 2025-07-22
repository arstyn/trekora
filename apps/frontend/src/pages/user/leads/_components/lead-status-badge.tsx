import { Badge } from "@/components/ui/badge";
import type { ILeadStatus } from "@/types/lead/lead.entity";

interface LeadStatusBadgeProps {
	status: ILeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
	const getStatusColor = (status: ILeadStatus) => {
		switch (status) {
			case "new":
				return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/30";
			case "contacted":
				return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/30";
			case "qualified":
				return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/30";
			case "lost":
				return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/30";
			case "converted":
				return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/30";
		}
	};

	return (
		<Badge className={`${getStatusColor(status)} capitalize`} variant="outline">
			{status}
		</Badge>
	);
}
