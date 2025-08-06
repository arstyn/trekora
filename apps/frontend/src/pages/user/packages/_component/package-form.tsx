import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { uploadSingleFile, deleteFile, getFileUrl as getServeFileUrl, type FileUploadResponse } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import { packageFormSchema, type PackageFormData } from "@/types/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Plus, Save, Trash2, Upload, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

interface PackageFormProps {
	isEditing?: boolean;
	packageId?: string;
	onSuccess?: () => void;
}

const defaultValues: PackageFormData = {
	name: "",
	destination: "",
	duration: "",
	price: 0,
	description: "",
	maxGuests: 0,
	startDate: undefined,
	endDate: undefined,
	difficulty: "easy",
	category: "adventure",
	inclusions: [],
	exclusions: [],
	status: "draft",
	thumbnail: "",
	itinerary: [
		{
			day: 1,
			title: "",
			description: "",
			activities: [""],
			meals: [],
			accommodation: "",
			images: [],
		},
	],
	paymentStructure: [
		{
			name: "Booking Advance",
			percentage: 10,
			description: "Initial booking amount",
			dueDate: "booking",
		},
		{
			name: "Confirmation",
			percentage: 40,
			description: "Confirmation payment",
			dueDate: "30_days_before",
		},
		{
			name: "Pre-departure",
			percentage: 50,
			description: "Final payment",
			dueDate: "2_weeks_before",
		},
	],
	cancellationStructure: [
		{
			timeframe: "30+ days before",
			percentage: 10,
			description: "Minimal cancellation fee",
		},
		{
			timeframe: "15-29 days before",
			percentage: 25,
			description: "Standard cancellation fee",
		},
		{
			timeframe: "7-14 days before",
			percentage: 50,
			description: "High cancellation fee",
		},
		{
			timeframe: "Less than 7 days",
			percentage: 100,
			description: "No refund",
		},
	],
	cancellationPolicy: [
		"Cancellation must be made in writing",
		"Refunds will be processed within 7-10 business days",
		"Travel insurance is recommended",
	],
	mealsBreakdown: {
		breakfast: ["Continental breakfast", "Fresh fruits", "Coffee/Tea"],
		lunch: ["Local cuisine", "Vegetarian options available"],
		dinner: ["3-course dinner", "Local specialties", "Beverages included"],
	},
	transportation: {
		toDestination: { mode: "flight", details: "", included: false },
		fromDestination: { mode: "flight", details: "", included: false },
		duringTrip: { mode: "bus", details: "", included: true },
	},
	documentRequirements: [
		{
			name: "Valid Passport",
			description: "Passport valid for at least 6 months",
			mandatory: true,
			applicableFor: "all",
		},
		{
			name: "Visa",
			description: "Tourist visa for destination country",
			mandatory: true,
			applicableFor: "all",
		},
	],
	preTripChecklist: [
		{
			task: "Collect all documents",
			description: "Verify all required documents are collected",
			category: "documents",
			dueDate: "2_weeks_before",
			completed: false,
		},
		{
			task: "Confirm bookings",
			description: "Confirm all hotel and transport bookings",
			category: "booking",
			dueDate: "1_week_before",
			completed: false,
		},
	],
	packageLocation: {
		type: "international",
		country: "",
		state: "",
	},
};

