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
import { AxiosRequest } from "@/lib/axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants/auth.constants";
import type { ILoginDto, ILoginResponse } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Define schema using Zod
export const LoginSchema = z.object({
	email: z.string(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
	const navigate = useNavigate();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginFormValues) {
		setIsLoading(true);
		setError(null);

		try {
			const { accessToken, refreshToken } = await AxiosRequest.post<
				ILoginDto,
				ILoginResponse
			>("/auth/login", values);
			localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
			localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

			navigate("/dashboard");
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An error occurred during login");
			}
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Email Field */}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email </FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your email or phone number"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Password Field */}
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
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

				{error && <p className="text-red-500 text-sm">{error}</p>}

				{/* Submit Button */}
				<Button
					type="submit"
					className="w-full cursor-pointer"
					disabled={isLoading}
				>
					{isLoading ? "Logging in..." : "Login"}
				</Button>
			</form>
		</Form>
	);
}
