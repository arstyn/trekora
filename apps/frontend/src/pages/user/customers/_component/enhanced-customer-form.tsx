import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import type { ICustomer, IRelative } from "@/types/customer.type";
import { format } from "date-fns";
import { CalendarIcon, Eye, Image as ImageIcon, Plus, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

interface EnhancedCustomerFormProps {
	customer?: ICustomer;
	onSave: (customer: ICustomer) => void;
	onCancel: () => void;
}

export default function EnhancedCustomerForm({
	customer,
	onSave,
	onCancel,
}: EnhancedCustomerFormProps) {
	const [formData, setFormData] = useState<ICustomer>(
		customer || {
			firstName: "",
			lastName: "",
			middleName: "",
			dateOfBirth: "",
			gender: "male",
			email: "",
			phone: "",
			alternativePhone: "",
			address: "",
			emergencyContactName: "",
			emergencyContactPhone: "",
			emergencyContactRelation: "",
			passportNumber: "",
			passportExpiryDate: "",
			passportIssueDate: "",
			passportCountry: "",
			passportPhotos: [],
			voterId: "",
			voterIdPhotos: [],
			aadhaarId: "",
			aadhaarIdPhotos: [],
			relatives: [],
			dietaryRestrictions: "",
			medicalConditions: "",
			specialRequests: "",
			notes: "",
		}
	);

	const [relatives, setRelatives] = useState<IRelative[]>(formData.relatives || []);
	const [files, setFiles] = useState<{ [key: string]: File[] }>({});
	const [filePreviews, setFilePreviews] = useState<{ [key: string]: string[] }>({});
	const [existingImages, setExistingImages] = useState<{ [key: string]: string[] }>({
		profilePhoto: customer?.profilePhoto ? [customer.profilePhoto] : [],
		passportPhotos: customer?.passportPhotos || [],
		voterIdPhotos: customer?.voterIdPhotos || [],
		aadhaarIdPhotos: customer?.aadhaarIdPhotos || [],
	});
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const fileInputRefs = {
		profilePhoto: useRef<HTMLInputElement>(null),
		passportPhotos: useRef<HTMLInputElement>(null),
		voterIdPhotos: useRef<HTMLInputElement>(null),
		aadhaarIdPhotos: useRef<HTMLInputElement>(null),
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData({ ...formData, [name]: value });
	};

	const getImageUrl = (filename: string) => {
		return getFileUrl(getServeFileUrl(filename));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
		const selectedFiles = Array.from(e.target.files || []);

		// Store files for submission
		setFiles((prev) => ({
			...prev,
			[field]: [...(prev[field] || []), ...selectedFiles],
		}));

		// Create preview URLs
		const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
		setFilePreviews((prev) => ({
			...prev,
			[field]: [...(prev[field] || []), ...previewUrls],
		}));

		// Update form data with file names
		const fileNames = selectedFiles.map((f) => f.name);
		setFormData((prev) => ({
			...prev,
			[field]: [
				...((prev[field as keyof ICustomer] as string[]) || []),
				...fileNames,
			],
		}));
	};

	const removeFile = (index: number, field: string, isExisting: boolean = false) => {
		if (isExisting) {
			// Remove existing image
			setExistingImages((prev) => ({
				...prev,
				[field]: prev[field]?.filter((_, i) => i !== index) || [],
			}));
		} else {
			// Remove from files
			setFiles((prev) => ({
				...prev,
				[field]: (prev[field] || []).filter((_, i) => i !== index),
			}));

			// Remove preview URL and revoke it
			setFilePreviews((prev) => {
				const previews = prev[field] || [];
				if (previews[index]) {
					URL.revokeObjectURL(previews[index]);
				}
				return {
					...prev,
					[field]: previews.filter((_, i) => i !== index),
				};
			});
		}
	};

	const addRelative = () => {
		setRelatives([...relatives, { name: "", relation: "", phone: "", address: "" }]);
	};

	const removeRelative = (index: number) => {
		setRelatives(relatives.filter((_, i) => i !== index));
	};

	const updateRelative = (index: number, field: keyof IRelative, value: string) => {
		const updated = relatives.map((rel, i) =>
			i === index ? { ...rel, [field]: value } : rel
		);
		setRelatives(updated);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formDataToSubmit = new FormData();

		// Add all form fields (filter out empty values)
		Object.entries(formData).forEach(([key, value]) => {
			if (key === "relatives") return; // Handle separately

			// Skip empty strings, null, undefined, and empty arrays
			if (
				value === undefined ||
				value === null ||
				value === "" ||
				(Array.isArray(value) && value.length === 0)
			) {
				return;
			}

			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					formDataToSubmit.append(`${key}[${index}]`, item);
				});
			} else {
				formDataToSubmit.append(key, value.toString());
			}
		});

		// Add relatives (only non-empty ones)
		const validRelatives = relatives.filter(
			(relative) =>
				relative.name.trim() !== "" ||
				relative.relation.trim() !== "" ||
				relative.phone.trim() !== "" ||
				relative.address.trim() !== ""
		);

		validRelatives.forEach((relative, index) => {
			formDataToSubmit.append(`relatives[${index}][name]`, relative.name);
			formDataToSubmit.append(`relatives[${index}][relation]`, relative.relation);
			formDataToSubmit.append(`relatives[${index}][phone]`, relative.phone);
			formDataToSubmit.append(`relatives[${index}][address]`, relative.address);
		});

		// Add files with proper field names
		Object.entries(files).forEach(([fieldName, fileArray]) => {
			fileArray.forEach((file) => {
				// Use the correct field name that backend expects
				formDataToSubmit.append(fieldName, file);
			});
		});

		try {
			const response = customer
				? await axiosInstance.put(`/customers/${customer.id}`, formDataToSubmit, {
						headers: { "Content-Type": "multipart/form-data" },
				  })
				: await axiosInstance.post("/customers", formDataToSubmit, {
						headers: { "Content-Type": "multipart/form-data" },
				  });

			onSave(response.data);
		} catch (error) {
			console.error("Error saving customer:", error);
		}
	};

	const FileUploadSection = ({
		field,
		label,
		acceptedTypes = "image/*",
		isProfilePhoto = false,
	}: {
		field: string;
		label: string;
		acceptedTypes?: string;
		isProfilePhoto?: boolean;
	}) => {
		const previews = filePreviews[field] || [];
		const existingImagesForField = existingImages[field] || [];
		const fileInputRef = fileInputRefs[field as keyof typeof fileInputRefs];

		return (
			<div className="space-y-3">
				<Label className="text-sm font-medium">{label}</Label>

				{isProfilePhoto ? (
					<div className="flex items-start gap-6">
						<div className="flex-shrink-0">
							<div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
								{previews.length > 0 ? (
									<img
										src={previews[0]}
										alt="Profile preview"
										className="w-full h-full object-cover"
									/>
								) : existingImagesForField.length > 0 ? (
									<img
										src={getImageUrl(existingImagesForField[0])}
										alt="Profile preview"
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="text-center">
										<ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
										<span className="text-sm text-gray-500">
											No image
										</span>
									</div>
								)}
							</div>
						</div>
						<div className="flex-1 space-y-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef?.current?.click()}
								className="flex items-center gap-2 h-10 px-4"
								size="sm"
							>
								<Upload className="h-4 w-4" />
								{previews.length > 0 || existingImagesForField.length > 0
									? "Change Photo"
									: "Upload Photo"}
							</Button>
							{(previews.length > 0 ||
								existingImagesForField.length > 0) && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() =>
										removeFile(
											0,
											field,
											existingImagesForField.length > 0 &&
												previews.length === 0
										)
									}
									className="h-10 px-4 text-destructive hover:text-destructive"
								>
									Remove
								</Button>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept={acceptedTypes}
								onChange={(e) => handleFileChange(e, field)}
								className="hidden"
							/>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef?.current?.click()}
								className="flex items-center gap-2 h-9 px-3"
								size="sm"
							>
								<Upload className="h-4 w-4" />
								Upload Files
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept={acceptedTypes}
								onChange={(e) => handleFileChange(e, field)}
								className="hidden"
							/>
						</div>

						{/* Show existing images */}
						{existingImagesForField.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
								{existingImagesForField.map((image, index) => (
									<div
										key={`existing-${index}`}
										className="relative group"
									>
										<div className="w-full h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
											<img
												src={getImageUrl(image)}
												alt={`Existing ${index + 1}`}
												className="w-full h-full object-cover cursor-pointer"
												onClick={() => {
													setSelectedImage(getImageUrl(image));
													setImageModalOpen(true);
												}}
											/>
										</div>
										<div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-200 rounded-lg flex items-center justify-center">
											<Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
										<Badge
											variant="secondary"
											className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
										>
											{index + 1}
										</Badge>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeFile(index, field, true)}
											className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>
						)}

						{/* Show new upload previews */}
						{previews.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
								{previews.map((preview, index) => (
									<div key={`new-${index}`} className="relative group">
										<div className="w-full h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
											<img
												src={preview}
												alt={`Preview ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() =>
												removeFile(index, field, false)
											}
											className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="min-w-7xl w-[90vw] h-[90vh] max-h-[90vh]  flex flex-col">
				<form onSubmit={handleSubmit} className="flex flex-col h-full">
					<DialogHeader className="flex-shrink-0 pb-4">
						<DialogTitle className="text-2xl font-bold">
							{customer ? "Edit Customer" : "Add New Customer"}
						</DialogTitle>
						<DialogDescription className="text-base">
							{customer
								? "Update customer information in your travel agency database."
								: "Add a new customer to your travel agency database."}
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="flex-1 pr-4 overflow-y-auto">
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
							{/* Personal Information Section */}
							<div className="rounded-lg border p-4">
								<h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">
									Personal Information
								</h3>
								<div className="space-y-4">
									{/* Profile Photo Section - Moved to top and made bigger */}
									<div className="space-y-2">
										<FileUploadSection
											field="profilePhoto"
											label="Profile Photo"
											isProfilePhoto={true}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="firstName"
												className="text-sm font-medium"
											>
												First Name *
											</Label>
											<Input
												id="firstName"
												name="firstName"
												value={formData.firstName}
												onChange={handleChange}
												required
												className="h-9"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="middleName"
												className="text-sm font-medium"
											>
												Middle Name
											</Label>
											<Input
												id="middleName"
												name="middleName"
												value={formData.middleName}
												onChange={handleChange}
												className="h-9"
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="lastName"
												className="text-sm font-medium"
											>
												Last Name *
											</Label>
											<Input
												id="lastName"
												name="lastName"
												value={formData.lastName}
												onChange={handleChange}
												required
												className="h-9"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="gender"
												className="text-sm font-medium"
											>
												Gender *
											</Label>
											<Select
												value={formData.gender}
												onValueChange={(value) =>
													handleSelectChange("gender", value)
												}
											>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="male">
														Male
													</SelectItem>
													<SelectItem value="female">
														Female
													</SelectItem>
													<SelectItem value="other">
														Other
													</SelectItem>
													<SelectItem value="prefer_not_to_say">
														Prefer not to say
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium">
											Date of Birth *
										</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className="h-9 justify-start text-left font-normal"
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{formData.dateOfBirth
														? format(
																new Date(
																	formData.dateOfBirth
																),
																"PPP"
														  )
														: "Select date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={
														formData.dateOfBirth
															? new Date(
																	formData.dateOfBirth
															  )
															: undefined
													}
													onSelect={(date) => {
														if (date) {
															setFormData({
																...formData,
																dateOfBirth: date
																	.toISOString()
																	.split("T")[0],
															});
														}
													}}
													disabled={(date) =>
														date > new Date() ||
														date < new Date("1900-01-01")
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							</div>

							{/* Contact Information Section */}
							<div className="rounded-lg border p-4">
								<h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">
									Contact Information
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="email"
												className="text-sm font-medium"
											>
												Email *
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={formData.email}
												onChange={handleChange}
												required
												className="h-9"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="phone"
												className="text-sm font-medium"
											>
												Phone *
											</Label>
											<Input
												id="phone"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												required
												className="h-9"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="alternativePhone"
											className="text-sm font-medium"
										>
											Alternative Phone
										</Label>
										<Input
											id="alternativePhone"
											name="alternativePhone"
											value={formData.alternativePhone}
											onChange={handleChange}
											className="h-9"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="address"
											className="text-sm font-medium"
										>
											Address *
										</Label>
										<Textarea
											id="address"
											name="address"
											value={formData.address}
											onChange={handleChange}
											required
											rows={3}
											className="resize-none"
										/>
									</div>
									<div>
										<h4 className="font-semibold text-base mb-3">
											Emergency Contact
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="emergencyContactName"
													className="text-sm font-medium"
												>
													Name
												</Label>
												<Input
													id="emergencyContactName"
													name="emergencyContactName"
													value={formData.emergencyContactName}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="emergencyContactPhone"
													className="text-sm font-medium"
												>
													Phone
												</Label>
												<Input
													id="emergencyContactPhone"
													name="emergencyContactPhone"
													value={formData.emergencyContactPhone}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="emergencyContactRelation"
													className="text-sm font-medium"
												>
													Relation
												</Label>
												<Input
													id="emergencyContactRelation"
													name="emergencyContactRelation"
													value={
														formData.emergencyContactRelation
													}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Documents Section */}
							<div className="rounded-lg border p-4">
								<h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">
									Documents
								</h3>

								{/* Passport Details */}
								<div className="mb-6">
									<h4 className="text-base font-medium mb-3">
										Passport Details
									</h4>
									<div className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="passportNumber"
													className="text-sm font-medium"
												>
													Passport Number
												</Label>
												<Input
													id="passportNumber"
													name="passportNumber"
													value={formData.passportNumber}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="passportCountry"
													className="text-sm font-medium"
												>
													Country
												</Label>
												<Input
													id="passportCountry"
													name="passportCountry"
													value={formData.passportCountry}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label className="text-sm font-medium">
													Issue Date
												</Label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="h-9 justify-start text-left font-normal"
														>
															<CalendarIcon className="mr-2 h-4 w-4" />
															{formData.passportIssueDate
																? format(
																		new Date(
																			formData.passportIssueDate
																		),
																		"PPP"
																  )
																: "Select date"}
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-0"
														align="start"
													>
														<Calendar
															mode="single"
															selected={
																formData.passportIssueDate
																	? new Date(
																			formData.passportIssueDate
																	  )
																	: undefined
															}
															onSelect={(date) => {
																if (date) {
																	setFormData({
																		...formData,
																		passportIssueDate:
																			date
																				.toISOString()
																				.split(
																					"T"
																				)[0],
																	});
																}
															}}
															disabled={(date) =>
																date > new Date() ||
																date <
																	new Date("1900-01-01")
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</div>
											<div className="space-y-2">
												<Label className="text-sm font-medium">
													Expiry Date
												</Label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="h-9 justify-start text-left font-normal"
														>
															<CalendarIcon className="mr-2 h-4 w-4" />
															{formData.passportExpiryDate
																? format(
																		new Date(
																			formData.passportExpiryDate
																		),
																		"PPP"
																  )
																: "Select date"}
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-0"
														align="start"
													>
														<Calendar
															mode="single"
															selected={
																formData.passportExpiryDate
																	? new Date(
																			formData.passportExpiryDate
																	  )
																	: undefined
															}
															onSelect={(date) => {
																if (date) {
																	setFormData({
																		...formData,
																		passportExpiryDate:
																			date
																				.toISOString()
																				.split(
																					"T"
																				)[0],
																	});
																}
															}}
															disabled={(date) =>
																date < new Date()
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</div>
										</div>
										<div>
											<FileUploadSection
												field="passportPhotos"
												label="Passport Photos"
											/>
										</div>
									</div>
								</div>

								{/* ID Documents */}
								<div>
									<h4 className="text-base font-medium mb-3">
										ID Documents
									</h4>
									<div className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="voterId"
													className="text-sm font-medium"
												>
													Voter ID
												</Label>
												<Input
													id="voterId"
													name="voterId"
													value={formData.voterId}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="aadhaarId"
													className="text-sm font-medium"
												>
													Aadhaar ID
												</Label>
												<Input
													id="aadhaarId"
													name="aadhaarId"
													value={formData.aadhaarId}
													onChange={handleChange}
													className="h-9"
												/>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FileUploadSection
												field="voterIdPhotos"
												label="Voter ID Photos"
											/>
											<FileUploadSection
												field="aadhaarIdPhotos"
												label="Aadhaar ID Photos"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Relatives Section */}
							<div className="rounded-lg border p-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-primary border-b pb-2">
										Relatives Information
									</h3>
									<Button
										type="button"
										onClick={addRelative}
										size="sm"
										className="h-8 px-3"
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Relative
									</Button>
								</div>
								<div className="space-y-4">
									{relatives.map((relative, index) => (
										<Card
											key={index}
											className="border-l-4 border-l-blue-500"
										>
											<CardContent className="p-4">
												<div className="flex items-center justify-between mb-4">
													<h4 className="font-semibold text-sm">
														Relative {index + 1}
													</h4>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															removeRelative(index)
														}
														className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label className="text-sm font-medium">
															Name
														</Label>
														<Input
															value={relative.name}
															onChange={(e) =>
																updateRelative(
																	index,
																	"name",
																	e.target.value
																)
															}
															className="h-9"
														/>
													</div>
													<div className="space-y-2">
														<Label className="text-sm font-medium">
															Relation
														</Label>
														<Input
															value={relative.relation}
															onChange={(e) =>
																updateRelative(
																	index,
																	"relation",
																	e.target.value
																)
															}
															className="h-9"
														/>
													</div>
													<div className="space-y-2">
														<Label className="text-sm font-medium">
															Phone
														</Label>
														<Input
															value={relative.phone}
															onChange={(e) =>
																updateRelative(
																	index,
																	"phone",
																	e.target.value
																)
															}
															className="h-9"
														/>
													</div>
													<div className="space-y-2">
														<Label className="text-sm font-medium">
															Address
														</Label>
														<Input
															value={relative.address}
															onChange={(e) =>
																updateRelative(
																	index,
																	"address",
																	e.target.value
																)
															}
															className="h-9"
														/>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
									{relatives.length === 0 && (
										<div className="text-center py-8">
											<div className="text-muted-foreground">
												<Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
												<p className="text-sm font-medium">
													No relatives added yet
												</p>
												<p className="text-xs">
													Click "Add Relative" to get started
												</p>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Travel Preferences Section */}
							<div className="rounded-lg border p-4">
								<h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">
									Travel Preferences
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="dietaryRestrictions"
												className="text-sm font-medium"
											>
												Dietary Restrictions
											</Label>
											<Textarea
												id="dietaryRestrictions"
												name="dietaryRestrictions"
												value={formData.dietaryRestrictions}
												onChange={handleChange}
												rows={3}
												className="resize-none"
												placeholder="Enter any dietary restrictions or preferences..."
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="medicalConditions"
												className="text-sm font-medium"
											>
												Medical Conditions
											</Label>
											<Textarea
												id="medicalConditions"
												name="medicalConditions"
												value={formData.medicalConditions}
												onChange={handleChange}
												rows={3}
												className="resize-none"
												placeholder="Enter any medical conditions or health requirements..."
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="specialRequests"
												className="text-sm font-medium"
											>
												Special Requests
											</Label>
											<Textarea
												id="specialRequests"
												name="specialRequests"
												value={formData.specialRequests}
												onChange={handleChange}
												rows={3}
												className="resize-none"
												placeholder="Enter any special requests or preferences..."
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="notes"
												className="text-sm font-medium"
											>
												Additional Notes
											</Label>
											<Textarea
												id="notes"
												name="notes"
												value={formData.notes}
												onChange={handleChange}
												rows={3}
												className="resize-none"
												placeholder="Enter any additional notes or comments..."
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</ScrollArea>

					<DialogFooter className="flex-shrink-0 pt-4 border-t">
						<div className="flex gap-3 w-full justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								className="h-9 px-4"
							>
								Cancel
							</Button>
							<Button type="submit" className="h-9 px-4">
								{customer ? "Update Customer" : "Add Customer"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>

			{/* Image Modal */}
			<Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Image Preview</DialogTitle>
					</DialogHeader>
					{selectedImage && (
						<div className="flex justify-center">
							<img
								src={selectedImage}
								alt="Preview"
								className="max-h-[70vh] max-w-full object-contain rounded-lg"
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