export function PackageForm({
	isEditing = false,
	packageId: initialPackageId,
	onSuccess,
}: PackageFormProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [isLoading, setIsLoading] = useState(false);
	const [packageId, setPackageId] = useState<string | undefined>(initialPackageId);
	const [currentPackage, setCurrentPackage] = useState<PackageFormData | null>(null);
	const [isDraftCreated, setIsDraftCreated] = useState(!!initialPackageId);
	const [isAutoSaving, setIsAutoSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<FileUploadResponse | null>(null);
	const [newInclusion, setNewInclusion] = useState("");
	const [newExclusion, setNewExclusion] = useState("");

	const form = useForm<PackageFormData>({
		resolver: zodResolver(packageFormSchema),
		defaultValues,
	});

	const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const createDraftPackage = useCallback(async () => {
		if (isDraftCreated || isEditing) return;

		try {
			setIsLoading(true);
			const draftData = {
				...defaultValues,
				status: "draft",
				name: "New Package Draft",
				// Ensure undefined values for empty fields
				destination: undefined,
				duration: undefined,
				description: undefined,
				thumbnail: undefined,
			};

			const response = await axiosInstance.post('/packages', draftData);
			if (response.data?.id) {
				setPackageId(response.data.id);
				setIsDraftCreated(true);
				setLastSaved(new Date());
				
				if (!isEditing && location.pathname === '/packages/create') {
					navigate(`/packages/create/${response.data.id}`, { replace: true });
				}
				
				toast.success("Draft package created");
			}
		} catch (error) {
			console.error('Failed to create draft package:', error);
			toast.error("Failed to create draft package");
		} finally {
			setIsLoading(false);
		}
	}, [isDraftCreated, isEditing, navigate, location.pathname]);

	const cleanFormData = useCallback((data: PackageFormData) => {
		return {
			...data,
			// Convert empty strings to undefined
			destination: data.destination === '' ? undefined : data.destination,
			duration: data.duration === '' ? undefined : data.duration,
			description: data.description === '' ? undefined : data.description,
			thumbnail: data.thumbnail === '' ? undefined : data.thumbnail,
			startDate: data.startDate === '' ? undefined : data.startDate,
			endDate: data.endDate === '' ? undefined : data.endDate,
			itinerary: data.itinerary?.map(day => ({
				...day,
				images: day.images?.map(img => {
					if (typeof img === 'object' && img !== null && 'id' in img) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (img as any)?.id;
					}
					return img;
				}).filter(Boolean) || []
			})) || []
		};
	}, []);

	const autoSave = useCallback(async (data: PackageFormData) => {
		if (!packageId || !isDraftCreated || isLoading) return;

		try {
			setIsAutoSaving(true);
			const cleanedData = cleanFormData(data);
			
			const response = await axiosInstance.patch(`/packages/${packageId}`, cleanedData);
			if (response.data) {
				setCurrentPackage(response.data);
				setLastSaved(new Date());
			}
		} catch (error) {
			console.error('Auto-save failed:', error);
		} finally {
			setIsAutoSaving(false);
		}
	}, [packageId, isDraftCreated, isLoading, cleanFormData]);

		const debouncedAutoSave = useCallback((data: PackageFormData) => {
		// Don't auto-save if we're currently loading or if draft isn't created yet
		if (!packageId || !isDraftCreated || isLoading || isAutoSaving) return;
		
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
		}
		
		autoSaveTimeoutRef.current = window.setTimeout(() => {
			autoSave(data);
		}, 3000) as unknown as NodeJS.Timeout; // Increased to 3 seconds to reduce frequency
	}, [autoSave, packageId, isDraftCreated, isLoading, isAutoSaving]);

	const {
		fields: itineraryFields,
		append: appendItinerary,
		remove: removeItinerary,
	} = useFieldArray({
		control: form.control,
		name: "itinerary",
	});

	const {
		fields: paymentFields,
		append: appendPayment,
		remove: removePayment,
	} = useFieldArray({
		control: form.control,
		name: "paymentStructure",
	});

	const {
		fields: cancellationFields,
		append: appendCancellation,
		remove: removeCancellation,
	} = useFieldArray({
		control: form.control,
		name: "cancellationStructure",
	});

	const {
		fields: documentFields,
		append: appendDocument,
		remove: removeDocument,
	} = useFieldArray({
		control: form.control,
		name: "documentRequirements",
	});

	const {
		fields: checklistFields,
		append: appendChecklist,
		remove: removeChecklist,
	} = useFieldArray({
		control: form.control,
		name: "preTripChecklist",
	});

	useEffect(() => {
		if (isEditing && packageId) {
			const loadPackage = async () => {
				try {
					setIsLoading(true);
					const res = await axiosInstance.get<PackageFormData>(
						`/packages/${packageId}`
					);
					if (res.data) {
						setCurrentPackage(res.data);
						form.reset(res.data);
						
						if (res.data.thumbnail) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const thumbnailObj = res.data.thumbnail as any;
							if (thumbnailObj?.id) {
								setThumbnailFile(thumbnailObj);
							}
						}
					}
				} catch (error) {
					if (error instanceof Error) {
						toast.error(error.message);
					} else {
						toast.error("Failed to load package");
					}
				} finally {
					setIsLoading(false);
				}
			};
			loadPackage();
		} else if (!isEditing && !isDraftCreated) {
			createDraftPackage();
		}
	}, [isEditing, packageId, form, isDraftCreated, createDraftPackage]);

	useEffect(() => {
		const subscription = form.watch((data) => {
			if (isDraftCreated && packageId && !isLoading && !isAutoSaving) {
				const formData = data as PackageFormData;
				if (formData.name && formData.name.trim() !== 'New Package Draft') {
					debouncedAutoSave(formData);
				}
			}
		});
		return () => subscription.unsubscribe();
	}, [form, isDraftCreated, packageId, isLoading, isAutoSaving, debouncedAutoSave]);

	useEffect(() => {
		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, []);

	const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!packageId) {
				toast.error("Please wait for draft package to be created");
				return;
			}

			try {
				setIsLoading(true);
				const uploadedFile = await uploadSingleFile(file, packageId, 'package');
				setThumbnailFile(uploadedFile);
				form.setValue("thumbnail", uploadedFile.id);
				
				setCurrentPackage(prev => prev ? {
					...prev,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					thumbnail: uploadedFile as any
				} : null);
				
				debouncedAutoSave(form.getValues() as PackageFormData);
				toast.success("Thumbnail uploaded successfully");
			} catch (error) {
				console.log(error);
				toast.error("Failed to upload thumbnail");
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleDayImageUpload = async (
		dayIndex: number,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!packageId) {
				toast.error("Please wait for draft package to be created");
				return;
			}

			try {
				setIsLoading(true);
				const uploadedFile = await uploadSingleFile(file, packageId, 'itinerary');

				setCurrentPackage(prev => {
					if (!prev) return null;
					const updatedItinerary = [...(prev.itinerary || [])];
					if (updatedItinerary[dayIndex]) {
						updatedItinerary[dayIndex] = {
							...updatedItinerary[dayIndex],
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							images: [...(updatedItinerary[dayIndex].images || []), uploadedFile as any]
						};
					}
					return {
						...prev,
						itinerary: updatedItinerary
					};
				});

				const currentImages = form.getValues(`itinerary.${dayIndex}.images`) || [];
				form.setValue(`itinerary.${dayIndex}.images`, [
					...currentImages,
					uploadedFile.id,
				]);
				debouncedAutoSave(form.getValues() as PackageFormData);

				toast.success("Image uploaded successfully");
			} catch (error) {
				console.log(error)
				toast.error("Failed to upload image");
			} finally {
				setIsLoading(false);
			}
		}
	};

	const removeDayImage = async (dayIndex: number, imageIndex: number) => {
		try {
			const currentImages = currentPackage?.itinerary?.[dayIndex]?.images || [];
			const imageToDelete = currentImages[imageIndex];

			if (imageToDelete && typeof imageToDelete === 'object' && 'id' in imageToDelete) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await deleteFile((imageToDelete as any)?.id);
			}

			// Update currentPackage state
			setCurrentPackage(prev => {
				if (!prev) return null;
				const updatedItinerary = [...(prev.itinerary || [])];
				if (updatedItinerary[dayIndex]) {
					updatedItinerary[dayIndex] = {
						...updatedItinerary[dayIndex],
						images: updatedItinerary[dayIndex].images?.filter((_, i) => i !== imageIndex) || []
					};
				}
				return {
					...prev,
					itinerary: updatedItinerary
				};
			});

			// Update form
			const formImages = form.getValues(`itinerary.${dayIndex}.images`);
			const newImages = formImages?.filter((_, i) => i !== imageIndex);
			form.setValue(`itinerary.${dayIndex}.images`, newImages);

			toast.success("Image removed successfully");
		} catch (error) {
			console.log(error)
			toast.error("Failed to remove image");
		}
	};

	const addActivity = (dayIndex: number) => {
		const currentActivities = form.getValues(`itinerary.${dayIndex}.activities`);
		if (currentActivities)
			form.setValue(`itinerary.${dayIndex}.activities`, [...currentActivities, ""]);
	};

	const removeActivity = (dayIndex: number, activityIndex: number) => {
		const currentActivities = form.getValues(`itinerary.${dayIndex}.activities`);
		if (currentActivities) {
			const newActivities = currentActivities.filter((_, i) => i !== activityIndex);
			form.setValue(`itinerary.${dayIndex}.activities`, newActivities);
		}
	};

	const addInclusion = () => {
		if (newInclusion.trim()) {
			const currentInclusions = form.getValues("inclusions");
			if (currentInclusions)
				form.setValue("inclusions", [...currentInclusions, newInclusion.trim()]);
			setNewInclusion("");
		}
	};

	const removeInclusion = (index: number) => {
		const currentInclusions = form.getValues("inclusions");
		if (currentInclusions)
			form.setValue(
				"inclusions",
				currentInclusions.filter((_, i) => i !== index)
			);
	};

	const addExclusion = () => {
		if (newExclusion.trim()) {
			const currentExclusions = form.getValues("exclusions");
			if (currentExclusions)
				form.setValue("exclusions", [...currentExclusions, newExclusion.trim()]);
			setNewExclusion("");
		}
	};

	const removeExclusion = (index: number) => {
		const currentExclusions = form.getValues("exclusions");
		if (currentExclusions)
			form.setValue(
				"exclusions",
				currentExclusions.filter((_, i) => i !== index)
			);
	};

	const addMealItem = (mealType: "breakfast" | "lunch" | "dinner") => {
		const currentMeals = form.getValues(`mealsBreakdown.${mealType}`);
		if (currentMeals)
			form.setValue(`mealsBreakdown.${mealType}`, [...currentMeals, ""]);
	};

	const removeMealItem = (
		mealType: "breakfast" | "lunch" | "dinner",
		index: number
	) => {
		const currentMeals = form.getValues(`mealsBreakdown.${mealType}`);
		if (currentMeals)
			form.setValue(
				`mealsBreakdown.${mealType}`,
				currentMeals.filter((_, i) => i !== index)
			);
	};

	const addDocumentsToChecklist = () => {
		const documentRequirements = form.getValues("documentRequirements");
		const currentChecklist = form.getValues("preTripChecklist");

		const documentTasks = documentRequirements?.map((doc) => ({
			task: `Collect ${doc.name}`,
			description: doc.description,
			category: "documents" as const,
			dueDate: "2_weeks_before",
			completed: false,
		}));

		if (currentChecklist && documentTasks)
			form.setValue("preTripChecklist", [...currentChecklist, ...documentTasks]);
	};

	const addCancellationPolicy = () => {
		const current = form.getValues("cancellationPolicy");
		if (current) form.setValue("cancellationPolicy", [...current, ""]);
	};

	const removeCancellationPolicy = (index: number) => {
		const current = form.getValues("cancellationPolicy");
		if (current)
			form.setValue(
				"cancellationPolicy",
				current.filter((_, i) => i !== index)
			);
	};

	const onSubmit = async (data: PackageFormData, status: "draft" | "published") => {
		setIsLoading(true);
		try {
			if (!packageId) {
				toast.error("Package not ready for submission");
				return;
			}

			const cleanedData = cleanFormData(data);
			const submitData = {
				...cleanedData,
				status,
				thumbnail: (() => {
					if (thumbnailFile?.id) return thumbnailFile.id;
					if (typeof cleanedData.thumbnail === 'object' && cleanedData.thumbnail !== null && 'id' in cleanedData.thumbnail) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return (cleanedData.thumbnail as any)?.id;
					}
					if (typeof cleanedData.thumbnail === 'string') return cleanedData.thumbnail;
					return undefined;
				})(),
			};

			const response = await axiosInstance.patch(`/packages/${packageId}`, submitData);

			if (response.data) {
				const action = status === "published" ? "published" : "saved";
				toast.success(`Package ${action} successfully!`);
				setLastSaved(new Date());
				onSuccess?.();
			}
		} catch (error) {
			console.error('Package submission error:', error);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any)?.response?.data?.message) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				toast.error((error as any)?.response.data.message);
			} else if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error(`Failed to ${status === "published" ? "publish" : "save"} package`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const getTotalPaymentPercentage = () => {
		const paymentStructure = form.watch("paymentStructure") || [];
		return paymentStructure.reduce(
			(total: number, milestone: { percentage?: number }) =>
				total + (milestone?.percentage ?? 0),
			0
		);
	};

	const indianStates = [
		"Andhra Pradesh",
		"Arunachal Pradesh",
		"Assam",
		"Bihar",
		"Chhattisgarh",
		"Goa",
		"Gujarat",
		"Haryana",
		"Himachal Pradesh",
		"Jharkhand",
		"Karnataka",
		"Kerala",
		"Madhya Pradesh",
		"Maharashtra",
		"Manipur",
		"Meghalaya",
		"Mizoram",
		"Nagaland",
		"Odisha",
		"Punjab",
		"Rajasthan",
		"Sikkim",
		"Tamil Nadu",
		"Telangana",
		"Tripura",
		"Uttar Pradesh",
		"Uttarakhand",
		"West Bengal",
		"Delhi",
		"Jammu and Kashmir",
		"Ladakh",
	];

	return (
		<div className="min-h-screen ">
			<Form {...form}>
				<form>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Form */}
							<div className="lg:col-span-2 space-y-6">
								{/* Package Thumbnail */}
								<Card>
									<CardHeader>
										<CardTitle>Package Thumbnail</CardTitle>
										<CardDescription>
											Upload a main image for your package
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center gap-4">
											<div className="relative">
												<img
													src={(() => {
														if (thumbnailFile?.id) return getFileUrl(getServeFileUrl(thumbnailFile.id));
														if (currentPackage?.thumbnail && typeof currentPackage.thumbnail === 'object' && 'id' in currentPackage.thumbnail) {
															// eslint-disable-next-line @typescript-eslint/no-explicit-any
															return getFileUrl(getServeFileUrl((currentPackage.thumbnail as any)?.id));
														}
														return "/placeholder.svg";
													})()}
													alt="Package thumbnail"
													width={200}
													height={150}
													className="rounded-lg object-cover border"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="thumbnail">
													Upload Thumbnail
												</Label>
												<Input
													id="thumbnail"
													type="file"
													accept="image/*"
													onChange={handleThumbnailUpload}
													className="w-full"
												/>
												<p className="text-sm">
													Recommended: 400x300px, JPG or PNG
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Basic Information */}
								<Card>
									<CardHeader>
										<CardTitle>Basic Information</CardTitle>
										<CardDescription>
											Enter the basic details of your tour package
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Package Name
														</FormLabel>
														<FormControl>
															<Input
																placeholder="e.g., Bali Paradise Getaway"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="destination"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Destination</FormLabel>
														<FormControl>
															<Input
																placeholder="e.g., Bali, Indonesia"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Describe your tour package..."
															className="min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<FormField
												control={form.control}
												name="duration"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Duration</FormLabel>
														<FormControl>
															<Input
																placeholder="e.g., 7 Days, 6 Nights"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="price"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Price (INR)</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="1299"
																{...field}
																onChange={(e) =>
																	field.onChange(
																		Number.parseFloat(
																			e.target.value
																		) || 0
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="maxGuests"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Max Guests</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="12"
																{...field}
																onChange={(e) =>
																	field.onChange(
																		Number.parseInt(
																			e.target.value
																		) || 0
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<FormField
												control={form.control}
												name="startDate"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Start Date</FormLabel>
														<FormControl>
															<Input
																type="date"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="endDate"
												render={({ field }) => (
													<FormItem>
														<FormLabel>End Date</FormLabel>
														<FormControl>
															<Input
																type="date"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="difficulty"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Difficulty Level
														</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select difficulty" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="easy">
																	Easy
																</SelectItem>
																<SelectItem value="moderate">
																	Moderate
																</SelectItem>
																<SelectItem value="challenging">
																	Challenging
																</SelectItem>
																<SelectItem value="extreme">
																	Extreme
																</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="category"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Category</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select category" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="adventure">
																Adventure
															</SelectItem>
															<SelectItem value="cultural">
																Cultural
															</SelectItem>
															<SelectItem value="relaxation">
																Relaxation
															</SelectItem>
															<SelectItem value="wildlife">
																Wildlife
															</SelectItem>
															<SelectItem value="luxury">
																Luxury
															</SelectItem>
															<SelectItem value="budget">
																Budget
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{/* Itinerary */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Itinerary</CardTitle>
												<CardDescription>
													Plan the day-by-day activities
												</CardDescription>
											</div>
											<Button
												type="button"
												onClick={() =>
													appendItinerary({
														day: itineraryFields.length + 1,
														title: "",
														description: "",
														activities: [""],
														meals: [],
														accommodation: "",
														images: [],
													})
												}
												size="sm"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Day
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-6">
										{itineraryFields.map((field, dayIndex) => (
											<div
												key={field.id}
												className="border rounded-lg p-4 space-y-4"
											>
												<div className="flex justify-between items-center">
													<h3 className="text-lg font-semibold">
														Day {dayIndex + 1}
													</h3>
													{itineraryFields.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeItinerary(dayIndex)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												{/* Day Images */}
												<div className="space-y-3">
													<Label>Day Images</Label>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
														{(currentPackage?.itinerary?.[dayIndex]?.images || [])
															// eslint-disable-next-line @typescript-eslint/no-explicit-any
															.map((fileData: any, imageIndex) => (
																<div
																	key={fileData.id || imageIndex}
																	className="relative group"
																>
																	<img
																		src={fileData ? getFileUrl(getServeFileUrl(fileData.id)) : "/placeholder.svg"}
																		alt={`Day ${dayIndex + 1} image ${imageIndex + 1}`}
																		width={150}
																		height={100}
																		className="rounded-lg object-cover border"
																	/>
																	<Button
																		type="button"
																		variant="destructive"
																		size="sm"
																		className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
																		onClick={() =>
																			removeDayImage(
																				dayIndex,
																				imageIndex
																			)
																		}
																	>
																		<X className="w-3 h-3" />
																	</Button>
																</div>
															))}
														<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
															<Upload className="w-6 h-6 text-muted-foreground mb-2" />
															<Label
																htmlFor={`day-${dayIndex}-image`}
																className="cursor-pointer text-sm "
															>
																Add Image
															</Label>
															<Input
																id={`day-${dayIndex}-image`}
																type="file"
																accept="image/*"
																className="hidden"
																onChange={(e) =>
																	handleDayImageUpload(
																		dayIndex,
																		e
																	)
																}
															/>
														</div>
													</div>
												</div>

												<FormField
													control={form.control}
													name={`itinerary.${dayIndex}.title`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Day Title
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Arrival in Bali"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`itinerary.${dayIndex}.description`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Description
															</FormLabel>
															<FormControl>
																<Textarea
																	placeholder="Describe the day's overview..."
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												{/* Activities */}
												<div className="space-y-2">
													<div className="flex justify-between items-center">
														<Label>Activities</Label>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																addActivity(dayIndex)
															}
														>
															<Plus className="w-4 h-4 mr-2" />
															Add Activity
														</Button>
													</div>
													{form
														.watch(
															`itinerary.${dayIndex}.activities`
														)
														?.map(
															(activity, activityIndex) => (
																<div
																	key={activityIndex}
																	className="flex gap-2"
																>
																	<FormField
																		control={
																			form.control
																		}
																		name={`itinerary.${dayIndex}.activities.${activityIndex}`}
																		render={({
																			field,
																		}) => (
																			<FormItem className="flex-1">
																				<FormControl>
																					<Input
																						placeholder={
																							activity
																						}
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	{(form.watch(
																		`itinerary.${dayIndex}.activities`
																	)?.length ?? 0) >
																		1 && (
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				onClick={() =>
																					removeActivity(
																						dayIndex,
																						activityIndex
																					)
																				}
																			>
																				<Trash2 className="w-4 h-4" />
																			</Button>
																		)}
																</div>
															)
														)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label>Meals Included</Label>
														<div className="space-y-2">
															{[
																"Breakfast",
																"Lunch",
																"Dinner",
															].map((meal) => (
																<FormField
																	key={meal}
																	control={form.control}
																	name={`itinerary.${dayIndex}.meals`}
																	render={({
																		field,
																	}) => (
																		<FormItem className="flex flex-row items-start space-x-3 space-y-0">
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(
																						meal
																					)}
																					onCheckedChange={(
																						checked
																					) => {
																						const updatedMeals =
																							checked
																								? [
																									...(field.value ||
																										[]),
																									meal,
																								]
																								: field.value?.filter(
																									(
																										value
																									) =>
																										value !==
																										meal
																								) ||
																								[];
																						field.onChange(
																							updatedMeals
																						);
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="font-normal">
																				{meal}
																			</FormLabel>
																		</FormItem>
																	)}
																/>
															))}
														</div>
													</div>
													<FormField
														control={form.control}
														name={`itinerary.${dayIndex}.accommodation`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Accommodation
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="e.g., Luxury Beach Resort"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										))}
									</CardContent>
								</Card>

								{/* Payment Structure */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Payment Structure</CardTitle>
												<CardDescription>
													Define payment milestones and
													percentages
												</CardDescription>
											</div>
											<Button
												type="button"
												onClick={() =>
													appendPayment({
														name: "",
														percentage: 0,
														description: "",
														dueDate: "booking",
													})
												}
												size="sm"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Milestone
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex justify-between items-center p-3  rounded-lg">
											<span className="font-medium">
												Total Payment Percentage:
											</span>
											<Badge
												variant={
													getTotalPaymentPercentage() === 100
														? "default"
														: "destructive"
												}
											>
												{getTotalPaymentPercentage()}%
											</Badge>
										</div>

										{paymentFields.map((field, index) => (
											<div
												key={field.id}
												className="border rounded-lg p-4 space-y-3"
											>
												<div className="flex justify-between items-center">
													<h4 className="font-medium">
														Payment Milestone
													</h4>
													{paymentFields.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removePayment(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
													<FormField
														control={form.control}
														name={`paymentStructure.${index}.name`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Milestone Name
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="e.g., Booking Advance"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`paymentStructure.${index}.percentage`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Percentage
																</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		min="0"
																		max="100"
																		placeholder="10"
																		{...field}
																		onChange={(e) =>
																			field.onChange(
																				Number.parseInt(
																					e
																						.target
																						.value
																				) || 0
																			)
																		}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`paymentStructure.${index}.dueDate`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Due Date
																</FormLabel>
																<Select
																	onValueChange={
																		field.onChange
																	}
																	defaultValue={
																		field.value
																	}
																>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="booking">
																			At Booking
																		</SelectItem>
																		<SelectItem value="30_days_before">
																			30 Days Before
																		</SelectItem>
																		<SelectItem value="2_weeks_before">
																			2 Weeks Before
																		</SelectItem>
																		<SelectItem value="1_week_before">
																			1 Week Before
																		</SelectItem>
																		<SelectItem value="departure">
																			At Departure
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name={`paymentStructure.${index}.description`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Description
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="Description of this payment milestone"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										))}
									</CardContent>
								</Card>

								{/* Cancellation Structure */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>
													Cancellation Structure
												</CardTitle>
												<CardDescription>
													Define cancellation fees based on
													timing
												</CardDescription>
											</div>
											<Button
												type="button"
												onClick={() =>
													appendCancellation({
														timeframe: "",
														percentage: 0,
														description: "",
													})
												}
												size="sm"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Tier
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{cancellationFields.map((field, index) => (
											<div
												key={field.id}
												className="border rounded-lg p-4 space-y-3"
											>
												<div className="flex justify-between items-center">
													<h4 className="font-medium">
														Cancellation Tier
													</h4>
													{cancellationFields.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeCancellation(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
													<FormField
														control={form.control}
														name={`cancellationStructure.${index}.timeframe`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Timeframe
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="e.g., 30+ days before"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`cancellationStructure.${index}.percentage`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Cancellation Fee (%)
																</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		min="0"
																		max="100"
																		placeholder="10"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`cancellationStructure.${index}.description`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Description
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Description of this tier"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										))}
									</CardContent>
								</Card>

								{/* Cancellation Policy */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Cancellation Policy</CardTitle>
												<CardDescription>
													Additional policy points and terms
												</CardDescription>
											</div>
											<Button
												type="button"
												onClick={addCancellationPolicy}
												size="sm"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Point
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										{form
											.watch("cancellationPolicy")
											?.map((policy, index) => (
												<div key={index} className="flex gap-2">
													<FormField
														control={form.control}
														name={`cancellationPolicy.${index}`}
														render={({ field }) => (
															<FormItem className="flex-1">
																<FormControl>
																	<Input
																		placeholder={
																			policy
																		}
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													{form.watch("cancellationPolicy") &&
														form.watch("cancellationPolicy")!
															.length > 1 && (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() =>
																	removeCancellationPolicy(
																		index
																	)
																}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
												</div>
											))}
									</CardContent>
								</Card>

								{/* Meals Breakdown */}
								<Card>
									<CardHeader>
										<CardTitle>Meals Breakdown</CardTitle>
										<CardDescription>
											Define what's included in each meal type
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{(["breakfast", "lunch", "dinner"] as const).map(
											(mealType) => (
												<div key={mealType} className="space-y-3">
													<div className="flex justify-between items-center">
														<Label className="text-base font-medium capitalize">
															{mealType}
														</Label>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																addMealItem(mealType)
															}
														>
															<Plus className="w-4 h-4 mr-2" />
															Add Item
														</Button>
													</div>
													<div className="space-y-2">
														{form
															.watch(
																`mealsBreakdown.${mealType}`
															)
															?.map((_, index) => (
																<div
																	key={index}
																	className="flex gap-2"
																>
																	<FormField
																		control={
																			form.control
																		}
																		name={`mealsBreakdown.${mealType}.${index}`}
																		render={({
																			field,
																		}) => (
																			<FormItem className="flex-1">
																				<FormControl>
																					<Input
																						placeholder={`Enter ${mealType} item...`}
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	{form.watch(
																		`mealsBreakdown.${mealType}`
																	)?.length &&
																		form.watch(
																			`mealsBreakdown.${mealType}`
																		)!.length > 1 && (
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				onClick={() =>
																					removeMealItem(
																						mealType,
																						index
																					)
																				}
																			>
																				<Trash2 className="w-4 h-4" />
																			</Button>
																		)}
																</div>
															))}
													</div>
												</div>
											)
										)}
									</CardContent>
								</Card>

								{/* Transportation */}
								<Card>
									<CardHeader>
										<CardTitle>Transportation</CardTitle>
										<CardDescription>
											Define transportation arrangements
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* To Destination */}
										<div className="space-y-3">
											<Label className="text-base font-medium">
												To Destination
											</Label>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<FormField
													control={form.control}
													name="transportation.toDestination.mode"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Mode of Transport
															</FormLabel>
															<Select
																onValueChange={
																	field.onChange
																}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="flight">
																		Flight
																	</SelectItem>
																	<SelectItem value="train">
																		Train
																	</SelectItem>
																	<SelectItem value="bus">
																		Bus
																	</SelectItem>
																	<SelectItem value="car">
																		Car
																	</SelectItem>
																	<SelectItem value="ship">
																		Ship
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.toDestination.details"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Details</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Economy class, Direct flight"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.toDestination.included"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={
																		field.onChange
																	}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	Included in Package
																</FormLabel>
															</div>
														</FormItem>
													)}
												/>
											</div>
										</div>

										{/* From Destination */}
										<div className="space-y-3">
											<Label className="text-base font-medium">
												From Destination
											</Label>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<FormField
													control={form.control}
													name="transportation.fromDestination.mode"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Mode of Transport
															</FormLabel>
															<Select
																onValueChange={
																	field.onChange
																}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="flight">
																		Flight
																	</SelectItem>
																	<SelectItem value="train">
																		Train
																	</SelectItem>
																	<SelectItem value="bus">
																		Bus
																	</SelectItem>
																	<SelectItem value="car">
																		Car
																	</SelectItem>
																	<SelectItem value="ship">
																		Ship
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.fromDestination.details"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Details</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Economy class, Direct flight"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.fromDestination.included"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={
																		field.onChange
																	}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	Included in Package
																</FormLabel>
															</div>
														</FormItem>
													)}
												/>
											</div>
										</div>

										{/* During Trip */}
										<div className="space-y-3">
											<Label className="text-base font-medium">
												During Trip
											</Label>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<FormField
													control={form.control}
													name="transportation.duringTrip.mode"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Mode of Transport
															</FormLabel>
															<Select
																onValueChange={
																	field.onChange
																}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="bus">
																		Bus
																	</SelectItem>
																	<SelectItem value="car">
																		Car
																	</SelectItem>
																	<SelectItem value="train">
																		Train
																	</SelectItem>
																	<SelectItem value="boat">
																		Boat
																	</SelectItem>
																	<SelectItem value="walking">
																		Walking
																	</SelectItem>
																	<SelectItem value="mixed">
																		Mixed
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.duringTrip.details"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Details</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Air-conditioned coach, Private transfers"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transportation.duringTrip.included"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={
																		field.onChange
																	}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	Included in Package
																</FormLabel>
															</div>
														</FormItem>
													)}
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Package Location */}
								<Card>
									<CardHeader>
										<CardTitle>Package Location</CardTitle>
										<CardDescription>
											Specify if this is an international or local
											package
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="packageLocation.type"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Package Type</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="international">
																International
															</SelectItem>
															<SelectItem value="local">
																Local/Domestic
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="packageLocation.country"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Country</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g., Indonesia, India, Thailand"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{form.watch("packageLocation.type") ===
											"local" && (
												<FormField
													control={form.control}
													name="packageLocation.state"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																State/Region
															</FormLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select state" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{indianStates.map(
																		(state) => (
																			<SelectItem
																				key={state}
																				value={state}
																			>
																				{state}
																			</SelectItem>
																		)
																	)}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
									</CardContent>
								</Card>

								{/* Document Requirements */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>
													Document Requirements
												</CardTitle>
												<CardDescription>
													Specify documents required for
													travelers
												</CardDescription>
											</div>
											<Button
												type="button"
												onClick={() =>
													appendDocument({
														name: "",
														description: "",
														mandatory: true,
														applicableFor: "all",
													})
												}
												size="sm"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Document
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{documentFields.map((field, index) => (
											<div
												key={field.id}
												className="border rounded-lg p-4 space-y-3"
											>
												<div className="flex justify-between items-center">
													<h4 className="font-medium">
														Document Requirement
													</h4>
													{documentFields.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeDocument(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													<FormField
														control={form.control}
														name={`documentRequirements.${index}.name`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Document Name
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="e.g., Valid Passport"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`documentRequirements.${index}.applicableFor`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Applicable For
																</FormLabel>
																<Select
																	onValueChange={
																		field.onChange
																	}
																	defaultValue={
																		field.value
																	}
																>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="all">
																			All Travelers
																		</SelectItem>
																		<SelectItem value="adults">
																			Adults Only
																		</SelectItem>
																		<SelectItem value="children">
																			Children Only
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name={`documentRequirements.${index}.description`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Description
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="e.g., Passport valid for at least 6 months from travel date"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`documentRequirements.${index}.mandatory`}
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={
																		field.onChange
																	}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	Mandatory Document
																</FormLabel>
															</div>
														</FormItem>
													)}
												/>
											</div>
										))}

										{/* Document Categories */}
										<div className="mt-6 p-4  rounded-lg">
											<h4 className="font-medium mb-3">
												Document Categories
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
												<div>
													<h5 className="font-medium text-primary mb-2">
														Adults Documents
													</h5>
													<ul className="space-y-1 ">
														{form
															.watch("documentRequirements")
															?.filter(
																(doc) =>
																	doc.applicableFor ===
																	"adults" ||
																	doc.applicableFor ===
																	"all"
															)
															.map((doc, index) => (
																<li key={index}>
																	• {doc.name}
																</li>
															))}
													</ul>
												</div>
												<div>
													<h5 className="font-medium text-primary mb-2">
														Children Documents
													</h5>
													<ul className="space-y-1 ">
														{form
															.watch("documentRequirements")
															?.filter(
																(doc) =>
																	doc.applicableFor ===
																	"children" ||
																	doc.applicableFor ===
																	"all"
															)
															.map((doc, index) => (
																<li key={index}>
																	• {doc.name}
																</li>
															))}
													</ul>
												</div>
												<div>
													<h5 className="font-medium text-primary mb-2">
														Mandatory
													</h5>
													<ul className="space-y-1 ">
														{form
															.watch("documentRequirements")
															?.filter(
																(doc) => doc.mandatory
															)
															.map((doc, index) => (
																<li key={index}>
																	• {doc.name}
																</li>
															))}
													</ul>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Pre-Trip Checklist - Not Needed */}
								<Card>
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Pre-Trip Checklist</CardTitle>
												<CardDescription>
													Tasks for operators to complete before
													departure
												</CardDescription>
											</div>
											<div className="flex gap-2">
												<Button
													type="button"
													variant="outline"
													onClick={addDocumentsToChecklist}
													size="sm"
												>
													<Plus className="w-4 h-4 mr-2" />
													Add Documents
												</Button>
												<Button
													type="button"
													onClick={() =>
														appendChecklist({
															task: "",
															description: "",
															category: "preparation",
															dueDate: "1_week_before",
															completed: false,
														})
													}
													size="sm"
												>
													<Plus className="w-4 h-4 mr-2" />
													Add Task
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{checklistFields.map((field, index) => (
											<div
												key={field.id}
												className="border rounded-lg p-4 space-y-3"
											>
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">
															Checklist Item
														</h4>
														<Badge
															variant={
																form.watch(
																	`preTripChecklist.${index}.category`
																) === "documents"
																	? "default"
																	: "secondary"
															}
														>
															{form.watch(
																`preTripChecklist.${index}.category`
															)}
														</Badge>
													</div>
													{checklistFields.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeChecklist(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													<FormField
														control={form.control}
														name={`preTripChecklist.${index}.task`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Task
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="e.g., Collect all documents"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`preTripChecklist.${index}.category`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Category
																</FormLabel>
																<Select
																	onValueChange={
																		field.onChange
																	}
																	defaultValue={
																		field.value
																	}
																>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="documents">
																			Documents
																		</SelectItem>
																		<SelectItem value="booking">
																			Booking
																		</SelectItem>
																		<SelectItem value="preparation">
																			Preparation
																		</SelectItem>
																		<SelectItem value="communication">
																			Communication
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													<FormField
														control={form.control}
														name={`preTripChecklist.${index}.description`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Description
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Detailed description of the task"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`preTripChecklist.${index}.dueDate`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Due Date
																</FormLabel>
																<Select
																	onValueChange={
																		field.onChange
																	}
																	defaultValue={
																		field.value
																	}
																>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="30_days_before">
																			30 Days Before
																		</SelectItem>
																		<SelectItem value="2_weeks_before">
																			2 Weeks Before
																		</SelectItem>
																		<SelectItem value="1_week_before">
																			1 Week Before
																		</SelectItem>
																		<SelectItem value="3_days_before">
																			3 Days Before
																		</SelectItem>
																		<SelectItem value="departure_day">
																			Departure Day
																		</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										))}
									</CardContent>
								</Card>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								{/* Actions */}
								<Card>
									<CardHeader>
										<CardTitle>Actions</CardTitle>
										{isDraftCreated && (
											<CardDescription className="flex items-center gap-2">
												{isAutoSaving ? (
													<span className="text-blue-600">Saving...</span>
												) : lastSaved ? (
													<span className="text-green-600">
														Last saved: {lastSaved.toLocaleTimeString()}
													</span>
												) : null}
											</CardDescription>
										)}
									</CardHeader>
									<CardContent className="space-y-2">
										<Button
											type="button"
											variant="outline"
											className="w-full bg-transparent"
											onClick={() =>
												form.handleSubmit((data) =>
													onSubmit(data, "draft")
												)()
											}
											disabled={isLoading}
										>
											<Save className="w-4 h-4 mr-2" />
											Save as Draft
										</Button>
										<Button
											type="button"
											className="w-full"
											onClick={() =>
												form.handleSubmit((data) =>
													onSubmit(data, "published")
												)()
											}
											disabled={isLoading || getTotalPaymentPercentage() !== 100}
										>
											<Eye className="w-4 h-4 mr-2" />
											{isEditing
												? "Update & Publish"
												: "Publish Package"}
										</Button>
										{getTotalPaymentPercentage() !== 100 && (
											<p className="text-sm text-red-500 mt-2">
												Payment structure must total exactly 100% to publish
											</p>
										)}
									</CardContent>
								</Card>

								{/* Inclusions */}
								<Card>
									<CardHeader>
										<CardTitle>Inclusions</CardTitle>
										<CardDescription>
											What's included in the package
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex gap-2">
											<Input
												placeholder="Add inclusion..."
												value={newInclusion}
												onChange={(e) =>
													setNewInclusion(e.target.value)
												}
												onKeyPress={(e) =>
													e.key === "Enter" && addInclusion()
												}
											/>
											<Button
												type="button"
												onClick={addInclusion}
												size="sm"
											>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										<div className="space-y-2">
											{form
												.watch("inclusions")
												?.map((inclusion, index) => (
													<div
														key={index}
														className="flex items-center justify-between"
													>
														<Badge variant="secondary">
															{inclusion}
														</Badge>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeInclusion(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												))}
										</div>
									</CardContent>
								</Card>

								{/* Exclusions */}
								<Card>
									<CardHeader>
										<CardTitle>Exclusions</CardTitle>
										<CardDescription>
											What's not included
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex gap-2">
											<Input
												placeholder="Add exclusion..."
												value={newExclusion}
												onChange={(e) =>
													setNewExclusion(e.target.value)
												}
												onKeyPress={(e) =>
													e.key === "Enter" && addExclusion()
												}
											/>
											<Button
												type="button"
												onClick={addExclusion}
												size="sm"
											>
												<Plus className="w-4 h-4" />
											</Button>
										</div>
										<div className="space-y-2">
											{form
												.watch("exclusions")
												?.map((exclusion, index) => (
													<div
														key={index}
														className="flex items-center justify-between"
													>
														<Badge variant="outline">
															{exclusion}
														</Badge>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																removeExclusion(index)
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												))}
										</div>
									</CardContent>
								</Card>

								{/* Package Summary */}
								<Card>
									<CardHeader>
										<CardTitle>Package Summary</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										<div className="flex justify-between">
											<span className="text-sm ">Status:</span>
											<Badge
												variant={
													form.watch("status") === "published"
														? "default"
														: "secondary"
												}
											>
												{form.watch("status")}
											</Badge>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">Duration:</span>
											<span className="text-sm font-medium">
												{form.watch("duration") || "Not set"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">Price:</span>
											<span className="text-sm font-medium">
												{form.watch("price")
													? `$${form.watch("price")}`
													: "Not set"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">Max Guests:</span>
											<span className="text-sm font-medium">
												{form.watch("maxGuests") || "Not set"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">
												Itinerary Days:
											</span>
											<span className="text-sm font-medium">
												{form.watch("itinerary")?.length || 0}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">
												Payment Structure:
											</span>
											<Badge
												variant={
													getTotalPaymentPercentage() === 100
														? "default"
														: "destructive"
												}
											>
												{getTotalPaymentPercentage()}%
											</Badge>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">
												Cancellation Tiers:
											</span>
											<span className="text-sm font-medium">
												{form.watch("cancellationStructure")
													?.length || 0}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">
												Package Type:
											</span>
											<Badge
												variant={
													form.watch("packageLocation.type") ===
														"international"
														? "default"
														: "secondary"
												}
											>
												{form.watch("packageLocation.type")}
											</Badge>
										</div>
										{form.watch("packageLocation.state") && (
											<div className="flex justify-between">
												<span className="text-sm ">State:</span>
												<span className="text-sm font-medium">
													{form.watch("packageLocation.state")}
												</span>
											</div>
										)}
										<div className="flex justify-between">
											<span className="text-sm ">
												Documents Required:
											</span>
											<span className="text-sm font-medium">
												{form.watch("documentRequirements")
													?.length || 0}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm ">
												Checklist Items:
											</span>
											<span className="text-sm font-medium">
												{form.watch("preTripChecklist")?.length ||
													0}
											</span>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
