import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewToggleProps {
	currentView: "table" | "kanban";
	onViewChange: (view: "table" | "kanban") => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
	return (
		<Tabs
			defaultValue={currentView}
			onValueChange={(value) => onViewChange(value as "table" | "kanban")}
		>
			<TabsList className="grid w-[200px] grid-cols-2">
				<TabsTrigger value="table" className="flex items-center">
					<List className="mr-2 h-4 w-4" />
					Table
				</TabsTrigger>
				<TabsTrigger value="kanban" className="flex items-center">
					<LayoutGrid className="mr-2 h-4 w-4" />
					Kanban
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
