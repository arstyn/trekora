import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2, CheckCircle, Globe, Users, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const onboardingSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().optional(),
    orgName: z.string().min(2, "Organization name must be at least 2 characters"),
    orgSize: z.string().min(1, "Please select organization size"),
    industry: z.string().min(1, "Please select industry"),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    description: z.string().optional(),
    teamMembers: z.array(
        z.object({
            email: z.string().email("Please enter a valid email address"),
            role: z.string().min(1, "Please select a role"),
        })
    ),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

type Step = "personal" | "organization" | "team" | "complete";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<Step>("personal");
    const [isLoading, setIsLoading] = useState(false);
    const { refresh } = useAuth();

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            orgName: "",
            orgSize: "",
            industry: "",
            website: "",
            description: "",
            teamMembers: [],
        },
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "teamMembers",
    });

    const steps = [
        { id: "personal", title: "Personal Info", icon: User },
        { id: "organization", title: "Organization", icon: Building2 },
        { id: "team", title: "Invite Team", icon: Users },
        { id: "complete", title: "Complete", icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    // Load existing default organization info on mount
    useEffect(() => {
        const fetchCurrentOrg = async () => {
            try {
                const res = await axiosInstance.get("/employee/profile");
                if (res.data?.organization) {
                    const org = res.data.organization;
                    form.reset({
                        firstName: "",
                        lastName: "",
                        phone: "",
                        orgName: org.name || "",
                        orgSize: org.size || "",
                        industry: org.industry || "",
                        website: org.domain || "",
                        description: org.description || "",
                        teamMembers: [],
                    });
                }
            } catch (err) {
                console.error("Failed to fetch initial profile organization", err);
            }
        };
        fetchCurrentOrg();
    }, [form]);

    const addTeamMember = () => {
        append({ email: "", role: "employee" });
    };

    const nextStep = async () => {
        if (currentStep === "personal") {
            const isValid = await form.trigger(["firstName", "lastName", "phone"]);
            if (!isValid) return;
            setCurrentStep("organization");
        } else if (currentStep === "organization") {
            const isValid = await form.trigger(["orgName", "orgSize", "industry", "website", "description"]);
            if (!isValid) return;
            setCurrentStep("team");
        } else if (currentStep === "team") {
            const isValid = await form.trigger(["teamMembers"]);
            if (!isValid) return;
            setCurrentStep("complete");
        }
    };

    const prevStep = () => {
        if (currentStep === "organization") {
            setCurrentStep("personal");
        } else if (currentStep === "team") {
            setCurrentStep("organization");
        } else if (currentStep === "complete") {
            setCurrentStep("team");
        }
    };

    const onSubmit = async (data: OnboardingFormValues) => {
        setIsLoading(true);
        try {
            await axiosInstance.post("/auth/complete-onboarding", data);
            toast.success("Welcome aboard! Onboarding completed successfully.");
            await refresh();
        } catch (err: any) {
            console.error("Onboarding submission failed", err);
            toast.error(err.response?.data?.message || "Failed to complete onboarding. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="w-full max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${
                                        isActive
                                            ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                                            : isCompleted
                                              ? "bg-primary border-primary text-primary-foreground"
                                              : "bg-background border-muted-foreground/30 text-muted-foreground"
                                    }
                                `}
                            >
                                <StepIcon className="w-5 h-5" />
                            </div>
                            <span
                                className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                                }`}
                            >
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
            <Progress value={progress} className="h-1.5 transition-all duration-500" />
        </div>
    );

    const renderPersonalStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-primary/5">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Personal Information</CardTitle>
                <CardDescription>Let's complete your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium">First Name</FormLabel>
                                <FormControl>
                                    <Input className="h-10 transition-all focus:border-primary" placeholder="John" {...field} />
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
                                <FormLabel className="font-medium">Last Name</FormLabel>
                                <FormControl>
                                    <Input className="h-10 transition-all focus:border-primary" placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Phone Number (Optional)</FormLabel>
                            <FormControl>
                                <Input className="h-10 transition-all focus:border-primary" placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="button" onClick={nextStep} className="w-full h-10 mt-2 font-medium cursor-pointer transition-all hover:bg-primary/90">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );

    const renderOrganizationStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-primary/5">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Organization Profile</CardTitle>
                <CardDescription>Tell us a bit about your organization to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="orgName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Organization Name</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-10 h-10 transition-all focus:border-primary" placeholder="Acme Corporation" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="orgSize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium">Organization Size</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
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
                                <FormLabel className="font-medium">Industry</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="travel-agency">Travel Agencies</SelectItem>
                                        <SelectItem value="hotel-resort">Hotels & Resorts</SelectItem>
                                        <SelectItem value="hajj-umra">Hajj & Umra</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Website (Optional)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-10 h-10 transition-all focus:border-primary" placeholder="https://example.com" {...field} />
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
                            <FormLabel className="font-medium">Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea className="transition-all focus:border-primary" placeholder="A brief description of your organization..." rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 w-full mt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-10 font-medium cursor-pointer">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1 h-10 font-medium cursor-pointer">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderTeamStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Invite Your Team</CardTitle>
                <CardDescription>Invite members to collaborate (you can skip this step and add them later)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-end border border-muted p-3 rounded-lg bg-card/50">
                                <div className="flex-1 space-y-1">
                                    <FormField
                                        control={form.control}
                                        name={`teamMembers.${index}.email`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                                                <FormControl>
                                                    <Input className="h-9" placeholder="colleague@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="w-28 space-y-1">
                                    <FormField
                                        control={form.control}
                                        name={`teamMembers.${index}.role`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold">Role</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="employee">Employee</SelectItem>
                                                        <SelectItem value="user">User</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 cursor-pointer border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-muted rounded-lg text-center bg-card/25">
                        <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground mb-1">No team members added yet</p>
                        <p className="text-xs text-muted-foreground/70 mb-3">Add teammates to collaborate in real-time</p>
                    </div>
                )}

                <Button type="button" variant="outline" onClick={addTeamMember} className="w-full h-10 font-medium cursor-pointer hover:bg-secondary">
                    <Plus className="w-4 h-4 mr-2" /> Add Team Member
                </Button>

                <div className="flex gap-2 w-full mt-4">
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-10 font-medium cursor-pointer">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1 h-10 font-medium cursor-pointer">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderCompleteStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Ready to launch!</CardTitle>
                <CardDescription>Confirm your setup below and let's get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="border border-muted p-4 rounded-lg bg-card/50 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</h4>
                            <p className="text-sm font-semibold">{form.getValues("firstName")} {form.getValues("lastName")}</p>
                        </div>
                        {form.getValues("phone") && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</h4>
                                <p className="text-sm font-medium">{form.getValues("phone")}</p>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-muted/50 pt-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization Name</h4>
                        <p className="text-base font-semibold">{form.getValues("orgName")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</h4>
                            <p className="text-sm font-medium">{form.getValues("orgSize")} employees</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</h4>
                            <p className="text-sm font-medium capitalize">{form.getValues("industry").replace("-", " ")}</p>
                        </div>
                    </div>
                    {form.getValues("website") && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</h4>
                            <p className="text-sm font-medium text-primary hover:underline">{form.getValues("website")}</p>
                        </div>
                    )}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invited Members</h4>
                        <p className="text-sm font-medium">{form.getValues("teamMembers").length} teammate(s)</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full">
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-10 font-medium cursor-pointer" disabled={isLoading}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} className="flex-1 h-10 font-medium cursor-pointer" disabled={isLoading}>
                        {isLoading ? "Setting up..." : "Complete Setup"} <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-gradient-to-tr from-background via-background/98 to-primary/5">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-xl">
                    {renderStepIndicator()}
                    {currentStep === "personal" && renderPersonalStep()}
                    {currentStep === "organization" && renderOrganizationStep()}
                    {currentStep === "team" && renderTeamStep()}
                    {currentStep === "complete" && renderCompleteStep()}
                </form>
            </Form>
        </div>
    );
}
