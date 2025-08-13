import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ICustomer } from "@/types/customer.type";
import type React from "react";
import { useState } from "react";

interface CustomerFormProps {
	customer?: ICustomer;
	onSave: (customer: ICustomer) => void;
	onCancel: () => void;
}

export default function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
	const [formData, setFormData] = useState<ICustomer>(
		customer || {
			name: "",
			email: "",
			phone: "",
			address: "",
			notes: "",
			status: "active",
		}
	);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleStatusChange = (value: string) => {
		setFormData({ ...formData, status: value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{customer ? "Edit Customer" : "Add New Customer"}
						</DialogTitle>
						<DialogDescription>
							{customer
								? "Update customer information in your travel agency database."
								: "Add a new customer to your travel agency database."}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={handleStatusChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								name="notes"
								value={formData.notes}
								onChange={handleChange}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit">
							{customer ? "Update Customer" : "Add Customer"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
