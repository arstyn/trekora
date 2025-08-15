import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import type { IBranch } from "@/types/branch.type";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreateBranchModal } from "./_components/branch-create-modal";
import { BranchFilter } from "./_components/branch-filter";
import { BranchTable } from "./_components/branch-table";
import { ViewBranchDialog } from "./_components/branch-view-modal";

export function BranchPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);

	const [branches, setBranch] = useState<IBranch[]>();
	const [filteredBranch, setFilteredBranch] = useState<IBranch[]>();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isCreatingBranch, setIsCreatingBranch] = useState(false);

	useEffect(() => {
		const getBranch = async () => {
			try {
				const res = await axiosInstance.get<IBranch[]>("/branches");
				setBranch(res.data);
				setFilteredBranch(res.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		};

		getBranch();
	}, []);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const branchId = searchParams.get("selected");
		if (branchId) {
			const foundBranch = branches && branches.find((l) => l.id === branchId);
			if (foundBranch) {
				setSelectedBranch(foundBranch);
				setIsCreatingBranch(false);
				setIsViewModalOpen(true);
			}
		} else {
			setIsViewModalOpen(false);
			setSelectedBranch(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, branches]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const filterBranch = (
		query: string,
		branchesToFilter: IBranch[] | undefined = branches
	) => {
		let filtered = branchesToFilter; // Use the passed branches instead of state

		if (query && filtered) {
			filtered = filtered.filter(
				(branch) =>
					branch.name.toLowerCase().includes(query.toLowerCase()) ||
					branch.location?.toLowerCase().includes(query.toLowerCase())
			);
		}

		setFilteredBranch(filtered);
	};

	const handleBranchClick = (branch: IBranch) => {
		navigate(`?selected=${branch.id}`);
	};

	const handleCreateBranch = () => {
		setSelectedBranch(null);
		setIsCreatingBranch(true);
		setIsViewModalOpen(true);
		navigate("?");
	};

	const handleSaveBranch = (isCreating: boolean, branchData: IBranch) => {
		let updatedBranch;

		if (!branches) {
			return;
		}

		if (isCreating) {
			updatedBranch = [branchData, ...branches];
		} else {
			updatedBranch = branches.map((l) =>
				l.id === branchData.id ? branchData : l
			);
		}

		setBranch(updatedBranch);

		// ✅ Update filtered branches
		filterBranch(searchQuery, updatedBranch);

		// ✅ Fix: Update selectedBranch if this is the one being viewed
		if (selectedBranch?.id === branchData.id) {
			setSelectedBranch(branchData);
		}

		if (isCreating) {
			setIsViewModalOpen(false);
		}
	};

	return (
		<div className="h-full">
			<div className="container mx-auto px-6 py-5">
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div className="flex flex-1 flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
							<BranchFilter onSearch={handleSearch} />
						</div>
						<div className="flex items-center space-x-2">
							<Button onClick={handleCreateBranch}>
								<Plus className="mr-2 h-4 w-4" /> New Branch
							</Button>
						</div>
					</div>

					{filteredBranch && (
						<div>
							<BranchTable
								branches={filteredBranch}
								onBranchClick={handleBranchClick}
							/>
						</div>
					)}
				</div>
			</div>

			<ViewBranchDialog
				open={isViewModalOpen}
				onOpenChange={(open: boolean) => {
					setIsViewModalOpen(open);
					if (!open) {
						navigate("?");
						setSelectedBranch(null);
					}
				}}
				branch={selectedBranch}
				onEdit={handleSaveBranch}
			/>

			<CreateBranchModal
				open={isCreatingBranch}
				onOpenChange={setIsCreatingBranch}
				onSave={handleSaveBranch}
			/>
		</div>
	);
}
