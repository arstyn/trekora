import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IBranch } from "@/types/branch.type";
import { format } from "date-fns";
import { useState } from "react";
import { BranchForm } from "./branch-form";

type ViewBranchDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	branch: IBranch | null;
	onEdit: (isCreating: boolean, branchData: IBranch) => void;
};

export function ViewBranchDialog({
	open,
	onOpenChange,
	branch,
	onEdit,
}: ViewBranchDialogProps) {
	const [showEditForm, setShowEditForm] = useState(false);

	if (!branch) return null;

	// Helper for empty fields
	const display = (value?: string | number | boolean | null) =>
		value !== undefined && value !== null && value !== "" ? (
			value
		) : (
			<span className="text-muted-foreground italic">N/A</span>
		);

	return (
		<Dialog
			open={open}
			onOpenChange={(on) => {
				onOpenChange(on);
				setShowEditForm(false);
			}}
		>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Branch Details
					</DialogTitle>
				</DialogHeader>

				{!showEditForm && (
					<div className="space-y-8">
						{/* Branch details */}
						<div className="max-h-[50vh] overflow-auto space-y-5">
							<Detail label="Name" value={display(branch.name)} />
							<Detail label="Location" value={display(branch.location)} />
							<Detail
								label="Created At"
								value={format(new Date(branch.createdAt), "PPP")}
							/>
						</div>

						<div className="pt-4 pr-4 flex justify-end gap-2 border-t">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Close
							</Button>

							<Button onClick={() => setShowEditForm(true)}>
								Edit Branch
							</Button>
						</div>
					</div>
				)}

				{showEditForm && (
					<BranchForm
						branch={branch}
						isCreating={!showEditForm}
						onSave={onEdit}
						onClose={() => setShowEditForm(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

// Helper component for details
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm">{value}</p>
		</div>
	);
}
