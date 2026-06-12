import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IBranch } from "@/types/branch.type";
import { BranchForm } from "./branch-form";

type CreateBranchModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (handleSaveBranch: boolean, lead: IBranch) => void;
};

export function CreateBranchModal({
	open,
	onOpenChange,
	onSave,
}: CreateBranchModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Branch Details
					</DialogTitle>
				</DialogHeader>
				<BranchForm isCreating={true} onSave={onSave} onClose={onOpenChange} />
			</DialogContent>
		</Dialog>
	);
}
