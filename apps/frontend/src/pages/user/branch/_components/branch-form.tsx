import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosRequest } from "@/lib/axios";
import { branchSchema, type BranchFormDTO, type IBranch } from "@/types/branch.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface BranchFormProps {
	branch?: IBranch;
	isCreating: boolean;
	onSave: (isCreating: boolean, branch: IBranch) => void;
	onClose?: (open: boolean) => void;
}

export function BranchForm({ branch, isCreating, onSave, onClose }: BranchFormProps) {
	const [loading, setLoading] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<BranchFormDTO>({
		resolver: zodResolver(branchSchema),
		defaultValues: {
			name: "",
			location: "",
		},
	});

	useEffect(() => {
		if (branch && !isCreating) {
			reset(branch);
		} else if (isCreating) {
			reset({
				name: "",
				location: "",
			});
		}
	}, [branch, isCreating, reset]);

	const onSubmit = async (data: BranchFormDTO) => {
		setLoading(true);
		console.log("🚀 ~ branch-form.tsx:66 ~ onSubmit ~ branch:", branch);
		console.log("🚀 ~ branch-form.tsx:66 ~ onSubmit ~ isCreating:", isCreating);

		if (isCreating) {
			try {
				const newBranch = await AxiosRequest.post<BranchFormDTO, IBranch>(
					"/branches",
					data
				);

				onSave(isCreating, newBranch);
				if (onClose) {
					onClose(false);
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		} else if (branch) {
			try {
				const updatedBranch = await AxiosRequest.put<Partial<IBranch>, IBranch>(
					`/branches/${branch.id}`,
					data
				);
				if (updatedBranch) {
					onSave(isCreating, { ...branch, ...updatedBranch });
					if (onClose) {
						onClose(false);
					}
				}
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Controller
						name="name"
						control={control}
						render={({ field }) => <Input id="name" {...field} />}
					/>
					{errors.name && (
						<span className="text-red-500 text-sm">
							{errors.name.message}
						</span>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="location">Location</Label>
					<Controller
						name="location"
						control={control}
						render={({ field }) => <Input id="location" {...field} />}
					/>
				</div>
			</div>
			<div className="pt-4 pr-4 flex justify-end gap-2 border-t">
				<Button
					variant="outline"
					onClick={() => {
						if (onClose) {
							onClose(false);
						}
					}}
					type="button"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading
						? "Loading..."
						: isCreating
						? "Create Branch"
						: "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
