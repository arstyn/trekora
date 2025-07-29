import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { ILoginResponse } from "@/types/auth.types";
import { onboardingSchema, type SignupFormDTO } from "@/types/signup.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	CheckCircle,
	Globe,
	Lock,
	Mail,
	Phone,
	Sparkles,
	User,
	UserPlus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type Step = "signup" | "organization" | "team" | "complete";

export default function Signup() {
	const [currentStep, setCurrentStep] = useState<Step>("signup");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<SignupFormDTO>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			phone: "",
			orgName: "",
			orgSize: "",
			industry: "",
			website: "",
			description: "",
			teamMembers: [],
			notifications: true,
			newsletter: false,
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "teamMembers",
	});

	const steps = [
		{ id: "signup", title: "Personal Info", icon: User },
		{ id: "organization", title: "Organization", icon: Building2 },
		{ id: "team", title: "Team Setup", icon: Users },
		{ id: "complete", title: "Complete", icon: CheckCircle },
	];

	const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	const addTeamMember = () => {
		append({ email: "", role: "employee" });
	};

	const nextStep = async () => {
		const stepOrder: Step[] = ["signup", "organization", "team", "complete"];
		const currentIndex = stepOrder.indexOf(currentStep);

		if (currentIndex < stepOrder.length - 1) {
			// Validate current step before proceeding
			let isValid = false;

			switch (currentStep) {
				case "signup":
					isValid = await form.trigger([
						"firstName",
						"lastName",
						"email",
						"password",
					]);
					break;
				case "organization":
					isValid = await form.trigger(["orgName", "orgSize", "industry"]);
					break;
				case "team":
					// Team step is optional, so always allow proceeding
					isValid = true;
					break;
				default:
					isValid = true;
			}

			if (isValid) {
				setCurrentStep(stepOrder[currentIndex + 1] as Step);
			}
		}
	};

	const prevStep = () => {
		const stepOrder: Step[] = ["signup", "organization", "team", "complete"];
		const currentIndex = stepOrder.indexOf(currentStep);
		if (currentIndex > 0) {
			setCurrentStep(stepOrder[currentIndex - 1] as Step);
		}
	};

	const onSubmit = async (data: SignupFormDTO) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await axiosInstance.post<SignupFormDTO, ILoginResponse>(
				"/auth/signup",
				data
			);

			if (response) {
				console.log("🚀 ~ signup.tsx:161 ~ onSubmit ~ response:", response);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			if (err?.message === "NEXT_REDIRECT") {
				return;
			}
			setError("An unexpected error occurred");
			setIsLoading(false);
		}
	};

	const renderStepIndicator = () => (
		<div className="w-full max-w-2xl mx-auto mb-8">
			<div className="flex items-center justify-between mb-4">
				{steps.map((step, index) => {
					const StepIcon = step.icon;
					const isActive = step.id === currentStep;
					const isCompleted = index < currentStepIndex;

					return (
						<div key={step.id} className="flex flex-col items-center">
							<div
								className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                ${
					isActive
						? "bg-primary border-primary text-primary-foreground"
						: isCompleted
						? "bg-primary border-primary text-primary-foreground"
						: "bg-background border-muted-foreground/30 text-muted-foreground"
				}
              `}
							>
								<StepIcon className="w-5 h-5" />
							</div>
							<span
								className={`text-sm mt-2 font-medium ${
									isActive ? "text-primary" : "text-muted-foreground"
								}`}
							>
								{step.title}
							</span>
						</div>
					);
				})}
			</div>
			<Progress value={progress} className="h-2" />
		</div>
	);

	const renderSignupStep = () => (
		<Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Create Your Account</CardTitle>
				<CardDescription>
					Let's start with your personal information
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First Name</FormLabel>
								<FormControl>
									<Input placeholder="John" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last Name</FormLabel>
								<FormControl>
									<Input placeholder="Doe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Address</FormLabel>
							<FormControl>
								<div className="relative">
									<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="email"
										className="pl-10"
										placeholder="john@example.com"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="password"
										className="pl-10"
										placeholder="••••••••"
										{...field}
									/>
								</div>
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
							<FormLabel>Phone Number (Optional)</FormLabel>
							<FormControl>
								<div className="relative">
									<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="tel"
										className="pl-10"
										placeholder="+1 (555) 123-4567"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button onClick={nextStep} className="w-full">
					Continue <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);

	const renderOrganizationStep = () => (
		<Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Setup Your Organization</CardTitle>
				<CardDescription>
					Tell us about your company or organization
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormField
					control={form.control}
					name="orgName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Organization Name</FormLabel>
							<FormControl>
								<div className="relative">
									<Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										className="pl-10"
										placeholder="Acme Corporation"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="orgSize"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Organization Size</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select size" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="1-10">1-10 employees</SelectItem>
									<SelectItem value="11-50">11-50 employees</SelectItem>
									<SelectItem value="51-200">
										51-200 employees
									</SelectItem>
									<SelectItem value="201-1000">
										201-1000 employees
									</SelectItem>
									<SelectItem value="1000+">1000+ employees</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="industry"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Industry</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select industry" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="technology">Technology</SelectItem>
									<SelectItem value="healthcare">Healthcare</SelectItem>
									<SelectItem value="finance">Finance</SelectItem>
									<SelectItem value="education">Education</SelectItem>
									<SelectItem value="retail">Retail</SelectItem>
									<SelectItem value="manufacturing">
										Manufacturing
									</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Website (Optional)</FormLabel>
							<FormControl>
								<div className="relative">
									<Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										className="pl-10"
										placeholder="https://example.com"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description (Optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Brief description of your organization..."
									rows={3}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={prevStep}
						className="flex-1 bg-transparent"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button onClick={nextStep} className="flex-1">
						Continue <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	const renderTeamStep = () => (
		<Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Invite Your Team</CardTitle>
				<CardDescription>
					Add team members to collaborate (you can skip this step)
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{fields.length > 0 && (
					<div className="space-y-3">
						{fields.map((field, index) => (
							<div key={field.id} className="flex gap-2 items-end">
								<div className="flex-1 space-y-2">
									<FormField
										control={form.control}
										name={`teamMembers.${index}.email`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														placeholder="colleague@example.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="w-32 space-y-2">
									<FormField
										control={form.control}
										name={`teamMembers.${index}.role`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Role</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="admin">
															Admin
														</SelectItem>
														<SelectItem value="manager">
															Manager
														</SelectItem>
														<SelectItem value="employee">
															Employee
														</SelectItem>
														<SelectItem value="user">
															User
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => remove(index)}
								>
									Remove
								</Button>
							</div>
						))}
					</div>
				)}

				<Button
					variant="outline"
					onClick={addTeamMember}
					className="w-full bg-transparent"
				>
					<UserPlus className="mr-2 h-4 w-4" />
					Add Team Member
				</Button>

				<div className="space-y-3 pt-4 border-t">
					<FormField
						control={form.control}
						name="notifications"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm">
										Send me notifications about team activity
									</FormLabel>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="newsletter"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm">
										Subscribe to product updates and tips
									</FormLabel>
								</div>
							</FormItem>
						)}
					/>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={prevStep}
						className="flex-1 bg-transparent"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button onClick={nextStep} className="flex-1">
						Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	const renderCompleteStep = () => {
		const formData = form.getValues();

		return (
			<Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<CheckCircle className="w-8 h-8 text-primary" />
					</div>
					<CardTitle className="text-2xl">Welcome to the Platform!</CardTitle>
					<CardDescription>
						Your account and organization have been successfully created
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="bg-muted/30 rounded-lg p-4 space-y-3">
						<div className="flex items-center gap-3">
							<Avatar>
								<AvatarFallback>
									{formData.firstName[0]}
									{formData.lastName[0]}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">
									{formData.firstName} {formData.lastName}
								</p>
								<p className="text-sm text-muted-foreground">
									{formData.email}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 text-sm">
							<Building2 className="w-4 h-4 text-muted-foreground" />
							<span>{formData.orgName}</span>
							<Badge variant="secondary">{formData.orgSize}</Badge>
						</div>

						{formData.teamMembers.length > 0 && (
							<div className="flex items-center gap-2 text-sm">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span>
									{formData.teamMembers.length} team member(s) invited
								</span>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<h4 className="font-medium flex items-center gap-2">
							<Sparkles className="w-4 h-4" />
							What's next?
						</h4>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Check your email for verification</li>
							<li>• Explore your dashboard</li>
							<li>• Set up your first project</li>
							<li>• Invite more team members</li>
						</ul>
					</div>

					{error && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
							{error}
						</div>
					)}

					<Button
						onClick={() => form.handleSubmit(onSubmit)()}
						className="w-full"
						size="lg"
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<span className="animate-spin">◌</span>
								Setting up your account...
							</div>
						) : (
							"Go to Dashboard"
						)}
					</Button>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center py-10">
			{/* <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div> */}
			{/* Decorative elements */}
			<div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
			<div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

			{/* Geometric shapes */}
			<div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
			<div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
			<div className="container mx-auto">
				{renderStepIndicator()}

				<Form {...form}>
					{currentStep === "signup" && renderSignupStep()}
					{currentStep === "organization" && renderOrganizationStep()}
					{currentStep === "team" && renderTeamStep()}
					{currentStep === "complete" && renderCompleteStep()}
				</Form>
			</div>
		</div>
	);
}
