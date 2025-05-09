"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "../action";
import { Eye, EyeClosed } from "lucide-react";

// Define schema using Zod
export const LoginSchema = z.object({
	email: z.string(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
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
			await login(values);
		} catch (error) {
			console.log("🚀 ~ login-form.tsx:47 ~ onSubmit ~ error:", error);
			setError("An error occurred during login");
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
							<FormLabel>Email or Phone Number</FormLabel>
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
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <Eye /> : <EyeClosed />}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{error && <p className="text-red-500 text-sm">{error}</p>}

				{/* Submit Button */}
				<Button type="submit" className="w-full">
					{isLoading ? "Logging in..." : "Login"}
				</Button>
			</form>
		</Form>
	);
}
