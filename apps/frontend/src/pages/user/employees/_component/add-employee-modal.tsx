import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, X, Upload, Image as ImageIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PermissionService } from "@/services/permission.service";
import type { PermissionSet } from "@/types/permission.types";

// Define the form schema with Zod
const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	departments: z.array(z.string()).optional(),
	roleId: z.string().optional(),
	status: z.enum(["active", "inactive", "terminated", "suspended"], {
		error: "Please select a status",
	}),
	joinDate: z.date({
		error: "Join date is required",
	}),
	address: z.string().optional(),
	phone: z.string().optional(),
	dateOfBirth: z.date({
		error: "Date of birth is required",
	}),
	gender: z.enum(["male", "female", "other"]).optional(),
	nationality: z.string().optional(),
	experience: z.string().optional(),
	specialization: z.string().optional(),
	additional_info: z.string().optional(),
	maritalStatus: z.enum(["single", "married"]).optional(),
	verificationDocumentType: z.string().optional(),
	emergencyContacts: z
		.array(
			z.object({
				name: z
					.string()
					.min(2, { message: "Contact name must be at least 2 characters" }),
				relation: z
					.string()
					.min(2, { message: "Relation must be at least 2 characters" }),
				phone: z.string(),
			})
		)
		.optional(),
});

// Define the type for the form values
export type ICreateEmployeeFormValues = z.infer<typeof formSchema>;

// Define the props for the AddEmployeeModal component
type AddEmployeeModalProps = {
	table: Table<IEmployee>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employees: IEmployee[];
	setEmployees: Dispatch<SetStateAction<IEmployee[]>>;
};

