import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { IReminder, IReminderDTO } from "@/types/reminder.entity";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Pencil, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ReminderTabProps {
	leadId: string;
}

// Zod schema for reminder form
const reminderSchema = z.object({
	remindAt: z.string().min(1, "Remind At is required"),
	repeat: z.enum(["none", "daily", "weekly", "monthly", "yearly", "custom"]),
	note: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

export function ReminderTab({ leadId }: ReminderTabProps) {
	const [reminders, setReminders] = useState<IReminder[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [editingReminder, setEditingReminder] = useState<IReminder | null>(null);

	const form = useForm();

	// react-hook-form setup
	const { control, handleSubmit, reset } = useForm<ReminderFormData>({
		resolver: zodResolver(reminderSchema),
		defaultValues: {
			remindAt: "",
			repeat: "none",
			note: "",
		},
	});

	useEffect(() => {
		const fetchReminders = async () => {
			setIsLoading(true);
			try {
				const res = await axiosInstance.get<IReminder[]>(
					`/reminder?entityType=lead&entityId=${leadId}`
				);

				if (res) {
					setReminders(res.data);
				}
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}

			setIsLoading(false);
		};

		fetchReminders();
	}, [leadId]);

	// Reset form when opening for add/edit
	useEffect(() => {
		if (showForm) {
			if (editingReminder) {
				reset({
					remindAt: editingReminder.remindAt
						? editingReminder.remindAt.slice(0, 16)
						: "",
					repeat:
						(editingReminder.repeat as ReminderFormData["repeat"]) || "none",
					note: editingReminder.note || "",
				});
			} else {
				reset({ remindAt: "", repeat: "none", note: "" });
			}
		}
	}, [showForm, editingReminder, reset]);

	const onSubmit = async (data: ReminderFormData) => {
		setIsLoading(true);
		try {
			let result: IReminder;
			if (editingReminder) {
				result = await axiosInstance.put<Partial<IReminder>, IReminder>(
					`/reminder/${editingReminder.id}`,
					data
				);
			} else {
				result = await axiosInstance.post<IReminderDTO, IReminder>("/reminder", {
					...data,
					type: "lead",
					entityType: "lead",
					entityId: leadId,
				});
			}
			if (result) {
				setShowForm(false);
				setEditingReminder(null);
				reset();
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}

		setIsLoading(false);
	};

	const handleEdit = (reminder: IReminder) => {
		setEditingReminder(reminder);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.delete(`/reminder/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		}

		setIsLoading(false);
	};

	return (
		<div className="space-y-4 ">
			{/* Add/Edit Reminder Modal */}
			<Dialog
				open={showForm}
				onOpenChange={(open) => {
					setShowForm(open);
					if (!open) setEditingReminder(null);
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{editingReminder ? "Edit Reminder" : "Add a new reminder"}
						</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={control}
								name="remindAt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Remind At</FormLabel>
										<FormControl>
											<Input type="datetime-local" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="repeat"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Repeat</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select repeat" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">
														None
													</SelectItem>
													<SelectItem value="daily">
														Daily
													</SelectItem>
													<SelectItem value="weekly">
														Weekly
													</SelectItem>
													<SelectItem value="monthly">
														Monthly
													</SelectItem>
													<SelectItem value="yearly">
														Yearly
													</SelectItem>
													<SelectItem value="custom">
														Custom
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="note"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Note</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowForm(false);
										setEditingReminder(null);
										reset();
									}}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading
										? editingReminder
											? "Saving..."
											: "Adding..."
										: editingReminder
										? "Save Changes"
										: "Add Reminder"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Reminders List */}
			<div className="space-y-4 max-h-56 overflow-y-auto pr-2 relative">
				{isLoading ? (
					<div>Loading...</div>
				) : reminders.length === 0 ? (
					<div className="text-center text-muted-foreground py-4">
						No reminders yet
					</div>
				) : (
					reminders.map((reminder) => (
						<div
							key={reminder.id}
							className="p-2 border rounded-md space-y-2 bg-card flex items-center justify-between"
						>
							<div>
								<div className="text-xs text-muted-foreground">
									{format(new Date(reminder.remindAt), "PPpp")} |
									Repeat: {reminder.repeat}
								</div>
								{reminder.note && (
									<div className="text-sm mt-1">{reminder.note}</div>
								)}
							</div>
							<div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleDelete(reminder.id)}
								>
									<Trash />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleEdit(reminder)}
								>
									<Pencil />
								</Button>
							</div>
						</div>
					))
				)}
			</div>
			<div className="flex justify-end">
				<Button
					onClick={() => {
						setShowForm(true);
						setEditingReminder(null);
						reset();
					}}
				>
					Add Reminder
					<Plus />
				</Button>
			</div>
		</div>
	);
}
