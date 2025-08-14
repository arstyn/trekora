import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import type { Group, ICustomer } from "@/types/customer.type";
import { MapPin, PlusCircle, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import CustomerForm from "./_component/customer-form";
import CustomerList from "./_component/customer-list";
import GroupManagement from "./_component/group-management";

export default function CustomerManagement() {
	const [customers, setCustomers] = useState<ICustomer[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
	const [isAddingCustomer, setIsAddingCustomer] = useState(false);
	const [activeTab, setActiveTab] = useState("customers");

	useEffect(() => {
		const fetchCustomers = async () => {
			const res = await axiosInstance.get<ICustomer[]>("/customers");
			if (res && res.data) {
				setCustomers(res.data);
			}
		};
		fetchCustomers();
	}, []);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddCustomer = async (newCustomer: ICustomer) => {
		await axiosInstance.post<ICustomer>("/customers", newCustomer);

		setCustomers([...customers, { ...newCustomer, id: Date.now().toString() }]);
		setIsAddingCustomer(false);
	};

	const handleUpdateCustomer = async (updatedCustomer: ICustomer) => {
		await axiosInstance.put<ICustomer>(
			`/customers/${updatedCustomer.id}`,
			updatedCustomer
		);
		setCustomers(
			customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
		);
		setSelectedCustomer(null);
	};

	const handleDeleteCustomer = async (customerId: string) => {
		await axiosInstance.delete<ICustomer>(`/customers/${customerId}`);

		setCustomers(customers.filter((c) => c.id !== customerId));

		setGroups(
			groups.map((group) => ({
				...group,
				memberIds: group.memberIds.filter((id) => id !== customerId),
			}))
		);

		setSelectedCustomer(null);
	};

	const handleAddGroup = (newGroup: Group) => {
		setGroups([...groups, { ...newGroup, id: Date.now().toString() }]);
	};

	const handleUpdateGroup = (updatedGroup: Group) => {
		setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
	};

	const handleDeleteGroup = (groupId: string) => {
		setGroups(groups.filter((g) => g.id !== groupId));
	};

	return (
		<div className="px-6 pt-6 space-y-6">
			<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Trekora</h1>
					<p className="text-muted-foreground">
						Your dream place to manage customers, itineraries, and groups.
					</p>
				</div>
				<div className="flex items-center space-x-2">
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
					<Button onClick={() => setIsAddingCustomer(true)}>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Customer
					</Button>
				</div>
			</div>

			<Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="customers">
						<Users className="mr-2 h-4 w-4" />
						Customers
					</TabsTrigger>
					<TabsTrigger value="groups">
						<MapPin className="mr-2 h-4 w-4" />
						Groups
					</TabsTrigger>
				</TabsList>

				<TabsContent value="customers" className="space-y-4">
					<CustomerList
						customers={filteredCustomers}
						onSelect={setSelectedCustomer}
						onDelete={handleDeleteCustomer}
					/>
				</TabsContent>

				<TabsContent value="groups" className="space-y-4">
					<GroupManagement
						groups={groups}
						customers={customers}
						onAdd={handleAddGroup}
						onUpdate={handleUpdateGroup}
						onDelete={handleDeleteGroup}
					/>
				</TabsContent>
			</Tabs>

			{isAddingCustomer && (
				<CustomerForm
					onSave={handleAddCustomer}
					onCancel={() => setIsAddingCustomer(false)}
				/>
			)}

			{selectedCustomer && (
				<CustomerForm
					customer={selectedCustomer}
					onSave={handleUpdateCustomer}
					onCancel={() => setSelectedCustomer(null)}
				/>
			)}
		</div>
	);
}
