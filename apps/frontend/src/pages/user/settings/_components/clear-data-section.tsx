import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle, CheckSquare, Square, Loader2, KeyRound, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";

type ClearItemKey = "bookings" | "batches" | "customers" | "leads" | "employees" | "packages" | "payments" | "workflows";

interface ClearItemOption {
	key: ClearItemKey;
	label: string;
	description: string;
}

const CLEAR_OPTIONS: ClearItemOption[] = [
	{
		key: "bookings",
		label: "Bookings",
		description: "All bookings, payment records, and checklist items",
	},
	{
		key: "batches",
		label: "Batches",
		description: "All batch schedules, logs, and blocked slots",
	},
	{
		key: "customers",
		label: "Customers",
		description: "All customer profiles and client data",
	},
	{
		key: "leads",
		label: "Leads",
		description: "All leads, status updates, and associated reminders",
	},
	{
		key: "employees",
		label: "Employees",
		description: "All employee accounts (your active user account will be preserved)",
	},
	{
		key: "packages",
		label: "Packages",
		description: "All tour packages, itineraries, pricing tiers, and policies",
	},
	{
		key: "payments",
		label: "Payments",
		description: "All payment transactions, receipts, and history",
	},
	{
		key: "workflows",
		label: "Workflows",
		description: "All automated workflows, steps, and activity logs",
	},
];

