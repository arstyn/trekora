import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import type { ICustomer } from "@/types/customer.type";
import { PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CustomerList from "./_components/customer-list";
import EnhancedCustomerForm from "./_components/enhanced-customer-form";
import { ViewCustomerDialog } from "./_components/view-customer-dialog";

export default function CustomerManagement() {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	const [customers, setCustomers] = useState<ICustomer[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const page = parseInt(searchParams.get("page") || "1", 10);
	const setPage = (newPage: number) => {
		setSearchParams((prev) => {
			if (newPage === 1) {
				prev.delete("page");
			} else {
				prev.set("page", newPage.toString());
			}
			return prev;
		});
	};

	const limit = parseInt(searchParams.get("limit") || "20", 10);
	const setLimit = (newLimit: number) => {
		setSearchParams((prev) => {
			if (newLimit === 20) {
				prev.delete("limit");
			} else {
				prev.set("limit", newLimit.toString());
			}
			return prev;
		});
	};
	const [total, setTotal] = useState(0);
	const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
	const [isAddingCustomer, setIsAddingCustomer] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setPage(1);
	}, [searchQuery]);

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setIsLoading(true);
				const res = await axiosInstance.get<{
					customers: ICustomer[];
					hasMore: boolean;
					total: number;
				}>("/customers", {
					params: {
						limit,
						offset: (page - 1) * limit,
						search: searchQuery || undefined,
					},
				});
				if (res && res.data) {
					setCustomers(res.data.customers);
					setTotal(res.data.total);
				}
			} finally {
				setIsLoading(false);
			}
		};

		const timeoutId = setTimeout(fetchCustomers, 300);
		return () => clearTimeout(timeoutId);
	}, [page, limit, searchQuery]);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const customerId = searchParams.get("selected");
		if (customerId) {
			const foundCustomer = customers.find((c) => c.id === customerId);
			if (foundCustomer) {
				setSelectedCustomer(foundCustomer);
				setIsViewDialogOpen(true);
				setIsAddingCustomer(false);
			}
		} else {
			if (!isEditDialogOpen) {
				setSelectedCustomer(null);
			}
			setIsViewDialogOpen(false);
		}
	}, [location.search, customers, isEditDialogOpen]);

	const handleAddCustomer = async (newCustomer: ICustomer) => {
		// The enhanced form handles the API call internally
		setCustomers([...customers, newCustomer]);
		setIsAddingCustomer(false);
	};

	const handleUpdateCustomer = async (updatedCustomer: ICustomer) => {
		// The enhanced form handles the API call internally
		setCustomers(
			customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
		);
		setSelectedCustomer(null);
		setIsEditDialogOpen(false);
	};

	const handleDeleteCustomer = async (customerId: string) => {
		await axiosInstance.delete<ICustomer>(`/customers/${customerId}`);

		setCustomers(customers.filter((c) => c.id !== customerId));

		setSelectedCustomer(null);
		setIsViewDialogOpen(false);
		setIsEditDialogOpen(false);
	};

	const handleCustomerClick = (customer: ICustomer) => {
		setSearchParams((prev) => {
			if (customer.id) {
				prev.set("selected", customer.id);
			}
			return prev;
		});
	};

	const handleEditCustomer = (customer: ICustomer) => {
		setSelectedCustomer(customer);
		setIsViewDialogOpen(false);
		setIsEditDialogOpen(true);
	};

	return (
		<div className="px-6 pt-6 space-y-6">
			<div className="flex items-center justify-between  space-x-2">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search customers..."
						className="w-full pl-8 md:w-[200px] lg:w-[300px]"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button onClick={() => setIsAddingCustomer(true)} size="sm">
					<PlusCircle className="mr-2 h-4 w-4" />
					Add Customer
				</Button>
			</div>

			<CustomerList
				customers={customers}
				total={total}
				page={page}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}
				isLoading={isLoading}
				onDelete={handleDeleteCustomer}
				onCustomerClick={handleCustomerClick}
			/>

			{isAddingCustomer && (
				<EnhancedCustomerForm
					onSave={handleAddCustomer}
					onCancel={() => setIsAddingCustomer(false)}
				/>
			)}

			{/* View Customer Dialog */}
			<ViewCustomerDialog
				open={isViewDialogOpen}
				onOpenChange={(open) => {
					setIsViewDialogOpen(open);
					if (!open) {
						setSearchParams((prev) => {
							prev.delete("selected");
							return prev;
						});
					}
				}}
				customer={selectedCustomer}
				onEdit={handleEditCustomer}
			/>

			{/* Edit Customer Dialog */}
			{isEditDialogOpen && selectedCustomer && (
				<EnhancedCustomerForm
					customer={selectedCustomer}
					onSave={handleUpdateCustomer}
					onCancel={() => {
						setIsEditDialogOpen(false);
						setSelectedCustomer(null);
						setSearchParams((prev) => {
							prev.delete("selected");
							return prev;
						});
					}}
				/>
			)}
		</div>
	);
}
