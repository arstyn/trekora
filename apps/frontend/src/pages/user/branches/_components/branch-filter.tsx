import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BranchFilterProps {
	onSearch: (query: string) => void;
}

export function BranchFilter({ onSearch }: BranchFilterProps) {
	return (
		<div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
			<div className="flex w-full sm:w-auto items-center gap-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search leads..."
					className=""
					onChange={(e) => onSearch(e.target.value)}
				/>
			</div>
		</div>
	);
}
