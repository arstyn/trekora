import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { IPackages } from "@/types/package.schema";
import { CalendarIcon, X } from "lucide-react";
import type React from "react";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface CreateBatchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateBatchDialog({ open, onOpenChange }: CreateBatchDialogProps) {
	const [packages, setPackages] = useState<IPackages[]>([]);
	const [employees, setEmployees] = useState<IEmployee[]>([]);

	const [formData, setFormData] = useState({
		packageId: "",
		startDate: "",
		endDate: "",
		totalSeats: "",
		coordinators: [] as IEmployee[],
	});

	useLayoutEffect(() => {
		const getData = async () => {
			try {
				const [packagesRes, employeesRes] = await Promise.all([
					axiosInstance.get(`/packages?status=published`),
					axiosInstance.get(`/employee`),
				]);

				setPackages(packagesRes.data);
				setEmployees(employeesRes.data);
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load data");
				}
			}
		};

		getData();
	}, []);

	const removeCoordinator = (index: number) => {
		setFormData((prev) => ({
			...prev,
			coordinators: prev.coordinators.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const payload = {
				...formData,
				coordinators: formData.coordinators.map((c) => c.id),
			};
			await axiosInstance.post(`/batches`, payload);

			onOpenChange(false);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load batches");
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Create New Batch</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="">
					{/* Basic Information */}
					<ScrollArea className="flex max-h-96 flex-col overflow-y-auto pr-3 pb-2">
						<div className="space-y-2">
							<Label htmlFor="package">Tour Package</Label>
							<Select
								value={formData.packageId}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										packageId: value,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a package" />
								</SelectTrigger>
								<SelectContent>
									{packages &&
										packages.length > 0 &&
										packages.map((pkg) => (
											<SelectItem value={pkg.id}>
												{pkg.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startDate">Start Date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={`w-full pl-3 text-left font-normal ${
												!formData.startDate
													? "text-muted-foreground"
													: ""
											}`}
										>
											{formData.startDate &&
											!isNaN(
												new Date(formData.startDate).getTime()
											) ? (
												format(
													new Date(formData.startDate),
													"PPP"
												)
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={new Date(formData.startDate)}
											onSelect={(date) => {
												if (date) {
													setFormData((prev) => ({
														...prev,
														startDate: date
															.toISOString()
															.split("T")[0],
													}));
												}
											}}
											disabled={(date) =>
												date < new Date("1900-01-01")
											}
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">End Date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={`w-full pl-3 text-left font-normal ${
												!formData.endDate
													? "text-muted-foreground"
													: ""
											}`}
										>
											{formData.endDate &&
											!isNaN(
												new Date(formData.endDate).getTime()
											) ? (
												format(new Date(formData.endDate), "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={new Date(formData.endDate)}
											onSelect={(date) => {
												if (date) {
													setFormData((prev) => ({
														...prev,
														endDate: date
															.toISOString()
															.split("T")[0],
													}));
												}
											}}
											disabled={(date) =>
												date < new Date("1900-01-01")
											}
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<div className="space-y-2 mt-2">
							<Label htmlFor="totalSeats">Total Seats</Label>
							<Input
								id="totalSeats"
								type="number"
								min="1"
								value={formData.totalSeats}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										totalSeats: e.target.value,
									}))
								}
								required
							/>
						</div>

						{/* Add New Coordinator */}
						<div className="space-y-2 mt-2">
							<Label>Add Coordinators</Label>
							<Select
								onValueChange={(value) => {
									const selected = employees?.find(
										(e) => e.id === value
									);
									if (
										selected &&
										!formData.coordinators.find(
											(c) => c.id === selected.id
										)
									) {
										setFormData((prev) => ({
											...prev,
											coordinators: [
												...prev.coordinators,
												selected,
											],
										}));
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select employee to add" />
								</SelectTrigger>
								<SelectContent>
									{employees?.map((emp) => (
										<SelectItem key={emp.id} value={emp.id}>
											{emp.name} ({emp.role.name})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Coordinators */}

						<div className="mt-2">
							{/* Existing Coordinators */}
							{formData.coordinators.length > 0 && (
								<div className="space-y-2 mt-2">
									<Label>Coordinators</Label>
									{formData.coordinators.map((coordinator, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div>
													<p className="font-medium">
														{coordinator.name}
													</p>
													<p className="text-sm text-muted-foreground">
														{coordinator.phone} •{" "}
														{coordinator.email}
													</p>
												</div>
												<Badge variant="outline">
													{coordinator.role.name}
												</Badge>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeCoordinator(index)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</ScrollArea>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create Batch</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
