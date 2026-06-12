import StatusBadge from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { PermissionService } from "@/services/permission.service";
import type { IEmployee } from "@/types/employee.types";
import type { PermissionSet } from "@/types/permission.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, History, Image as ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface IActivityLog {
	id: string;
	action: string;
	details: string;
	createdAt: string;
	performedBy?: {
		name: string;
		email: string;
	};
}

const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	departments: z.array(z.string()).optional(),
	status: z.enum(["active", "inactive", "terminated", "suspended", "pending_activation"]).optional(),
	joinDate: z.date({ error: "Join date is required" }),
	address: z.string().optional(),
	phone: z.string().optional(),
	dateOfBirth: z.date().optional(),
	gender: z.enum(["male", "female", "other"]).optional(),
	nationality: z.string().optional(),
	customNationality: z.string().optional(),
	experience: z.string().optional(),
	customExperience: z.string().optional(),
	designation: z.string().optional(),
	specialization: z.string().optional(),
	additional_info: z.string().optional(),
	maritalStatus: z.enum(["single", "married"]).optional(),
	verificationDocumentType: z.string().optional(),
	managerId: z.string().optional(),
	branchId: z.string().optional(),
	emergencyContacts: z.array(z.object({
		name: z.string().min(2, { message: "Contact name must be at least 2 characters" }),
		relation: z.string().min(2, { message: "Relation must be at least 2 characters" }),
		phone: z.string(),
	})).optional(),
});

export type IEmployeeFormValues = z.infer<typeof formSchema>;

export type EmployeeModalProps = {
	mode: "add" | "edit" | "view";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee?: IEmployee | null;
	employees?: IEmployee[];
	onSuccess?: (employee: IEmployee, action: "add" | "edit") => void;
	onEdit?: (employee: IEmployee) => void;
	onResendInvite?: (employee: IEmployee) => void;
	onReactivate?: (employee: IEmployee) => void;
	onArchive?: (employee: IEmployee) => void;
	onUnarchive?: (employee: IEmployee) => void;
	onTerminate?: (employee: IEmployee) => void;
};

