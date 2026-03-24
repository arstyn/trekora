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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import axiosInstance from "@/lib/axios";
import type { ILoginResponse } from "@/types/auth.types";
import { onboardingSchema, type SignupFormDTO } from "@/types/signup.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle,
    Eye,
    EyeClosed,
    Globe,
    Mail,
    Phone,
    User,
    UserPlus,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type Step =
    | "email"
    | "verify-otp"
    | "signup"
    | "organization"
    | "team"
    | "complete";

export default function Signup() {
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupComplete, setSignupComplete] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const form = useForm<SignupFormDTO>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            otpToken: "",
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
        { id: "email", title: "Email Verify", icon: Mail },
        { id: "signup", title: "Personal Info", icon: User },
        { id: "organization", title: "Organization", icon: Building2 },
        { id: "team", title: "Team Setup", icon: Users },
        { id: "complete", title: "Complete", icon: CheckCircle },
    ];

    // Helper to calculate progress index treating email and verify-otp as the first visual step
    const getVisualStepIndex = (step: Step) => {
        if (step === "email" || step === "verify-otp") return 0;
        return steps.findIndex((s) => s.id === step);
    };

    const currentStepIndex = getVisualStepIndex(currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const addTeamMember = () => {
        append({ email: "", role: "employee" });
    };

    const handleGoogleAuth = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google`;
    };

    const handleSendOtp = async () => {
        const isValid = await form.trigger(["email"]);
        if (!isValid) return;

        setIsLoading(true);
        setError(null);
        try {
            await axiosInstance.post("/auth/send-otp", {
                email: form.getValues("email"),
            });
            setCurrentStep("verify-otp");
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                    "Failed to send OTP. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post("/auth/verify-otp", {
                email: form.getValues("email"),
                otp: otpValue,
            });
            form.setValue("otpToken", response.data.otpToken);
            setCurrentStep("signup");
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                    "Invalid OTP. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        const stepOrder: Step[] = [
            "email",
            "verify-otp",
            "signup",
            "organization",
            "team",
            "complete",
        ];
        const currentIndex = stepOrder.indexOf(currentStep);

        if (currentIndex < stepOrder.length - 1) {
            let isValid = false;

            switch (currentStep) {
                case "email":
                    await handleSendOtp();
                    return; // handeled by handleSendOtp
                case "verify-otp":
                    await handleVerifyOtp();
                    return; // handled by handleVerifyOtp
                case "signup":
                    isValid = await form.trigger([
                        "firstName",
                        "lastName",
                        "password",
                    ]);
                    break;
                case "organization":
                    isValid = await form.trigger([
                        "orgName",
                        "orgSize",
                        "industry",
                    ]);
                    break;
                case "team":
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
        const stepOrder: Step[] = [
            "email",
            "verify-otp",
            "signup",
            "organization",
            "team",
            "complete",
        ];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1] as Step);
        }
    };

    const onSubmit = async (data: SignupFormDTO) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<
                SignupFormDTO,
                ILoginResponse
            >("/auth/signup", data);

            if (response) {
                setSignupComplete(true);
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(
                    error.response?.data.message ??
                        "An unexpected error occurred",
                );
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = step.id === steps[currentStepIndex].id;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center"
                        >
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
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
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

    const renderEmailStep = () => (
        <Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>
                    Enter your email to verify your account or sign up with
                    Google
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full h-12 flex items-center justify-center gap-2 font-medium"
                    onClick={handleGoogleAuth}
                    type="button"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with logically
                        </span>
                    </div>
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

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <Button
                    onClick={nextStep}
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending OTP..." : "Continue with Email"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );

    const renderVerifyOtpStep = () => (
        <Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                    We sent a verification code to {form.getValues("email")}.
                    Please enter it below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
                <div className="flex w-full justify-center py-4">
                    <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(val) => setOtpValue(val)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md w-full">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 w-full">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 bg-transparent"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={nextStep}
                        className="flex-1"
                        disabled={otpValue.length < 6 || isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderSignupStep = () => (
        <Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription>
                    Let's set up your profile details
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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Enter your password"
                                        {...field}
                                    />
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPassword(!showPassword);
                                        }}
                                    >
                                        {showPassword ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeClosed className="w-4 h-4" />
                                        )}
                                    </button>
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

                <div className="flex gap-2 w-full">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 bg-transparent"
                    >
                        {/* We skip verify-otp to go back to email smoothly optionally, but normally back takes to previous */}
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={nextStep} className="flex-1">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderOrganizationStep = () => (
        <Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                    Setup Your Organization
                </CardTitle>
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
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1-10">
                                        1-10 employees
                                    </SelectItem>
                                    <SelectItem value="11-50">
                                        11-50 employees
                                    </SelectItem>
                                    <SelectItem value="51-200">
                                        51-200 employees
                                    </SelectItem>
                                    <SelectItem value="201-1000">
                                        201-1000 employees
                                    </SelectItem>
                                    <SelectItem value="1000+">
                                        1000+ employees
                                    </SelectItem>
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
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="travel-agency">
                                        Travel Agencies
                                    </SelectItem>
                                    <SelectItem value="hotel-resort">
                                        Hotels & Resorts
                                    </SelectItem>
                                    <SelectItem value="hajj-umra">
                                        Hajj & Umra
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
                            <div
                                key={field.id}
                                className="flex gap-2 items-end"
                            >
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
                                                    onValueChange={
                                                        field.onChange
                                                    }
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
                                        Send me notifications about team
                                        activity
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

    const renderReviewStep = () => {
        const formData = form.getValues();

        return (
            <Card className="mx-auto max-w-2xl w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Review Your Information
                    </CardTitle>
                    <CardDescription>
                        Make sure everything looks good before completing
                        registration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Personal Info</h4>
                        <p>
                            {formData.firstName} {formData.lastName}
                        </p>
                        <p>{formData.email}</p>
                        {formData.phone && <p>{formData.phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold">Organization</h4>
                        <p>
                            {formData.orgName} ({formData.orgSize})
                        </p>
                        <p>{formData.industry}</p>
                        {formData.website && <p>{formData.website}</p>}
                        {formData.description && <p>{formData.description}</p>}
                    </div>

                    {formData.teamMembers.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Team Members</h4>
                            <ul className="list-disc pl-4">
                                {formData.teamMembers.map((m, i) => (
                                    <li key={i}>
                                        {m.email} — {m.role}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-semibold">Preferences</h4>
                        <p>
                            Notifications:{" "}
                            {formData.notifications ? "Yes" : "No"}
                        </p>
                        <p>Newsletter: {formData.newsletter ? "Yes" : "No"}</p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1 bg-transparent"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                            onClick={() => form.handleSubmit(onSubmit)()}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing Up..." : "Sign Up"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderSignupConfirmation = () => (
        <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl text-center">
            <CardHeader>
                <CardTitle className="text-2xl">You're All Set!</CardTitle>
                <CardDescription>
                    Your account has been created successfully. You can now
                    login.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    className="w-full mt-4"
                    onClick={() => (window.location.href = "/login")}
                >
                    Go to Login
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center py-10">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

            {/* Geometric shapes */}
            <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
            <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
            <div className="container mx-auto z-10">
                {!signupComplete && renderStepIndicator()}

                <Form {...form}>
                    {signupComplete
                        ? renderSignupConfirmation()
                        : currentStep === "email"
                          ? renderEmailStep()
                          : currentStep === "verify-otp"
                            ? renderVerifyOtpStep()
                            : currentStep === "signup"
                              ? renderSignupStep()
                              : currentStep === "organization"
                                ? renderOrganizationStep()
                                : currentStep === "team"
                                  ? renderTeamStep()
                                  : renderReviewStep()}
                </Form>
            </div>
        </div>
    );
}
