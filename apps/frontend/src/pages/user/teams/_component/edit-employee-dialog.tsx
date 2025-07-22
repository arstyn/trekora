import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AxiosRequest } from "@/lib/axios";
import type { IDepartment } from "@/types/department.type";
import type { IEmployee, IEmployeeCreateDTO } from "@/types/employee.types";
import type { IRole } from "@/types/role.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Update Zod schema to include all fields
const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email({ message: "Please enter a valid email address" }),
	dateOfBirth: z.date().optional(),
	gender: z.enum(["male", "female", "other"]).optional(),
	nationality: z.string().optional(),
	maritalStatus: z.enum(["single", "married"]).optional(),
	joinDate: z.date({ error: "Join date is required" }),
	avatar: z.string().optional(),
	branchId: z.string().optional(),
	roleId: z.string().min(1, { message: "Role is required" }),
	status: z.enum(["active", "inactive", "suspended", "terminated"], {
		error: "Please select a status",
	}),
	departments: z
		.array(z.string())
		.min(1, { message: "Select at least one department" }),
});

// Define the type for the form values
export type IEditEmployeeFormValues = z.infer<typeof formSchema>;

// Define the props for the EditEmployeeDialog component
type EditEmployeeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: IEmployee | null;
	onUpdateEmployee: (id: string, updatedEmployee: IEmployee) => void;
	roles: IRole[];
	departments: IDepartment[];
};

export function EditEmployeeDialog({
	open,
	onOpenChange,
	employee,
	onUpdateEmployee,
	roles,
	departments,
}: EditEmployeeDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Helper to extract departments from employeeDepartments
	const getDepartmentIds = (employee: IEmployee) =>
		employee.employeeDepartments?.map((ud) => ud.department.id) ?? [];

	// Initialize the form
	const form = useForm<IEditEmployeeFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: employee
			? {
					name: employee.name,
					address: employee.address ?? "",
					phone: employee.phone ?? "",
					email: employee.email ?? "",
					dateOfBirth: employee.dateOfBirth
						? new Date(employee.dateOfBirth)
						: undefined,
					gender: employee.gender ?? undefined,
					nationality: employee.nationality ?? "",
					maritalStatus: employee.maritalStatus ?? undefined,
					joinDate: employee.joinDate
						? new Date(employee.joinDate)
						: new Date(),
					avatar: employee.avatar ?? "",
					branchId: employee.branchId ?? "",
					roleId: employee.roleId ?? employee.role?.id ?? "",
					status: employee.status,
					departments: getDepartmentIds(employee),
			  }
			: {
					name: "",
					address: "",
					phone: "",
					email: "",
					dateOfBirth: undefined,
					gender: undefined,
					nationality: "",
					maritalStatus: undefined,
					joinDate: new Date(),
					avatar: "",
					branchId: "",
					roleId: "",
					status: "active",
					departments: [],
			  },
	});

	// Update form values when employee changes

	// Handle form submission
	const onSubmit = async (data: IEditEmployeeFormValues) => {
		if (!employee) return;

		setIsSubmitting(true);

		try {
			// Create the updated employee object
			const updatedEmployee = {
				name: data.name,
				email: data.email,
				departments: data.departments,
				roleId: data.roleId,
				status: data.status,
				joinDate: format(data.joinDate, "yyyy-MM-dd"),
				avatar: "/placeholder.svg?height=40&width=40",
				address: data.address,
				phone: data.phone,
				dateOfBirth: data.dateOfBirth
					? format(data.dateOfBirth, "yyyy-MM-dd")
					: undefined,
				gender: data.gender,
				nationality: data.nationality,
				maritalStatus: data.maritalStatus,
				// emergencyContacts: data.emergencyContacts,
			};

			try {
				const employeeData = await AxiosRequest.put<
					IEmployeeCreateDTO,
					IEmployee
				>(`/employee/${employee.id}`, updatedEmployee);
				onUpdateEmployee(employee.id, employeeData);
				form.reset();
				onOpenChange(false);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}

			// Close the dialog
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating employee:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!employee) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						Edit Employee
					</DialogTitle>
					<DialogDescription>Update employee information.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="max-h-[60vh] overflow-auto space-y-4 pr-3 pb-5">
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

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input placeholder="Address" {...field} />
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
											<Input
												placeholder="Phone Number"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="departments"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Departments</FormLabel>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={`w-full justify-between text-left truncate ${
																field.value.length === 0
																	? "text-muted-foreground"
																	: ""
															}`}
														>
															{field.value.length > 0
																? departments
																		.filter((dep) =>
																			field.value.find(
																				(a) =>
																					a ===
																					dep.id
																			)
																		)
																		.map(
																			(d) => d.name
																		)
																		.join(", ")
																: "Select departments"}
															<ChevronDown className="ml-2 h-4 w-4" />
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-full p-2">
														<div className="flex flex-col space-y-2">
															{departments.map((dept) => (
																<div
																	key={dept.id}
																	className="flex items-center space-x-2"
																>
																	<Checkbox
																		checked={field.value.includes(
																			dept.id
																		)}
																		onCheckedChange={(
																			checked
																		) => {
																			if (checked) {
																				field.onChange(
																					[
																						...field.value,
																						dept.id,
																					]
																				);
																			} else {
																				field.onChange(
																					field.value.filter(
																						(
																							item
																						) =>
																							item !==
																							dept.id
																					)
																				);
																			}
																		}}
																	/>
																	<span>
																		{dept.name}
																	</span>
																</div>
															))}
														</div>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="roleId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="capitalize">
															<SelectValue placeholder="Select role" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{roles.map((role) => (
															<SelectItem
																key={role.id}
																value={role.id}
																className="capitalize"
															>
																{role.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
												value={field.value}
												className="flex space-x-4"
											>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="active" />
													</FormControl>
													<FormLabel className="font-normal">
														Active
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="in-active" />
													</FormControl>
													<FormLabel className="font-normal">
														In Active
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2 space-y-0">
													<FormControl>
														<RadioGroupItem value="on leave" />
													</FormControl>
													<FormLabel className="font-normal">
														On Leave
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
														className={`w-full pl-3 text-left font-normal ${
															!field.value
																? "text-muted-foreground"
																: ""
														}`}
													>
														{field.value ? (
															format(field.value, "PPP")
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
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dateOfBirth"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date of Birth</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={`w-full pl-3 text-left font-normal ${
															!field.value
																? "text-muted-foreground"
																: ""
														}`}
													>
														{field.value ? (
															format(field.value, "PPP")
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
													initialFocus
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
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">
													Female
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

							<FormField
								control={form.control}
								name="maritalStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Marital Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
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
								name="avatar"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Avatar URL</FormLabel>
										<FormControl>
											<Input placeholder="Avatar URL" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
