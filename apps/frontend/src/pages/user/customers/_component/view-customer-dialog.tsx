import { ImageGallery } from "@/components/image-gallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import type { ICustomer } from "@/types/customer.type";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useState } from "react";

type ViewCustomerDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customer: ICustomer | null;
	onEdit?: (customer: ICustomer) => void;
};

export function ViewCustomerDialog({
	open,
	onOpenChange,
	customer,
	onEdit,
}: ViewCustomerDialogProps) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [imageModalTitle, setImageModalTitle] = useState<string>("Document Image");

	if (!customer) return null;

	// Format date of birth
	const formattedDOB = customer.dateOfBirth
		? format(new Date(customer.dateOfBirth), "PPP")
		: "";

	// Format passport dates
	const formattedPassportIssue = customer.passportIssueDate
		? format(new Date(customer.passportIssueDate), "PPP")
		: "";

	const formattedPassportExpiry = customer.passportExpiryDate
		? format(new Date(customer.passportExpiryDate), "PPP")
		: "";

	// Helper for empty fields
	const display = (value?: string | number | boolean | null) =>
		value !== undefined && value !== null && value !== "" ? (
			value
		) : (
			<span className="text-muted-foreground italic">N/A</span>
		);

	// Get profile photo URL
	const profilePhotoUrl = customer.profilePhoto
		? getFileUrl(getServeFileUrl(customer.profilePhoto))
		: "/placeholder.svg";

	// Helper function to open image modal
	const openImageModal = (imageUrl: string, title: string = "Document Image") => {
		setSelectedImage(imageUrl);
		setImageModalTitle(title);
		setImageModalOpen(true);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Customer Details
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="space-y-6 max-h-[70vh] pr-4">
					{/* Header with profile photo and basic info */}
					<div className="flex items-center border-b pb-4">
						<div
							className="relative group cursor-pointer"
							onClick={() =>
								customer.profilePhoto &&
								openImageModal(profilePhotoUrl, "Profile Photo")
							}
						>
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={profilePhotoUrl}
									alt={`${customer.firstName} ${customer.lastName}`}
									className="object-cover"
								/>
								<AvatarFallback className="text-lg">
									{customer.firstName.charAt(0)}
									{customer.lastName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							{customer.profilePhoto && (
								<div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-200 rounded-full flex items-center justify-center">
									<Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							)}
						</div>
						<div className="flex items-center justify-between w-full px-4">
							<div>
								<h3 className="text-xl font-semibold">
									{customer.firstName}{" "}
									{customer.middleName && `${customer.middleName} `}
									{customer.lastName}
								</h3>
								<p className="text-sm text-muted-foreground">
									{customer.email}
								</p>
								<p className="text-sm text-muted-foreground">
									{customer.phone}
								</p>
							</div>
						</div>
					</div>

					{/* Personal Information */}
					<div className="space-y-4">
						<h4 className="text-lg font-semibold text-primary mt-5">
							Personal Information
						</h4>
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-3">
								<Detail label="Customer ID" value={customer.id} />
								<Detail label="First Name" value={customer.firstName} />
								<Detail
									label="Middle Name"
									value={display(customer.middleName)}
								/>
								<Detail label="Last Name" value={customer.lastName} />
								<Detail
									label="Date of Birth"
									value={display(formattedDOB)}
								/>
								<Detail
									label="Gender"
									value={display(customer.gender?.replace("_", " "))}
								/>
							</div>
							<div className="space-y-3">
								<Detail label="Email" value={display(customer.email)} />
								<Detail label="Phone" value={display(customer.phone)} />
								<Detail
									label="Alternative Phone"
									value={display(customer.alternativePhone)}
								/>
								<Detail
									label="Address"
									value={display(customer.address)}
								/>
							</div>
						</div>
					</div>

					{/* Emergency Contact */}
					{(customer.emergencyContactName ||
						customer.emergencyContactPhone ||
						customer.emergencyContactRelation) && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								Emergency Contact
							</h4>
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-3">
									<Detail
										label="Contact Name"
										value={display(customer.emergencyContactName)}
									/>
									<Detail
										label="Phone"
										value={display(customer.emergencyContactPhone)}
									/>
								</div>
								<div className="space-y-3">
									<Detail
										label="Relation"
										value={display(customer.emergencyContactRelation)}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Passport Information */}
					{(customer.passportNumber ||
						customer.passportCountry ||
						customer.passportIssueDate ||
						customer.passportExpiryDate ||
						customer.passportPhotos?.length) && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								Passport Information
							</h4>
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-3">
									<Detail
										label="Passport Number"
										value={display(customer.passportNumber)}
									/>
									<Detail
										label="Country"
										value={display(customer.passportCountry)}
									/>
								</div>
								<div className="space-y-3">
									<Detail
										label="Issue Date"
										value={display(formattedPassportIssue)}
									/>
									<Detail
										label="Expiry Date"
										value={display(formattedPassportExpiry)}
									/>
								</div>
							</div>
							{/* Passport Photos */}
							{customer.passportPhotos &&
								customer.passportPhotos.length > 0 && (
									<div className="space-y-3">
										<h5 className="text-md font-medium text-muted-foreground">
											Passport Photos
										</h5>
										<ImageGallery
											images={customer.passportPhotos}
											onImageClick={(imageUrl) =>
												openImageModal(imageUrl, "Passport Photo")
											}
										/>
									</div>
								)}
						</div>
					)}

					{/* ID Documents */}
					{(customer.aadhaarId ||
						customer.voterId ||
						customer.aadhaarIdPhotos?.length ||
						customer.voterIdPhotos?.length) && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								ID Documents
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Aadhaar ID Section */}
								{(customer.aadhaarId ||
									customer.aadhaarIdPhotos?.length) && (
									<div className="space-y-3">
										<Detail
											label="Aadhaar ID"
											value={display(customer.aadhaarId)}
										/>
										{/* Aadhaar Photos */}
										{customer.aadhaarIdPhotos &&
											customer.aadhaarIdPhotos.length > 0 && (
												<div className="space-y-2">
													<h6 className="text-sm font-medium text-muted-foreground">
														Aadhaar Photos
													</h6>
													<ImageGallery
														images={customer.aadhaarIdPhotos}
														onImageClick={(imageUrl) =>
															openImageModal(
																imageUrl,
																"Aadhaar ID Photo"
															)
														}
													/>
												</div>
											)}
									</div>
								)}

								{/* Voter ID Section */}
								{(customer.voterId || customer.voterIdPhotos?.length) && (
									<div className="space-y-3">
										<Detail
											label="Voter ID"
											value={display(customer.voterId)}
										/>
										{/* Voter ID Photos */}
										{customer.voterIdPhotos &&
											customer.voterIdPhotos.length > 0 && (
												<div className="space-y-2">
													<h6 className="text-sm font-medium text-muted-foreground">
														Voter ID Photos
													</h6>
													<ImageGallery
														images={customer.voterIdPhotos}
														onImageClick={(imageUrl) =>
															openImageModal(
																imageUrl,
																"Voter ID Photo"
															)
														}
													/>
												</div>
											)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Travel Preferences */}
					{(customer.dietaryRestrictions ||
						customer.medicalConditions ||
						customer.specialRequests) && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								Travel Preferences
							</h4>
							<div className="space-y-3">
								<Detail
									label="Dietary Restrictions"
									value={display(customer.dietaryRestrictions)}
								/>
								<Detail
									label="Medical Conditions"
									value={display(customer.medicalConditions)}
								/>
								<Detail
									label="Special Requests"
									value={display(customer.specialRequests)}
								/>
							</div>
						</div>
					)}

					{/* Relatives */}
					{customer.relatives && customer.relatives.length > 0 && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								Relatives
							</h4>
							<div className="space-y-3">
								{customer.relatives.map((relative, idx) => (
									<div
										key={idx}
										className="border rounded-lg p-3 space-y-2"
									>
										<div className="grid grid-cols-2 gap-4">
											<Detail label="Name" value={relative.name} />
											<Detail
												label="Relation"
												value={relative.relation}
											/>
											<Detail
												label="Phone"
												value={relative.phone}
											/>
											<Detail
												label="Address"
												value={relative.address}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Additional Notes */}
					{customer.notes && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-primary mt-5">
								Additional Notes
							</h4>
							<div className="space-y-3">
								<Detail label="Notes" value={display(customer.notes)} />
							</div>
						</div>
					)}
				</ScrollArea>

				<div className="pt-4 pr-4 flex justify-end gap-2 border-t">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					{onEdit && customer && (
						<Button
							onClick={() => {
								onEdit(customer);
								onOpenChange(false);
							}}
						>
							Edit Customer
						</Button>
					)}
				</div>
			</DialogContent>

			{/* Image Modal */}
			<Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>{imageModalTitle}</DialogTitle>
					</DialogHeader>
					<div className="p-6 pt-0">
						{selectedImage && (
							<div className="flex justify-center">
								<img
									src={selectedImage}
									alt="Document"
									className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
								/>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm">{value}</p>
		</div>
	);
}
