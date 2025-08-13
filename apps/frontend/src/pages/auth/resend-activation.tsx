import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import { NavLink } from "react-router-dom";

export default function ResendActivationPage() {
	const [email, setEmail] = useState("");
	const [result, setResult] = useState<null | {
		success: boolean;
		message: string;
	}>();
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setResult(null);
		try {
			const res = await axiosInstance.post("/auth/resend-activation", { email });
			console.log("🚀 ~ resend-activation.tsx:29 ~ handleSubmit ~ res:", res);

			// setResult(res);
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				setResult({
					message:
						error.response?.data.message ?? "An unexpected error occurred",
					success: false,
				});
			} else if (error instanceof Error) {
				setResult({
					message: error.message ?? "An unexpected error occurred",
					success: false,
				});
			} else {
				setResult({
					message: "An unexpected error occurred",
					success: false,
				});
			}
		}
	};

	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
			{/* Decorative elements */}
			<div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
			<div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

			{/* Geometric shapes */}
			<div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
			<div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />

			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						{result?.success ? (
							<CheckCircle className="h-16 w-16 text-green-500" />
						) : result ? (
							<XCircle className="h-16 w-16 text-red-500" />
						) : null}
					</div>
					<CardTitle className="text-2xl font-bold">
						Resend Activation Link
					</CardTitle>
					<CardDescription>
						Enter your email to receive a new activation link.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							type="email"
							required
							placeholder="Email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
							disabled={loading || result?.success}
						/>
						{result && (
							<Alert variant={result.success ? "default" : "destructive"}>
								<AlertDescription>{result.message}</AlertDescription>
							</Alert>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={loading || result?.success}
						>
							{loading ? "Sending..." : "Send Activation Link"}
						</Button>
					</form>
					<div className="space-y-3">
						<Button asChild variant="ghost" className="w-full">
							<NavLink to="/login">Back to Login</NavLink>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
