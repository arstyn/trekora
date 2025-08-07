import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import type { PackageFormData } from "@/types/package.schema";
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Edit,
	MapPin,
	Users,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ViewPackagePage() {
	const { id } = useParams<{ id: string }>();
	const [packageData, setPackageData] = useState<PackageFormData>();

	useEffect(() => {
		const getPackage = async () => {
			try {
				const res = await axiosInstance.get<PackageFormData>(`/packages/${id}`);
				setPackageData(res.data);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to load updates");
				}
			}
		};

		getPackage();
	}, [id]);

	if (!packageData) {
		return null;
	}

	const completedTasks = packageData.preTripChecklist
		? packageData.preTripChecklist.filter((item) => item?.completed).length
		: 0;
	const totalTasks = packageData.preTripChecklist?.length || 0;
	const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	return (
		<div className="min-h-screen ">
			{/* Header */}
			{/* Hero Section */}
			<section className="relative">
				<div className="h-96 relative">
					<div>
						<img
							// src={packageData.thumbnail || '/placeholder.svg'}
							src={"/placeholder.svg"}
							alt={packageData.name || ""}
							className="object-cover opacity-30 w-full h-96"
						/>
					</div>
					<div className="absolute inset-0 bg-opacity-40" />
					<div className="absolute bottom-6 left-6">
						<div className="flex items-center gap-4 mb-4">
							<Badge
								variant={
									packageData.status === "published"
										? "default"
										: "secondary"
								}
								className="text-sm"
							>
								{packageData.status}
							</Badge>
							<Badge
								variant={
									packageData.packageLocation?.type === "international"
										? "default"
										: "secondary"
								}
							>
								{packageData.packageLocation?.type}
							</Badge>
						</div>
						<h2 className="text-4xl font-bold mb-2">{packageData.name || "Untitled Package"}</h2>
						<p className=" flex items-center gap-2">
							<MapPin className="w-4 h-4" />
							{packageData.destination || "Destination not set"}
						</p>
					</div>
				</div>
				<NavLink to={`/packages/edit/${id}`} className="absolute top-5 right-5">
					<Button>
						<Edit className="w-4 h-4 mr-2" />
						Edit Package
					</Button>
				</NavLink>
			</section>

			{/* Main Content */}
			<main className="px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Package Overview */}
						<Card>
							<CardHeader>
								<CardTitle>Package Overview</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<p className=" leading-relaxed">
									{packageData.description || "Package description not available yet."}
								</p>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="text-center p-4 bg-primary/10 rounded-lg">
										<Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
										<div className="text-sm text-muted-foreground">
											Duration
										</div>
										<div className="font-semibold">
											{packageData.duration || "Not set"}
										</div>
									</div>
									<div className="text-center p-4 bg-primary/10 rounded-lg">
										<DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
										<div className="text-sm text-muted-foreground">
											Price
										</div>
										<div className="font-semibold">
											₹{packageData.price || 0}
										</div>
									</div>
									<div className="text-center p-4 bg-primary/10 rounded-lg">
										<Users className="w-8 h-8 text-primary mx-auto mb-2" />
										<div className="text-sm text-muted-foreground">
											Max Guests
										</div>
										<div className="font-semibold">
											{packageData.maxGuests || "Not set"}
										</div>
									</div>
									<div className="text-center p-4 bg-primary/10 rounded-lg">
										<MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
										<div className="text-sm text-muted-foreground">
											Difficulty
										</div>
										<div className="font-semibold capitalize">
											{packageData.difficulty || "Not set"}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Detailed Itinerary */}
						<Card>
							<CardHeader>
								<CardTitle>Detailed Itinerary</CardTitle>
								<CardDescription>
									{packageData.itinerary?.length ?? 0} days of amazing
									experiences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{packageData.itinerary && packageData.itinerary.length > 0 ? packageData.itinerary.map((day, index) => (
									<div key={index} className="border rounded-lg p-6">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
												{day?.day || index + 1}
											</div>
											<div>
												<h3 className="text-xl font-semibold">
													{day?.title || `Day ${index + 1}`}
												</h3>
												<p>{day?.description || "No description available"}</p>
											</div>
										</div>

										{/* Day Images */}
										{day?.images && day.images.length > 0 && (
											<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
												{day.images.map((_, imageIndex) => (
													<img
														key={imageIndex}
														// src={image || '/placeholder.svg'}
														src={"/placeholder.svg"}
														alt={`Day ${day?.day || index + 1} - Image ${imageIndex + 1
															}`}
														className="rounded-lg object-cover"
													/>
												))}
											</div>
										)}

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold mb-2">
													Activities
												</h4>
												<ul className="space-y-1">
													{day?.activities && day.activities.length > 0 ? day.activities.map(
														(activity, actIndex) => (
															<li
																key={actIndex}
																className="flex items-start gap-2"
															>
																<div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
																<span>{activity || "Activity not specified"}</span>
															</li>
														)
													) : (
														<li className="text-muted-foreground text-sm">No activities planned yet</li>
													)}
												</ul>
											</div>
											<div>
												<h4 className="font-semibold mb-2">
													Details
												</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span>Meals:</span>
														<span>
															{day?.meals && day.meals.length > 0 ? day.meals.join(", ") : "None"}
														</span>
													</div>
													<div className="flex justify-between">
														<span>Accommodation:</span>
														<span>{day?.accommodation || "Not specified"}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								)) : (
									<div className="text-center py-8 text-muted-foreground">
										<p>No itinerary has been created yet.</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Payment Structure */}
						<Card>
							<CardHeader>
								<CardTitle>Payment Structure</CardTitle>
								<CardDescription>
									How and when to pay for this package
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{packageData.paymentStructure && packageData.paymentStructure.length > 0 ? packageData.paymentStructure.map(
										(milestone, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-4 border rounded-lg"
											>
												<div>
													<h4 className="font-semibold">
														{milestone?.name || "Payment Milestone"}
													</h4>
													<p className="text-sm ">
														{milestone?.description || "No description"}
													</p>
												</div>
												<div className="text-right">
													<div className="text-2xl font-bold text-primary">
														{milestone?.percentage || 0}%
													</div>
													<div className="text-sm  capitalize">
														{milestone?.dueDate?.replace("_", " ") || "Not specified"}
													</div>
												</div>
											</div>
										)
									) : (
										<div className="text-center py-8 text-muted-foreground">
											<p>No payment structure has been defined yet.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Cancellation Policy */}
						<Card>
							<CardHeader>
								<CardTitle>Cancellation Policy</CardTitle>
								<CardDescription>
									Cancellation fees and terms
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<h4 className="font-semibold">Cancellation Fees</h4>
									{packageData.cancellationStructure && packageData.cancellationStructure.length > 0 ? packageData.cancellationStructure.map(
										(tier, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3  rounded-lg"
											>
												<div>
													<span className="font-medium">
														{tier?.timeframe || "Not specified"}
													</span>
													<p className="text-sm ">
														{tier?.description || "No description"}
													</p>
												</div>
												<Badge variant="outline">
													{tier?.percentage || 0}% fee
												</Badge>
											</div>
										)
									) : (
										<div className="text-muted-foreground text-sm">
											<p>No cancellation structure has been defined yet.</p>
										</div>
									)}
								</div>

								<div className="space-y-3">
									<h4 className="font-semibold">Policy Terms</h4>
									<ul className="space-y-2">
										{packageData.cancellationPolicy && packageData.cancellationPolicy.length > 0 ? packageData.cancellationPolicy.map(
											(point, index) => (
												<li
													key={index}
													className="flex items-start gap-2"
												>
													<div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
													<span>{typeof point === 'string' ? point : (point && typeof point === 'object' && 'text' in point ? (point as { text: string }).text : "Policy term not available")}</span>
												</li>
											)
										) : (
											<li className="text-muted-foreground text-sm">No cancellation policy terms have been defined yet.</li>
										)}
									</ul>
								</div>
							</CardContent>
						</Card>

						{/* Document Requirements */}
						<Card>
							<CardHeader>
								<CardTitle>Document Requirements</CardTitle>
								<CardDescription>
									Required documents for all travelers
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold mb-3 text-blue-600">
											All Travelers
										</h4>
										<div className="space-y-3">
											{packageData.documentRequirements && packageData.documentRequirements.length > 0 ? packageData.documentRequirements
												.filter((doc) => doc?.applicableFor === "all")
												.map((doc, index) => (
													<div
														key={index}
														className="p-3 border rounded-lg"
													>
														<div className="flex items-center gap-2 mb-1">
															<h5 className="font-medium">
																{doc?.name || "Document"}
															</h5>
															{doc?.mandatory && (
																<Badge
																	variant="destructive"
																	className="text-xs"
																>
																	Required
																</Badge>
															)}
														</div>
														<p className="text-sm ">
															{doc?.description || "No description available"}
														</p>
													</div>
												)) : (
												<div className="text-muted-foreground text-sm">
													No documents required for all travelers.
												</div>
											)}
										</div>
									</div>
									<div>
										<h4 className="font-semibold mb-3 text-green-600">
											Children Only
										</h4>
										<div className="space-y-3">
											{packageData.documentRequirements && packageData.documentRequirements.length > 0 ? packageData.documentRequirements
												.filter((doc) => doc?.applicableFor === "children")
												.map((doc, index) => (
													<div
														key={index}
														className="p-3 border rounded-lg"
													>
														<div className="flex items-center gap-2 mb-1">
															<h5 className="font-medium">
																{doc?.name || "Document"}
															</h5>
															{doc?.mandatory && (
																<Badge
																	variant="destructive"
																	className="text-xs"
																>
																	Required
																</Badge>
															)}
														</div>
														<p className="text-sm ">
															{doc?.description || "No description available"}
														</p>
													</div>
												)) : (
												<div className="text-muted-foreground text-sm">
													No specific documents required for children.
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Meals Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle>Meals Included</CardTitle>
								<CardDescription>
									What's included in each meal
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{packageData.mealsBreakdown && Object.keys(packageData.mealsBreakdown).length > 0 ? Object.entries(packageData.mealsBreakdown).map(
										([mealType, items]) => (
											<>
												{(["breakfast", "lunch", "dinner"].includes(mealType?.toLowerCase())) && (
													<div key={mealType}>
														<h4 className="font-semibold mb-3 capitalize text-primary">
															{mealType}
														</h4>
														<ul className="space-y-2">
															{items && items?.length > 0 ? items?.map((item, index) => (
																<li
																	key={index}
																	className="flex items-start gap-2"
																>
																	<div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
																	<span className=" text-sm">
																		{item || "Item not specified"}
																	</span>
																</li>
															)) : (
																<li className="text-muted-foreground text-sm">No items specified</li>
															)}
														</ul>
													</div>
												)}
											</>
										)
									) : (
										<div className="col-span-3 text-center py-8 text-muted-foreground">
											<p>No meal breakdown has been provided yet.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Transportation */}
						<Card>
							<CardHeader>
								<CardTitle>Transportation</CardTitle>
								<CardDescription>
									How you'll get there and around
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="p-4 border rounded-lg">
											<h4 className="font-semibold mb-2">
												To Destination
											</h4>
											<div className="space-y-1 text-sm">
												<div className="flex justify-between">
													<span>Mode:</span>
													<span className="capitalize">
														{packageData.transportation?.toDestination?.mode || "Not specified"}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Details:</span>
													<span>
														{packageData.transportation?.toDestination?.details || "Not specified"}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Included:</span>
													<Badge
														variant={
															packageData.transportation
																?.toDestination?.included
																? "default"
																: "outline"
														}
													>
														{packageData.transportation
															?.toDestination?.included
															? "Yes"
															: "No"}
													</Badge>
												</div>
											</div>
										</div>
										<div className="p-4 border rounded-lg">
											<h4 className="font-semibold mb-2">
												From Destination
											</h4>
											<div className="space-y-1 text-sm">
												<div className="flex justify-between">
													<span>Mode:</span>
													<span className="capitalize">
														{packageData.transportation?.fromDestination?.mode || "Not specified"}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Details:</span>
													<span>
														{packageData.transportation?.fromDestination?.details || "Not specified"}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Included:</span>
													<Badge
														variant={
															packageData.transportation
																?.fromDestination
																?.included
																? "default"
																: "outline"
														}
													>
														{packageData.transportation
															?.fromDestination?.included
															? "Yes"
															: "No"}
													</Badge>
												</div>
											</div>
										</div>
									</div>
									<div className="p-4 border rounded-lg">
										<h4 className="font-semibold mb-2">
											During Trip
										</h4>
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div className="flex justify-between">
												<span>Mode:</span>
												<span className="capitalize">
													{packageData.transportation?.duringTrip?.mode || "Not specified"}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Details:</span>
												<span>
													{packageData.transportation?.duringTrip?.details || "Not specified"}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Included:</span>
												<Badge
													variant={
														packageData.transportation
															?.duringTrip?.included
															? "default"
															: "outline"
													}
												>
													{packageData.transportation
														?.duringTrip?.included
														? "Yes"
														: "No"}
												</Badge>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Quick Info */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm ">Package Type:</span>
									<Badge
										variant={
											packageData.packageLocation?.type ===
												"international"
												? "default"
												: "secondary"
										}
									>
										{packageData.packageLocation?.type || "Not set"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-sm ">Country:</span>
									<span className="text-sm font-medium">
										{packageData.packageLocation?.country || "Not specified"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm ">Category:</span>
									<span className="text-sm font-medium capitalize">
										{packageData.category || "Not set"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm ">Start Date:</span>
									<span className="text-sm font-medium">
										{packageData.startDate ? new Date(packageData.startDate).toLocaleDateString() : "Not set"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm ">End Date:</span>
									<span className="text-sm font-medium">
										{packageData.endDate ? new Date(packageData.endDate).toLocaleDateString() : "Not set"}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Pre-Trip Checklist Progress */}
						<Card>
							<CardHeader>
								<CardTitle>Pre-Trip Checklist</CardTitle>
								<CardDescription>
									Operator preparation progress
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Overall Progress
									</span>
									<span className="text-sm font-bold">
										{completionPercentage}%
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full transition-all duration-300"
										style={{ width: `${completionPercentage}%` }}
									/>
								</div>

								<div className="space-y-2">
									{packageData.preTripChecklist && packageData.preTripChecklist.length > 0 ? packageData.preTripChecklist.map((item, index) => (
										<div
											key={index}
											className="flex items-center gap-2 p-2 rounded border"
										>
											{item?.completed ? (
												<CheckCircle className="w-4 h-4 text-primary" />
											) : (
												<Clock className="w-4 h-4 text-muted-foreground" />
											)}
											<div className="flex-1">
												<div className="text-sm font-medium">
													{item?.task || "Untitled task"}
												</div>
												<div className="text-xs ">
													{item?.category || "General"}
												</div>
											</div>
										</div>
									)) : (
										<div className="text-center py-4 text-muted-foreground">
											<p className="text-sm">No checklist items have been created yet.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Inclusions & Exclusions */}
						<Card>
							<CardHeader>
								<CardTitle>What's Included</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h4 className="font-semibold text-primary mb-2">
										Included
									</h4>
									<div className="space-y-1">
										{packageData.inclusions && packageData.inclusions.length > 0 ? packageData.inclusions.map((item, index) => (
											<div
												key={index}
												className="flex items-center gap-2"
											>
												<CheckCircle className="w-4 h-4 text-primary" />
												<span className="text-sm">{typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? (item as { item: string }).item : "Inclusion not specified")}</span>
											</div>
										)) : (
											<div className="text-muted-foreground text-sm">No inclusions specified yet.</div>
										)}
									</div>
								</div>
								<div>
									<h4 className="font-semibold text-destructive mb-2">
										Not Included
									</h4>
									<div className="space-y-1">
										{packageData.exclusions && packageData.exclusions.length > 0 ? packageData.exclusions.map((item, index) => (
											<div
												key={index}
												className="flex items-center gap-2"
											>
												<XCircle className="w-4 h-4 text-destructive" />
												<span className="text-sm">{typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? (item as { item: string }).item : "Exclusion not specified")}</span>
											</div>
										)) : (
											<div className="text-muted-foreground text-sm">No exclusions specified yet.</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}

