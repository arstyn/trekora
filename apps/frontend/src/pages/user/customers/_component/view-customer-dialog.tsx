import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ICustomer } from "@/types/customer.type";
import { format } from "date-fns";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import { useState } from "react";
import { Eye, X } from "lucide-react";

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
	const openImageModal = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setImageModalOpen(true);
	};

	// Helper function to close image modal
	const closeImageModal = () => {
		setImageModalOpen(false);
		setSelectedImage(null);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Customer Details
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 overflow-y-auto max-h-[70vh]">
					{/* Header with profile photo and basic info */}
					<div className="flex items-center border-b pb-4">
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
						<h4 className="text-lg font-semibold text-primary">
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
							<h4 className="text-lg font-semibold text-primary">
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
							<h4 className="text-lg font-semibold text-primary">
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
											onImageClick={openImageModal}
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
							<h4 className="text-lg font-semibold text-primary">
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
														onImageClick={openImageModal}
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
														onImageClick={openImageModal}
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
							<h4 className="text-lg font-semibold text-primary">
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
							<h4 className="text-lg font-semibold text-primary">
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
							<h4 className="text-lg font-semibold text-primary">
								Additional Notes
							</h4>
							<div className="space-y-3">
								<Detail label="Notes" value={display(customer.notes)} />
							</div>
						</div>
					)}
				</div>

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
						<DialogTitle className="flex items-center justify-between">
							Document Image
							<Button
								variant="ghost"
								size="sm"
								onClick={closeImageModal}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</DialogTitle>
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

interface ImageGalleryProps {
	images: string[];
	onImageClick: (imageUrl: string) => void;
}

function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
	const getImageUrl = (filename: string) => {
		return getFileUrl(getServeFileUrl(filename));
	};

	return (
		<div className="flex flex-wrap gap-2">
			{images.map((image, index) => (
				<div
					key={index}
					className="relative group cursor-pointer"
					onClick={() => onImageClick(getImageUrl(image))}
				>
					<div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
						<img
							src={getImageUrl(image)}
							alt={`Document ${index + 1}`}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
						<Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>
					<Badge
						variant="secondary"
						className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
					>
						{index + 1}
					</Badge>
				</div>
			))}
		</div>
	);
}
