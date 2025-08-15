import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import type { ILead, ILeadStatus } from "@/types/lead/lead.entity";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CustomerForm from "../customers/_component/customer-form";
import { KanbanBoard } from "./_components/kanban-board";
import { CreateLeadModal } from "./_components/lead-create-modal";
import { LeadFilter } from "./_components/lead-filter";
import { LeadTable } from "./_components/lead-table";
import { ViewLeadDialog } from "./_components/lead-view-modal";
import { ViewToggle } from "./_components/view-toggle";
import type { ICustomer } from "@/types/customer.type";

export function Leads() {
	const navigate = useNavigate();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);

	const [view, setView] = useState<"table" | "kanban">("table");
	const [leads, setLeads] = useState<ILead[]>();
	const [filteredLeads, setFilteredLeads] = useState<ILead[]>();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ILeadStatus | "all">("all");
	const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isCreatingLead, setIsCreatingLead] = useState(false);
	const [openCustomerCreateModal, setOpenCustomerCreateModal] = useState(false);

	useEffect(() => {
		const getLeads = async () => {
			try {
				const res = await axiosInstance.get<ILead[]>("/lead");
				setLeads(res.data);
				setFilteredLeads(res.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		};

		getLeads();
	}, []);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const leadId = searchParams.get("selected");
		if (leadId) {
			const foundLead = leads && leads.find((l) => l.id === leadId);
			if (foundLead) {
				setSelectedLead(foundLead);
				setIsCreatingLead(false);
				setIsViewModalOpen(true);
			}
		} else {
			setIsViewModalOpen(false);
			setSelectedLead(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, leads]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		filterLeads(query, statusFilter);
	};

	const handleStatusFilter = (status: ILeadStatus | "all") => {
		setStatusFilter(status);
		filterLeads(searchQuery, status);
	};

	const filterLeads = (
		query: string,
		status: ILeadStatus | "all",
		leadsToFilter: ILead[] | undefined = leads
	) => {
		let filtered = leadsToFilter; // Use the passed leads instead of state

		if (query && filtered) {
			filtered = filtered.filter(
				(lead) =>
					lead.name.toLowerCase().includes(query.toLowerCase()) ||
					lead.company?.toLowerCase().includes(query.toLowerCase()) ||
					lead.email?.toLowerCase().includes(query.toLowerCase())
			);
		}

		if (status !== "all" && filtered) {
			filtered = filtered.filter((lead) => lead.status === status);
		}

		setFilteredLeads(filtered);
	};

	const updateLeadStatus = async (leadId: string, newStatus: ILeadStatus) => {
		try {
			const updatedLead = await axiosInstance.put<Partial<ILead>, ILead>(
				`/lead/${leadId}`,
				{
					status: newStatus,
				}
			);
			if (updatedLead) {
				const updatedLeads =
					leads &&
					leads.map((lead) =>
						lead.id === leadId ? { ...lead, status: newStatus } : lead
					);
				setLeads(updatedLeads);
				filterLeads(searchQuery, statusFilter, updatedLeads);
				if (newStatus === "converted") {
					setOpenCustomerCreateModal(true);
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}
	};

	const handleLeadClick = (lead: ILead) => {
		navigate(`?selected=${lead.id}`);
	};

	const handleCreateLead = () => {
		setSelectedLead(null);
		setIsCreatingLead(true);
		setIsViewModalOpen(true);
		navigate("?");
	};

	const handleSaveLead = (isCreating: boolean, leadData: ILead) => {
		let updatedLeads;

		if (!leads) {
			return;
		}

		if (isCreating) {
			updatedLeads = [leadData, ...leads];
		} else {
			updatedLeads = leads.map((l) => (l.id === leadData.id ? leadData : l));
		}

		setLeads(updatedLeads);

		// ✅ Update filtered leads
		filterLeads(searchQuery, statusFilter, updatedLeads);

		// ✅ Fix: Update selectedLead if this is the one being viewed
		if (selectedLead?.id === leadData.id) {
			setSelectedLead(leadData);
		}

		if (isCreating) {
			setIsViewModalOpen(false);
		}
	};

	const handleSaveCustomer = async (customer: ICustomer) => {
		try {
			await axiosInstance.post<ICustomer>(`/customers`, customer);
			toast.success("Customer created successfully...!");
			setOpenCustomerCreateModal(false);
		} catch (error) {
			toast.error("Failed to create customer");
			console.error(error);
		}
	};

	const handleOnCancel = () => {
		setOpenCustomerCreateModal(false);
	};

	return (
		<div className="h-full">
			<div className="container mx-auto px-6 py-5">
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div className="flex flex-1 flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
							<LeadFilter
								onSearch={handleSearch}
								onStatusFilter={handleStatusFilter}
								currentStatus={statusFilter}
								view={view}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Button onClick={handleCreateLead}>
								<Plus className="mr-2 h-4 w-4" /> New Lead
							</Button>
							<ViewToggle currentView={view} onViewChange={setView} />
						</div>
					</div>

					{filteredLeads && (
						<div>
							{view === "table" ? (
								<LeadTable
									leads={filteredLeads}
									onStatusChange={updateLeadStatus}
									onLeadClick={handleLeadClick}
								/>
							) : (
								<KanbanBoard
									leads={filteredLeads}
									onLeadMove={updateLeadStatus}
									onLeadClick={handleLeadClick}
								/>
							)}
						</div>
					)}
				</div>
			</div>

			<ViewLeadDialog
				open={isViewModalOpen}
				onOpenChange={(open) => {
					setIsViewModalOpen(open);
					if (!open) {
						navigate("?");
						setSelectedLead(null);
					}
				}}
				lead={selectedLead}
				onEdit={handleSaveLead}
			/>

			<CreateLeadModal
				open={isCreatingLead}
				onOpenChange={setIsCreatingLead}
				onSave={handleSaveLead}
				setOpenCustomerCreateModal={setOpenCustomerCreateModal}
			/>

			{openCustomerCreateModal && (
				<CustomerForm onCancel={handleOnCancel} onSave={handleSaveCustomer} />
			)}
		</div>
	);
}
