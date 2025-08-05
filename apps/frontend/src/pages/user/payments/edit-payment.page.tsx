import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Upload, Loader2, AlertTriangle, Trash2, Eye, Download, FileText } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import PaymentService from "@/services/payment.service";
import type { Payment, UpdatePaymentDto, FileManager } from "@/types/payment.types";
import { 
	PaymentType, 
	PaymentMethod, 
	PaymentStatus 
} from "@/types/payment.types";
import { useToast } from "@/hooks/use-toast";

export default function EditPaymentPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [paymentData, setPaymentData] = useState<Payment | null>(null);
	const [receiptFiles, setReceiptFiles] = useState<FileManager[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const { toast } = useToast();

	const [formData, setFormData] = useState({
		amount: "",
		paymentType: "",
		paymentMethod: "",
		paymentReference: "",
		transactionId: "",
		paymentDate: "",
		paymentScreenshot: null as File | null,
		notes: "",
		status: "",
	});

	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (id) {
			loadPaymentDetails();
		}
	}, [id]);

	const loadPaymentDetails = async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError(null);
			
			// Load payment details with receipt files
			const [payment, receipts] = await Promise.all([
				PaymentService.getPaymentById(id, true),
				PaymentService.getPaymentReceipts(id).catch(() => []) // Fallback to empty array if fails
			]);
			
			setPaymentData(payment);
			setReceiptFiles(receipts);
			
			// Populate form with existing data
			setFormData({
				amount: payment.amount.toString(),
				paymentType: payment.paymentType,
				paymentMethod: payment.paymentMethod,
				paymentReference: payment.paymentReference || "",
				transactionId: payment.transactionId || "",
				paymentDate: payment.paymentDate.split('T')[0], // Format for date input
				paymentScreenshot: null,
				notes: payment.notes || "",
				status: payment.status,
			});
		} catch (error) {
			console.error("Error loading payment details:", error);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const errorMessage = (error as any)?.response?.status === 404 
				? "Payment not found"
				: "Failed to load payment details. Please try again.";
			setError(errorMessage);
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!formData.amount || Number(formData.amount) <= 0) {
			errors.amount = "Please enter a valid amount";
		}

		if (paymentData && Number(formData.amount) > paymentData.booking.balanceAmount + paymentData.amount) {
			// Allow current amount + available balance
			const maxAllowed = paymentData.booking.balanceAmount + paymentData.amount;
			errors.amount = `Amount cannot exceed ${formatCurrency(maxAllowed)}`;
		}

		if (!formData.paymentType) {
			errors.paymentType = "Please select a payment type";
		}

		if (!formData.paymentMethod) {
			errors.paymentMethod = "Please select a payment method";
		}

		if (!formData.paymentDate) {
			errors.paymentDate = "Please select a payment date";
		}

		if (!formData.status) {
			errors.status = "Please select a status";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setHasChanges(true);
		
		// Clear validation error for this field
		if (validationErrors[field]) {
			setValidationErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0 || !id) return;

		// Validate file types and size
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
		const maxSize = 5 * 1024 * 1024; // 5MB

		for (const file of Array.from(files)) {
			if (!allowedTypes.includes(file.type)) {
				toast({
					title: "Invalid file type",
					description: "Please upload only JPEG, PNG, or PDF files.",
					variant: "destructive",
				});
				return;
			}

			if (file.size > maxSize) {
				toast({
					title: "File too large",
					description: "Please upload files smaller than 5MB.",
					variant: "destructive",
				});
				return;
			}
		}

		try {
			setUploading(true);
			
			let newFiles: FileManager[];
			
			if (files.length === 1) {
				// Single file upload
				const newFile = await PaymentService.uploadReceipt(id, files[0]);
				newFiles = [newFile];
			} else {
				// Multiple file upload
				newFiles = await PaymentService.uploadReceipts(id, Array.from(files));
			}
			
			// Add new files to local state
			setReceiptFiles(prev => [...prev, ...newFiles]);
			setHasChanges(true);
			
			toast({
				title: "Success",
				description: `${files.length} receipt file(s) uploaded successfully.`,
			});
		} catch (error) {
			console.error("Error uploading receipt files:", error);
			toast({
				title: "Error",
				description: "Failed to upload receipt files. Please try again.",
				variant: "destructive",
			});
		} finally {
			setUploading(false);
			// Reset file input
			event.target.value = '';
		}
	};

	const handleDeleteReceiptFile = async (fileId: string) => {
		if (!id) return;

		try {
			await PaymentService.deleteReceiptFile(id, fileId);
			
			// Remove file from local state
			setReceiptFiles(prev => prev.filter(file => file.id !== fileId));
			setHasChanges(true);
			
			toast({
				title: "Success",
				description: "Receipt file deleted successfully.",
			});
		} catch (error) {
			console.error("Error deleting receipt file:", error);
			toast({
				title: "Error",
				description: "Failed to delete receipt file. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm() || !id) {
			return;
		}

		try {
			setSubmitting(true);
			setError(null);

			// Check if payment can be modified
			if (paymentData?.status === "completed" || paymentData?.status === "refunded") {
				// Only allow status and notes changes for completed/refunded payments
				const updateData: UpdatePaymentDto = {
					notes: formData.notes || undefined,
				};

				if (formData.status !== paymentData.status) {
					updateData.status = formData.status as PaymentStatus;
				}

				await PaymentService.updatePayment(id, updateData);
			} else {
				// Full update for pending/failed payments
				const updateData: UpdatePaymentDto = {
					amount: Number(formData.amount),
					paymentType: formData.paymentType as PaymentType,
					paymentMethod: formData.paymentMethod as PaymentMethod,
					status: formData.status as PaymentStatus,
					paymentReference: formData.paymentReference || undefined,
					transactionId: formData.transactionId || undefined,
					paymentDate: formData.paymentDate,
					notes: formData.notes || undefined,
				};

				await PaymentService.updatePayment(id, updateData);
			}

			toast({
				title: "Success",
				description: "Payment updated successfully.",
			});

			setHasChanges(false);
			
			// Navigate back to payment details
			navigate(`/payments/${id}`);

		} catch (error) {
			console.error("Error updating payment:", error);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const errorMessage = (error as any)?.response?.data?.message || "Failed to update payment. Please try again.";
			setError(errorMessage);
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case "failed":
				return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
			case "refunded":
				return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const isReadOnly = paymentData?.status === "completed" || paymentData?.status === "refunded";

	if (loading) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<NavLink to="/payments">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Payments
							</Button>
						</NavLink>
						<Skeleton className="h-8 w-48" />
					</div>
					<div className="flex gap-2">
						<Skeleton className="h-9 w-24" />
						<Skeleton className="h-9 w-24" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="space-y-4">
								{[...Array(8)].map((_, i) => (
									<div key={i} className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
									</div>
								))}
							</CardContent>
						</Card>
					</div>
					<div>
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-24" />
							</CardHeader>
							<CardContent className="space-y-4">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-24" />
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error || !paymentData) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="flex items-center gap-4">
					<NavLink to="/payments">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Payments
						</Button>
					</NavLink>
				</div>
				
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						{error || "Payment not found"}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to={`/payments/${id}`}>
						<Button variant="ghost" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Payment
						</Button>
					</NavLink>
					<div>
						<h1 className="text-2xl font-bold">Edit Payment</h1>
						<p className="text-muted-foreground">
							Payment ID: {paymentData.id} • {getStatusBadge(paymentData.status)}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button 
						type="submit" 
						form="edit-payment-form"
						disabled={!hasChanges || submitting}
					>
						{submitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="w-4 h-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{isReadOnly && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						This payment is {paymentData.status}. Only notes can be modified.
					</AlertDescription>
				</Alert>
			)}

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Payment Form */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Payment Details</CardTitle>
						</CardHeader>
						<CardContent>
							<form id="edit-payment-form" onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="amount">Payment Amount *</Label>
										<Input
											id="amount"
											type="number"
											min="0"
											step="0.01"
											value={formData.amount}
											onChange={(e) => handleInputChange("amount", e.target.value)}
											placeholder="Enter amount"
											disabled={isReadOnly}
											required
										/>
										{validationErrors.amount && (
											<p className="text-sm text-red-500 mt-1">{validationErrors.amount}</p>
										)}
									</div>
									<div>
										<Label htmlFor="paymentType">Payment Type *</Label>
										<Select
											value={formData.paymentType}
											onValueChange={(value) => handleInputChange("paymentType", value)}
											disabled={isReadOnly}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select payment type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={PaymentType.ADVANCE}>
													Advance Payment
												</SelectItem>
												<SelectItem value={PaymentType.BALANCE}>
													Balance Payment
												</SelectItem>
												<SelectItem value={PaymentType.PARTIAL}>
													Partial Payment
												</SelectItem>
												<SelectItem value={PaymentType.REFUND}>
													Refund
												</SelectItem>
											</SelectContent>
										</Select>
										{validationErrors.paymentType && (
											<p className="text-sm text-red-500 mt-1">{validationErrors.paymentType}</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="paymentMethod">Payment Method *</Label>
										<Select
											value={formData.paymentMethod}
											onValueChange={(value) => handleInputChange("paymentMethod", value)}
											disabled={isReadOnly}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select payment method" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={PaymentMethod.BANK_TRANSFER}>
													Bank Transfer
												</SelectItem>
												<SelectItem value={PaymentMethod.CREDIT_CARD}>
													Credit Card
												</SelectItem>
												<SelectItem value={PaymentMethod.DEBIT_CARD}>
													Debit Card
												</SelectItem>
												<SelectItem value={PaymentMethod.CASH}>
													Cash
												</SelectItem>
												<SelectItem value={PaymentMethod.UPI}>
													UPI
												</SelectItem>
												<SelectItem value={PaymentMethod.OTHER}>
													Other
												</SelectItem>
											</SelectContent>
										</Select>
										{validationErrors.paymentMethod && (
											<p className="text-sm text-red-500 mt-1">{validationErrors.paymentMethod}</p>
										)}
									</div>
									<div>
										<Label htmlFor="status">Payment Status *</Label>
										<Select
											value={formData.status}
											onValueChange={(value) => handleInputChange("status", value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={PaymentStatus.PENDING}>
													Pending
												</SelectItem>
												<SelectItem value={PaymentStatus.COMPLETED}>
													Completed
												</SelectItem>
												<SelectItem value={PaymentStatus.FAILED}>
													Failed
												</SelectItem>
												<SelectItem value={PaymentStatus.REFUNDED}>
													Refunded
												</SelectItem>
											</SelectContent>
										</Select>
										{validationErrors.status && (
											<p className="text-sm text-red-500 mt-1">{validationErrors.status}</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="paymentReference">Payment Reference</Label>
										<Input
											id="paymentReference"
											value={formData.paymentReference}
											onChange={(e) => handleInputChange("paymentReference", e.target.value)}
											placeholder="Transaction ID, Check number, etc."
											disabled={isReadOnly}
										/>
									</div>
									<div>
										<Label htmlFor="transactionId">Transaction ID</Label>
										<Input
											id="transactionId"
											value={formData.transactionId}
											onChange={(e) => handleInputChange("transactionId", e.target.value)}
											placeholder="Bank transaction ID"
											disabled={isReadOnly}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="paymentDate">Payment Date *</Label>
									<Input
										id="paymentDate"
										type="date"
										value={formData.paymentDate}
										onChange={(e) => handleInputChange("paymentDate", e.target.value)}
										disabled={isReadOnly}
										required
									/>
									{validationErrors.paymentDate && (
										<p className="text-sm text-red-500 mt-1">{validationErrors.paymentDate}</p>
									)}
								</div>

								<div>
									<Label htmlFor="paymentScreenshot">
										Payment Screenshots/Receipts
									</Label>
									<div className="mt-2 space-y-4">
										{/* Upload Area */}
										<label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
											<div className="text-center">
												{uploading ? (
													<>
														<Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
														<p className="text-sm text-muted-foreground">
															Uploading...
														</p>
													</>
												) : (
													<>
														<Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
														<p className="text-sm text-muted-foreground">
															Click to upload receipts (JPEG, PNG, PDF - Max 5MB each)
														</p>
														<p className="text-xs text-muted-foreground mt-1">
															Multiple files supported
														</p>
													</>
												)}
											</div>
											<input
												type="file"
												className="hidden"
												multiple
												accept="image/jpeg,image/jpg,image/png,application/pdf"
												onChange={handleFileUpload}
												disabled={uploading}
											/>
										</label>

										{/* Uploaded Files */}
										{receiptFiles.length > 0 && (
											<div className="space-y-2">
												<p className="text-sm font-medium">Uploaded Receipt Files:</p>
												{receiptFiles.map((file) => {
													const isImage = file.filename.toLowerCase().match(/\.(jpg|jpeg|png)$/);
													const FileIcon = isImage ? Eye : FileText;
													
													return (
														<div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
															<div className="flex items-center gap-3">
																<FileIcon className="w-4 h-4 text-muted-foreground" />
																<div>
																	<span className="text-sm font-medium">{file.filename}</span>
																	<p className="text-xs text-muted-foreground">
																		Uploaded {new Date(file.createdAt).toLocaleDateString()}
																	</p>
																</div>
															</div>
															<div className="flex items-center gap-1">
																<Button 
																	type="button"
																	size="sm" 
																	variant="ghost"
																	onClick={() => window.open(file.url, '_blank')}
																>
																	<Eye className="w-4 h-4" />
																</Button>
																<Button 
																	type="button"
																	size="sm" 
																	variant="ghost"
																	onClick={() => window.open(file.url, '_blank')}
																>
																	<Download className="w-4 h-4" />
																</Button>
																<Button 
																	type="button"
																	size="sm" 
																	variant="ghost"
																	onClick={() => handleDeleteReceiptFile(file.id)}
																>
																	<Trash2 className="w-4 h-4" />
																</Button>
															</div>
														</div>
													);
												})}
											</div>
										)}

										{/* Legacy receipt file support */}
										{paymentData?.receiptFilePath && !receiptFiles.length && (
											<div className="p-3 border rounded-lg bg-yellow-50">
												<div className="flex items-center gap-2">
													<FileText className="w-4 h-4" />
													<div>
														<span className="text-sm font-medium">Legacy Receipt File</span>
														<p className="text-xs text-muted-foreground">
															Uploaded via old system - Upload new files to replace
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>

								<div>
									<Label htmlFor="notes">Notes</Label>
									<Textarea
										id="notes"
										value={formData.notes}
										onChange={(e) => handleInputChange("notes", e.target.value)}
										placeholder="Additional notes about this payment..."
										rows={3}
									/>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Booking Summary */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Booking Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Customer</p>
								<p className="font-medium">{paymentData.booking.customer.name}</p>
								<p className="text-sm text-muted-foreground">
									{paymentData.booking.customer.email}
								</p>
							</div>
							<Separator />
							<div>
								<p className="text-sm text-muted-foreground">Booking ID</p>
								<NavLink
									to={`/bookings/${paymentData.booking.id}`}
									className="font-medium text-blue-600 hover:underline"
								>
									{paymentData.booking.bookingNumber}
								</NavLink>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Package</p>
								<p className="font-medium">
									{paymentData.booking.package.name}
								</p>
							</div>
							<Separator />
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Total Amount:</span>
									<span>{formatCurrency(paymentData.booking.totalAmount)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Advance Paid:</span>
									<span>{formatCurrency(paymentData.booking.advancePaid)}</span>
								</div>
								<div className="flex justify-between font-medium border-t pt-2">
									<span>Balance:</span>
									<span>{formatCurrency(paymentData.booking.balanceAmount)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
