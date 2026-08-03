import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { Building2, CheckCircle2, XCircle, AlertCircle, LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

interface IInviteDetails {
	valid: boolean;
	email: string;
	employeeName?: string;
	employeeDesignation?: string;
	organizationName?: string;
	organizationId?: string;
	branchName?: string;
	isExistingUser: boolean;
}

export default function AcceptInvitationPage() {
	const { id: token } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [details, setDetails] = useState<IInviteDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [actionSuccess, setActionSuccess] = useState<string | null>(null);

	const isLoggedIn = !!localStorage.getItem("accessToken");

	useEffect(() => {
		const fetchDetails = async () => {
			if (!token) {
				setError("Invalid invitation token");
				setIsLoading(false);
				return;
			}
			try {
				const res = await axiosInstance.get<IInviteDetails>(`/user-invite/details/${token}`);
				setDetails(res.data);
			} catch (err: unknown) {
				if (err instanceof AxiosError) {
					setError(err.response?.data?.message || "Invalid or expired invitation link.");
				} else {
					setError("Failed to load invitation details.");
				}
			} finally {
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [token]);

	const handleAccept = async () => {
		if (!token) return;
		setIsSubmitting(true);
		setError(null);
		try {
			const res = await axiosInstance.post(`/user-invite/accept-org`, { token });
			setActionSuccess(res.data.message || "Successfully joined organization!");
			if (res.data.organizationId) {
				localStorage.setItem("activeOrganizationId", res.data.organizationId);
			}
			setTimeout(() => {
				window.location.href = "/";
			}, 1500);
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || "Failed to accept invitation.");
			} else {
				setError("An error occurred while accepting invitation.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDecline = async () => {
		if (!token) return;
		setIsSubmitting(true);
		setError(null);
		try {
			await axiosInstance.post(`/user-invite/decline-org`, { token });
			setActionSuccess("Invitation declined.");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (err: unknown) {
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || "Failed to decline invitation.");
			} else {
				setError("An error occurred while declining invitation.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
						</div>
						<CardTitle className="text-xl font-bold">Loading Invitation...</CardTitle>
						<CardDescription>Please wait while we verify your invitation link.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (error && !details) {
		return (
			<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<XCircle className="h-16 w-16 text-destructive" />
						</div>
						<CardTitle className="text-2xl font-bold">Invitation Error</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-center">
						<Button asChild className="w-full" variant="outline">
							<NavLink to="/login">Go to Login</NavLink>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (actionSuccess) {
		return (
			<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
				<Card className="w-full max-w-md border shadow-lg">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
						</div>
						<CardTitle className="text-2xl font-bold">Action Completed</CardTitle>
						<CardDescription>{actionSuccess}</CardDescription>
					</CardHeader>
					<CardContent className="text-center text-sm text-muted-foreground">
						Redirecting you shortly...
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
			{/* Background Glows */}
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

			<Card className="w-full max-w-lg border shadow-xl backdrop-blur-sm bg-card/95">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
						<Building2 className="w-7 h-7 text-primary" />
					</div>
					<Badge variant="secondary" className="mx-auto mb-2 text-xs uppercase tracking-wider">
						Organization Invitation
					</Badge>
					<CardTitle className="text-2xl font-bold tracking-tight">
						Join {details?.organizationName || "New Organization"}
					</CardTitle>
					<CardDescription>
						You have been invited to join <span className="font-medium text-foreground">{details?.organizationName}</span> on Trekora.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6 pt-4">
					{/* Invitation Summary Card */}
					<div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">Invited Email:</span>
							<span className="font-medium text-foreground">{details?.email}</span>
						</div>
						{details?.employeeName && (
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Name:</span>
								<span className="font-medium text-foreground">{details.employeeName}</span>
							</div>
						)}
						{details?.employeeDesignation && (
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Role / Designation:</span>
								<span className="font-medium text-foreground">{details.employeeDesignation}</span>
							</div>
						)}
						{details?.branchName && (
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Branch:</span>
								<span className="font-medium text-foreground">{details.branchName}</span>
							</div>
						)}
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Logged Out Warning */}
					{!isLoggedIn ? (
						<div className="space-y-4">
							<Alert variant="default" className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
								<LogIn className="h-4 w-4 text-amber-600 dark:text-amber-400" />
								<AlertTitle className="font-semibold">Login Required</AlertTitle>
								<AlertDescription className="text-xs">
									You must be logged into your account ({details?.email}) before accepting this invitation.
								</AlertDescription>
							</Alert>

							<Button asChild className="w-full gap-2" size="lg">
								<NavLink to={`/login?redirect=/accept-invitation/${token}`}>
									Log In to Accept <ArrowRight className="w-4 h-4" />
								</NavLink>
							</Button>
						</div>
					) : (
						/* Action Buttons */
						<div className="space-y-3">
							<Button
								onClick={handleAccept}
								disabled={isSubmitting}
								className="w-full gap-2 font-semibold"
								size="lg"
							>
								<ShieldCheck className="w-5 h-5" />
								{isSubmitting ? "Accepting..." : "Accept Invitation"}
							</Button>

							<Button
								onClick={handleDecline}
								disabled={isSubmitting}
								variant="outline"
								className="w-full text-muted-foreground hover:text-destructive hover:border-destructive/50"
							>
								{isSubmitting ? "Processing..." : "Decline"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
