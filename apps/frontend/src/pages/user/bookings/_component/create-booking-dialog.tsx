import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Calendar,
	DollarSign,
	Upload,
	Users,
	Loader2,
	AlertCircle,
	Search,
	Plus,
	X,
	Check,
	CheckCircle,
	CheckCircle2,
	Package,
	UserPlus,
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import BookingService from "@/services/booking.service";
import type {
	ICreateBookingRequest,
	IBookingPassenger,
	PaymentMethod,
	IPackage,
	ICustomer,
	IBooking,
} from "@/types/booking.types";
import type { IBatches } from "@/types/batches.types";
import { toast } from "sonner";

interface EnhancedBookingPassenger extends IBookingPassenger {
	checklist: {
		id: string;
		item: string;
		completed: boolean;
		mandatory: boolean;
	}[];
}

interface GroupChecklistItem {
	id: string;
	item: string;
	completed: boolean;
	mandatory: boolean;
}

interface CreateBookingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBookingCreated?: () => void;
}

export function CreateBookingDialog({
	open,
	onOpenChange,
	onBookingCreated,
}: CreateBookingDialogProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
	const [packages, setPackages] = useState<IPackage[]>([]);
	const [customers, setCustomers] = useState<ICustomer[]>([]);
	const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);
	const [loadingData, setLoadingData] = useState(false);
	const [customerSearch, setCustomerSearch] = useState("");
	const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
	const [customerPagination, setCustomerPagination] = useState({
		offset: 0,
		limit: 10,
		hasMore: true,
		total: 0,
	});
	const [loadingCustomers, setLoadingCustomers] = useState(false);
	const [groupChecklist, setGroupChecklist] = useState<GroupChecklistItem[]>([]);

	// Form validation
	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.customerId) newErrors.customerId = "Please select a customer";
		if (!formData.packageId) newErrors.packageId = "Please select a tour package";
		if (!formData.batchId) newErrors.batchId = "Please select a batch";
		if (!formData.numberOfPassengers || formData.numberOfPassengers < 1) {
			newErrors.numberOfPassengers = "Please select number of passengers";
		}
		if (formData.advanceAmount > 0 && !formData.paymentMethod) {
			newErrors.paymentMethod =
				"Please select a payment method for advance payment";
		}

		// Validate passenger details
		const invalidPassengers = formData.passengers.some((p, index) => {
			if (!p.fullName) {
				newErrors[`passenger_${index}_name`] = "Full name is required";
				return true;
			}
			if (!p.age || p.age < 1) {
				newErrors[`passenger_${index}_age`] = "Valid age is required";
				return true;
			}
			if (!p.emergencyContact) {
				newErrors[`passenger_${index}_emergency`] =
					"Emergency contact is required";
				return true;
			}
			return false;
		});

		if (invalidPassengers) {
			newErrors.passengers = "Please fill in all required passenger details";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const [formData, setFormData] = useState<{
		customerId: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;

		packageId: string;
		batchId: string;
		numberOfPassengers: number;

		passengers: EnhancedBookingPassenger[];

		// Payment Details
		totalAmount: number;
		advanceAmount: number;
		paymentMethod: PaymentMethod | "";
		paymentReference: string;
		paymentScreenshot: File | null;

		// Additional Details
		specialRequests: string;
	}>({
		customerId: "",
		customerName: "",
		customerEmail: "",
		customerPhone: "",
		packageId: "",
		batchId: "",
		numberOfPassengers: 1,
		passengers: [
			{
				fullName: "",
				age: 0,
				email: "",
				phone: "",
				emergencyContact: "",
				specialRequirements: "",
				checklist: [],
			},
		],
		totalAmount: 0,
		advanceAmount: 0,
		paymentMethod: "",
		paymentReference: "",
		paymentScreenshot: null,
		specialRequests: "",
	});

	// Load initial data when dialog opens
	useEffect(() => {
		if (open) {
			loadInitialData();
		}
	}, [open]);

	// Load packages and customers when dialog opens
	const loadInitialData = async () => {
		try {
			setLoadingData(true);
			const [packagesData, customersData] = await Promise.all([
				BookingService.getPackages(),
				BookingService.getCustomers({ limit: 10, offset: 0 }),
			]);
			setPackages(packagesData);
			setCustomers(customersData.customers);
			setCustomerPagination({
				offset: 10,
				limit: 10,
				hasMore: customersData.hasMore,
				total: customersData.total,
			});
		} catch (err) {
			console.error("Error loading initial data:", err);
			setError("Failed to load data. Please try again.");
		} finally {
			setLoadingData(false);
		}
	};

	const searchCustomers = async (query: string, reset = true) => {
		if (query.length < 2) {
			// Reset to initial customers if search is too short
			if (reset) {
				await loadInitialCustomers();
			}
			return;
		}

		try {
			setLoadingCustomers(true);
			const results = await BookingService.searchCustomers(query, {
				limit: 10,
				offset: reset ? 0 : customerPagination.offset,
			});

			if (reset) {
				setCustomers(results.customers);
				setCustomerPagination({
					offset: 10,
					limit: 10,
					hasMore: results.hasMore,
					total: results.total,
				});
			} else {
				setCustomers((prev) => [...prev, ...results.customers]);
				setCustomerPagination((prev) => ({
					...prev,
					offset: prev.offset + 10,
					hasMore: results.hasMore,
				}));
			}
		} catch (err) {
			console.error("Error searching customers:", err);
		} finally {
			setLoadingCustomers(false);
		}
	};

	const loadInitialCustomers = async () => {
		try {
			setLoadingCustomers(true);
			const results = await BookingService.getCustomers({ limit: 10, offset: 0 });
			setCustomers(results.customers);
			setCustomerPagination({
				offset: 10,
				limit: 10,
				hasMore: results.hasMore,
				total: results.total,
			});
		} catch (err) {
			console.error("Error loading customers:", err);
		} finally {
			setLoadingCustomers(false);
		}
	};

	const loadMoreCustomers = async () => {
		if (loadingCustomers || !customerPagination.hasMore) return;

		try {
			setLoadingCustomers(true);
			const results = await BookingService.getCustomers({
				limit: 10,
				offset: customerPagination.offset,
				search: customerSearch || undefined,
			});

			setCustomers((prev) => [...prev, ...results.customers]);
			setCustomerPagination((prev) => ({
				...prev,
				offset: prev.offset + 10,
				hasMore: results.hasMore,
			}));
		} catch (err) {
			console.error("Error loading more customers:", err);
		} finally {
			setLoadingCustomers(false);
		}
	};

	// Load batches when package is selected
	useEffect(() => {
		if (formData.packageId) {
			loadAvailableBatches(formData.packageId);
		}
	}, [formData.packageId]);

	const loadAvailableBatches = async (packageId: string) => {
		try {
			const batches = await BookingService.getAvailableBatches(packageId);
			setAvailableBatches(batches);
		} catch (err) {
			console.error("Error loading batches:", err);
			setError("Failed to load available batches.");
		}
	};

	const selectedPackage = packages.find((p) => p.id === formData.packageId);
	const selectedBatch = availableBatches.find((b) => b.id === formData.batchId);

	const updatePassengerCount = (count: number) => {
		const newPassengers = Array.from(
			{ length: count },
			(_, i) =>
				formData.passengers[i] || {
					fullName: "",
					age: 0,
					email: "",
					phone: "",
					emergencyContact: "",
					specialRequirements: "",
					checklist: [],
				}
		);
		setFormData((prev) => ({
			...prev,
			numberOfPassengers: count,
			passengers: newPassengers,
			totalAmount: selectedPackage ? selectedPackage.price * count : 0,
		}));
	};

	const updatePassenger = (
		index: number,
		field: keyof EnhancedBookingPassenger,
		value: string | number
	) => {
		const newPassengers = [...formData.passengers];
		newPassengers[index] = { ...newPassengers[index], [field]: value };
		setFormData((prev) => ({ ...prev, passengers: newPassengers }));
	};

	// Individual checklist functions (now with API integration)
	const addChecklistItem = async (passengerIndex: number, item: string) => {
		if (!item.trim()) return;

		// If booking is already created, call API
		if (createdBookingId) {
			try {
				const checklistItem = await BookingService.addChecklistItem(
					createdBookingId,
					{
						item: item.trim(),
						completed: false,
						mandatory: false,
						type: "INDIVIDUAL",
						passengerId: formData.passengers[passengerIndex].id, // Assuming passenger has ID after booking creation
						sortOrder: formData.passengers[passengerIndex].checklist.length,
					}
				);

				const newPassengers = [...formData.passengers];
				newPassengers[passengerIndex] = {
					...newPassengers[passengerIndex],
					checklist: [
						...newPassengers[passengerIndex].checklist,
						{
							id: checklistItem.id,
							item: checklistItem.item,
							completed: checklistItem.completed,
							mandatory: checklistItem.mandatory,
						},
					],
				};

				setFormData((prev) => ({ ...prev, passengers: newPassengers }));
				toast.success("Checklist item added successfully");
			} catch (error) {
				console.error("Error adding checklist item:", error);
				toast.error("Failed to add checklist item");
			}
		} else {
			// Before booking creation, just update local state
			const newPassengers = [...formData.passengers];
			const newChecklistItem = {
				id: Date.now().toString(),
				item: item.trim(),
				completed: false,
				mandatory: false,
			};

			newPassengers[passengerIndex] = {
				...newPassengers[passengerIndex],
				checklist: [...newPassengers[passengerIndex].checklist, newChecklistItem],
			};

			setFormData((prev) => ({ ...prev, passengers: newPassengers }));
		}
	};

	const removeChecklistItem = async (passengerIndex: number, itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith("temp-")) {
			try {
				await BookingService.deleteChecklistItem(itemId);
				toast.success("Checklist item removed");
			} catch (error) {
				console.error("Error removing checklist item:", error);
				toast.error("Failed to remove checklist item");
				return;
			}
		}

		const newPassengers = [...formData.passengers];
		newPassengers[passengerIndex] = {
			...newPassengers[passengerIndex],
			checklist: newPassengers[passengerIndex].checklist.filter(
				(item) => item.id !== itemId
			),
		};

		setFormData((prev) => ({ ...prev, passengers: newPassengers }));
	};

	const toggleChecklistItem = async (passengerIndex: number, itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith("temp-")) {
			try {
				const updatedItem = await BookingService.toggleChecklistItem(itemId);

				const newPassengers = [...formData.passengers];
				newPassengers[passengerIndex] = {
					...newPassengers[passengerIndex],
					checklist: newPassengers[passengerIndex].checklist.map((item) =>
						item.id === itemId
							? { ...item, completed: updatedItem.completed }
							: item
					),
				};

				setFormData((prev) => ({ ...prev, passengers: newPassengers }));
			} catch (error) {
				console.error("Error toggling checklist item:", error);
				toast.error("Failed to update checklist item");
			}
		} else {
			// Before booking creation or temporary items, just update local state
			const newPassengers = [...formData.passengers];
			newPassengers[passengerIndex] = {
				...newPassengers[passengerIndex],
				checklist: newPassengers[passengerIndex].checklist.map((item) =>
					item.id === itemId ? { ...item, completed: !item.completed } : item
				),
			};

			setFormData((prev) => ({ ...prev, passengers: newPassengers }));
		}
	};

	// Group checklist functions (with API integration)
	const toggleGroupChecklistItem = async (itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith("temp-")) {
			try {
				const updatedItem = await BookingService.toggleChecklistItem(itemId);

				setGroupChecklist((prev) =>
					prev.map((item) =>
						item.id === itemId
							? { ...item, completed: updatedItem.completed }
							: item
					)
				);
			} catch (error) {
				console.error("Error toggling group checklist item:", error);
				toast.error("Failed to update checklist item");
			}
		} else {
			// Before booking creation or temporary items, just update local state
			setGroupChecklist((prev) =>
				prev.map((item) =>
					item.id === itemId ? { ...item, completed: !item.completed } : item
				)
			);
		}
	};

	const addGroupChecklistItem = async (item: string, mandatory: boolean = false) => {
		if (!item.trim()) return;

		// If booking is created, call API
		if (createdBookingId) {
			try {
				const checklistItem = await BookingService.addChecklistItem(
					createdBookingId,
					{
						item: item.trim(),
						completed: false,
						mandatory,
						type: "GROUP",
						sortOrder: groupChecklist.length,
					}
				);

				const newItem: GroupChecklistItem = {
					id: checklistItem.id,
					item: checklistItem.item,
					completed: checklistItem.completed,
					mandatory: checklistItem.mandatory,
				};

				setGroupChecklist((prev) => [...prev, newItem]);
				toast.success("Group checklist item added successfully");
			} catch (error) {
				console.error("Error adding group checklist item:", error);
				toast.error("Failed to add group checklist item");
			}
		} else {
			// Before booking creation, just update local state
			const newItem: GroupChecklistItem = {
				id: `temp-${Date.now()}`,
				item: item.trim(),
				completed: false,
				mandatory,
			};

			setGroupChecklist((prev) => [...prev, newItem]);
		}
	};

	const removeGroupChecklistItem = async (itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith("temp-")) {
			try {
				await BookingService.deleteChecklistItem(itemId);
				toast.success("Group checklist item removed");
			} catch (error) {
				console.error("Error removing group checklist item:", error);
				toast.error("Failed to remove checklist item");
				return;
			}
		}

		setGroupChecklist((prev) => prev.filter((item) => item.id !== itemId));
	};

	// Check if group can proceed (at least one item)
	const canGroupProceed = () => {
		return groupChecklist.length > 0;
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError("File size must be less than 5MB");
				return;
			}
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/jpg",
				"application/pdf",
			];
			if (!allowedTypes.includes(file.type)) {
				setError("File must be an image (JPEG, PNG) or PDF");
				return;
			}

			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
		}
	};

	const handleCustomerSelect = (customer: ICustomer) => {
		setFormData((prev) => ({
			...prev,
			customerId: customer.id,
			customerName: customer.name,
			customerEmail: customer.email,
			customerPhone: customer.phone,
		}));
		setCustomerSearch(customer.name);
		setCustomerPopoverOpen(false);
		// Clear any existing customer selection errors
		if (errors.customerId) {
			setErrors((prev) => ({
				...prev,
				customerId: "",
			}));
		}
	};

	const createChecklistItems = async (bookingId: string, booking: IBooking) => {
		try {
			for (let i = 0; i < groupChecklist.length; i++) {
				const groupItem = groupChecklist[i];
				if (groupItem.id.startsWith("temp-")) {
					await BookingService.addChecklistItem(bookingId, {
						item: groupItem.item,
						completed: groupItem.completed,
						mandatory: groupItem.mandatory,
						type: "GROUP",
						sortOrder: i,
					});
				}
			}
			for (
				let passengerIndex = 0;
				passengerIndex < formData.passengers.length;
				passengerIndex++
			) {
				const passenger = formData.passengers[passengerIndex];
				const bookingPassenger = booking.passengers[passengerIndex];

				for (let i = 0; i < passenger.checklist.length; i++) {
					const checklistItem = passenger.checklist[i];
					if (
						checklistItem.id.toString().startsWith("temp-") ||
						!checklistItem.id.match(/^\d+$/)
					) {
						await BookingService.addChecklistItem(bookingId, {
							item: checklistItem.item,
							completed: checklistItem.completed,
							mandatory: checklistItem.mandatory,
							type: "INDIVIDUAL",
							passengerId: bookingPassenger.id,
							sortOrder: i,
						});
					}
				}
			}
		} catch (error) {
			console.error("Error creating checklist items:", error);
			toast.error("Booking created but some checklist items could not be added");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			setError("Please fix the errors before submitting");
			return;
		}

		if (!canGroupProceed()) {
			setError("Please add at least one group checklist item to proceed.");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const regularPassengers: IBookingPassenger[] = formData.passengers.map(
				(passenger) => ({
					fullName: passenger.fullName,
					age: passenger.age,
					email: passenger.email,
					phone: passenger.phone,
					emergencyContact: passenger.emergencyContact,
					specialRequirements: passenger.specialRequirements,
				})
			);

			const bookingData: ICreateBookingRequest = {
				customerId: formData.customerId,
				packageId: formData.packageId,
				batchId: formData.batchId,
				numberOfPassengers: formData.numberOfPassengers,
				totalAmount: formData.totalAmount,
				specialRequests: formData.specialRequests,
				passengers: regularPassengers,
				initialPayment:
					formData.advanceAmount > 0
						? {
								amount: formData.advanceAmount,
								paymentMethod: formData.paymentMethod as PaymentMethod,
								paymentReference: formData.paymentReference,
								notes: "Initial payment",
						  }
						: undefined,
			};

			const validation = BookingService.validateBookingData(bookingData);
			if (!validation.isValid) {
				setError(validation.errors.join(", "));
				return;
			}

			if (formData.paymentScreenshot) {
				const uploadResult = await BookingService.uploadFile(
					formData.paymentScreenshot
				);
				if (bookingData.initialPayment) {
					bookingData.initialPayment.filePath = uploadResult.filePath;
				}
			}

			const createdBooking = await BookingService.createBooking(bookingData);
			setCreatedBookingId(createdBooking.id);

			await createChecklistItems(createdBooking.id, createdBooking);

			toast.success("Booking created successfully", {
				description: `Booking ${BookingService.formatBookingNumber(
					createdBooking.bookingNumber
				)} has been created with checklist items.`,
			});

			resetForm();
			onOpenChange(false);

			if (onBookingCreated) {
				onBookingCreated();
			}
		} catch (err) {
			console.error("Error creating booking:", err);
			setError(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(err as any)?.response?.data?.message ||
					"Failed to create booking. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setCreatedBookingId(null);
		setFormData({
			customerId: "",
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			packageId: "",
			batchId: "",
			numberOfPassengers: 1,
			passengers: [
				{
					fullName: "",
					age: 0,
					email: "",
					phone: "",
					emergencyContact: "",
					specialRequirements: "",
					checklist: [],
				},
			],
			totalAmount: 0,
			advanceAmount: 0,
			paymentMethod: "",
			paymentReference: "",
			paymentScreenshot: null,
			specialRequests: "",
		});
		setGroupChecklist([]);
		setCustomerSearch("");
		setCustomerPopoverOpen(false);
		setCustomerPagination({
			offset: 0,
			limit: 10,
			hasMore: true,
			total: 0,
		});
		setLoadingCustomers(false);
		setError(null);
		setErrors({});
	};

	const ChecklistManager = ({ passengerIndex }: { passengerIndex: number }) => {
		const [newItem, setNewItem] = useState("");
		const passenger = formData.passengers[passengerIndex];

		const handleAddItem = () => {
			if (newItem.trim()) {
				addChecklistItem(passengerIndex, newItem);
				setNewItem("");
			}
		};

		const handleKeyPress = (e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleAddItem();
			}
		};

		return (
			<div className="space-y-3">
				<Label>Individual Travel Checklist</Label>

				{/* Add new item */}
				<div className="flex gap-2">
					<Input
						value={newItem}
						onChange={(e) => setNewItem(e.target.value)}
						placeholder="Add checklist item (e.g., Passport, Medicines, etc.)"
						onKeyPress={handleKeyPress}
						className="flex-1"
					/>
					<Button
						type="button"
						onClick={handleAddItem}
						size="sm"
						disabled={!newItem.trim()}
					>
						<Plus className="w-4 h-4" />
					</Button>
				</div>

				{/* Checklist items */}
				{passenger.checklist.length > 0 && (
					<div className="space-y-2 max-h-40 overflow-y-auto">
						{passenger.checklist.map((item) => (
							<div
								key={item.id}
								className={`flex items-center gap-2 p-2 rounded-lg border ${
									item.completed
										? "bg-green-50 border-green-200"
										: "bg-gray-50 border-gray-200"
								}`}
							>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() =>
										toggleChecklistItem(passengerIndex, item.id)
									}
									className={`p-1 h-6 w-6 rounded ${
										item.completed
											? "bg-green-500 text-white hover:bg-green-600"
											: "border-2 border-gray-300 hover:border-gray-400"
									}`}
								>
									{item.completed && <Check className="w-3 h-3" />}
								</Button>
								<span
									className={`flex-1 text-sm ${
										item.completed
											? "line-through text-green-700"
											: "text-gray-900"
									}`}
								>
									{item.item}
								</span>
								{item.mandatory && (
									<Badge variant="destructive" className="text-xs">
										Mandatory
									</Badge>
								)}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() =>
										removeChecklistItem(passengerIndex, item.id)
									}
									className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
								>
									<X className="w-3 h-3" />
								</Button>
							</div>
						))}
					</div>
				)}

				{passenger.checklist.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No individual checklist items added yet. Add items to help track
						personal travel preparations.
					</p>
				)}
			</div>
		);
	};

	// Component for group checklist management
	const GroupChecklistManager = () => {
		const [newItem, setNewItem] = useState("");
		const [newItemMandatory, setNewItemMandatory] = useState(false);

		const handleAddItem = () => {
			if (newItem.trim()) {
				addGroupChecklistItem(newItem, newItemMandatory);
				setNewItem("");
				setNewItemMandatory(false);
			}
		};

		const handleKeyPress = (e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleAddItem();
			}
		};

		return (
			<div className="space-y-2">
				<div>
					<p className="text-sm text-muted-foreground mt-1">
						Add at least one checklist item for travelers.
					</p>
				</div>

				{/* Add new item */}
				<div className="space-y-2">
					<div className="flex gap-2">
						<Input
							value={newItem}
							onChange={(e) => setNewItem(e.target.value)}
							placeholder="Add checklist item..."
							onKeyPress={handleKeyPress}
							className="flex-1"
						/>
						<Button
							type="button"
							onClick={handleAddItem}
							size="sm"
							disabled={!newItem.trim()}
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="mandatory"
							checked={newItemMandatory}
							onChange={(e) => setNewItemMandatory(e.target.checked)}
							className="rounded"
						/>
						<label
							htmlFor="mandatory"
							className="text-sm text-muted-foreground"
						>
							Mark as mandatory
						</label>
					</div>
				</div>

				{/* Checklist items */}
				<div className="space-y-2 max-h-60 overflow-y-auto mb-5">
					{groupChecklist.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
						>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => toggleGroupChecklistItem(item.id)}
								className={`p-1 h-6 w-6 rounded ${
									item.completed
										? "bg-green-500 text-white hover:bg-green-600"
										: "border-2 border-gray-300 hover:border-gray-400"
								}`}
							>
								{item.completed && <Check className="w-3 h-3" />}
							</Button>
							<div className="flex-1 ">
								<span
									className={`text-sm ${
										item.completed
											? "line-through text-green-700"
											: "text-primary"
									}`}
								>
									{item.item}
								</span>
								{item.mandatory && (
									<Badge variant="destructive" className="ml-2 text-xs">
										Mandatory
									</Badge>
								)}
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => removeGroupChecklistItem(item.id)}
								className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
							>
								<X className="w-3 h-3" />
							</Button>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-7xl w-full overflow-hidden p-0">
				<DialogHeader className="px-6 py-4 border-b flex-shrink-0">
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Plus className="h-5 w-5 text-primary" />
						Create New Booking
					</DialogTitle>
				</DialogHeader>

				{loadingData ? (
					<div className="flex items-center justify-center py-12 flex-1">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading data...
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col flex-1 p-0">
						{error && (
							<div className="px-5 pt-5">
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							</div>
						)}
						<ScrollArea className="px-5 pb-5 pt-1 max-h-[70vh]">
							{/* Main Grid Layout */}
							<div className="grid grid-cols-2 gap-5">
								{/* Customer Selection */}
								<Card className="border-0 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-base font-semibold">
											<Users className="h-4 w-4 text-primary" />
											Customer Selection
										</CardTitle>
										<CardDescription className="text-sm">
											Search and select a customer for this booking
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-4">
											{/* Customer Search */}
											<div className="space-y-2">
												<Label className="text-sm font-medium">
													Search Customer
												</Label>
												<Popover
													open={customerPopoverOpen}
													onOpenChange={setCustomerPopoverOpen}
												>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															role="combobox"
															className={`w-full justify-between ${
																errors.customerId
																	? "border-destructive"
																	: ""
															}`}
														>
															<span className="flex items-center gap-2">
																<UserPlus className="h-4 w-4" />
																{formData.customerName ||
																	"Select a customer"}
															</span>
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-[400px] p-0"
														align="start"
													>
														<div className="p-3 border-b">
															<div className="relative">
																<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
																<Input
																	placeholder="Search customers..."
																	value={customerSearch}
																	onChange={(e) => {
																		setCustomerSearch(
																			e.target.value
																		);
																		searchCustomers(
																			e.target.value
																		);
																	}}
																	className="pl-8"
																/>
															</div>
														</div>
														<ScrollArea
															className="max-h-60"
															onScrollCapture={(e) => {
																const {
																	scrollTop,
																	scrollHeight,
																	clientHeight,
																} = e.currentTarget;
																if (
																	scrollHeight -
																		scrollTop <=
																	clientHeight + 10
																) {
																	loadMoreCustomers();
																}
															}}
														>
															<div className="p-2">
																{customers.length > 0 ? (
																	<div className="space-y-1">
																		{customers.map(
																			(
																				customer
																			) => (
																				<div
																					key={
																						customer.id
																					}
																					className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
																					onClick={() => {
																						handleCustomerSelect(
																							customer
																						);
																						if (
																							errors.customerId
																						) {
																							setErrors(
																								(
																									prev
																								) => ({
																									...prev,
																									customerId:
																										"",
																								})
																							);
																						}
																					}}
																				>
																					<Checkbox
																						checked={
																							formData.customerId ===
																							customer.id
																						}
																						onCheckedChange={() => {
																							handleCustomerSelect(
																								customer
																							);
																							if (
																								errors.customerId
																							) {
																								setErrors(
																									(
																										prev
																									) => ({
																										...prev,
																										customerId:
																											"",
																									})
																								);
																							}
																						}}
																					/>
																					<div className="flex-1 min-w-0">
																						<p className="text-sm font-medium truncate">
																							{
																								customer.name
																							}
																						</p>
																						<p className="text-xs text-muted-foreground">
																							{
																								customer.email
																							}{" "}
																							•{" "}
																							{
																								customer.phone
																							}
																						</p>
																					</div>
																				</div>
																			)
																		)}

																		{/* Loading indicator */}
																		{loadingCustomers && (
																			<div className="flex items-center justify-center py-4">
																				<Loader2 className="h-4 w-4 animate-spin mr-2" />
																				<span className="text-sm text-muted-foreground">
																					Loading
																					more
																					customers...
																				</span>
																			</div>
																		)}

																		{/* End of list indicator */}
																		{!customerPagination.hasMore &&
																			customers.length >
																				0 && (
																				<div className="text-center py-2 text-xs text-muted-foreground">
																					No
																					more
																					customers
																					to
																					load
																				</div>
																			)}
																	</div>
																) : (
																	<div className="text-center py-4 text-muted-foreground">
																		{loadingCustomers ? (
																			<div className="flex items-center justify-center">
																				<Loader2 className="h-4 w-4 animate-spin mr-2" />
																				Loading
																				customers...
																			</div>
																		) : (
																			"No customers found"
																		)}
																	</div>
																)}
															</div>
														</ScrollArea>
													</PopoverContent>
												</Popover>
												{errors.customerId && (
													<Alert
														variant="destructive"
														className="py-2"
													>
														<AlertCircle className="h-4 w-4" />
														<AlertDescription>
															{errors.customerId}
														</AlertDescription>
													</Alert>
												)}
											</div>

											{/* Selected Customer Details */}
											{formData.customerId && (
												<div className="mt-4 p-4 bg-muted/30 rounded-lg border">
													<div className="flex items-start gap-3">
														<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
															<Users className="h-5 w-5 text-primary" />
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-semibold text-sm mb-1">
																{formData.customerName}
															</h4>
															<p className="text-xs text-muted-foreground mb-2">
																{formData.customerEmail}
															</p>
															<div className="flex flex-wrap gap-2">
																<Badge
																	variant="secondary"
																	className="text-xs"
																>
																	Phone:{" "}
																	{
																		formData.customerPhone
																	}
																</Badge>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Package Selection */}
								<Card className="border-0 shadow-sm">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-base font-semibold">
											<Package className="h-4 w-4 text-primary" />
											Tour Package
										</CardTitle>
										<CardDescription className="text-sm">
											Select the tour package for this booking
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-4">
											<div className="space-y-2">
												<Label className="text-sm font-medium">
													Select Package
												</Label>
												<Select
													value={formData.packageId}
													onValueChange={(value) => {
														const pkg = packages.find(
															(p) => p.id === value
														);
														setFormData((prev) => ({
															...prev,
															packageId: value,
															batchId: "",
															totalAmount: pkg
																? pkg.price *
																  prev.numberOfPassengers
																: 0,
														}));
														if (errors.packageId) {
															setErrors((prev) => ({
																...prev,
																packageId: "",
															}));
														}
													}}
												>
													<SelectTrigger
														className={
															errors.packageId
																? "border-destructive"
																: ""
														}
													>
														<SelectValue placeholder="Choose a package" />
													</SelectTrigger>
													<SelectContent>
														{packages.map((pkg) => (
															<SelectItem
																key={pkg.id}
																value={pkg.id}
															>
																{pkg.name} -{" "}
																{BookingService.formatCurrency(
																	pkg.price
																)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{errors.packageId && (
													<Alert
														variant="destructive"
														className="py-2"
													>
														<AlertCircle className="h-4 w-4" />
														<AlertDescription>
															{errors.packageId}
														</AlertDescription>
													</Alert>
												)}
											</div>

											{/* Selected Package Details */}
											{(() => {
												const selectedPackage = packages.find(
													(pkg) => pkg.id === formData.packageId
												);
												return (
													selectedPackage && (
														<div className="mt-4 p-4 bg-muted/30 rounded-lg border">
															<div className="flex items-start gap-3">
																<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
																	<Package className="h-5 w-5 text-primary" />
																</div>
																<div className="flex-1 min-w-0">
																	<h4 className="font-semibold text-sm mb-1">
																		{
																			selectedPackage.name
																		}
																	</h4>
																	<p className="text-xs text-muted-foreground mb-2">
																		{selectedPackage.description ||
																			"No description available"}
																	</p>
																	<div className="flex flex-wrap gap-2">
																		{selectedPackage.duration && (
																			<Badge
																				variant="secondary"
																				className="text-xs"
																			>
																				Duration:{" "}
																				{
																					selectedPackage.duration
																				}{" "}
																				days
																			</Badge>
																		)}
																		{selectedPackage.price && (
																			<Badge
																				variant="secondary"
																				className="text-xs"
																			>
																				Price: ₹
																				{
																					selectedPackage.price
																				}
																			</Badge>
																		)}
																	</div>
																</div>
															</div>
														</div>
													)
												);
											})()}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Right Column */}
							<div className="space-y-5">
								{/* Batch Selection */}
								{formData.packageId && (
									<Card className="border-0 shadow-sm">
										<CardHeader className="pb-3">
											<CardTitle className="flex items-center gap-2 text-base font-semibold">
												<Calendar className="h-4 w-4 text-primary" />
												Available Batches
											</CardTitle>
											<CardDescription className="text-sm">
												Select a batch for your travel dates
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="grid gap-3">
												{availableBatches.map((batch) => (
													<div
														key={batch.id}
														className={`p-4 border rounded-lg cursor-pointer transition-colors ${
															formData.batchId === batch.id
																? "border-primary bg-primary/5"
																: "hover:bg-muted/50"
														} ${
															errors.batchId
																? "border-destructive"
																: ""
														}`}
														onClick={() => {
															setFormData((prev) => ({
																...prev,
																batchId: batch.id,
															}));
															if (errors.batchId) {
																setErrors((prev) => ({
																	...prev,
																	batchId: "",
																}));
															}
														}}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<Calendar className="w-4 h-4" />
																<div>
																	<p className="font-medium">
																		{new Date(
																			batch.startDate
																		).toLocaleDateString()}{" "}
																		-{" "}
																		{new Date(
																			batch.endDate
																		).toLocaleDateString()}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{batch.totalSeats -
																			batch.bookedSeats}{" "}
																		seats available
																		out of{" "}
																		{batch.totalSeats}
																	</p>
																</div>
															</div>
															<Badge
																variant={
																	batch.totalSeats -
																		batch.bookedSeats >
																	5
																		? "default"
																		: "secondary"
																}
															>
																{batch.totalSeats -
																	batch.bookedSeats}{" "}
																Available
															</Badge>
														</div>
													</div>
												))}
											</div>
											{errors.batchId && (
												<Alert
													variant="destructive"
													className="py-2 mt-3"
												>
													<AlertCircle className="h-4 w-4" />
													<AlertDescription>
														{errors.batchId}
													</AlertDescription>
												</Alert>
											)}
										</CardContent>
									</Card>
								)}

								{/* Passenger Count & Total Amount */}
								{formData.batchId && (
									<Card className="border-0 shadow-sm">
										<CardHeader className="pb-3">
											<CardTitle className="flex items-center gap-2 text-base font-semibold">
												<Users className="h-4 w-4 text-primary" />
												Passenger Count & Pricing
											</CardTitle>
											<CardDescription className="text-sm">
												Select number of passengers and view total
												amount
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="space-y-4">
												<div className="space-y-2">
													<Label className="text-sm font-medium">
														Number of Passengers
													</Label>
													<Select
														value={formData.numberOfPassengers.toString()}
														onValueChange={(value) => {
															updatePassengerCount(
																Number.parseInt(value)
															);
															if (
																errors.numberOfPassengers
															) {
																setErrors((prev) => ({
																	...prev,
																	numberOfPassengers:
																		"",
																}));
															}
														}}
													>
														<SelectTrigger
															className={
																errors.numberOfPassengers
																	? "border-destructive"
																	: ""
															}
														>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{Array.from(
																{
																	length: Math.min(
																		selectedBatch
																			? selectedBatch.totalSeats -
																					selectedBatch.bookedSeats
																			: 1,
																		10
																	),
																},
																(_, i) => (
																	<SelectItem
																		key={i + 1}
																		value={(
																			i + 1
																		).toString()}
																	>
																		{i + 1} Passenger
																		{i > 0 ? "s" : ""}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
													{errors.numberOfPassengers && (
														<Alert
															variant="destructive"
															className="py-2"
														>
															<AlertCircle className="h-4 w-4" />
															<AlertDescription>
																{
																	errors.numberOfPassengers
																}
															</AlertDescription>
														</Alert>
													)}
												</div>

												{formData.totalAmount > 0 && (
													<div className="p-4 bg-muted/30 rounded-lg border">
														<div className="flex items-center justify-between">
															<span className="font-medium">
																Total Amount:
															</span>
															<span className="text-xl font-bold">
																{BookingService.formatCurrency(
																	formData.totalAmount
																)}
															</span>
														</div>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>

							{/* Passenger Details */}
							<div className="mt-5">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<Users className="h-5 w-5 text-primary" />
											Passenger Details
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										{formData.passengers.map((passenger, index) => (
											<div
												key={index}
												className="p-4 border rounded-lg space-y-4"
											>
												<h4 className="font-medium flex items-center gap-2">
													<Users className="w-4 h-4" />
													Passenger {index + 1}
												</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label>Full Name *</Label>
														<Input
															value={passenger.fullName}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"fullName",
																	e.target.value
																)
															}
															required
														/>
													</div>
													<div className="space-y-2">
														<Label>Age *</Label>
														<Input
															type="number"
															value={passenger.age || ""}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"age",
																	Number.parseInt(
																		e.target.value
																	) || 0
																)
															}
															required
														/>
													</div>
													<div className="space-y-2">
														<Label>Email</Label>
														<Input
															type="email"
															value={passenger.email}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"email",
																	e.target.value
																)
															}
														/>
													</div>
													<div className="space-y-2">
														<Label>Phone</Label>
														<Input
															value={passenger.phone}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"phone",
																	e.target.value
																)
															}
														/>
													</div>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label>Emergency Contact *</Label>
														<Input
															value={
																passenger.emergencyContact
															}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"emergencyContact",
																	e.target.value
																)
															}
															placeholder="Name and phone number"
															required
														/>
													</div>
													<div className="space-y-2">
														<Label>
															Special Requirements
														</Label>
														<Textarea
															value={
																passenger.specialRequirements
															}
															onChange={(e) =>
																updatePassenger(
																	index,
																	"specialRequirements",
																	e.target.value
																)
															}
															placeholder="Dietary restrictions, medical conditions, etc."
															rows={2}
														/>
													</div>
												</div>

												{/* Individual Checklist Section */}
												<div className="border-t pt-4">
													<ChecklistManager
														passengerIndex={index}
													/>
												</div>
											</div>
										))}
									</CardContent>
								</Card>
							</div>

							<div className="grid grid-cols-2 gap-5">
								{/* Group Checklist */}
								<div className="mt-5">
									<Card>
										<CardHeader>
											<CardTitle className="text-lg">
												Group Checklist
											</CardTitle>
										</CardHeader>
										<CardContent>
											<GroupChecklistManager />
											{/* Group checklist status on final step */}
											<div
												className={`p-3 rounded-lg border ${
													canGroupProceed()
														? "bg-green-50 border-green-300"
														: "bg-gray-50 border-gray-300"
												}`}
											>
												<div className="flex items-center gap-2">
													{canGroupProceed() ? (
														<CheckCircle className="w-5 h-5 text-green-600" />
													) : (
														<AlertCircle className="w-5 h-5 text-gray-600" />
													)}
													<span
														className={`font-medium ${
															canGroupProceed()
																? "text-green-700"
																: "text-gray-700"
														}`}
													>
														{canGroupProceed()
															? `Group checklist ready (${groupChecklist.length} items added)`
															: "Add at least one group checklist item to proceed"}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Payment Details */}
								<div className="mt-5">
									<Card>
										<CardHeader>
											<CardTitle className="text-lg">
												Payment Information
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label>Total Amount</Label>
													<div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
														<DollarSign className="w-3 h-3" />
														<span className="font-bold">
															{BookingService.formatCurrency(
																formData.totalAmount
															)}
														</span>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor="advanceAmount">
														Advance Payment
													</Label>
													<Input
														id="advanceAmount"
														type="number"
														min="0"
														max={formData.totalAmount}
														value={
															formData.advanceAmount || ""
														}
														onChange={(e) =>
															setFormData((prev) => ({
																...prev,
																advanceAmount:
																	Number.parseInt(
																		e.target.value
																	) || 0,
															}))
														}
													/>
												</div>
											</div>

											{formData.advanceAmount > 0 && (
												<>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="paymentMethod">
																Payment Method *
															</Label>
															<Select
																value={
																	formData.paymentMethod
																}
																onValueChange={(value) =>
																	setFormData(
																		(prev) => ({
																			...prev,
																			paymentMethod:
																				value as PaymentMethod,
																		})
																	)
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select payment method" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="bank_transfer">
																		Bank Transfer
																	</SelectItem>
																	<SelectItem value="credit_card">
																		Credit Card
																	</SelectItem>
																	<SelectItem value="debit_card">
																		Debit Card
																	</SelectItem>
																	<SelectItem value="cash">
																		Cash
																	</SelectItem>
																	<SelectItem value="upi">
																		UPI
																	</SelectItem>
																	<SelectItem value="other">
																		Other
																	</SelectItem>
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<Label htmlFor="paymentReference">
																Payment Reference
															</Label>
															<Input
																id="paymentReference"
																value={
																	formData.paymentReference
																}
																onChange={(e) =>
																	setFormData(
																		(prev) => ({
																			...prev,
																			paymentReference:
																				e.target
																					.value,
																		})
																	)
																}
																placeholder="Transaction ID, Check number, etc."
															/>
														</div>
													</div>

													<div>
														<Label htmlFor="paymentScreenshot">
															Payment Screenshot/Receipt
														</Label>
														<div className="mt-2">
															<label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
																<div className="text-center">
																	<Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
																	<p className="text-sm text-muted-foreground">
																		{formData.paymentScreenshot
																			? formData
																					.paymentScreenshot
																					.name
																			: "Click to upload payment proof (Max 5MB)"}
																	</p>
																</div>
																<input
																	type="file"
																	className="hidden"
																	accept="image/*,.pdf"
																	onChange={
																		handleFileUpload
																	}
																/>
															</label>
														</div>
													</div>
												</>
											)}

											<div className="space-y-2">
												<Label htmlFor="specialRequests">
													Special Requests
												</Label>
												<Textarea
													id="specialRequests"
													value={formData.specialRequests}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															specialRequests:
																e.target.value,
														}))
													}
													placeholder="Any special arrangements or requests..."
													rows={3}
												/>
											</div>

											{formData.advanceAmount > 0 && (
												<div className="p-4 bg-muted/50 rounded-lg">
													<div className="space-y-2">
														<div className="flex justify-between">
															<span>Total Amount:</span>
															<span className="font-medium">
																{BookingService.formatCurrency(
																	formData.totalAmount
																)}
															</span>
														</div>
														<div className="flex justify-between">
															<span>Advance Payment:</span>
															<span className="font-medium">
																{BookingService.formatCurrency(
																	formData.advanceAmount
																)}
															</span>
														</div>
														<div className="flex justify-between border-t pt-2">
															<span className="font-medium">
																Balance Amount:
															</span>
															<span className="font-bold">
																{BookingService.formatCurrency(
																	formData.totalAmount -
																		formData.advanceAmount
																)}
															</span>
														</div>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								</div>
							</div>
						</ScrollArea>

						{/* Footer */}
						<div className="px-6 py-4 border-t bg-background flex-shrink-0">
							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									{formData.customerId && (
										<span className="flex items-center gap-1">
											<CheckCircle2 className="h-4 w-4 text-green-600" />
											Customer selected
										</span>
									)}
								</div>
								<div className="flex items-center gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											resetForm();
											onOpenChange(false);
										}}
										disabled={loading}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={loading || !canGroupProceed()}
										className="min-w-[120px]"
									>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating...
											</>
										) : (
											<>
												<Plus className="mr-2 h-4 w-4" />
												Create Booking
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
