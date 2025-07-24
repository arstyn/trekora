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
import type { IDepartment } from "@/types/department.type";
import type { IEmployee } from "@/types/employee.types";
import type { IRole } from "@/types/role.types";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the form schema with Zod
const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	departments: z
		.array(z.string())
		.min(1, { message: "Please select at least one departments" }),
	roleId: z.string().min(1, { message: "Role is required" }),
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
	maritalStatus: z.enum(["single", "married"]).optional(),
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
	roles: IRole[];
	departments: IDepartment[];
};

export function AddEmployeeModal({
	table,
	open,
	onOpenChange,
	employees,
	setEmployees,
	roles,
	departments,
}: AddEmployeeModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			maritalStatus: undefined,
			emergencyContacts: [],
		},
	});

	// Handle form submission
	const onSubmit = async (data: ICreateEmployeeFormValues) => {
		setIsSubmitting(true);
		// Create the new employee object
		const newEmployee = {
			name: data.name,
			email: data.email,
			departments: data.departments,
			roleId: data.roleId,
			status: data.status,
			joinDate: format(data.joinDate, "yyyy-MM-dd"),
			avatar: "/placeholder.svg?height=40&width=40",
			address: data.address,
			phone: data.phone,
			dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
			gender: data.gender,
			nationality: data.nationality,
			maritalStatus: data.maritalStatus,
			emergencyContacts: data.emergencyContacts,
		};

		try {
			const res = await axiosInstance.post<IEmployee>("/employee", newEmployee);
			setEmployees([res.data, ...employees]);
			table.setPageIndex(0);
			table.resetColumnFilters();
			form.reset();
			onOpenChange(false);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		} finally {
			setIsSubmitting(false);
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
														className={`w-full pl-3 text-left font-normal ${
															!field.value
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
														className={`w-full pl-3 text-left font-normal ${
															!field.value
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
