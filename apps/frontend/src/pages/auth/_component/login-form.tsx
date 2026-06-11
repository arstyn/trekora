import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/authContext";
import axiosInstance from "@/lib/axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants/auth.constants";
import type { ILoginResponse } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";

// Define schema using Zod
export const LoginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
	const { refresh } = useAuth();
	const navigate = useNavigate();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState<"email" | "otp">("email");
	const [otpValue, setOtpValue] = useState("");

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
		},
	});

	async function handleSendOtp() {
		const isEmailValid = await form.trigger("email");
		if (!isEmailValid) return;

		setIsLoading(true);
		setError(null);
		try {
			await axiosInstance.post("/auth/login/send-otp", {
				email: form.getValues("email"),
			});
			setStep("otp");
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
			} else if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("Failed to send OTP. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	async function handleLogin() {
		if (otpValue.length < 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const email = form.getValues("email");
			const res = await axiosInstance.post<ILoginResponse>("/auth/login", {
				email,
				otp: otpValue,
			});
			localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
			localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
			refresh();
			navigate("/");
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				setError(error.response?.data?.message || "Invalid OTP. Please try again.");
			} else if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An error occurred during login");
			}
		} finally {
			setIsLoading(false);
		}
	}

	if (step === "otp") {
		return (
			<div className="space-y-6 flex flex-col items-center">
				<div className="text-center w-full">
					<p className="text-sm text-muted-foreground">
						We sent a verification code to <span className="font-medium text-foreground">{form.getValues("email")}</span>.
					</p>
				</div>

				<div className="flex w-full justify-center py-2">
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

				{error && <p className="text-destructive text-sm w-full text-center">{error}</p>}

				<div className="flex gap-2 w-full">
					<Button
						variant="outline"
						type="button"
						onClick={() => {
							setStep("email");
							setError(null);
						}}
						className="flex-1 bg-transparent cursor-pointer"
						disabled={isLoading}
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button
						onClick={handleLogin}
						className="flex-1 cursor-pointer"
						disabled={otpValue.length < 6 || isLoading}
					>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSendOtp();
				}}
				className="space-y-4"
			>
				{/* Email Field */}
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
										placeholder="john@example.com"
										className="pl-10"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{error && <p className="text-destructive text-sm">{error}</p>}

				{/* Submit Button */}
				<Button
					type="submit"
					className="w-full cursor-pointer"
					disabled={isLoading}
				>
					{isLoading ? "Sending OTP..." : "Send OTP"}
				</Button>
			</form>
		</Form>
	);
}
