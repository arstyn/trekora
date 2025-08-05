import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Archive,
	ArrowLeft,
	Download,
	Edit,
	Eye,
	FileText,
	RefreshCw,
	AlertTriangle,
	Loader2,
	Trash2,
	Upload,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import PaymentService from "@/services/payment.service";
import type { Payment, FileManager } from "@/types/payment.types";
import { useToast } from "@/hooks/use-toast";
import { getFileUrl } from "@/lib/utils";

export default function PaymentDetailsPage() {
	const { id } = useParams<{ id: string }>();
	// const navigate = useNavigate();
	const [paymentData, setPaymentData] = useState<Payment | null>(null);
	const [receiptFiles, setReceiptFiles] = useState<FileManager[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
	const [selectedDocument, setSelectedDocument] = useState<FileManager | null>(null);
	const { toast } = useToast();

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

	const handleAction = async (action: string) => {
		if (!id || !paymentData) return;

		try {
			setActionLoading(prev => ({ ...prev, [action]: true }));

			switch (action) {
				case "complete":
					await PaymentService.markPaymentCompleted(id);
					toast({
						title: "Success",
						description: "Payment marked as completed.",
					});
					break;
				case "fail":
					await PaymentService.markPaymentFailed(id);
					toast({
						title: "Success", 
						description: "Payment marked as failed.",
					});
					break;
				case "retry":
					await PaymentService.retryPayment(id);
					toast({
						title: "Success",
						description: "Payment retry initiated.",
					});
					break;
				case "archive":
					await PaymentService.archivePayment(id);
					toast({
						title: "Success",
						description: "Payment archived successfully.",
					});
					break;
				default:
					break;
			}

			// Reload payment data
			loadPaymentDetails();
		} catch (error) {
			console.error("Error performing action:", error);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const errorMessage = (error as any)?.response?.data?.message || "Failed to perform action. Please try again.";
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setActionLoading(prev => ({ ...prev, [action]: false }));
		}
	};

	const handleDeleteReceiptFile = async (fileId: string) => {
		if (!id) return;

		try {
			setActionLoading(prev => ({ ...prev, [`deleteFile_${fileId}`]: true }));
			
			await PaymentService.deleteReceiptFile(id, fileId);
			
			// Remove file from local state
			setReceiptFiles(prev => prev.filter(file => file.id !== fileId));
			
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
		} finally {
			setActionLoading(prev => ({ ...prev, [`deleteFile_${fileId}`]: false }));
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
			setActionLoading(prev => ({ ...prev, upload: true }));
			
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
			setActionLoading(prev => ({ ...prev, upload: false }));
			// Reset file input
			event.target.value = '';
		}
	};

	const getFileIcon = (filename: string) => {
		const extension = filename.split('.').pop()?.toLowerCase();
		return extension === 'pdf' ? FileText : Eye;
	};


	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
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
			case "archived":
				return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getPaymentTypeBadge = (type: string) => {
		switch (type.toLowerCase()) {
			case "advance":
				return (
					<Badge variant="outline" className="bg-blue-50 text-blue-700">
						Advance
					</Badge>
				);
			case "balance":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700">
						Balance
					</Badge>
				);
			case "partial":
				return (
					<Badge variant="outline" className="bg-orange-50 text-orange-700">
						Partial
					</Badge>
				);
			case "refund":
				return (
					<Badge variant="outline" className="bg-red-50 text-red-700">
						Refund
					</Badge>
				);
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

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
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="space-y-4">
								{[...Array(6)].map((_, i) => (
									<div key={i} className="flex justify-between">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-32" />
									</div>
								))}
							</CardContent>
						</Card>
					</div>
					<div className="space-y-6">
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

				<div className="flex justify-center">
					<Button onClick={loadPaymentDetails}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to="/payments">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Payments
						</Button>
					</NavLink>
					<div>
						<h1 className="text-2xl font-bold">Payment Details</h1>
						<p className="text-muted-foreground">Payment ID: {paymentData.id}</p>
					</div>
				</div>
				<div className="flex gap-2">
					{paymentData.status !== "completed" && paymentData.status !== "refunded" && (
						<NavLink to={`/payments/${id}/edit`}>
							<Button variant="outline">
								<Edit className="w-4 h-4 mr-2" />
								Edit Payment
							</Button>
						</NavLink>
					)}
					{receiptFiles.length > 0 && (
						<div className="flex gap-2">
							<Button 
								variant="outline"
								onClick={() => {
									// Download first receipt file or show dropdown for multiple
									if (receiptFiles.length === 1) {
										window.open(getFileUrl(receiptFiles[0].url), '_blank');
									}
								}}
							>
								<Download className="w-4 h-4 mr-2" />
								{receiptFiles.length === 1 ? 'Download Receipt' : `Download (${receiptFiles.length})`}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Payment Details */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Payment Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="font-medium">Amount:</span>
								<span className="text-lg font-bold">{formatCurrency(paymentData.amount)}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Payment Type:</span>
								{getPaymentTypeBadge(paymentData.paymentType)}
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Payment Method:</span>
								<span>{paymentData.paymentMethod.replace('_', ' ')}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Status:</span>
								{getStatusBadge(paymentData.status)}
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Payment Date:</span>
								<span>{new Date(paymentData.paymentDate).toLocaleDateString()}</span>
							</div>
							{paymentData.paymentReference && (
								<div className="flex justify-between">
									<span className="font-medium">Reference:</span>
									<span className="font-mono text-sm">{paymentData.paymentReference}</span>
								</div>
							)}
							{paymentData.transactionId && (
								<div className="flex justify-between">
									<span className="font-medium">Transaction ID:</span>
									<span className="font-mono text-sm">{paymentData.transactionId}</span>
								</div>
							)}
							{paymentData.notes && (
								<>
									<Separator />
									<div>
										<span className="font-medium">Notes:</span>
										<p className="mt-2 text-sm text-muted-foreground">{paymentData.notes}</p>
									</div>
								</>
							)}
							<Separator />
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Recorded by:</span>
								<span>{paymentData.recordedBy.firstName} {paymentData.recordedBy.lastName}</span>
							</div>
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Created at:</span>
								<span>{new Date(paymentData.createdAt).toLocaleString()}</span>
							</div>
						</CardContent>
					</Card>

					{/* Customer Information */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span className="font-medium">Name:</span>
								<span>{paymentData.booking.customer.name}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Email:</span>
								<span>{paymentData.booking.customer.email}</span>
							</div>
							{paymentData.booking.customer.phone && (
								<div className="flex justify-between">
									<span className="font-medium">Phone:</span>
									<span>{paymentData.booking.customer.phone}</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Booking Information */}
					<Card>
						<CardHeader>
							<CardTitle>Booking Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span className="font-medium">Booking ID:</span>
								<NavLink 
									to={`/bookings/${paymentData.booking.id}`}
									className="text-blue-600 hover:underline"
								>
									{paymentData.booking.bookingNumber}
								</NavLink>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Package:</span>
								<span>{paymentData.booking.package.name}</span>
							</div>
							{paymentData.booking.package.destination && (
								<div className="flex justify-between">
									<span className="font-medium">Destination:</span>
									<span>{paymentData.booking.package.destination}</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between">
								<span className="font-medium">Total Amount:</span>
								<span>{formatCurrency(paymentData.booking.totalAmount)}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Advance Paid:</span>
								<span>{formatCurrency(paymentData.booking.advancePaid)}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Balance Amount:</span>
								<span className="font-bold">{formatCurrency(paymentData.booking.balanceAmount)}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Actions and Documents */}
				<div className="space-y-6">
					{/* Quick Actions */}
					{paymentData.status !== "archived" && (
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{paymentData.status === "pending" && (
									<>
										<Button 
											className="w-full" 
											onClick={() => handleAction("complete")}
											disabled={actionLoading.complete}
										>
											{actionLoading.complete ? (
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											) : (
												<RefreshCw className="w-4 h-4 mr-2" />
											)}
											Mark as Completed
										</Button>
										<Button 
											variant="outline" 
											className="w-full"
											onClick={() => handleAction("fail")}
											disabled={actionLoading.fail}
										>
											{actionLoading.fail ? (
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											) : (
												<RefreshCw className="w-4 h-4 mr-2" />
											)}
											Mark as Failed
										</Button>
									</>
								)}
								{paymentData.status === "failed" && (
									<Button 
										className="w-full"
										onClick={() => handleAction("retry")}
										disabled={actionLoading.retry}
									>
										{actionLoading.retry ? (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										) : (
											<RefreshCw className="w-4 h-4 mr-2" />
										)}
										Retry Payment
									</Button>
								)}
								<Button 
									variant="outline" 
									className="w-full"
									onClick={() => handleAction("archive")}
									disabled={actionLoading.archive}
								>
									{actionLoading.archive ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<Archive className="w-4 h-4 mr-2" />
									)}
									Archive Payment
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Documents */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								Documents
								<div className="flex gap-2">
									<label>
										<input
											type="file"
											className="hidden"
											multiple
											accept="image/jpeg,image/jpg,image/png,application/pdf"
											onChange={handleFileUpload}
											disabled={actionLoading.upload}
										/>
										<Button size="sm" variant="outline" disabled={actionLoading.upload} asChild>
											<span>
												{actionLoading.upload ? (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												) : (
													<Upload className="w-4 h-4 mr-2" />
												)}
												{actionLoading.upload ? 'Uploading...' : 'Upload'}
											</span>
										</Button>
									</label>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{receiptFiles.length > 0 ? (
								<div className="space-y-2">
									{receiptFiles.map((file) => {
										const FileIcon = getFileIcon(file.filename);
										return (
											<div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
												<div className="flex items-center gap-3">
													<FileIcon className="w-4 h-4 text-muted-foreground" />
													<div>
														<span className="text-sm font-medium">{file.filename}</span>
														<p className="text-xs text-muted-foreground">
															Uploaded {new Date(file.createdAt).toLocaleDateString()}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button 
														size="sm" 
														variant="ghost"
														onClick={() => window.open(getFileUrl(file.url), '_blank')}
													>
														<Eye className="w-4 h-4" />
													</Button>
													<Button 
														size="sm" 
														variant="ghost"
														onClick={() => {
															// For download, we can also trigger a download attribute
															const link = document.createElement('a');
															link.href = getFileUrl(file.url);
															link.download = file.filename;
															link.target = '_blank';
															document.body.appendChild(link);
															link.click();
															document.body.removeChild(link);
														}}
													>
														<Download className="w-4 h-4" />
													</Button>
													<Button 
														size="sm" 
														variant="ghost"
														onClick={() => handleDeleteReceiptFile(file.id)}
														disabled={actionLoading[`deleteFile_${file.id}`]}
													>
														{actionLoading[`deleteFile_${file.id}`] ? (
															<Loader2 className="w-4 h-4 animate-spin" />
														) : (
															<Trash2 className="w-4 h-4" />
														)}
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-6 text-muted-foreground">
									<FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No receipt files uploaded</p>
									<p className="text-xs">Upload payment receipts or screenshots</p>
								</div>
							)}
							
							{/* Legacy receipt file path support */}
							{paymentData.receiptFilePath && !receiptFiles.length && (
								<div className="space-y-2">
									<div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
										<div className="flex items-center gap-2">
											<FileText className="w-4 h-4" />
											<div>
												<span className="text-sm">Legacy Receipt File</span>
												<p className="text-xs text-muted-foreground">
													Uploaded via old system
												</p>
											</div>
										</div>
										<Button 
											size="sm" 
											variant="ghost"
											onClick={() => setSelectedDocument({ 
												id: 'legacy', 
												filename: 'receipt', 
												url: paymentData.receiptFilePath || '',
												relatedId: paymentData.id,
												relatedType: 'payment',
												createdAt: paymentData.createdAt,
												updatedAt: paymentData.updatedAt
											})}
										>
											<Eye className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Document Preview Dialog */}
			<Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Document Preview</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center h-96 bg-muted">
						<p className="text-muted-foreground">Document preview will be implemented</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
