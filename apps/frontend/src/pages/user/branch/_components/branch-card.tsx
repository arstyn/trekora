import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { IBranch } from "@/types/branch.type";
import { Calendar, MoreHorizontal } from "lucide-react";

interface BranchCardProps {
	branch: IBranch;
}

export function BranchCard({ branch }: BranchCardProps) {
	// Generate initials from name
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<Card className="group cursor-grab border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
			<CardContent className="px-4">
				<div className="space-y-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<Avatar className={`h-9 w-9 `}>
								<AvatarFallback>
									{getInitials(branch.name)}
								</AvatarFallback>
							</Avatar>
							<div>
								<h4 className="font-medium">{branch.name}</h4>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-2 rounded-lg text-xs">
						<div className="flex items-center text-muted-foreground">
							<Calendar className="mr-1 h-3 w-3" />
							{formatDate(branch.createdAt)}
						</div>
					</div>

					<div className="flex items-center justify-between pt-1">
						<div className="text-xs text-muted-foreground">
							ID: {branch.id}
						</div>
						<button className="rounded-full p-1 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-slate-700">
							<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