export function AddEmployeeModal({
	table,
	open,
	onOpenChange,
	employees,
	setEmployees,
}: AddEmployeeModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
	const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
	const [verificationDocFile, setVerificationDocFile] = useState<File | null>(null);
	const [verificationDocPreview, setVerificationDocPreview] = useState<string | null>(
		null
	);
	const profilePhotoRef = useRef<HTMLInputElement>(null);
	const verificationDocRef = useRef<HTMLInputElement>(null);

	// Permission sets state
	const [allPermissionSets, setAllPermissionSets] = useState<PermissionSet[]>([]);
	const [selectedPermissionSetIds, setSelectedPermissionSetIds] = useState<string[]>([]);
	const [loadingPermissionSets, setLoadingPermissionSets] = useState(false);

	// Load permission sets when dialog opens
	useEffect(() => {
		if (open) {
			loadPermissionSets();
		}
	}, [open]);

	const loadPermissionSets = async () => {
		try {
			setLoadingPermissionSets(true);
			const allSets = await PermissionService.getAllPermissionSets();
			setAllPermissionSets(allSets);
			setSelectedPermissionSetIds([]); // Reset selection for new employee
		} catch (error) {
			console.error("Failed to load permission sets:", error);
			toast.error("Failed to load permission sets");
		} finally {
			setLoadingPermissionSets(false);
		}
	};

	const handlePermissionSetToggle = (permissionSetId: string, checked: boolean) => {
		if (checked) {
			setSelectedPermissionSetIds((prev) => [...prev, permissionSetId]);
		} else {
			setSelectedPermissionSetIds((prev) => prev.filter((id) => id !== permissionSetId));
		}
	};

	// Initialize the form
	const form = useForm<ICreateEmployeeFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			departments: [],
			roleId: "",
			status: "inactive",
			joinDate: new Date(),
			address: "",
			phone: "",
			dateOfBirth: new Date(),
			gender: undefined,
			nationality: "",
			experience: "",
			specialization: "",
			additional_info: "",
			maritalStatus: undefined,
			verificationDocumentType: "",
			emergencyContacts: [],
		},
	});

	// Handle form submission
	const onSubmit = async (data: ICreateEmployeeFormValues) => {
		setIsSubmitting(true);

		const formDataToSubmit = new FormData();

		// Add all form fields
		formDataToSubmit.append("name", data.name);
		formDataToSubmit.append("email", data.email);
		if (data.departments && data.departments.length > 0) {
			data.departments.forEach((dept, index) => {
				formDataToSubmit.append(`departments[${index}]`, dept);
			});
		}
		if (data.roleId) {
			formDataToSubmit.append("roleId", data.roleId);
		}
		formDataToSubmit.append("status", data.status);
		formDataToSubmit.append("joinDate", format(data.joinDate, "yyyy-MM-dd"));

		if (data.address) formDataToSubmit.append("address", data.address);
		if (data.phone) formDataToSubmit.append("phone", data.phone);
		formDataToSubmit.append("dateOfBirth", format(data.dateOfBirth, "yyyy-MM-dd"));
		if (data.gender) formDataToSubmit.append("gender", data.gender);
		if (data.nationality) formDataToSubmit.append("nationality", data.nationality);
		if (data.experience) formDataToSubmit.append("experience", data.experience);
		if (data.specialization)
			formDataToSubmit.append("specialization", data.specialization);
		if (data.additional_info)
			formDataToSubmit.append("additional_info", data.additional_info);
		if (data.maritalStatus)
			formDataToSubmit.append("maritalStatus", data.maritalStatus);
		if (data.verificationDocumentType)
			formDataToSubmit.append(
				"verificationDocumentType",
				data.verificationDocumentType
			);

		// Add files
		if (profilePhotoFile) {
			formDataToSubmit.append("profilePhoto", profilePhotoFile);
		}
		if (verificationDocFile) {
			formDataToSubmit.append("verificationDocument", verificationDocFile);
		}

		try {
			const res = await axiosInstance.post<IEmployee>(
				"/employee",
				formDataToSubmit,
				{
					headers: { "Content-Type": "multipart/form-data" },
				}
			);

			// Assign permission sets to the newly created employee
			if (res.data.id && selectedPermissionSetIds.length > 0) {
				for (const setId of selectedPermissionSetIds) {
					await PermissionService.assignPermissionSet(setId, {
						employeeId: res.data.id,
					});
				}
			}

			setEmployees([res.data, ...employees]);
			table.setPageIndex(0);
			table.resetColumnFilters();
			form.reset();
			setProfilePhotoFile(null);
			setProfilePhotoPreview(null);
			setVerificationDocFile(null);
			setVerificationDocPreview(null);
			setSelectedPermissionSetIds([]); // Reset permission set selection
			onOpenChange(false);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to add employee");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setProfilePhotoFile(file);
			setProfilePhotoPreview(URL.createObjectURL(file));
		}
	};

	const handleVerificationDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setVerificationDocFile(file);
			// Create preview for images only
			if (file.type.startsWith("image/")) {
				setVerificationDocPreview(URL.createObjectURL(file));
			} else {
				setVerificationDocPreview(null);
			}
		}
	};

	const removeProfilePhoto = () => {
		setProfilePhotoFile(null);
		setProfilePhotoPreview(null);
		if (profilePhotoRef.current) {
			profilePhotoRef.current.value = "";
		}
	};

	const removeVerificationDoc = () => {
		setVerificationDocFile(null);
		setVerificationDocPreview(null);
		if (verificationDocRef.current) {
			verificationDocRef.current.value = "";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Add New Employee
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className=""
						autoComplete="off"
					>
						<div className="space-y-4 overflow-auto h-[70vh] pr-5 py-5">
							{/* Basic Info */}

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="john.doe@company.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Profile Photo Upload */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">
									Profile Photo
								</Label>
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0">
										<div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
											{profilePhotoPreview ? (
												<img
													src={profilePhotoPreview}
													alt="Profile preview"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="text-center">
													<ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
													<span className="text-xs text-gray-500">
														No image
													</span>
												</div>
											)}
										</div>
									</div>
									<div className="flex-1 space-y-2">
										<input
											ref={profilePhotoRef}
											type="file"
											accept="image/*"
											onChange={handleProfilePhotoChange}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												profilePhotoRef.current?.click()
											}
											className="flex items-center gap-2"
											size="sm"
										>
											<Upload className="h-4 w-4" />
											Upload Photo
										</Button>
										{profilePhotoFile && (
											<div className="flex items-center gap-2">
												<span className="text-sm text-gray-600">
													{profilePhotoFile.name}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={removeProfilePhoto}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Verification Document Upload */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">
									Verification Document
								</Label>
								<FormField
									control={form.control}
									name="verificationDocumentType"
									render={({ field }) => (
										<FormItem>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select document type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="passport">
														Passport
													</SelectItem>
													<SelectItem value="driving_license">
														Driving License
													</SelectItem>
													<SelectItem value="aadhaar">
														Aadhaar Card
													</SelectItem>
													<SelectItem value="voter_id">
														Voter ID
													</SelectItem>
													<SelectItem value="pan_card">
														PAN Card
													</SelectItem>
													<SelectItem value="other">
														Other
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0">
										<div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
											{verificationDocPreview ? (
												<img
													src={verificationDocPreview}
													alt="Document preview"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="text-center">
													<ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
													<span className="text-xs text-gray-500">
														No file
													</span>
												</div>
											)}
										</div>
									</div>
									<div className="flex-1 space-y-2">
										<input
											ref={verificationDocRef}
											type="file"
											accept="image/*,.pdf"
											onChange={handleVerificationDocChange}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												verificationDocRef.current?.click()
											}
											className="flex items-center gap-2"
											size="sm"
										>
											<Upload className="h-4 w-4" />
											Upload Document
										</Button>
										{verificationDocFile && (
											<div className="flex items-center gap-2">
												<span className="text-sm text-gray-600">
													{verificationDocFile.name}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={removeVerificationDoc}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Permission Sets Assignment */}
							<div className="space-y-2">
								<Label>Permission Sets</Label>
								{loadingPermissionSets ? (
									<div className="text-sm text-muted-foreground">
										Loading permission sets...
									</div>
								) : (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={`w-full justify-between text-left truncate ${selectedPermissionSetIds.length === 0
													? "text-muted-foreground"
													: ""
													}`}
											>
												{selectedPermissionSetIds.length > 0
													? `${selectedPermissionSetIds.length} selected`
													: "Select permission sets"}
												<ChevronDown className="ml-2 h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-2">
											<div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
												{allPermissionSets.map((set) => (
													<div
														key={set.id}
														className="flex items-center space-x-2"
													>
														<Checkbox
															id={`permission-set-create-${set.id}`}
															checked={selectedPermissionSetIds.includes(
																set.id
															)}
															onCheckedChange={(checked) =>
																handlePermissionSetToggle(set.id, checked as boolean)
															}
														/>
														<label
															htmlFor={`permission-set-create-${set.id}`}
															className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
														>
															{set.name}
														</label>
													</div>
												))}
											</div>
										</PopoverContent>
									</Popover>
								)}
								<div className="text-sm text-muted-foreground">
									{selectedPermissionSetIds.length} permission set(s) selected
								</div>
							</div>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel>Status</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex space-x-4"
											>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="inactive" />
													</FormControl>
													<FormLabel className="font-normal">
														In Active
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="suspended" />
													</FormControl>
													<FormLabel className="font-normal">
														Suspended
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="terminated" />
													</FormControl>
													<FormLabel className="font-normal">
														Terminated
													</FormLabel>
												</FormItem>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="joinDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Join Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={`w-full pl-3 text-left font-normal ${!field.value
															? "text-muted-foreground"
															: ""
															}`}
													>
														{field.value &&
															!isNaN(
																new Date(
																	field.value
																).getTime()
															) ? (
															format(
																new Date(field.value),
																"PPP"
															)
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() ||
														date < new Date("1900-01-01")
													}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* More Details */}

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input placeholder="123 Main St" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input placeholder="+1234567890" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="dateOfBirth"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date of Birth</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={`w-full pl-3 text-left font-normal ${!field.value
															? "text-muted-foreground"
															: ""
															}`}
													>
														{field.value &&
															!isNaN(
																new Date(
																	field.value
																).getTime()
															) ? (
															format(
																new Date(field.value),
																"PPP"
															)
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() ||
														date < new Date("1900-01-01")
													}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gender</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select gender" />
													</SelectTrigger>
												</FormControl>
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
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="nationality"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nationality</FormLabel>
										<FormControl>
											<Input placeholder="Nationality" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="experience"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Experience</FormLabel>
										<FormControl>
											<Input placeholder="Experience" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="specialization"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Specialization</FormLabel>
										<FormControl>
											<Input
												placeholder="Specialization"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="additional_info"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Additional Info</FormLabel>
										<FormControl>
											<Input
												placeholder="Additional Info"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Other Info */}
							<FormField
								control={form.control}
								name="maritalStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Marital Status</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="single">
														Single
													</SelectItem>
													<SelectItem value="married">
														Married
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="emergencyContacts"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Emergency Contacts</FormLabel>
										<FormControl>
											<div>
												{(Array.isArray(field.value)
													? field.value
													: []
												).map((contact, idx: number) => (
													<div
														key={idx}
														className="flex gap-2 mb-2"
													>
														<Input
															placeholder="Name"
															value={contact.name}
															onChange={(e) => {
																const updated = [
																	...(field.value ??
																		[]),
																];
																if (updated[idx]) {
																	updated[idx].name =
																		e.target.value;
																	field.onChange(
																		updated
																	);
																}
															}}
														/>
														<Input
															placeholder="Relation"
															value={contact.relation}
															onChange={(e) => {
																const updated = [
																	...(field.value ??
																		[]),
																];
																if (updated[idx]) {
																	updated[
																		idx
																	].relation =
																		e.target.value;
																	field.onChange(
																		updated
																	);
																}
															}}
														/>
														<Input
															placeholder="Phone Number"
															value={contact.phone}
															onChange={(e) => {
																const updated = [
																	...(field.value ??
																		[]),
																];
																if (updated[idx]) {
																	updated[idx].phone =
																		e.target.value;
																	field.onChange(
																		updated
																	);
																}
															}}
														/>
														<Button
															type="button"
															variant="destructive"
															size="icon"
															onClick={() => {
																const updated = [
																	...(field.value ??
																		[]),
																];
																updated.splice(idx, 1);
																field.onChange(updated);
															}}
														>
															<X className="w-4 h-4" />
														</Button>
													</div>
												))}
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														field.onChange([
															...(field.value ?? []),
															{ name: "", relation: "" },
														])
													}
												>
													Add Contact
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter className="pt-4 flex justify-between">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Adding..." : "Add Employee"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
