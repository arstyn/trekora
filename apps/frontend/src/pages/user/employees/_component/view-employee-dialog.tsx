import StatusBadge from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFileUrl } from "@/lib/utils";
import type { IEmployee } from "@/types/employee.types";
import { PermissionService } from "@/services/permission.service";
import { format } from "date-fns";
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PermissionSet } from "@/types/permission.types";

type ViewEmployeeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: IEmployee | null;
	onEdit?: (employee: IEmployee) => void;
};

export function ViewEmployeeDialog({
	open,
	onOpenChange,
	employee,
	onEdit,
}: ViewEmployeeDialogProps) {
	const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
	const [loadingPermissionSets, setLoadingPermissionSets] = useState(false);

	useEffect(() => {
		if (open && employee?.id) {
			loadPermissionSets();
		}
	}, [open, employee?.id]);

	const loadPermissionSets = async () => {
		if (!employee?.id) return;
		try {
			setLoadingPermissionSets(true);
			const sets = await PermissionService.getPermissionSetsForEmployee(employee.id);
			setPermissionSets(sets);
		} catch (error) {
			console.error("Failed to load permission sets:", error);
			toast.error("Failed to load permission sets");
		} finally {
			setLoadingPermissionSets(false);
		}
	};

	if (!employee) return null;

	// Format join date
	const formattedDate = employee.joinDate
		? format(new Date(employee.joinDate), "PPP")
		: "";

	// Format date of birth
	const formattedDOB = employee.dateOfBirth
		? format(new Date(employee.dateOfBirth), "PPP")
		: "";

	// Helper for empty fields
	const display = (value?: string | number | boolean | null) =>
		value !== undefined && value !== null && value !== "" ? (
			value
		) : (
			<span className="text-muted-foreground italic">N/A</span>
		);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center justify-between">
						Employee Details
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="flex-1 min-h-0">
					<div className="space-y-8 pr-4">
						<div className="flex items-center border-b pb-4">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={(() => {
										if (employee.profilePhoto) {
											return getFileUrl(
												getServeFileUrl(employee.profilePhoto)
											);
										}
										return "/placeholder.svg";
									})()}
									alt={employee.name}
									className="object-cover w-full h-full"
								/>
								<AvatarFallback className="text-lg">
									{employee.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="flex items-center justify-between w-full px-4">
								<div>
									<h3 className="text-xl font-semibold">{employee.name}</h3>
									<p className="text-sm text-muted-foreground">
										{employee.email}
									</p>
								</div>
								<StatusBadge status={employee.status} />
							</div>
						</div>

						<div className="max-h-[50vh] overflow-auto space-y-5">
							<div className="grid grid-cols-2 gap-6 ">
								<div className="space-y-3">
									<Detail label="Employee ID" value={employee.id} />
									<Detail
										label="Branch"
										value={display(employee.branch?.name)}
									/>
									<Detail
										label="Role"
										value={display(employee.role?.name)}
									/>
									<Detail
										label="Manager"
										value={display(employee.manager?.name)}
									/>
									<Detail
										label="Organization"
										value={display(employee.organization?.name)}
									/>
									<Detail label="Email" value={display(employee.email)} />
									<Detail label="Phone" value={display(employee.phone)} />
									<Detail
										label="Marital Status"
										value={display(employee.maritalStatus)}
									/>
									<Detail
										label="Address"
										value={display(employee.address)}
									/>
									<Detail
										label="Date of Birth"
										value={display(formattedDOB)}
									/>
									<Detail label="Gender" value={display(employee.gender)} />
								</div>

								<div className="space-y-3">
									<Detail
										label="Nationality"
										value={display(employee.nationality)}
									/>
									<Detail
										label="Experience"
										value={display(employee.experience)}
									/>
									<Detail
										label="Additional Info"
										value={display(employee.additional_info)}
									/>
									<Detail
										label="Nationality"
										value={display(employee.nationality)}
									/>

									<Detail
										label="Join Date"
										value={display(formattedDate)}
									/>
									<Detail
										label="Employment Duration"
										value={
											employee.joinDate &&
											calculateDuration(employee.joinDate)
										}
									/>
									<Detail
										label="Created At"
										value={format(new Date(employee.createdAt), "PPP")}
									/>
									<Detail
										label="Updated At"
										value={format(new Date(employee.updatedAt), "PPP")}
									/>
									<div>
										<p className="text-xs font-medium text-muted-foreground">
											Status
										</p>
										<StatusBadge status={employee.status} />
									</div>
								</div>
							</div>

							{employee.employeeDepartments &&
								employee.employeeDepartments.length > 0 && (
									<div>
										<p className="text-sm font-medium text-muted-foreground mb-1">
											Departments
										</p>
										<ul className="list-disc list-inside text-sm">
											{employee.employeeDepartments.map((dep, idx) => (
												<li key={idx}>
													{dep.department.name || "N/A"}
												</li>
											))}
										</ul>
									</div>
								)}

							<div>
								<p className="text-sm font-medium text-muted-foreground mb-2">
									Permission Sets
								</p>
								{loadingPermissionSets ? (
									<p className="text-sm text-muted-foreground">Loading...</p>
								) : permissionSets.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{permissionSets.map((set) => (
											<Badge key={set.id} variant="secondary">
												{set.name}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground italic">
										No permission sets assigned
									</p>
								)}
							</div>
						</div>
					</div>
				</ScrollArea>

				<div className="pt-4 flex justify-end gap-2 border-t flex-shrink-0">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					{onEdit && employee && (
						<Button
							onClick={() => {
								onEdit(employee);
								onOpenChange(false);
							}}
						>
							Edit Employee
						</Button>
					)}
				</div>
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
	if (months < 0) {
		years--;
		months += 12;
	}

	if (years > 0) {
		return `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"
			}`;
	} else {
		return `${months} ${months === 1 ? "month" : "months"}`;
	}
}