export function EmployeeModal({
	mode,
	open,
	onOpenChange,
	employee,
	employees = [],
	onSuccess,
	onEdit,
	onResendInvite,
	onReactivate,
	onArchive,
	onUnarchive,
	onTerminate,
}: EmployeeModalProps) {
	const isViewMode = mode === "view";

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
	const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
	const [verificationDocFile, setVerificationDocFile] = useState<File | null>(null);
	const [verificationDocPreview, setVerificationDocPreview] = useState<string | null>(null);

	const profilePhotoRef = useRef<HTMLInputElement>(null);
	const verificationDocRef = useRef<HTMLInputElement>(null);

	const [allPermissionSets, setAllPermissionSets] = useState<PermissionSet[]>([]);
	const [selectedPermissionSetIds, setSelectedPermissionSetIds] = useState<string[]>([]);
	const [loadingPermissionSets, setLoadingPermissionSets] = useState(false);
	const [searchPermissionQuery, setSearchPermissionQuery] = useState("");

	// View mode state
	const [logs, setLogs] = useState<IActivityLog[]>([]);
	const [loadingLogs, setLoadingLogs] = useState(false);
	const [showAllLogs, setShowAllLogs] = useState(false);

	const filteredPermissionSets = allPermissionSets.filter(set =>
		set.name.toLowerCase().includes(searchPermissionQuery.toLowerCase())
	);

	const getDepartmentIds = (emp: IEmployee) => emp.employeeDepartments?.map((ud) => ud.department.id) ?? [];

	const form = useForm<IEmployeeFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "", email: "", departments: [], status: "inactive",
			joinDate: new Date(), address: "", phone: "", dateOfBirth: undefined,
			gender: undefined, nationality: "India", customNationality: "",
			experience: "", customExperience: "", designation: "", specialization: "",
			additional_info: "", maritalStatus: undefined, verificationDocumentType: "",
			emergencyContacts: [], managerId: "", branchId: ""
		},
	});

	useEffect(() => {
		if (open) {
			if ((mode === "edit" || mode === "view") && employee) {
				form.reset({
					name: employee.name,
					email: employee.email ?? "",
					departments: getDepartmentIds(employee),
					status: employee.status as any ?? "inactive",
					joinDate: employee.joinDate ? new Date(employee.joinDate) : new Date(),
					address: employee.address ?? "",
					phone: employee.phone ?? "",
					dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined,
					gender: employee.gender as any ?? undefined,
					nationality: employee.nationality ?? "India",
					customNationality: "",
					experience: employee.experience ?? "",
					customExperience: "",
					designation: employee.designation ?? "",
					specialization: employee.specialization ?? "",
					additional_info: employee.additional_info ?? "",
					maritalStatus: employee.maritalStatus as any ?? undefined,
					verificationDocumentType: employee.verificationDocumentType ?? "",
					emergencyContacts: [],
					managerId: employee.managerId ?? "",
					branchId: employee.branchId ?? "",
				});
				loadPermissionSets();
				if (mode === "view") {
					loadLogs();
					setShowAllLogs(false);
				}
			} else {
				form.reset({
					name: "", email: "", departments: [], status: "inactive",
					joinDate: new Date(), address: "", phone: "", dateOfBirth: undefined,
					gender: undefined, nationality: "India", customNationality: "",
					experience: "", customExperience: "", designation: "", specialization: "",
					additional_info: "", maritalStatus: undefined, verificationDocumentType: "",
					emergencyContacts: [], managerId: "", branchId: ""
				});
				loadPermissionSets();
			}
		} else {
			setProfilePhotoFile(null);
			setProfilePhotoPreview(null);
			setVerificationDocFile(null);
			setVerificationDocPreview(null);
		}
	}, [open, mode, employee]);

	const loadPermissionSets = async () => {
		try {
			setLoadingPermissionSets(true);
			const allSets = await PermissionService.getAllPermissionSets();
			setAllPermissionSets(allSets);

			if ((mode === "edit" || mode === "view") && employee?.id) {
				const employeeSets = await PermissionService.getPermissionSetsForEmployee(employee.id);
				setSelectedPermissionSetIds(employeeSets.map(set => set.id));
			} else {
				setSelectedPermissionSetIds([]);
			}
		} catch (error) {
			console.error("Failed to load permission sets:", error);
			toast.error("Failed to load permission sets");
		} finally {
			setLoadingPermissionSets(false);
		}
	};

	const loadLogs = async () => {
		if (!employee?.id) return;
		try {
			setLoadingLogs(true);
			const res = await axiosInstance.get<IActivityLog[]>(`/activity-log/employee/${employee.id}`);
			setLogs(res.data);
		} catch (error) {
			console.error("Failed to load activity logs:", error);
		} finally {
			setLoadingLogs(false);
		}
	};

	const handlePermissionSetToggle = (permissionSetId: string, checked: boolean) => {
		if (checked) {
			setSelectedPermissionSetIds((prev) => [...prev, permissionSetId]);
		} else {
			setSelectedPermissionSetIds((prev) => prev.filter((id) => id !== permissionSetId));
		}
	};

	const onSubmit = async (data: IEmployeeFormValues) => {
		setIsSubmitting(true);
		const formDataToSubmit = new FormData();

		formDataToSubmit.append("name", data.name);
		formDataToSubmit.append("email", data.email);
		if (data.departments && data.departments.length > 0) {
			data.departments.forEach((dept, index) => {
				formDataToSubmit.append(`departments[${index}]`, dept);
			});
		}
		if (data.status) formDataToSubmit.append("status", data.status);
		formDataToSubmit.append("joinDate", format(data.joinDate, "yyyy-MM-dd"));
		if (data.address) formDataToSubmit.append("address", data.address);
		if (data.phone) formDataToSubmit.append("phone", data.phone);
		if (data.dateOfBirth) formDataToSubmit.append("dateOfBirth", format(data.dateOfBirth, "yyyy-MM-dd"));

		const finalNationality = data.nationality === "Other" ? data.customNationality : data.nationality;
		const finalExperience = data.experience === "Other" ? data.customExperience : data.experience;
		if (data.gender) formDataToSubmit.append("gender", data.gender);
		if (finalNationality) formDataToSubmit.append("nationality", finalNationality);
		if (finalExperience) formDataToSubmit.append("experience", finalExperience);
		if (data.designation) formDataToSubmit.append("designation", data.designation);
		if (data.specialization) formDataToSubmit.append("specialization", data.specialization);
		if (data.additional_info) formDataToSubmit.append("additional_info", data.additional_info);
		if (data.maritalStatus) formDataToSubmit.append("maritalStatus", data.maritalStatus);
		if (data.verificationDocumentType) formDataToSubmit.append("verificationDocumentType", data.verificationDocumentType);
		if (data.managerId) formDataToSubmit.append("managerId", data.managerId);
		else formDataToSubmit.append("managerId", "");
		if (data.branchId) formDataToSubmit.append("branchId", data.branchId);

		if (profilePhotoFile) formDataToSubmit.append("profilePhoto", profilePhotoFile);
		if (verificationDocFile) formDataToSubmit.append("verificationDocument", verificationDocFile);

		try {
			let resData: IEmployee;
			if (mode === "edit" && employee) {
				const res = await axiosInstance.put<IEmployee>(`/employee/${employee.id}`, formDataToSubmit, { headers: { "Content-Type": "multipart/form-data" } });
				resData = res.data;

				const currentSets = await PermissionService.getPermissionSetsForEmployee(employee.id);
				const currentSetIds = currentSets.map(set => set.id);
				const setsToAdd = selectedPermissionSetIds.filter(id => !currentSetIds.includes(id));
				const setsToRemove = currentSetIds.filter(id => !selectedPermissionSetIds.includes(id));

				for (const setId of setsToRemove) {
					await PermissionService.removePermissionSetAssignment(setId, { employeeId: employee.id });
				}
				for (const setId of setsToAdd) {
					await PermissionService.assignPermissionSet(setId, { employeeId: employee.id });
				}
			} else {
				const res = await axiosInstance.post<IEmployee>("/employee", formDataToSubmit, { headers: { "Content-Type": "multipart/form-data" } });
				resData = res.data;

				if (resData.id && selectedPermissionSetIds.length > 0) {
					for (const setId of selectedPermissionSetIds) {
						await PermissionService.assignPermissionSet(setId, { employeeId: resData.id });
					}
				}
			}

			if (onSuccess) onSuccess(resData, mode as "add" | "edit");
			onOpenChange(false);
		} catch (error) {
			if (error instanceof Error) toast.error(error.message);
			else toast.error(`Failed to ${mode} employee`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) { setProfilePhotoFile(file); setProfilePhotoPreview(URL.createObjectURL(file)); }
	};
	const handleVerificationDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setVerificationDocFile(file);
			if (file.type.startsWith("image/")) setVerificationDocPreview(URL.createObjectURL(file));
			else setVerificationDocPreview(null);
		}
	};
	const removeProfilePhoto = () => { setProfilePhotoFile(null); setProfilePhotoPreview(null); if (profilePhotoRef.current) profilePhotoRef.current.value = ""; };
	const removeVerificationDoc = () => { setVerificationDocFile(null); setVerificationDocPreview(null); if (verificationDocRef.current) verificationDocRef.current.value = ""; };

	const formattedDate = employee?.joinDate ? format(new Date(employee.joinDate), "PPP") : "";
	const formattedDOB = employee?.dateOfBirth ? format(new Date(employee.dateOfBirth), "PPP") : "";
	const display = (value?: string | number | boolean | null) => value !== undefined && value !== null && value !== "" ? value : <span className="text-muted-foreground italic">N/A</span>;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={isViewMode ? "sm:max-w-[700px] max-h-[90vh] flex flex-col" : "sm:max-w-[600px]"}>
				<DialogHeader className={isViewMode ? "flex-shrink-0" : ""}>
					<DialogTitle className="flex items-center justify-between">
						{mode === "add" ? "Add New Employee" : mode === "edit" ? "Edit Employee" : "Employee Details"}
					</DialogTitle>
					{mode === "edit" && <DialogDescription>Update employee information.</DialogDescription>}
				</DialogHeader>

				{isViewMode && employee ? (
					<>
						<ScrollArea className="flex-1 min-h-0">
							<div className="space-y-8 pr-4">
								<div className="flex items-center border-b pb-4">
									<Avatar className="h-16 w-16">
										<AvatarImage src={employee.profilePhoto || "/placeholder.svg"} alt={employee.name} className="object-cover w-full h-full" />
										<AvatarFallback className="text-lg">{employee.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex items-center justify-between w-full px-4">
										<div>
											<h3 className="text-xl font-semibold">{employee.name}</h3>
											<p className="text-sm text-muted-foreground">{employee.email}</p>
										</div>
										<StatusBadge status={employee.status} />
									</div>
								</div>

								<div className="max-h-[50vh] overflow-auto space-y-5">
									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-3">
											<Detail label="Employee ID" value={employee.id} />
											<Detail label="Branch" value={display(employee.branch?.name)} />
											<Detail label="Manager" value={display(employee.manager?.name)} />
											<Detail label="Organization" value={display(employee.organization?.name)} />
											<Detail label="Email" value={display(employee.email)} />
											<Detail label="Phone" value={display(employee.phone)} />
											<Detail label="Marital Status" value={display(employee.maritalStatus)} />
											<Detail label="Address" value={display(employee.address)} />
											<Detail label="Date of Birth" value={display(formattedDOB)} />
											<Detail label="Gender" value={display(employee.gender)} />
										</div>
										<div className="space-y-3">
											<Detail label="Nationality" value={display(employee.nationality)} />
											<Detail label="Experience" value={display(employee.experience)} />
											<Detail label="Designation" value={display(employee.designation)} />
											<Detail label="Specialization" value={display(employee.specialization)} />
											<Detail label="Additional Info" value={display(employee.additional_info)} />
											<Detail label="Join Date" value={display(formattedDate)} />
											<Detail label="Employment Duration" value={employee.joinDate && calculateDuration(employee.joinDate)} />
											<Detail label="Created At" value={format(new Date(employee.createdAt), "PPP")} />
											<Detail label="Updated At" value={format(new Date(employee.updatedAt), "PPP")} />
										</div>
									</div>

									{employee.employeeDepartments && employee.employeeDepartments.length > 0 && (
										<div>
											<p className="text-sm font-medium text-muted-foreground mb-1">Departments</p>
											<ul className="list-disc list-inside text-sm">
												{employee.employeeDepartments.map((dep, idx) => (
													<li key={idx}>{dep.department.name || "N/A"}</li>
												))}
											</ul>
										</div>
									)}

									<div>
										<p className="text-sm font-medium text-muted-foreground mb-2">Permission Sets</p>
										{loadingPermissionSets ? (
											<p className="text-sm text-muted-foreground">Loading...</p>
										) : selectedPermissionSetIds.length > 0 ? (
											<div className="flex flex-wrap gap-2">
												{allPermissionSets.filter(set => selectedPermissionSetIds.includes(set.id)).map((set) => (
													<Badge key={set.id} variant="secondary">{set.name}</Badge>
												))}
											</div>
										) : (
											<p className="text-sm text-muted-foreground italic">No permission sets assigned</p>
										)}
									</div>

									<div className="border-t pt-4 pr-2">
										<p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5"><History className="h-4 w-4" />Activity History</p>
										{loadingLogs ? (
											<p className="text-sm text-muted-foreground">Loading history...</p>
										) : logs.length > 0 ? (
											<div className="space-y-3">
												{(showAllLogs ? logs : logs.slice(0, 3)).map((log) => (
													<div key={log.id} className="text-xs bg-muted/40 p-2.5 rounded-lg border flex justify-between items-start gap-4">
														<div className="space-y-1">
															<p className="text-foreground font-medium">{log.details}</p>
															<p className="text-muted-foreground">By: {log.performedBy ? `${log.performedBy.name} (${log.performedBy.email})` : "System"}</p>
														</div>
														<span className="text-muted-foreground shrink-0 font-medium">
															{new Date(log.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
														</span>
													</div>
												))}
												{logs.length > 3 && (
													<div className="flex justify-center pt-1">
														<Button type="button" variant="ghost" size="sm" onClick={() => setShowAllLogs(!showAllLogs)} className="text-xs font-semibold text-primary hover:text-primary/90">
															{showAllLogs ? "View Less" : `View More (${logs.length - 3} more)`}
														</Button>
													</div>
												)}
											</div>
										) : (
											<p className="text-sm text-muted-foreground italic">No activities recorded yet.</p>
										)}
									</div>
								</div>
							</div>
						</ScrollArea>
						<div className="pt-4 flex flex-wrap justify-end gap-2 border-t flex-shrink-0">
							{employee.isArchived ? (
								onUnarchive && <Button variant="outline" className="text-blue-600" onClick={() => onUnarchive(employee)}>Unarchive</Button>
							) : (
								<>
									{(employee.status === "inactive" || employee.status === "pending_activation") && onResendInvite && (
										<Button variant="outline" className="text-blue-600" onClick={() => onResendInvite(employee)}>
											{employee.status === "pending_activation" ? "Resend Invite" : "Send Invite"}
										</Button>
									)}
									{employee.status === "terminated" && onReactivate && (
										<Button variant="outline" className="text-green-600" onClick={() => onReactivate(employee)}>Reactivate</Button>
									)}
									{employee.status !== "terminated" && onTerminate && (
										<Button variant="outline" className="text-red-600" onClick={() => onTerminate(employee)}>Terminate</Button>
									)}
									{onArchive && (
										<Button variant="outline" className="text-amber-600" onClick={() => onArchive(employee)}>Archive</Button>
									)}
								</>
							)}
							<Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
							{onEdit && employee && (
								<Button onClick={() => { onEdit(employee); }}>Edit Employee</Button>
							)}
						</div>
					</>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="" autoComplete="off">
							<div className="space-y-4 overflow-auto h-[70vh] pr-5 py-5">
								<FormField control={form.control} name="name" render={({ field }) => (
									<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="email" render={({ field }) => (
									<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@company.com" {...field} /></FormControl><FormMessage /></FormItem>
								)} />

								<div className="space-y-3">
									<Label className="text-sm font-medium">Profile Photo</Label>
									<div className="flex items-start gap-4">
										<div className="flex-shrink-0">
											<div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
												{profilePhotoPreview ? <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" /> : employee?.profilePhoto ? <img src={employee.profilePhoto} alt="Profile preview" className="w-full h-full object-cover" /> : (
													<div className="text-center"><ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" /><span className="text-xs text-gray-500">No image</span></div>
												)}
											</div>
										</div>
										<div className="flex-1 space-y-2">
											<input ref={profilePhotoRef} type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
											<Button type="button" variant="outline" onClick={() => profilePhotoRef.current?.click()} className="flex items-center gap-2" size="sm"><Upload className="h-4 w-4" />Upload Photo</Button>
											{profilePhotoFile && (
												<div className="flex items-center gap-2"><span className="text-sm text-gray-600">{profilePhotoFile.name}</span><Button type="button" variant="ghost" size="sm" onClick={removeProfilePhoto}><X className="h-4 w-4" /></Button></div>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<Label className="text-sm font-medium">Verification Document</Label>
									<FormField control={form.control} name="verificationDocumentType" render={({ field }) => (
										<FormItem>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select document type" /></SelectTrigger></FormControl>
												<SelectContent>
													<SelectItem value="passport">Passport</SelectItem>
													<SelectItem value="driving_license">Driving License</SelectItem>
													<SelectItem value="aadhaar">Aadhaar Card</SelectItem>
													<SelectItem value="voter_id">Voter ID</SelectItem>
													<SelectItem value="pan_card">PAN Card</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)} />
									<div className="flex items-start gap-4">
										<div className="flex-shrink-0">
											<div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
												{verificationDocPreview ? <img src={verificationDocPreview} alt="Document preview" className="w-full h-full object-cover" /> : employee?.verificationDocument ? <img src={employee.verificationDocument} alt="Document preview" className="w-full h-full object-cover" /> : (
													<div className="text-center"><ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" /><span className="text-xs text-gray-500">No file</span></div>
												)}
											</div>
										</div>
										<div className="flex-1 space-y-2">
											<input ref={verificationDocRef} type="file" accept="image/*,.pdf" onChange={handleVerificationDocChange} className="hidden" />
											<Button type="button" variant="outline" onClick={() => verificationDocRef.current?.click()} className="flex items-center gap-2" size="sm"><Upload className="h-4 w-4" />Upload Document</Button>
											{verificationDocFile && (
												<div className="flex items-center gap-2"><span className="text-sm text-gray-600">{verificationDocFile.name}</span><Button type="button" variant="ghost" size="sm" onClick={removeVerificationDoc}><X className="h-4 w-4" /></Button></div>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Permission Sets</Label>
									{loadingPermissionSets ? <div className="text-sm text-muted-foreground">Loading permission sets...</div> : (
										<Popover>
											<PopoverTrigger asChild>
												<Button variant="outline" role="combobox" className={`w-full justify-between font-normal ${selectedPermissionSetIds.length === 0 ? "text-muted-foreground" : ""}`}>
													{selectedPermissionSetIds.length > 0 ? `${selectedPermissionSetIds.length} selected` : "Select permission sets"}
													<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
												<div className="p-2 border-b">
													<Input placeholder="Search permission sets..." value={searchPermissionQuery} onChange={(e) => setSearchPermissionQuery(e.target.value)} className="h-8" />
												</div>
												<div className="flex flex-col space-y-2 p-2 max-h-60 overflow-y-auto">
													{filteredPermissionSets.length === 0 ? <div className="text-sm text-center text-muted-foreground py-4">No results found.</div> : (
														filteredPermissionSets.map((set) => (
															<div key={set.id} className="flex items-center space-x-2">
																<Checkbox id={`permission-set-create-${set.id}`} checked={selectedPermissionSetIds.includes(set.id)} onCheckedChange={(checked) => handlePermissionSetToggle(set.id, checked as boolean)} />
																<label htmlFor={`permission-set-create-${set.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">{set.name}</label>
															</div>
														))
													)}
												</div>
											</PopoverContent>
										</Popover>
									)}
									<div className="text-sm text-muted-foreground">{selectedPermissionSetIds.length} permission set(s) selected</div>
								</div>

								<FormField control={form.control} name="status" render={({ field }) => (
									<FormItem className="space-y-3"><FormLabel>Status</FormLabel><FormControl>
										<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
											<FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="inactive" /></FormControl><FormLabel className="font-normal">In Active</FormLabel></FormItem>
											<FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="suspended" /></FormControl><FormLabel className="font-normal">Suspended</FormLabel></FormItem>
											<FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="terminated" /></FormControl><FormLabel className="font-normal">Terminated</FormLabel></FormItem>
										</RadioGroup>
									</FormControl><FormMessage /></FormItem>
								)} />

								<FormField control={form.control} name="managerId" render={({ field }) => (
									<FormItem>
										<FormLabel>Manager</FormLabel>
										<FormControl>
											<Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} defaultValue={field.value || "none"}>
												<FormControl><SelectTrigger><SelectValue placeholder="Select manager (optional)" /></SelectTrigger></FormControl>
												<SelectContent>
													<SelectItem value="none">No Manager</SelectItem>
													{employees.filter(emp => emp.id !== employee?.id).map(emp => (
														<SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)} />

								<FormField control={form.control} name="joinDate" render={({ field }) => (
									<FormItem className="flex flex-col"><FormLabel>Join Date</FormLabel><Popover modal={false}><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}>
										{field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
											<Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={[{ after: new Date() }, { before: new Date("1900-01-01") }]} />
										</PopoverContent></Popover><FormMessage /></FormItem>
								)} />

								<FormField control={form.control} name="address" render={({ field }) => (
									<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="phone" render={({ field }) => (
									<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="dateOfBirth" render={({ field }) => (
									<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover modal={false}><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}>
										{field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
											<Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={[{ after: new Date() }, { before: new Date("1900-01-01") }]} />
										</PopoverContent></Popover><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="gender" render={({ field }) => (
									<FormItem><FormLabel>Gender</FormLabel><FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
											<SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
										</Select>
									</FormControl><FormMessage /></FormItem>
								)} />

								<FormField control={form.control} name="nationality" render={({ field }) => (
									<FormItem><FormLabel>Nationality</FormLabel><FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select nationality" /></SelectTrigger></FormControl>
											<SelectContent><SelectItem value="India">India</SelectItem><SelectItem value="USA">USA</SelectItem><SelectItem value="UK">UK</SelectItem><SelectItem value="Canada">Canada</SelectItem><SelectItem value="Australia">Australia</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
										</Select>
									</FormControl><FormMessage /></FormItem>
								)} />
								{form.watch("nationality") === "Other" && (
									<FormField control={form.control} name="customNationality" render={({ field }) => (
										<FormItem><FormLabel>Custom Nationality</FormLabel><FormControl><Input placeholder="Enter custom nationality" {...field} /></FormControl><FormMessage /></FormItem>
									)} />
								)}

								<FormField control={form.control} name="experience" render={({ field }) => (
									<FormItem><FormLabel>Experience</FormLabel><FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select experience" /></SelectTrigger></FormControl>
											<SelectContent><SelectItem value="Fresher">Fresher</SelectItem><SelectItem value="1-3 years">1-3 years</SelectItem><SelectItem value="3-5 years">3-5 years</SelectItem><SelectItem value="5+ years">5+ years</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
										</Select>
									</FormControl><FormMessage /></FormItem>
								)} />
								{form.watch("experience") === "Other" && (
									<FormField control={form.control} name="customExperience" render={({ field }) => (
										<FormItem><FormLabel>Custom Experience</FormLabel><FormControl><Input placeholder="Enter custom experience" {...field} /></FormControl><FormMessage /></FormItem>
									)} />
								)}

								<FormField control={form.control} name="designation" render={({ field }) => (
									<FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="E.g. Group Coodinator" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="specialization" render={({ field }) => (
									<FormItem><FormLabel>Specialization</FormLabel><FormControl><Input placeholder="Specialization" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
								<FormField control={form.control} name="additional_info" render={({ field }) => (
									<FormItem><FormLabel>Additional Info</FormLabel><FormControl><Input placeholder="Additional Information" {...field} /></FormControl><FormMessage /></FormItem>
								)} />
							</div>

							<DialogFooter className="pt-4 mt-2 border-t">
								<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
								<Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : mode === "add" ? "Create Employee" : "Save Changes"}</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
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

function calculateDuration(joinDate: Date): string {
	const start = new Date(joinDate);
	const now = new Date();
	let years = now.getFullYear() - start.getFullYear();
	let months = now.getMonth() - start.getMonth();
	if (months < 0) { years--; months += 12; }
	if (years > 0) return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
	return `${months} ${months === 1 ? "month" : "months"}`;
}
