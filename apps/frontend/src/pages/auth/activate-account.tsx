import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavLink, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

interface IActivationResult {
	success: boolean;
	message: string;
	status: "success" | "error" | "expired" | "invalid" | "already_active";
}

export default function ActivatePage() {
	const [result, setResult] = useState<IActivationResult>();
	const { id: token } = useParams<{ id: string }>();

	useEffect(() => {
		const activateUser = async () => {
			try {
				await axiosInstance.post<IActivationResult>(
					`/auth/activate-account/${token}`,
					{}
				);
			} catch (error: unknown) {
				if (error instanceof AxiosError) {
					setResult({
						message:
							error.response?.data.message ??
							"An unexpected error occurred",
						status: "error",
						success: false,
					});
				} else if (error instanceof Error) {
					setResult({
						message: error.message ?? "An unexpected error occurred",
						status: "error",
						success: false,
					});
				} else {
					setResult({
						message: "An unexpected error occurred",
						status: "error",
						success: false,
					});
				}
			}
		};
		activateUser();
	}, [token]);

	// Handle missing parameters
	if (!token) {
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
							<XCircle className="h-16 w-16 text-red-500" />
						</div>
						<CardTitle className="text-2xl font-bold">
							Invalid Activation Link
						</CardTitle>
						<CardDescription>
							The activation link appears to be invalid or incomplete.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert className="" variant="destructive">
							<AlertDescription className="text-red-800">
								Please check your email and click the correct activation
								link, or request a new one.
							</AlertDescription>
						</Alert>
						<div className="space-y-3">
							<Button
								asChild
								variant="outline"
								className="w-full bg-transparent"
							>
								<NavLink to="/resend-activation">
									Request New Activation Link
								</NavLink>
							</Button>
							<Button asChild variant="ghost" className="w-full">
								<NavLink to="/login">Back to Login</NavLink>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Handle successful activation
	if (result && result.success && result.status === "success") {
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
							<CheckCircle className="h-16 w-16 text-green-500" />
						</div>
						<CardTitle className="text-2xl font-bold">
							Account Activated!
						</CardTitle>
						<CardDescription>
							Welcome! Your account is now active and ready to use.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert className="" variant="default">
							<AlertDescription className="">
								{result.message}
							</AlertDescription>
						</Alert>
						<div className="space-y-3">
							<Button asChild className="w-full" size="lg">
								<NavLink to="/dashboard">Go to Dashboard</NavLink>
							</Button>
							<p className="text-sm text-gray-600 text-center">
								You can now access all features of your account.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Handle errors (expired, invalid, etc.)
	const getErrorIcon = () => {
		switch (result && result.status) {
			case "expired":
				return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
			default:
				return <XCircle className="h-16 w-16 text-red-500" />;
		}
	};

	const getErrorTitle = () => {
		switch (result && result.status) {
			case "expired":
				return "Link Expired";
			case "invalid":
				return "Invalid Link";
			default:
				return "Activation Failed";
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
					<div className="flex justify-center mb-4">{getErrorIcon()}</div>
					<CardTitle className="text-2xl font-bold">
						{getErrorTitle()}
					</CardTitle>
					<CardDescription>
						We encountered an issue while activating your account.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert
						className={
							result && result.status === "expired"
								? "border-yellow-200 bg-yellow-50"
								: "border-red-200 bg-red-50"
						}
					>
						<AlertDescription
							className={
								result && result.status === "expired"
									? "text-yellow-800"
									: "text-red-800"
							}
						>
							{result && result.message}
						</AlertDescription>
					</Alert>
					<div className="space-y-3">
						<Button
							asChild
							variant="outline"
							className="w-full bg-transparent"
						>
							<NavLink to="/resend-activation">
								Request New Activation Link
							</NavLink>
						</Button>
						<Button asChild variant="ghost" className="w-full">
							<NavLink to="/login">Back to Login</NavLink>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
