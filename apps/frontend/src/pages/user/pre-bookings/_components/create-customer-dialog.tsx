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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { preBookingService } from "@/services/pre-booking.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateCustomerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preBookingId: string;
	temporaryDetails?: {
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

export function CreateCustomerDialog({
	open,
	onOpenChange,
	preBookingId,
	temporaryDetails,
	onSuccess,
}: CreateCustomerDialogProps) {
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		// Personal Details
		firstName: temporaryDetails?.firstName || "",
		lastName: temporaryDetails?.lastName || "",
		middleName: "",
		dateOfBirth: temporaryDetails?.dateOfBirth || "",
		gender: "male" as "male" | "female" | "other" | "prefer_not_to_say",
		profilePhoto: "",

		// Contact Information
		email: temporaryDetails?.email || "",
		phone: temporaryDetails?.phone || "",
		alternativePhone: "",
		address: temporaryDetails?.address || "",

		// Emergency Contact
		emergencyContactName: "",
		emergencyContactPhone: "",
		emergencyContactRelation: "",

		// Passport Details
		passportNumber: "",
		passportExpiryDate: "",
		passportIssueDate: "",
		passportCountry: "",

		// ID Documents
		voterId: "",
		aadhaarId: "",

		// Travel Preferences
		dietaryRestrictions: "",
		medicalConditions: "",
		specialRequests: "",

		// Additional Information
		notes: temporaryDetails?.notes || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.phone ||
			!formData.dateOfBirth ||
			!formData.address
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			setLoading(true);
			await preBookingService.createCustomerFromPreBooking(preBookingId, {
				...formData,
				passportExpiryDate: formData.passportExpiryDate || undefined,
				passportIssueDate: formData.passportIssueDate || undefined,
			});

			toast.success("Customer created successfully");
			onSuccess();
			onOpenChange(false);
		} catch (error) {
			console.error("Error creating customer:", error);
			toast.error("Failed to create customer");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Customer Profile</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Tabs defaultValue="personal" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="personal">Personal</TabsTrigger>
							<TabsTrigger value="contact">Contact</TabsTrigger>
							<TabsTrigger value="documents">Documents</TabsTrigger>
							<TabsTrigger value="preferences">Preferences</TabsTrigger>
						</TabsList>

						<TabsContent value="personal" className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
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
									<Label htmlFor="middleName">Middle Name</Label>
									<Input
										id="middleName"
										value={formData.middleName}
										onChange={(e) =>
											setFormData({
												...formData,
												middleName: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name *</Label>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											setFormData({
												...formData,
												lastName: e.target.value,
											})
										}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="dateOfBirth">Date of Birth *</Label>
									<Input
										id="dateOfBirth"
										type="date"
										value={formData.dateOfBirth}
										onChange={(e) =>
											setFormData({
												...formData,
												dateOfBirth: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="gender">Gender *</Label>
									<Select
										value={formData.gender}
										onValueChange={(value: typeof formData.gender) =>
											setFormData({ ...formData, gender: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
											<SelectItem value="other">Other</SelectItem>
											<SelectItem value="prefer_not_to_say">
												Prefer not to say
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="contact" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
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
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="alternativePhone">
									Alternative Phone
								</Label>
								<Input
									id="alternativePhone"
									type="tel"
									value={formData.alternativePhone}
									onChange={(e) =>
										setFormData({
											...formData,
											alternativePhone: e.target.value,
										})
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="address">Address *</Label>
								<Textarea
									id="address"
									value={formData.address}
									onChange={(e) =>
										setFormData({
											...formData,
											address: e.target.value,
										})
									}
									required
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="emergencyContactName">
										Emergency Contact Name
									</Label>
									<Input
										id="emergencyContactName"
										value={formData.emergencyContactName}
										onChange={(e) =>
											setFormData({
												...formData,
												emergencyContactName: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emergencyContactPhone">
										Emergency Contact Phone
									</Label>
									<Input
										id="emergencyContactPhone"
										type="tel"
										value={formData.emergencyContactPhone}
										onChange={(e) =>
											setFormData({
												...formData,
												emergencyContactPhone: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emergencyContactRelation">
										Relation
									</Label>
									<Input
										id="emergencyContactRelation"
										value={formData.emergencyContactRelation}
										onChange={(e) =>
											setFormData({
												...formData,
												emergencyContactRelation: e.target.value,
											})
										}
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="documents" className="space-y-4">
							<div className="space-y-4">
								<h3 className="font-medium">Passport Details</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="passportNumber">
											Passport Number
										</Label>
										<Input
											id="passportNumber"
											value={formData.passportNumber}
											onChange={(e) =>
												setFormData({
													...formData,
													passportNumber: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="passportCountry">
											Passport Country
										</Label>
										<Input
											id="passportCountry"
											value={formData.passportCountry}
											onChange={(e) =>
												setFormData({
													...formData,
													passportCountry: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="passportIssueDate">
											Issue Date
										</Label>
										<Input
											id="passportIssueDate"
											type="date"
											value={formData.passportIssueDate}
											onChange={(e) =>
												setFormData({
													...formData,
													passportIssueDate: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="passportExpiryDate">
											Expiry Date
										</Label>
										<Input
											id="passportExpiryDate"
											type="date"
											value={formData.passportExpiryDate}
											onChange={(e) =>
												setFormData({
													...formData,
													passportExpiryDate: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="font-medium">ID Documents</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="aadhaarId">Aadhaar ID</Label>
										<Input
											id="aadhaarId"
											value={formData.aadhaarId}
											onChange={(e) =>
												setFormData({
													...formData,
													aadhaarId: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="voterId">Voter ID</Label>
										<Input
											id="voterId"
											value={formData.voterId}
											onChange={(e) =>
												setFormData({
													...formData,
													voterId: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="preferences" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="dietaryRestrictions">
									Dietary Restrictions
								</Label>
								<Textarea
									id="dietaryRestrictions"
									value={formData.dietaryRestrictions}
									onChange={(e) =>
										setFormData({
											...formData,
											dietaryRestrictions: e.target.value,
										})
									}
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="medicalConditions">
									Medical Conditions
								</Label>
								<Textarea
									id="medicalConditions"
									value={formData.medicalConditions}
									onChange={(e) =>
										setFormData({
											...formData,
											medicalConditions: e.target.value,
										})
									}
									rows={2}
								/>
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
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="notes">Additional Notes</Label>
								<Textarea
									id="notes"
									value={formData.notes}
									onChange={(e) =>
										setFormData({
											...formData,
											notes: e.target.value,
										})
									}
									rows={3}
								/>
							</div>
						</TabsContent>
					</Tabs>

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
									Creating...
								</>
							) : (
								"Create Customer"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
