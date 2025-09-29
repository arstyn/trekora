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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Image as ImageIcon } from "lucide-react";
import type { ICustomer, IRelative } from "@/types/customer.type";
import type React from "react";
import { useState, useRef } from "react";
import axiosInstance from "@/lib/axios";

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
	const [files, setFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData({ ...formData, [name]: value });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
		const selectedFiles = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...selectedFiles]);

		// Update form data with file names for preview
		const fileNames = selectedFiles.map((f) => f.name);
		setFormData((prev) => ({
			...prev,
			[field]: [
				...((prev[field as keyof ICustomer] as string[]) || []),
				...fileNames,
			],
		}));
	};

	const removeFile = (index: number, field: string) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		setFormData((prev) => ({
			...prev,
			[field]: ((prev[field as keyof ICustomer] as string[]) || []).filter(
				(_, i) => i !== index
			),
		}));
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

		// Add all form fields
		Object.entries(formData).forEach(([key, value]) => {
			if (key === "relatives") return; // Handle separately
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					formDataToSubmit.append(`${key}[${index}]`, item);
				});
			} else if (value !== undefined && value !== null) {
				formDataToSubmit.append(key, value.toString());
			}
		});

		// Add relatives
		relatives.forEach((relative, index) => {
			formDataToSubmit.append(`relatives[${index}][name]`, relative.name);
			formDataToSubmit.append(`relatives[${index}][relation]`, relative.relation);
			formDataToSubmit.append(`relatives[${index}][phone]`, relative.phone);
			formDataToSubmit.append(`relatives[${index}][address]`, relative.address);
		});

		// Add files
		files.forEach((file) => {
			formDataToSubmit.append("files", file);
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
	}: {
		field: string;
		label: string;
		acceptedTypes?: string;
	}) => (
		<div className="space-y-3">
			<Label className="text-sm font-medium">{label}</Label>
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => fileInputRef.current?.click()}
					className="flex items-center gap-2 h-10 px-4"
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
			{formData[field as keyof ICustomer] &&
				Array.isArray(formData[field as keyof ICustomer]) && (
					<div className="flex flex-wrap gap-2 mt-3">
						{(formData[field as keyof ICustomer] as string[]).map(
							(file, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="flex items-center gap-2 px-3 py-1"
								>
									<ImageIcon className="h-3 w-3" />
									<span className="text-xs">{file}</span>
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
										onClick={() => removeFile(index, field)}
									/>
								</Badge>
							)
						)}
					</div>
				)}
		</div>
	);

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="max-w-7xl w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
				<form onSubmit={handleSubmit} className="flex flex-col h-full">
					<DialogHeader className="flex-shrink-0 pb-6">
						<DialogTitle className="text-2xl font-bold">
							{customer ? "Edit Customer" : "Add New Customer"}
						</DialogTitle>
						<DialogDescription className="text-base">
							{customer
								? "Update customer information in your travel agency database."
								: "Add a new customer to your travel agency database."}
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="personal" className="w-full flex-1 flex flex-col">
						<TabsList className="grid w-full grid-cols-5 mb-6">
							<TabsTrigger value="personal" className="text-sm font-medium">
								Personal
							</TabsTrigger>
							<TabsTrigger value="contact" className="text-sm font-medium">
								Contact
							</TabsTrigger>
							<TabsTrigger
								value="documents"
								className="text-sm font-medium"
							>
								Documents
							</TabsTrigger>
							<TabsTrigger
								value="relatives"
								className="text-sm font-medium"
							>
								Relatives
							</TabsTrigger>
							<TabsTrigger
								value="preferences"
								className="text-sm font-medium"
							>
								Preferences
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value="personal"
							className="space-y-6 flex-1 overflow-y-auto"
						>
							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-lg font-semibold">
										Personal Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
												className="h-10"
											/>
										</div>
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
												className="h-10"
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
												className="h-10"
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="dateOfBirth"
												className="text-sm font-medium"
											>
												Date of Birth *
											</Label>
											<Input
												id="dateOfBirth"
												name="dateOfBirth"
												type="date"
												value={formData.dateOfBirth}
												onChange={handleChange}
												required
												className="h-10"
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
												<SelectTrigger className="h-10">
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
									<FileUploadSection
										field="profilePhoto"
										label="Profile Photo"
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="contact"
							className="space-y-6 flex-1 overflow-y-auto"
						>
							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-lg font-semibold">
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
												className="h-10"
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
												className="h-10"
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
											className="h-10"
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
									<div className="space-y-4">
										<h4 className="font-semibold text-base">
											Emergency Contact
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
													className="h-10"
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
													className="h-10"
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
													className="h-10"
												/>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="documents"
							className="space-y-6 flex-1 overflow-y-auto"
						>
							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-lg font-semibold">
										Passport Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
												className="h-10"
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
												className="h-10"
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="passportIssueDate"
												className="text-sm font-medium"
											>
												Issue Date
											</Label>
											<Input
												id="passportIssueDate"
												name="passportIssueDate"
												type="date"
												value={formData.passportIssueDate}
												onChange={handleChange}
												className="h-10"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="passportExpiryDate"
												className="text-sm font-medium"
											>
												Expiry Date
											</Label>
											<Input
												id="passportExpiryDate"
												name="passportExpiryDate"
												type="date"
												value={formData.passportExpiryDate}
												onChange={handleChange}
												className="h-10"
											/>
										</div>
									</div>
									<FileUploadSection
										field="passportPhotos"
										label="Passport Photos"
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-lg font-semibold">
										ID Documents
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
												className="h-10"
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
												className="h-10"
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FileUploadSection
											field="voterIdPhotos"
											label="Voter ID Photos"
										/>
										<FileUploadSection
											field="aadhaarIdPhotos"
											label="Aadhaar ID Photos"
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="relatives"
							className="space-y-6 flex-1 overflow-y-auto"
						>
							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center justify-between text-lg font-semibold">
										Relatives Information
										<Button
											type="button"
											onClick={addRelative}
											size="sm"
											className="h-9"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Relative
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{relatives.map((relative, index) => (
										<Card
											key={index}
											className="border-l-4 border-l-blue-500"
										>
											<CardContent className="pt-6">
												<div className="flex items-center justify-between mb-6">
													<h4 className="font-semibold text-base">
														Relative {index + 1}
													</h4>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															removeRelative(index)
														}
														className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
															className="h-10"
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
															className="h-10"
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
															className="h-10"
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
															className="h-10"
														/>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
									{relatives.length === 0 && (
										<div className="text-center py-12">
											<div className="text-muted-foreground mb-4">
												<Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
												<p className="text-lg font-medium">
													No relatives added yet
												</p>
												<p className="text-sm">
													Click "Add Relative" to get started
												</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="preferences"
							className="space-y-6 flex-1 overflow-y-auto"
						>
							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-lg font-semibold">
										Travel Preferences
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
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
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					<DialogFooter className="flex-shrink-0 pt-6 border-t">
						<div className="flex gap-3 w-full justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								className="h-10 px-6"
							>
								Cancel
							</Button>
							<Button type="submit" className="h-10 px-6">
								{customer ? "Update Customer" : "Add Customer"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
