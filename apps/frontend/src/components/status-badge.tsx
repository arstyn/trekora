import { CheckCircle2Icon, LoaderIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface Props {
	status: "active" | "inactive" | "suspended" | "terminated";
}

export default function StatusBadge({ status }: Props) {
	return (
		<Badge
			variant="outline"
			className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 capitalize"
		>
			{status === "active" ? (
				<CheckCircle2Icon className="text-green-500 dark:text-green-400" />
			) : (
				<LoaderIcon />
			)}
			{status}
		</Badge>
	);
}
