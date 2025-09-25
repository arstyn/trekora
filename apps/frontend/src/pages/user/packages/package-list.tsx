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
import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import type { IPackages } from "@/types/package.schema";
import { Calendar, IndianRupee, MapPin, Plus, Users, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Packages() {
	const [packages, setPackages] = useState<IPackages[]>([]);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const getPackages = async () => {
			try {
				const res = await axiosInstance.get<IPackages[]>("/packages");
				setPackages(res.data);
			} catch (error) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("Failed to load updates");
				}
			}
		};

		getPackages();
	}, []);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-800">
					{error ?? "Something went wrong please try later"}
				</p>
			</div>
		);
	}

	// Empty state when no packages exist
	if (packages.length === 0) {
		return (
			<div className="min-h-screen">
				<main className="px-4 sm:px-6 lg:px-6 py-6">
					{/* Stats - Show 0 for all stats */}
					<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
						<Card>
							<CardContent className="px-6">
								<div className="flex items-center">
									<div className="p-2 bg-primary/10 rounded-lg">
										<MapPin className="w-6 h-6 text-primary" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium">
											Total Packages
										</p>
										<p className="text-2xl font-bold">0</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="px-6">
								<div className="flex items-center">
									<div className="p-2 bg-primary/10 rounded-lg">
										<Calendar className="w-6 h-6 text-primary" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium">Published</p>
										<p className="text-2xl font-bold">0</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="px-6">
								<div className="flex items-center">
									<div className="p-2 bg-primary/10 rounded-lg">
										<Users className="w-6 h-6 text-primary" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium">Drafts</p>
										<p className="text-2xl font-bold">0</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="px-6">
								<div className="flex items-center">
									<div className="p-2 bg-primary/10 rounded-lg">
										<IndianRupee className="w-6 h-6 text-primary" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium">Avg. Price</p>
										<p className="text-2xl font-bold">₹0</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<NavLink to="/packages/create">
							<div className="flex items-center bg-card hover:bg-secondary cursor-pointer rounded-xl border px-6 h-full">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Plus className="w-6 h-6 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">Create</p>
									<p className="text-2xl font-bold">Package</p>
								</div>
							</div>
						</NavLink>
					</div>

					{/* Empty State */}
					<div className="flex flex-col items-center justify-center py-16">
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6">
								<Package className="h-12 w-12 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold text-primary mb-2">
								No packages yet
							</h3>
							<p className="text-gray-600 mb-8 max-w-md">
								Get started by creating your first travel package. Add
								destinations, pricing, and details to attract customers.
							</p>
							<NavLink to="/packages/create">
								<Button size="lg" className="gap-2 cursor-pointer">
									<Plus className="h-5 w-5" />
									Create Your First Package
								</Button>
							</NavLink>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Main Content */}
			<main className="px-4 sm:px-6 lg:px-6 py-6">
				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
					<Card>
						<CardContent className="px-6">
							<div className="flex items-center">
								<div className="p-2 bg-primary/10 rounded-lg">
									<MapPin className="w-6 h-6 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">Total Packages</p>
									<p className="text-2xl font-bold">
										{packages.length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="px-6">
							<div className="flex items-center">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Calendar className="w-6 h-6 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">Published</p>
									<p className="text-2xl font-bold">
										{
											packages.filter(
												(pkg) => pkg.status === "published"
											).length
										}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="px-6">
							<div className="flex items-center">
								<div className="p-2 bg-primary/10 rounded-lg">
									<Users className="w-6 h-6 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">Drafts</p>
									<p className="text-2xl font-bold">
										{
											packages.filter(
												(pkg) => pkg.status === "draft"
											).length
										}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="px-6">
							<div className="flex items-center">
								<div className="p-2 bg-primary/10 rounded-lg">
									<IndianRupee className="w-6 h-6 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">Avg. Price</p>
									<p className="text-2xl font-bold">
										₹
										{Math.round(
											packages.reduce(
												(sum, pkg) =>
													sum + parseInt(pkg.price ?? "0"),
												0
											) / packages.length
										)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<NavLink to="/packages/create">
						<div className="flex items-center bg-card hover:bg-secondary cursor-pointer rounded-xl border px-6 h-full">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Plus className="w-6 h-6 text-primary" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium">Create</p>
								<p className="text-2xl font-bold">Package</p>
							</div>
						</div>
					</NavLink>
				</div>

				{/* Package Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{packages.map((pkg) => (
						<Card
							key={pkg.id}
							className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
						>
							<div className="relative">
								<img
									src={(() => {
										if (pkg?.thumbnail) {
											return getFileUrl(
												getServeFileUrl(pkg.thumbnail)
											);
										}
										return "/placeholder.svg";
									})()}
									alt={pkg.name || ""}
									className="w-full h-48 object-cover"
								/>
								<Badge
									className={`absolute top-2 right-2 ${
										pkg.status === "published"
											? "bg-green-500 hover:bg-green-600"
											: "bg-yellow-500 hover:bg-yellow-600"
									}`}
								>
									{pkg.status}
								</Badge>
							</div>

							<CardHeader>
								<CardTitle className="text-lg">{pkg.name}</CardTitle>
								<CardDescription className="flex items-center gap-1">
									<MapPin className="w-4 h-4" />
									{pkg.destination}
								</CardDescription>
							</CardHeader>

							<CardContent>
								<p className="text-sm  mb-4">{pkg.description}</p>

								<div className="space-y-2 mb-4">
									<div className="flex items-center justify-between text-sm">
										<span className="">Duration:</span>
										<span className="font-medium">
											{pkg.duration}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="">Max Guests:</span>
										<span className="font-medium">
											{pkg.maxGuests} people
										</span>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold text-primary">
										₹{pkg.price}
									</div>
									<div className="flex gap-2">
										<NavLink to={`/packages/edit/${pkg.id}`}>
											<Button
												variant="outline"
												size="sm"
												className="cursor-pointer"
											>
												Edit
											</Button>
										</NavLink>
										<NavLink to={`/packages/${pkg.id}`}>
											<Button size="sm" className="cursor-pointer">
												View
											</Button>
										</NavLink>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</main>
		</div>
	);
}
