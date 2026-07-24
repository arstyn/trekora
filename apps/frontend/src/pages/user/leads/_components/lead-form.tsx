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
import { Check, ChevronsUpDown, IndianRupee, Package, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface LeadFormProps {
	lead?: ILead;
	isCreating: boolean;
	onSave: (isCreating: boolean, lead: ILead) => void;
	onClose?: (open: boolean) => void;
	setOpenCustomerCreateModal?: (open: boolean) => void;
	defaultLeadType?: "individual" | "company";
}

export function LeadForm({
	lead,
	isCreating,
	onSave,
	onClose,
	setOpenCustomerCreateModal,
	defaultLeadType,
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
		trigger,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(leadSchema),
		defaultValues: {
			name: "",
			leadType: defaultLeadType || "individual",
			company: "",
			companyWebsite: "",
			companyIndustry: "",
			contactDesignation: "",
			companySize: "",
			email: undefined,
			phone: "",
			status: "new" as const,
			notes: "",
			preferredPackageId: undefined,
			consideredPackageIds: [],
			isCustomPackage: false,
			customPackageName: "",
			customPackageDestination: "",
			customPackageDays: undefined,
			customPackageNights: undefined,
			customPackagePrice: undefined,
			customPackageDescription: "",
			budget: undefined,
			numberOfPassengers: 1,
		},
	});

	const consideredPackageIds = watch("consideredPackageIds");
	const currentLeadType = watch("leadType");
	const isCustomPackage = watch("isCustomPackage");

	const [companyStep, setCompanyStep] = useState<number>(1);

	const handleNextStep1 = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const isValid = await trigger(["company", "companyWebsite", "companyIndustry", "companySize"]);
		if (isValid) {
			setCompanyStep(2);
		}
	};

	const handleNextStep2 = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const isValid = await trigger(["name", "contactDesignation", "email", "phone"]);
		if (isValid) {
			setCompanyStep(3);
		}
	};

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
				leadType: lead.leadType || "individual",
				company: lead.company || "",
				companyWebsite: lead.companyWebsite || "",
				companyIndustry: lead.companyIndustry || "",
				contactDesignation: lead.contactDesignation || "",
				companySize: lead.companySize || "",
				email: lead.email,
				phone: lead.phone,
				status: lead.status,
				notes: lead.notes,
				preferredPackageId: lead.preferredPackageId,
				consideredPackageIds: lead.consideredPackageIds || [],
				isCustomPackage: lead.isCustomPackage || false,
				customPackageName: lead.customPackageName || "",
				customPackageDestination: lead.customPackageDestination || "",
				customPackageDays: lead.customPackageDays,
				customPackageNights: lead.customPackageNights,
				customPackagePrice: lead.customPackagePrice,
				customPackageDescription: lead.customPackageDescription || "",
				budget: lead.budget,
				numberOfPassengers: lead.numberOfPassengers || 1,
			});
		} else if (isCreating) {
			reset({
				name: "",
				leadType: defaultLeadType || "individual",
				company: "",
				companyWebsite: "",
				companyIndustry: "",
				contactDesignation: "",
				companySize: "",
				email: "",
				phone: "",
				status: "new",
				notes: "",
				preferredPackageId: undefined,
				consideredPackageIds: [],
				isCustomPackage: false,
				customPackageName: "",
				customPackageDestination: "",
				customPackageDays: undefined,
				customPackageNights: undefined,
				customPackagePrice: undefined,
				customPackageDescription: "",
				budget: undefined,
				numberOfPassengers: 1,
			});
		}
	}, [lead, isCreating, reset, defaultLeadType]);

	const onSubmit = async (data: LeadFormDTO) => {
		setLoading(true);
		const isCustom = data.isCustomPackage && currentLeadType === "company";
		const cleanedData = {
			...data,
			email: data.email || undefined,
			phone: data.phone || undefined,
			company: data.company || undefined,
			companyWebsite: data.companyWebsite || undefined,
			companyIndustry: data.companyIndustry || undefined,
			contactDesignation: data.contactDesignation || undefined,
			companySize: data.companySize || undefined,
			notes: data.notes || undefined,
			isCustomPackage: isCustom,
			preferredPackageId: isCustom ? null : (data.preferredPackageId || null),
			consideredPackageIds: isCustom ? [] : (data.consideredPackageIds || []),
			customPackageName: isCustom ? (data.customPackageName || null) : null,
			customPackageDestination: isCustom ? (data.customPackageDestination || null) : null,
			customPackageDays: isCustom ? (data.customPackageDays !== undefined && (data.customPackageDays as string | number) !== "" ? Number(data.customPackageDays) : null) : null,
			customPackageNights: isCustom ? (data.customPackageNights !== undefined && (data.customPackageNights as string | number) !== "" ? Number(data.customPackageNights) : null) : null,
			customPackagePrice: isCustom ? (data.customPackagePrice !== undefined && (data.customPackagePrice as string | number) !== "" ? Number(data.customPackagePrice) : null) : null,
			customPackageDescription: isCustom ? (data.customPackageDescription || null) : null,
			budget: isCustom ? (data.budget !== undefined && (data.budget as string | number) !== "" ? Number(data.budget) : null) : null,
		};

		if (isCreating) {
			try {
				const res = await axiosInstance.post<ILead>("/lead", cleanedData);

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
				const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, cleanedData);
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
			{currentLeadType === "company" && (
				<div className="flex items-center justify-between border-b pb-4 text-xs font-medium text-muted-foreground select-none">
					<button
						type="button"
						onClick={() => companyStep > 1 && setCompanyStep(1)}
						className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${companyStep === 1 ? "text-primary font-semibold" : ""}`}
					>
						<span className={`inline-flex items-center justify-center size-5 rounded-full border text-[10px] ${companyStep === 1 ? "border-primary bg-primary text-primary-foreground font-bold" : "border-muted-foreground"}`}>
							1
						</span>
						Company Info
					</button>
					<div className="h-px bg-border flex-1 mx-4" />
					<button
						type="button"
						onClick={() => companyStep > 2 && setCompanyStep(2)}
						className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${companyStep === 2 ? "text-primary font-semibold" : ""}`}
						disabled={companyStep < 2}
					>
						<span className={`inline-flex items-center justify-center size-5 rounded-full border text-[10px] ${companyStep === 2 ? "border-primary bg-primary text-primary-foreground font-bold" : "border-muted-foreground"}`}>
							2
						</span>
						Contact Person
					</button>
					<div className="h-px bg-border flex-1 mx-4" />
					<button
						type="button"
						className={`flex items-center gap-1.5 transition-colors ${companyStep === 3 ? "text-primary font-semibold" : ""}`}
						disabled={companyStep < 3}
					>
						<span className={`inline-flex items-center justify-center size-5 rounded-full border text-[10px] ${companyStep === 3 ? "border-primary bg-primary text-primary-foreground font-bold" : "border-muted-foreground"}`}>
							3
						</span>
						Requirements
					</button>
				</div>
			)}

			<div className="space-y-4">
				{currentLeadType === "company" ? (
					<>
						{companyStep === 1 && (
							<div className="space-y-4">
								{/* Company Details */}
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="company">Company Name</Label>
										<Controller
											name="company"
											control={control}
											render={({ field }) => (
												<Input id="company" placeholder="e.g. Acme Corp" {...field} value={field.value ?? ""} />
											)}
										/>
										{errors.company && (
											<span className="text-red-500 text-sm">
												{errors.company.message}
											</span>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="companyWebsite">Company Website</Label>
										<Controller
											name="companyWebsite"
											control={control}
											render={({ field }) => (
												<Input id="companyWebsite" placeholder="e.g. www.acme.com" {...field} value={field.value ?? ""} />
											)}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="companyIndustry">Industry</Label>
										<Controller
											name="companyIndustry"
											control={control}
											render={({ field }) => (
												<Input id="companyIndustry" placeholder="e.g. Technology, Finance" {...field} value={field.value ?? ""} />
											)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="companySize">Company Size</Label>
										<Controller
											name="companySize"
											control={control}
											render={({ field }) => (
												<Select value={field.value ?? undefined} onValueChange={field.onChange}>
													<SelectTrigger id="companySize">
														<SelectValue placeholder="Select size..." />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1-10">1-10 employees</SelectItem>
														<SelectItem value="11-50">11-50 employees</SelectItem>
														<SelectItem value="51-200">51-200 employees</SelectItem>
														<SelectItem value="201-500">201-500 employees</SelectItem>
														<SelectItem value="501+">501+ employees</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
								</div>
							</div>
						)}

						{companyStep === 2 && (
							<div className="space-y-4">
								{/* Contact Info */}
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Contact Person Name</Label>
										<Controller
											name="name"
											control={control}
											render={({ field }) => (
												<Input id="name" placeholder="Contact person's full name" {...field} />
											)}
										/>
										{errors.name && (
											<span className="text-red-500 text-sm">
												{errors.name.message}
											</span>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="contactDesignation">Contact Designation</Label>
										<Controller
											name="contactDesignation"
											control={control}
											render={({ field }) => (
												<Input id="contactDesignation" placeholder="e.g. HR Manager, CEO" {...field} value={field.value ?? ""} />
											)}
										/>
									</div>
								</div>

								{/* Shared contact information in Step 2 */}
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<Controller
											name="email"
											control={control}
											render={({ field }) => (
												<Input id="email" type="email" placeholder="email@example.com" {...field} value={field.value ?? ""} />
											)}
										/>
										{errors.email && (
											<span className="text-red-500 text-sm">
												{errors.email.message}
											</span>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Controller
											name="phone"
											control={control}
											render={({ field }) => (
												<Input id="phone" placeholder="Phone number" {...field} value={field.value ?? ""} />
											)}
										/>
									</div>
								</div>
							</div>
						)}
					</>
				) : (
					<>
						{/* Individual Details */}
						<div className="space-y-4">
							<div className="">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Controller
										name="name"
										control={control}
										render={({ field }) => (
											<Input id="name" placeholder="Traveler's full name" {...field} />
										)}
									/>
									{errors.name && (
										<span className="text-red-500 text-sm">
											{errors.name.message}
										</span>
									)}
								</div>
							</div>

							{/* Shared contact information for individual */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Controller
										name="email"
										control={control}
										render={({ field }) => (
											<Input id="email" type="email" placeholder="email@example.com" {...field} value={field.value ?? ""} />
										)}
									/>
									{errors.email && (
										<span className="text-red-500 text-sm">
											{errors.email.message}
										</span>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Controller
										name="phone"
										control={control}
										render={({ field }) => (
											<Input id="phone" placeholder="Phone number" {...field} value={field.value ?? ""} />
										)}
									/>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Step 3 (for company) or Main (for individual) package preferences and details */}
				{(currentLeadType !== "company" || companyStep === 3) && (
					<div className="space-y-4">
						{/* Package Preferences Section */}
						<div className={`space-y-4 ${currentLeadType !== "company" ? "pt-4 border-t" : ""}`}>
							<div className="flex items-center gap-2 text-sm font-medium">
								<Package className="size-4" />
								<span>Package Preferences</span>
							</div>

							{currentLeadType === "company" && (
								<div className="space-y-2">
									<Label>Package Preference Type</Label>
									<Controller
										name="isCustomPackage"
										control={control}
										render={({ field }) => (
											<div className="flex gap-4">
												<label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-md hover:bg-accent/40 w-1/2 justify-center transition-all select-none ${!field.value ? "border-primary bg-primary/5" : ""}`}>
													<input
														type="radio"
														name="packageType"
														checked={!field.value}
														onChange={() => field.onChange(false)}
														className="text-primary focus:ring-primary h-4 w-4"
													/>
													<span className="text-sm font-medium">Existing Package</span>
												</label>
												<label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-md hover:bg-accent/40 w-1/2 justify-center transition-all select-none ${field.value ? "border-primary bg-primary/5" : ""}`}>
													<input
														type="radio"
														name="packageType"
														checked={field.value}
														onChange={() => field.onChange(true)}
														className="text-primary focus:ring-primary h-4 w-4"
													/>
													<span className="text-sm font-medium">Custom Package</span>
												</label>
											</div>
										)}
									/>
								</div>
							)}

							{isCustomPackage && currentLeadType === "company" ? (
								<div className="space-y-4 border p-4 rounded-md bg-muted/20">
									<h4 className="text-sm font-semibold text-primary">Custom Package Details</h4>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="customPackageName">Package Name</Label>
											<Controller
												name="customPackageName"
												control={control}
												render={({ field }) => (
													<Input id="customPackageName" placeholder="e.g. Annual Retreat Package" {...field} value={field.value ?? ""} />
												)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="customPackageDestination">Destination</Label>
											<Controller
												name="customPackageDestination"
												control={control}
												render={({ field }) => (
													<Input id="customPackageDestination" placeholder="e.g. Goa, Manali" {...field} value={field.value ?? ""} />
												)}
											/>
										</div>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label htmlFor="customPackageDays">Days</Label>
											<Controller
												name="customPackageDays"
												control={control}
												render={({ field }) => (
													<Input
														id="customPackageDays"
														type="number"
														min="0"
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
													/>
												)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="customPackageNights">Nights</Label>
											<Controller
												name="customPackageNights"
												control={control}
												render={({ field }) => (
													<Input
														id="customPackageNights"
														type="number"
														min="0"
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
													/>
												)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="customPackagePrice">Estimated Price (₹)</Label>
											<Controller
												name="customPackagePrice"
												control={control}
												render={({ field }) => (
													<Input
														id="customPackagePrice"
														type="number"
														min="0"
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
													/>
												)}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="customPackageDescription">Requirements / Description</Label>
										<Controller
											name="customPackageDescription"
											control={control}
											render={({ field }) => (
												<Textarea
													id="customPackageDescription"
													rows={4}
													placeholder="Detail what type of custom package components (accommodation, activities, dining preference etc.) the company requires."
													{...field}
													value={field.value ?? ""}
												/>
											)}
										/>
									</div>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										{/* Number of passengers for custom package */}
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
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
													/>
												)}
											/>
										</div>

										{/* Budget for custom package */}
										<div className="space-y-2">
											<Label htmlFor="budget">
												<div className="flex items-center gap-2">
													<IndianRupee className="size-4" />
													Client Budget (₹)
												</div>
											</Label>
											<Controller
												name="budget"
												control={control}
												render={({ field }) => (
													<Input
														id="budget"
														type="number"
														min="0"
														placeholder="e.g. 50000"
														{...field}
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
													/>
												)}
											/>
										</div>
									</div>
								</div>
							) : (
								<>
									{/* Existing Package inputs */}
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
																								{pkg.packageTiers?.[0]?.adultCost}
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
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value === "" ? "" : Number(e.target.value)
															)
														}
														onWheel={(e) => e.currentTarget.blur()}
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
														id="consideredPackagesContent"
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
																							onCheckedChange={() => { }}
																						/>
																						<div className="flex-1 min-w-0">
																							<p className="text-sm font-medium truncate">
																								{pkg.name}
																							</p>
																							<p className="text-xs text-muted-foreground">
																								₹
																								{pkg.packageTiers?.[0]?.adultCost}
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
								</>
							)}
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
									<Textarea id="notes" rows={5} {...field} value={field.value ?? ""} />
								)}
							/>
							{errors.notes && (
								<span className="text-red-500 text-sm">
									{errors.notes.message}
								</span>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="pt-4 pr-4 flex justify-between items-center border-t">
				<div>
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
				</div>
				<div className="flex gap-2">
					{currentLeadType === "company" ? (
						<>
							{companyStep > 1 && (
								<Button
									variant="outline"
									onClick={() => setCompanyStep((prev) => prev - 1)}
									type="button"
								>
									Back
								</Button>
							)}
							{companyStep < 3 ? (
								<Button
									key={`next-btn-step-${companyStep}`}
									onClick={(e) => companyStep === 1 ? handleNextStep1(e) : handleNextStep2(e)}
									type="button"
								>
									Next
								</Button>
							) : (
								<Button key="company-submit-btn" type="submit" disabled={loading}>
									{loading ? "Loading..." : isCreating ? "Create Lead" : "Save Changes"}
								</Button>
							)}
						</>
					) : (
						<Button key="individual-submit-btn" type="submit" disabled={loading}>
							{loading ? "Loading..." : isCreating ? "Create Lead" : "Save Changes"}
						</Button>
					)}
				</div>
			</div>
		</form>
	);
}