export function ClearDataSection() {
	const { hasPermission, loading: permissionLoading } = useHasPermission("settings", "clear-data");
	const [selectedItems, setSelectedItems] = useState<Record<ClearItemKey, boolean>>({
		bookings: false,
		batches: false,
		customers: false,
		leads: false,
		employees: false,
		packages: false,
		payments: false,
		workflows: false,
	});
	const [step, setStep] = useState<"confirm" | "verify">("confirm");
	const [otp, setOtp] = useState("");
	const [maskedEmail, setMaskedEmail] = useState("");
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isClearing, setIsClearing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	if (permissionLoading || !hasPermission) {
		return null;
	}

	const selectedKeys = (Object.keys(selectedItems) as ClearItemKey[]).filter(
		(key) => selectedItems[key]
	);

	const isAnySelected = selectedKeys.length > 0;
	const isAllSelected = selectedKeys.length === CLEAR_OPTIONS.length;

	const handleToggleItem = (key: ClearItemKey) => {
		setSelectedItems((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSelectAll = () => {
		const targetState = !isAllSelected;
		const updatedState = { ...selectedItems };
		CLEAR_OPTIONS.forEach((opt) => {
			updatedState[opt.key] = targetState;
		});
		setSelectedItems(updatedState);
	};

	const handleOpenDialog = () => {
		if (!isAnySelected) return;
		setIsDialogOpen(true);
		setOtp("");
		setStep("confirm");
	};

	const handleSendOtp = async () => {
		setIsSendingOtp(true);
		try {
			const response = await axiosInstance.post<{
				message: string;
				maskedEmail: string;
			}>("/settings/send-clear-otp");

			setMaskedEmail(response.data.maskedEmail || "your email");
			setStep("verify");
			toast.success("Verification Code Sent", {
				description: response.data.message || "OTP code has been sent to your registered email.",
			});
		} catch (error: any) {
			const errorMsg = error?.response?.data?.message || "Failed to send OTP code.";
			toast.error("Error sending OTP", { description: errorMsg });
		} finally {
			setIsSendingOtp(false);
		}
	};

	const handleClearData = async () => {
		if (!isAnySelected) return;
		if (!otp || otp.trim().length !== 6) {
			toast.error("Please enter the 6-digit OTP verification code.");
			return;
		}

		setIsClearing(true);
		try {
			const response = await axiosInstance.post<{
				success: boolean;
				cleared: Record<string, number>;
			}>("/settings/clear-data", {
				...selectedItems,
				otp: otp.trim(),
			});

			if (response.data.success) {
				toast.success("Data cleared successfully", {
					description: "Selected organization entities have been permanently deleted.",
				});
				// Reset selection and dialog
				setSelectedItems({
					bookings: false,
					batches: false,
					customers: false,
					leads: false,
					employees: false,
					packages: false,
					payments: false,
					workflows: false,
				});
				setOtp("");
				setStep("confirm");
				setIsDialogOpen(false);
			} else {
				toast.error("Failed to clear data");
			}
		} catch (error: any) {
			const errorMsg = error?.response?.data?.message || "An error occurred while clearing data.";
			toast.error("Error clearing data", { description: errorMsg });
		} finally {
			setIsClearing(false);
		}
	};

	return (
		<Card className="md:col-span-2 border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2 text-destructive">
							<Trash2 className="h-5 w-5 text-destructive" />
							Clear Organization Data
						</CardTitle>
						<CardDescription>
							Selectively purge data records for your organization. This operation requires email OTP verification and cannot be undone.
						</CardDescription>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleSelectAll}
						className="text-xs"
					>
						{isAllSelected ? (
							<>
								<Square className="h-3.5 w-3.5 mr-1.5" />
								Deselect All
							</>
						) : (
							<>
								<CheckSquare className="h-3.5 w-3.5 mr-1.5" />
								Select All
							</>
						)}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
					{CLEAR_OPTIONS.map((option) => {
						const isChecked = selectedItems[option.key];
						return (
							<div
								key={option.key}
								onClick={() => handleToggleItem(option.key)}
								className={`flex items-start space-x-3 p-3.5 rounded-lg border transition-colors cursor-pointer select-none ${
									isChecked
										? "border-destructive bg-destructive/10 dark:bg-destructive/20"
										: "border-border hover:bg-muted/50"
								}`}
							>
								<Checkbox
									id={`clear-${option.key}`}
									checked={isChecked}
									onCheckedChange={() => handleToggleItem(option.key)}
									className="mt-0.5"
								/>
								<div className="grid gap-1">
									<Label
										htmlFor={`clear-${option.key}`}
										className="font-semibold text-sm cursor-pointer"
									>
										{option.label}
									</Label>
									<p className="text-xs text-muted-foreground leading-relaxed">
										{option.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex justify-end pt-2">
					<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								disabled={!isAnySelected || isClearing}
								onClick={handleOpenDialog}
								className="gap-2"
							>
								<Trash2 className="h-4 w-4" />
								Clear Selected Data ({selectedKeys.length})
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="sm:max-w-md">
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-5 w-5" />
									{step === "confirm" ? "Confirm Data Purge Request" : "Verify Email OTP"}
								</AlertDialogTitle>
								<AlertDialogDescription asChild>
									<div className="space-y-3 pt-2 text-muted-foreground text-sm">
										<p className="font-medium text-foreground">
											You are about to permanently delete data for:
										</p>
										<ul className="list-disc list-inside text-sm font-semibold text-destructive space-y-0.5">
											{selectedKeys.map((key) => {
												const opt = CLEAR_OPTIONS.find((o) => o.key === key);
												return <li key={key}>{opt?.label}</li>;
											})}
										</ul>

										{step === "confirm" ? (
											<p className="text-xs text-muted-foreground bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20">
												To proceed, click <strong>"Send OTP Code"</strong> below. A 6-digit verification code will be sent to your registered email address.
											</p>
										) : (
											<div className="bg-muted/60 p-4 rounded-lg border space-y-3 mt-3">
												<div className="flex items-center justify-between text-xs text-foreground font-medium">
													<span className="flex items-center gap-1.5">
														<Mail className="h-3.5 w-3.5 text-muted-foreground" />
														OTP sent to {maskedEmail}
													</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														disabled={isSendingOtp}
														onClick={handleSendOtp}
														className="h-auto p-0 text-xs text-primary hover:underline"
													>
														{isSendingOtp ? "Sending..." : "Resend Code"}
													</Button>
												</div>

												<div className="space-y-2">
													<Label className="text-xs font-semibold flex items-center justify-center gap-1.5 text-foreground">
														<KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
														Enter 6-Digit Verification Code
													</Label>
													<div className="flex w-full justify-center py-1">
														<InputOTP
															maxLength={6}
															value={otp}
															onChange={(val) => setOtp(val)}
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
												</div>
											</div>
										)}

										<p className="text-xs text-muted-foreground bg-destructive/10 p-2.5 rounded border border-destructive/20">
											<strong>Warning:</strong> This action cannot be undone once confirmed.
										</p>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="mt-4 sm:justify-between">
								<AlertDialogCancel disabled={isClearing || isSendingOtp}>
									Cancel
								</AlertDialogCancel>
								{step === "confirm" ? (
									<Button
										variant="destructive"
										onClick={handleSendOtp}
										disabled={isSendingOtp}
										className="gap-2"
									>
										{isSendingOtp ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Sending Code...
											</>
										) : (
											<>
												<Send className="h-4 w-4" />
												Send OTP Code
											</>
										)}
									</Button>
								) : (
									<Button
										variant="destructive"
										onClick={handleClearData}
										disabled={isClearing || isSendingOtp || otp.trim().length !== 6}
										className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
									>
										{isClearing ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Verifying & Purging...
											</>
										) : (
											"Verify OTP & Delete Data"
										)}
									</Button>
								)}
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</CardContent>
		</Card>
	);
}
