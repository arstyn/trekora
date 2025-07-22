import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AxiosRequest } from "@/lib/axios";
import { Download, Key, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AccountActionsSection() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			const response = await AxiosRequest.post<
				object,
				{ success: boolean; message: string }
			>("/auth/logout", {});

			if ("success" in response && response.success) {
				navigate("/");
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				toast("Logged Out", {
					description: "You have been successfully logged out.",
				});
			} else {
				toast("Error", {
					description: "Logout failed. Please try again.",
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to load updates");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePassword = () => {
		toast("Change Password", {
			description: "Password change functionality would be implemented here.",
		});
	};

	const handleDownloadData = () => {
		toast("Download Data", {
			description: "Data download functionality would be implemented here.",
		});
	};

	return (
		<Card className="md:col-span-2">
			<CardHeader>
				<CardTitle>Account Actions</CardTitle>
				<CardDescription>Manage your account and session</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row gap-4">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleChangePassword}
					>
						<Key className="h-4 w-4 mr-2" />
						Change Password
					</Button>
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleDownloadData}
					>
						<Download className="h-4 w-4 mr-2" />
						Download Data
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" className="flex-1">
								<LogOut className="h-4 w-4 mr-2" />
								Logout
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you sure you want to logout?
								</AlertDialogTitle>
								<AlertDialogDescription>
									You will be signed out of your account and redirected
									to the login page.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleLogout}
									disabled={isLoading}
								>
									{isLoading ? "Logging out..." : "Logout"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</CardContent>
		</Card>
	);
}
