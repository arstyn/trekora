import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/authContext";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants/auth.constants";
import type { ILoginResponse } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ArrowRight,
    Mail,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

type Step = "email" | "verify-otp";

export default function Signup() {
    const { refresh } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange",
    });

    const steps = [
        { id: "email", title: "Email Verify", icon: Mail },
        { id: "verify-otp", title: "Verify OTP", icon: Mail },
    ];

    const currentStepIndex = currentStep === "email" ? 0 : 1;
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
            const email = form.getValues("email");
            const response = await axiosInstance.post("/auth/verify-otp", {
                email,
                otp: otpValue,
            });

            // Immediately register/signup the user
            const signupResponse = await axiosInstance.post<any, { data: ILoginResponse }>("/auth/signup", {
                email,
                otpToken: response.data.otpToken,
                notifications: true,
                newsletter: false,
            });

            // Save tokens and login user
            localStorage.setItem(ACCESS_TOKEN_KEY, signupResponse.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, signupResponse.data.refreshToken);
            refresh();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Invalid OTP or signup failed. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        if (currentStep === "email") {
            await handleSendOtp();
        } else if (currentStep === "verify-otp") {
            await handleVerifyOtp();
        }
    };

    const prevStep = () => {
        if (currentStep === "verify-otp") {
            setCurrentStep("email");
            setError(null);
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
                        <div
                            key={step.id}
                            className="flex flex-col items-center"
                        >
                            <div
                                className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isActive
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
                                className={`text-xs mt-2 font-medium transition-colors duration-300 ${isActive
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground"
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

    const renderEmailStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-primary/5">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Get Started</CardTitle>
                <CardDescription>
                    Enter your email to verify your account or sign up with Google
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full h-10 flex items-center justify-center gap-2 font-medium cursor-pointer"
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

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with otp
                        </span>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Email Address</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        className="pl-10 h-10 transition-all focus:border-primary"
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
                    className="w-full h-10 font-medium cursor-pointer transition-all hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending OTP..." : "Continue with Email"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );

    const renderVerifyOtpStep = () => (
        <Card className="mx-auto max-w-xl w-full border-muted bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Verify Your Email</CardTitle>
                <CardDescription>
                    We sent a verification code to {form.getValues("email")}. Please enter it below.
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
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md w-full text-center">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 w-full">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-10 font-medium cursor-pointer"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={nextStep}
                        className="flex-1 h-10 font-medium cursor-pointer"
                        disabled={otpValue.length < 6 || isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify & Sign Up"}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-gradient-to-tr from-background via-background/98 to-primary/5">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl pointer-events-none" />

            <div className="container mx-auto z-10">
                {renderStepIndicator()}

                <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="w-full">
                        {currentStep === "email"
                            ? renderEmailStep()
                            : renderVerifyOtpStep()}
                    </form>
                </Form>
            </div>
        </div>
    );
}
