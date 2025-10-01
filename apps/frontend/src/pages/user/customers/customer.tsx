import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import type { ICustomer } from "@/types/customer.type";
import { PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerList from "./_component/customer-list";
import EnhancedCustomerForm from "./_component/enhanced-customer-form";
import { ViewCustomerDialog } from "./_component/view-customer-dialog";

export default function CustomerManagement() {
	const navigate = useNavigate();
	const location = useLocation();

	const [customers, setCustomers] = useState<ICustomer[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
	const [isAddingCustomer, setIsAddingCustomer] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	useEffect(() => {
		const fetchCustomers = async () => {
			const res = await axiosInstance.get<ICustomer[]>("/customers");
			if (res && res.data) {
				setCustomers(res.data);
			}
		};
		fetchCustomers();
	}, []);

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
			setSelectedCustomer(null);
			setIsViewDialogOpen(false);
		}
	}, [location.search, customers]);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.passportNumber?.toLowerCase().includes(searchQuery.toLowerCase())
	);

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
		navigate(`?selected=${customer.id}`);
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
				customers={filteredCustomers}
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
						navigate("?");
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
						navigate("?");
					}}
				/>
			)}
		</div>
	);
}
