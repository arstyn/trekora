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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { preBookingService } from "@/services/pre-booking.service";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdatePackageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preBookingId: string;
	currentData?: {
		packageId?: string;
		preferredStartDate?: Date | string;
		preferredEndDate?: Date | string;
		numberOfTravelers: number;
		specialRequests?: string;
		estimatedAmount?: number;
	};
	onSuccess: () => void;
}

interface Package {
	id: string;
	name: string;
	price: number;
	destination?: string;
	duration?: string;
}

export function UpdatePackageDialog({
	open,
	onOpenChange,
	preBookingId,
	currentData,
	onSuccess,
}: UpdatePackageDialogProps) {
	const [loading, setLoading] = useState(false);
	const [packages, setPackages] = useState<Package[]>([]);
	const [loadingPackages, setLoadingPackages] = useState(false);

	const [formData, setFormData] = useState({
		packageId: currentData?.packageId || "",
		preferredStartDate: currentData?.preferredStartDate
			? new Date(currentData.preferredStartDate).toISOString().split("T")[0]
			: "",
		preferredEndDate: currentData?.preferredEndDate
			? new Date(currentData.preferredEndDate).toISOString().split("T")[0]
			: "",
		numberOfTravelers: currentData?.numberOfTravelers || 1,
		specialRequests: currentData?.specialRequests || "",
		estimatedAmount: currentData?.estimatedAmount || 0,
	});

	useEffect(() => {
		if (open) {
			fetchPackages();
		}
	}, [open]);

	const fetchPackages = async () => {
		try {
			setLoadingPackages(true);
			const response = await axiosInstance.get("/packages?status=published");
			setPackages(response.data);
		} catch (error) {
			console.error("Error fetching packages:", error);
			toast.error("Failed to load packages");
		} finally {
			setLoadingPackages(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.packageId) {
			toast.error("Please select a package");
			return;
		}

		if (!formData.preferredStartDate) {
			toast.error("Please select a start date");
			return;
		}

		try {
			setLoading(true);
			await preBookingService.updatePackageAndDates(preBookingId, {
				packageId: formData.packageId,
				preferredStartDate: formData.preferredStartDate,
				preferredEndDate: formData.preferredEndDate || undefined,
				numberOfTravelers: formData.numberOfTravelers,
				specialRequests: formData.specialRequests || undefined,
				estimatedAmount: formData.estimatedAmount || undefined,
			});

			toast.success("Package and dates updated successfully");
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating package:", error);
			toast.error("Failed to update package and dates");
		} finally {
			setLoading(false);
		}
	};

	const selectedPackage = packages.find((p) => p.id === formData.packageId);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Update Package & Dates</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="packageId">Package *</Label>
						{loadingPackages ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm text-muted-foreground">
									Loading packages...
								</span>
							</div>
						) : (
							<Select
								value={formData.packageId}
								onValueChange={(value) => {
									const pkg = packages.find((p) => p.id === value);
									setFormData({
										...formData,
										packageId: value,
										estimatedAmount: pkg
											? pkg.price * formData.numberOfTravelers
											: 0,
									});
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a package" />
								</SelectTrigger>
								<SelectContent>
									{packages.map((pkg) => (
										<SelectItem key={pkg.id} value={pkg.id}>
											{pkg.name} - ₹{pkg.price.toLocaleString()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{selectedPackage && (
							<div className="text-sm text-muted-foreground">
								<p>Destination: {selectedPackage.destination || "N/A"}</p>
								<p>Duration: {selectedPackage.duration || "N/A"}</p>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="preferredStartDate">
								Preferred Start Date *
							</Label>
							<Input
								id="preferredStartDate"
								type="date"
								value={formData.preferredStartDate}
								onChange={(e) =>
									setFormData({
										...formData,
										preferredStartDate: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="preferredEndDate">Preferred End Date</Label>
							<Input
								id="preferredEndDate"
								type="date"
								value={formData.preferredEndDate}
								onChange={(e) =>
									setFormData({
										...formData,
										preferredEndDate: e.target.value,
									})
								}
								min={formData.preferredStartDate}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="numberOfTravelers">
								Number of Travelers *
							</Label>
							<Input
								id="numberOfTravelers"
								type="number"
								min="1"
								value={formData.numberOfTravelers}
								onChange={(e) => {
									const travelers = parseInt(e.target.value);
									setFormData({
										...formData,
										numberOfTravelers: travelers,
										estimatedAmount: selectedPackage
											? selectedPackage.price * travelers
											: 0,
									});
								}}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="estimatedAmount">Estimated Amount (₹)</Label>
							<Input
								id="estimatedAmount"
								type="number"
								min="0"
								value={formData.estimatedAmount}
								onChange={(e) =>
									setFormData({
										...formData,
										estimatedAmount: parseFloat(e.target.value) || 0,
									})
								}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="specialRequests">Special Requests</Label>
						<Textarea
							id="specialRequests"
							value={formData.specialRequests}
							onChange={(e) =>
								setFormData({
									...formData,
									specialRequests: e.target.value,
								})
							}
							placeholder="Any special requirements..."
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
