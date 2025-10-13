import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ILead } from "@/types/lead/lead.entity";
import { leadSchema, type LeadFormDTO } from "@/types/lead/lead.schema";
import type { IPackages } from "@/types/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Package, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface LeadFormProps {
	lead?: ILead;
	isCreating: boolean;
	onSave: (isCreating: boolean, lead: ILead) => void;
	onClose?: (open: boolean) => void;
	setOpenCustomerCreateModal?: (open: boolean) => void;
}

export function LeadForm({
	lead,
	isCreating,
	onSave,
	onClose,
	setOpenCustomerCreateModal,
}: LeadFormProps) {
	const [loading, setLoading] = useState(false);
	const [packages, setPackages] = useState<IPackages[]>([]);
	const [openPackageSelect, setOpenPackageSelect] = useState(false);
	const [openConsideredSelect, setOpenConsideredSelect] = useState(false);
	const [packageSearch, setPackageSearch] = useState("");
	const [consideredSearch, setConsideredSearch] = useState("");

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(leadSchema),
		defaultValues: {
			name: "",
			company: "",
			email: undefined,
			phone: "",
			status: "new" as const,
			notes: "",
			preferredPackageId: undefined,
			consideredPackageIds: [],
			numberOfPassengers: 1,
		},
	});

	const consideredPackageIds = watch("consideredPackageIds");

	// Fetch packages on component mount
	useEffect(() => {
		const fetchPackages = async () => {
			try {
				const res = await axiosInstance.get<IPackages[]>("/packages");
				setPackages(res.data.filter((pkg) => pkg.status === "published"));
			} catch (error) {
				console.error("Failed to fetch packages:", error);
				toast.error("Failed to load packages");
			}
		};
		fetchPackages();
	}, []);

	useEffect(() => {
		if (lead && !isCreating) {
			reset({
				name: lead.name,
				company: lead.company,
				email: lead.email,
				phone: lead.phone,
				status: lead.status,
				notes: lead.notes,
				preferredPackageId: lead.preferredPackageId,
				consideredPackageIds: lead.consideredPackageIds || [],
				numberOfPassengers: lead.numberOfPassengers || 1,
			});
		} else if (isCreating) {
			reset({
				name: "",
				company: "",
				email: "",
				phone: "",
				status: "new",
				notes: "",
				preferredPackageId: undefined,
				consideredPackageIds: [],
				numberOfPassengers: 1,
			});
		}
	}, [lead, isCreating, reset]);

	const onSubmit = async (data: LeadFormDTO) => {
		setLoading(true);
		if (isCreating) {
			try {
				const res = await axiosInstance.post<ILead>("/lead", data);

				onSave(isCreating, res.data);
				if (onClose) {
					onClose(false);
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		} else if (lead) {
			try {
				const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, data);
				if (res) {
					onSave(isCreating, { ...lead, ...res.data });
					if (onClose) {
						onClose(false);
					}
				}
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		}
		if (data.status === "converted" && setOpenCustomerCreateModal) {
			setOpenCustomerCreateModal(true);
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Controller
							name="name"
							control={control}
							render={({ field }) => <Input id="name" {...field} />}
						/>
						{errors.name && (
							<span className="text-red-500 text-sm">
								{errors.name.message}
							</span>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="company">Company</Label>
						<Controller
							name="company"
							control={control}
							render={({ field }) => <Input id="company" {...field} />}
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<Input id="email" type="email" {...field} />
							)}
						/>
						{errors.email && (
							<span className="text-red-500 text-sm">
								{errors.email.message}
							</span>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="phone">Phone</Label>
						<Controller
							name="phone"
							control={control}
							render={({ field }) => <Input id="phone" {...field} />}
						/>
					</div>
				</div>

				{/* Package Preferences Section */}
				<div className="space-y-4 pt-4 border-t">
					<div className="flex items-center gap-2 text-sm font-medium">
						<Package className="size-4" />
						<span>Package Preferences</span>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Preferred Package */}
						<div className="space-y-2">
							<Label htmlFor="preferredPackageId">Preferred Package</Label>
							<Controller
								name="preferredPackageId"
								control={control}
								render={({ field }) => (
									<Popover
										open={openPackageSelect}
										onOpenChange={setOpenPackageSelect}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={openPackageSelect}
												className="w-full justify-between"
											>
												{field.value
													? packages.find(
															(pkg) =>
																pkg.id === field.value
													  )?.name
													: "Select package..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-[400px] p-0"
											align="start"
										>
											<div className="p-3 border-b">
												<div className="relative">
													<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="Search packages..."
														value={packageSearch}
														onChange={(e) =>
															setPackageSearch(
																e.target.value
															)
														}
														className="pl-8"
													/>
												</div>
											</div>
											<ScrollArea className="h-72">
												<div className="p-2">
													{packages.filter((pkg) =>
														pkg.name
															?.toLowerCase()
															.includes(
																packageSearch.toLowerCase()
															)
													).length > 0 ? (
														<div className="space-y-1">
															{packages
																.filter((pkg) =>
																	pkg.name
																		?.toLowerCase()
																		.includes(
																			packageSearch.toLowerCase()
																		)
																)
																.map((pkg) => (
																	<div
																		key={pkg.id}
																		className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			field.onChange(
																				pkg.id
																			);
																			setOpenPackageSelect(
																				false
																			);
																			setPackageSearch(
																				""
																			);
																		}}
																	>
																		<div className="flex-1 min-w-0">
																			<p className="text-sm font-medium truncate">
																				{pkg.name}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				₹
																				{
																					pkg.price
																				}
																			</p>
																		</div>
																		{field.value ===
																			pkg.id && (
																			<Check className="h-4 w-4 text-primary" />
																		)}
																	</div>
																))}
														</div>
													) : (
														<div className="text-center py-4 text-muted-foreground">
															No packages found
														</div>
													)}
												</div>
											</ScrollArea>
										</PopoverContent>
									</Popover>
								)}
							/>
							{errors.preferredPackageId && (
								<span className="text-red-500 text-sm">
									{errors.preferredPackageId.message}
								</span>
							)}
						</div>

						{/* Number of Passengers */}
						<div className="space-y-2">
							<Label htmlFor="numberOfPassengers">
								<div className="flex items-center gap-2">
									<Users className="size-4" />
									Number of Passengers
								</div>
							</Label>
							<Controller
								name="numberOfPassengers"
								control={control}
								render={({ field }) => (
									<Input
										id="numberOfPassengers"
										type="number"
										min="1"
										{...field}
										onChange={(e) =>
											field.onChange(
												Number.parseInt(e.target.value) || 1
											)
										}
									/>
								)}
							/>
							{errors.numberOfPassengers && (
								<span className="text-red-500 text-sm">
									{errors.numberOfPassengers.message}
								</span>
							)}
						</div>
					</div>

					{/* Considered Packages */}
					<div className="space-y-2">
						<Label htmlFor="consideredPackageIds">Considered Packages</Label>
						<Controller
							name="consideredPackageIds"
							control={control}
							render={({ field }) => (
								<Popover
									open={openConsideredSelect}
									onOpenChange={setOpenConsideredSelect}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={openConsideredSelect}
											className="w-full justify-between"
										>
											{field.value && field.value.length > 0
												? `${field.value.length} package(s) selected`
												: "Select packages..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-[400px] p-0"
										align="start"
									>
										<div className="p-3 border-b">
											<div className="relative">
												<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Search packages..."
													value={consideredSearch}
													onChange={(e) =>
														setConsideredSearch(
															e.target.value
														)
													}
													className="pl-8"
												/>
											</div>
										</div>
										<ScrollArea className="h-72">
											<div className="p-2">
												{packages.filter((pkg) =>
													pkg.name
														?.toLowerCase()
														.includes(
															consideredSearch.toLowerCase()
														)
												).length > 0 ? (
													<div className="space-y-1">
														{packages
															.filter((pkg) =>
																pkg.name
																	?.toLowerCase()
																	.includes(
																		consideredSearch.toLowerCase()
																	)
															)
															.map((pkg) => {
																const isSelected =
																	field.value?.includes(
																		pkg.id
																	) || false;
																return (
																	<div
																		key={pkg.id}
																		className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			const newValue =
																				isSelected
																					? field.value?.filter(
																							(
																								id
																							) =>
																								id !==
																								pkg.id
																					  ) ||
																					  []
																					: [
																							...(field.value ||
																								[]),
																							pkg.id,
																					  ];
																			field.onChange(
																				newValue
																			);
																		}}
																	>
																		<Checkbox
																			checked={
																				isSelected
																			}
																			onCheckedChange={() => {}}
																		/>
																		<div className="flex-1 min-w-0">
																			<p className="text-sm font-medium truncate">
																				{pkg.name}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				₹
																				{
																					pkg.price
																				}
																			</p>
																		</div>
																	</div>
																);
															})}
													</div>
												) : (
													<div className="text-center py-4 text-muted-foreground">
														No packages found
													</div>
												)}
											</div>
										</ScrollArea>
									</PopoverContent>
								</Popover>
							)}
						/>
						{errors.consideredPackageIds && (
							<span className="text-red-500 text-sm">
								{errors.consideredPackageIds.message}
							</span>
						)}
						{consideredPackageIds && consideredPackageIds.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{consideredPackageIds.map((pkgId) => {
									const pkg = packages.find((p) => p.id === pkgId);
									return pkg ? (
										<div
											key={pkgId}
											className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md"
										>
											{pkg.name}
										</div>
									) : null;
								})}
							</div>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="status">Status</Label>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="new">New</SelectItem>
									<SelectItem value="contacted">Contacted</SelectItem>
									<SelectItem value="qualified">Qualified</SelectItem>
									<SelectItem value="lost">Lost</SelectItem>
									<SelectItem value="converted">Converted</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Controller
						name="notes"
						control={control}
						render={({ field }) => (
							<Textarea id="notes" rows={5} {...field} />
						)}
					/>
				</div>
			</div>
			<div className="pt-4 pr-4 flex justify-end gap-2 border-t">
				<Button
					variant="outline"
					onClick={() => {
						if (onClose) {
							onClose(false);
						}
					}}
					type="button"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? "Loading..." : isCreating ? "Create Lead" : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
