import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { preBookingService } from "@/services/pre-booking.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdateCustomerDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preBookingId: string;
	currentDetails?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		address?: string;
		dateOfBirth?: string;
		notes?: string;
	};
	onSuccess: () => void;
}

export function UpdateCustomerDetailsDialog({
	open,
	onOpenChange,
	preBookingId,
	currentDetails,
	onSuccess,
}: UpdateCustomerDetailsDialogProps) {
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		firstName: currentDetails?.firstName || "",
		lastName: currentDetails?.lastName || "",
		email: currentDetails?.email || "",
		phone: currentDetails?.phone || "",
		address: currentDetails?.address || "",
		dateOfBirth: currentDetails?.dateOfBirth || "",
		notes: currentDetails?.notes || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.phone
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			setLoading(true);
			await preBookingService.updateTemporaryCustomerDetails(preBookingId, {
				temporaryCustomerDetails: formData,
			});

			toast.success("Customer details updated successfully");
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating customer details:", error);
			toast.error("Failed to update customer details");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Update Customer Details</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name *</Label>
							<Input
								id="firstName"
								value={formData.firstName}
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name *</Label>
							<Input
								id="lastName"
								value={formData.lastName}
								onChange={(e) =>
									setFormData({ ...formData, lastName: e.target.value })
								}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email *</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Phone *</Label>
							<Input
								id="phone"
								type="tel"
								value={formData.phone}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address">Address</Label>
						<Input
							id="address"
							value={formData.address}
							onChange={(e) =>
								setFormData({ ...formData, address: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="dateOfBirth">Date of Birth</Label>
						<Input
							id="dateOfBirth"
							type="date"
							value={formData.dateOfBirth}
							onChange={(e) =>
								setFormData({ ...formData, dateOfBirth: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							value={formData.notes}
							onChange={(e) =>
								setFormData({ ...formData, notes: e.target.value })
							}
							placeholder="Additional notes..."
							rows={3}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
