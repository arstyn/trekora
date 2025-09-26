import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, DollarSign, Upload, Users, Loader2, AlertCircle, Search, Plus, X, Check, CheckCircle } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import BookingService from "@/services/booking.service";
import type {
	ICreateBookingRequest,
	IBookingPassenger,
	PaymentMethod,
	IPackage,
	ICustomer,
	IBooking
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

export function CreateBookingDialog({ open, onOpenChange, onBookingCreated }: CreateBookingDialogProps) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);


	const [packages, setPackages] = useState<IPackage[]>([]);
	const [customers, setCustomers] = useState<ICustomer[]>([]);
	const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);
	const [loadingData, setLoadingData] = useState(false);

	const [customerSearch, setCustomerSearch] = useState("");
	const [showCustomerResults, setShowCustomerResults] = useState(false);

	const [groupChecklist, setGroupChecklist] = useState<GroupChecklistItem[]>([]);

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
			const [packagesData] = await Promise.all([
				BookingService.getPackages(),
			]);
			setPackages(packagesData);
		} catch (err) {
			console.error('Error loading initial data:', err);
			setError('Failed to load packages. Please try again.');
		} finally {
			setLoadingData(false);
		}
	};

	const searchCustomers = async (query: string) => {
		if (query.length < 2) {
			setCustomers([]);
			return;
		}

		try {
			const results = await BookingService.searchCustomers(query);
			setCustomers(results);
			setShowCustomerResults(true);
		} catch (err) {
			console.error('Error searching customers:', err);
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
			console.error('Error loading batches:', err);
			setError('Failed to load available batches.');
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

	const updatePassenger = (index: number, field: keyof EnhancedBookingPassenger, value: string | number) => {
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
				const checklistItem = await BookingService.addChecklistItem(createdBookingId, {
					item: item.trim(),
					completed: false,
					mandatory: false,
					type: 'INDIVIDUAL',
					passengerId: formData.passengers[passengerIndex].id, // Assuming passenger has ID after booking creation
					sortOrder: formData.passengers[passengerIndex].checklist.length
				});

				const newPassengers = [...formData.passengers];
				newPassengers[passengerIndex] = {
					...newPassengers[passengerIndex],
					checklist: [...newPassengers[passengerIndex].checklist, {
						id: checklistItem.id,
						item: checklistItem.item,
						completed: checklistItem.completed,
						mandatory: checklistItem.mandatory
					}]
				};

				setFormData((prev) => ({ ...prev, passengers: newPassengers }));
				toast.success('Checklist item added successfully');
			} catch (error) {
				console.error('Error adding checklist item:', error);
				toast.error('Failed to add checklist item');
			}
		} else {
			// Before booking creation, just update local state
			const newPassengers = [...formData.passengers];
			const newChecklistItem = {
				id: Date.now().toString(),
				item: item.trim(),
				completed: false,
				mandatory: false
			};

			newPassengers[passengerIndex] = {
				...newPassengers[passengerIndex],
				checklist: [...newPassengers[passengerIndex].checklist, newChecklistItem]
			};

			setFormData((prev) => ({ ...prev, passengers: newPassengers }));
		}
	};

	const removeChecklistItem = async (passengerIndex: number, itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith('temp-')) {
			try {
				await BookingService.deleteChecklistItem(itemId);
				toast.success('Checklist item removed');
			} catch (error) {
				console.error('Error removing checklist item:', error);
				toast.error('Failed to remove checklist item');
				return;
			}
		}

		const newPassengers = [...formData.passengers];
		newPassengers[passengerIndex] = {
			...newPassengers[passengerIndex],
			checklist: newPassengers[passengerIndex].checklist.filter(item => item.id !== itemId)
		};

		setFormData((prev) => ({ ...prev, passengers: newPassengers }));
	};

	const toggleChecklistItem = async (passengerIndex: number, itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith('temp-')) {
			try {
				const updatedItem = await BookingService.toggleChecklistItem(itemId);

				const newPassengers = [...formData.passengers];
				newPassengers[passengerIndex] = {
					...newPassengers[passengerIndex],
					checklist: newPassengers[passengerIndex].checklist.map(item =>
						item.id === itemId
							? { ...item, completed: updatedItem.completed }
							: item
					)
				};

				setFormData((prev) => ({ ...prev, passengers: newPassengers }));
			} catch (error) {
				console.error('Error toggling checklist item:', error);
				toast.error('Failed to update checklist item');
			}
		} else {
			// Before booking creation or temporary items, just update local state
			const newPassengers = [...formData.passengers];
			newPassengers[passengerIndex] = {
				...newPassengers[passengerIndex],
				checklist: newPassengers[passengerIndex].checklist.map(item =>
					item.id === itemId ? { ...item, completed: !item.completed } : item
				)
			};

			setFormData((prev) => ({ ...prev, passengers: newPassengers }));
		}
	};

	// Group checklist functions (with API integration)
	const toggleGroupChecklistItem = async (itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith('temp-')) {
			try {
				const updatedItem = await BookingService.toggleChecklistItem(itemId);

				setGroupChecklist(prev =>
					prev.map(item =>
						item.id === itemId
							? { ...item, completed: updatedItem.completed }
							: item
					)
				);
			} catch (error) {
				console.error('Error toggling group checklist item:', error);
				toast.error('Failed to update checklist item');
			}
		} else {
			// Before booking creation or temporary items, just update local state
			setGroupChecklist(prev =>
				prev.map(item =>
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
				const checklistItem = await BookingService.addChecklistItem(createdBookingId, {
					item: item.trim(),
					completed: false,
					mandatory,
					type: 'GROUP',
					sortOrder: groupChecklist.length
				});

				const newItem: GroupChecklistItem = {
					id: checklistItem.id,
					item: checklistItem.item,
					completed: checklistItem.completed,
					mandatory: checklistItem.mandatory
				};

				setGroupChecklist(prev => [...prev, newItem]);
				toast.success('Group checklist item added successfully');
			} catch (error) {
				console.error('Error adding group checklist item:', error);
				toast.error('Failed to add group checklist item');
			}
		} else {
			// Before booking creation, just update local state
			const newItem: GroupChecklistItem = {
				id: `temp-${Date.now()}`,
				item: item.trim(),
				completed: false,
				mandatory
			};

			setGroupChecklist(prev => [...prev, newItem]);
		}
	};

	const removeGroupChecklistItem = async (itemId: string) => {
		// If booking is created and item has a real API ID, call API
		if (createdBookingId && !itemId.startsWith('temp-')) {
			try {
				await BookingService.deleteChecklistItem(itemId);
				toast.success('Group checklist item removed');
			} catch (error) {
				console.error('Error removing group checklist item:', error);
				toast.error('Failed to remove checklist item');
				return;
			}
		}

		setGroupChecklist(prev => prev.filter(item => item.id !== itemId));
	};

	// Check if group can proceed (at least one item)
	const canGroupProceed = () => {
		return groupChecklist.length > 0;
	};

	// Get group checklist completion stats
	const getGroupChecklistStats = () => {
		const total = groupChecklist.length;
		const completed = groupChecklist.filter(item => item.completed).length;
		const mandatoryTotal = groupChecklist.filter(item => item.mandatory).length;
		const mandatoryCompleted = groupChecklist.filter(item => item.mandatory && item.completed).length;

		return {
			total,
			completed,
			mandatoryTotal,
			mandatoryCompleted,
			completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			mandatoryPercentage: mandatoryTotal > 0 ? Math.round((mandatoryCompleted / mandatoryTotal) * 100) : 0
		};
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setError('File size must be less than 5MB');
				return;
			}

			// Validate file type
			const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
			if (!allowedTypes.includes(file.type)) {
				setError('File must be an image (JPEG, PNG) or PDF');
				return;
			}

			setFormData((prev) => ({ ...prev, paymentScreenshot: file }));
		}
	};

	const handleCustomerSelect = (customer: ICustomer) => {
		setFormData(prev => ({
			...prev,
			customerId: customer.id,
			customerName: customer.name,
			customerEmail: customer.email,
			customerPhone: customer.phone,
		}));
		setCustomerSearch(customer.name);
		setShowCustomerResults(false);
	};

	// Create checklist items after booking creation
	const createChecklistItems = async (bookingId: string, booking: IBooking) => {
		try {
			// Create group checklist items
			for (let i = 0; i < groupChecklist.length; i++) {
				const groupItem = groupChecklist[i];
				if (groupItem.id.startsWith('temp-')) { // Only create temporary items
					await BookingService.addChecklistItem(bookingId, {
						item: groupItem.item,
						completed: groupItem.completed,
						mandatory: groupItem.mandatory,
						type: 'GROUP',
						sortOrder: i
					});
				}
			}

			// Create individual checklist items
			for (let passengerIndex = 0; passengerIndex < formData.passengers.length; passengerIndex++) {
				const passenger = formData.passengers[passengerIndex];
				const bookingPassenger = booking.passengers[passengerIndex]; // Get the created passenger with ID

				for (let i = 0; i < passenger.checklist.length; i++) {
					const checklistItem = passenger.checklist[i];
					if (checklistItem.id.toString().startsWith('temp-') || !checklistItem.id.match(/^\d+$/)) {
						await BookingService.addChecklistItem(bookingId, {
							item: checklistItem.item,
							completed: checklistItem.completed,
							mandatory: checklistItem.mandatory,
							type: 'INDIVIDUAL',
							passengerId: bookingPassenger.id,
							sortOrder: i
						});
					}
				}
			}
		} catch (error) {
			console.error('Error creating checklist items:', error);
			toast.error('Booking created but some checklist items could not be added');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check if group checklist has at least one item
		if (!canGroupProceed()) {
			setError('Please add at least one group checklist item to proceed.');
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Convert enhanced passengers back to regular passengers for API
			const regularPassengers: IBookingPassenger[] = formData.passengers.map(passenger => ({
				fullName: passenger.fullName,
				age: passenger.age,
				email: passenger.email,
				phone: passenger.phone,
				emergencyContact: passenger.emergencyContact,
				specialRequirements: passenger.specialRequirements,
			}));

			// Prepare booking data (without checklist initially)
			const bookingData: ICreateBookingRequest = {
				customerId: formData.customerId,
				packageId: formData.packageId,
				batchId: formData.batchId,
				numberOfPassengers: formData.numberOfPassengers,
				totalAmount: formData.totalAmount,
				specialRequests: formData.specialRequests,
				passengers: regularPassengers,
				initialPayment: formData.advanceAmount > 0 ? {
					amount: formData.advanceAmount,
					paymentMethod: formData.paymentMethod as PaymentMethod,
					paymentReference: formData.paymentReference,
					notes: "Initial payment",
				} : undefined,
			};

			// Validate data
			const validation = BookingService.validateBookingData(bookingData);
			if (!validation.isValid) {
				setError(validation.errors.join(', '));
				return;
			}

			// Upload payment screenshot if provided
			if (formData.paymentScreenshot) {
				const uploadResult = await BookingService.uploadFile(formData.paymentScreenshot);
				if (bookingData.initialPayment) {
					bookingData.initialPayment.filePath = uploadResult.filePath;
				}
			}

			// Create booking
			const createdBooking = await BookingService.createBooking(bookingData);
			setCreatedBookingId(createdBooking.id);

			// Create checklist items after booking creation
			await createChecklistItems(createdBooking.id, createdBooking);

			toast.success('Booking created successfully', {
				description: `Booking ${BookingService.formatBookingNumber(createdBooking.bookingNumber)} has been created with checklist items.`,
			});

			// Reset form and close dialog
			resetForm();
			onOpenChange(false);

			// Notify parent component
			if (onBookingCreated) {
				onBookingCreated();
			}

		} catch (err) {
			console.error('Error creating booking:', err);
			setError((err as any)?.response?.data?.message || 'Failed to create booking. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setStep(1);
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
		setError(null);
	};

	const nextStep = () => {
		// Basic validation before proceeding to next step
		if (step === 1 && !formData.customerId) {
			setError('Please select a customer');
			return;
		}
		if (step === 2 && (!formData.packageId || !formData.batchId)) {
			setError('Please select both package and batch');
			return;
		}
		if (step === 3) {
			const invalidPassengers = formData.passengers.some(p => !p.fullName || !p.age || !p.emergencyContact);
			if (invalidPassengers) {
				setError('Please fill in all required passenger details');
				return;
			}
		}

		setError(null);
		setStep((prev) => Math.min(prev + 1, 5));
	};

	const prevStep = () => {
		setError(null);
		setStep((prev) => Math.max(prev - 1, 1));
	};

	// Component for individual checklist management
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
			if (e.key === 'Enter') {
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
								className={`flex items-center gap-2 p-2 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
									}`}
							>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => toggleChecklistItem(passengerIndex, item.id)}
									className={`p-1 h-6 w-6 rounded ${item.completed
											? 'bg-green-500 text-white hover:bg-green-600'
											: 'border-2 border-gray-300 hover:border-gray-400'
										}`}
								>
									{item.completed && <Check className="w-3 h-3" />}
								</Button>
								<span
									className={`flex-1 text-sm ${item.completed
											? 'line-through text-green-700'
											: 'text-gray-900'
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
									onClick={() => removeChecklistItem(passengerIndex, item.id)}
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
						No individual checklist items added yet. Add items to help track personal travel preparations.
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
						<label htmlFor="mandatory" className="text-sm text-muted-foreground">
							Mark as mandatory
						</label>
					</div>
				</div>

				{/* Checklist items */}
				<div className="space-y-2 max-h-60 overflow-y-auto">
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
								className={`p-1 h-6 w-6 rounded ${item.completed
										? 'bg-green-500 text-white hover:bg-green-600'
										: 'border-2 border-gray-300 hover:border-gray-400'
									}`}
							>
								{item.completed && <Check className="w-3 h-3" />}
							</Button>
							<div className="flex-1">
								<span className={`text-sm ${item.completed
										? 'line-through text-green-700'
										: 'text-gray-900'
									}`}>
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

				{groupChecklist.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No group checklist items added yet. Add items to help track group preparations.
					</p>
				)}
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Booking - Step {step} of 5</DialogTitle>
				</DialogHeader>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{loadingData ? (
					<div className="flex items-center justify-center py-8">
						<div className="flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Loading data...</span>
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Step 1: Customer Selection */}
						{step === 1 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Customer Selection
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="customerSearch">Search Customer *</Label>
										<div className="relative mt-2">
											<Input
												id="customerSearch"
												value={customerSearch}
												onChange={(e) => {
													setCustomerSearch(e.target.value);
													searchCustomers(e.target.value);
												}}
												placeholder="Type customer name or email to search..."
												className="pr-10"
											/>
											<Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>

										{showCustomerResults && customers.length > 0 && (
											<div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
												{customers.map((customer) => (
													<div
														key={customer.id}
														className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
														onClick={() => handleCustomerSelect(customer)}
													>
														<div className="font-medium">{customer.name}</div>
														<div className="text-sm text-muted-foreground">
															{customer.email} • {customer.phone}
														</div>
													</div>
												))}
											</div>
										)}
									</div>

									{formData.customerId && (
										<div className="p-4 bg-muted/50 rounded-lg">
											<h4 className="font-medium mb-2">Selected Customer:</h4>
											<div className="space-y-1">
												<p><strong>Name:</strong> {formData.customerName}</p>
												<p><strong>Email:</strong> {formData.customerEmail}</p>
												<p><strong>Phone:</strong> {formData.customerPhone}</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Step 2: Package & Batch Selection */}
						{step === 2 && (
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">
											Package & Batch Selection
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label htmlFor="package" className="mb-2">Select Package *</Label>
											<Select
												value={formData.packageId}
												onValueChange={(value) => {
													const pkg = packages.find(p => p.id === value);
													setFormData((prev) => ({
														...prev,
														packageId: value,
														batchId: "",
														totalAmount: pkg ? pkg.price * prev.numberOfPassengers : 0,
													}));
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Choose a package" />
												</SelectTrigger>
												<SelectContent>
													{packages.map((pkg) => (
														<SelectItem
															key={pkg.id}
															value={pkg.id}
														>
															{pkg.name} - {BookingService.formatCurrency(pkg.price)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{formData.packageId && (
											<div>
												<Label>Available Batches</Label>
												<div className="grid gap-3 mt-2">
													{availableBatches.map((batch) => (
														<div
															key={batch.id}
															className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.batchId === batch.id
																	? "border-primary bg-primary/5"
																	: "hover:bg-muted/50"
																}`}
															onClick={() =>
																setFormData((prev) => ({
																	...prev,
																	batchId: batch.id,
																}))
															}
														>
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	<Calendar className="w-4 h-4" />
																	<div>
																		<p className="font-medium">
																			{new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
																		</p>
																		<p className="text-sm text-muted-foreground">
																			{batch.totalSeats - batch.bookedSeats} seats available out of {batch.totalSeats}
																		</p>
																	</div>
																</div>
																<Badge
																	variant={
																		(batch.totalSeats - batch.bookedSeats) > 5
																			? "default"
																			: "secondary"
																	}
																>
																	{batch.totalSeats - batch.bookedSeats} Available
																</Badge>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{formData.batchId && (
											<div>
												<Label htmlFor="passengers" className="mb-2">
													Number of Passengers *
												</Label>
												<Select
													value={formData.numberOfPassengers.toString()}
													onValueChange={(value) =>
														updatePassengerCount(Number.parseInt(value))
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{Array.from(
															{
																length: Math.min(
																	selectedBatch ? selectedBatch.totalSeats - selectedBatch.bookedSeats : 1,
																	10
																),
															},
															(_, i) => (
																<SelectItem
																	key={i + 1}
																	value={(i + 1).toString()}
																>
																	{i + 1} Passenger{i > 0 ? "s" : ""}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
										)}

										{formData.totalAmount > 0 && (
											<div className="p-4 bg-muted/50 rounded-lg">
												<div className="flex items-center justify-between">
													<span className="font-medium">
														Total Amount:
													</span>
													<span className="text-xl font-bold">
														{BookingService.formatCurrency(formData.totalAmount)}
													</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}

						{/* Step 3: Passenger Details */}
						{step === 3 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
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
											<div className="grid grid-cols-2 gap-4">
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
																Number.parseInt(e.target.value) || 0
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
											<div className="space-y-2">
												<Label>Emergency Contact *</Label>
												<Input
													value={passenger.emergencyContact}
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
												<Label>Special Requirements</Label>
												<Textarea
													value={passenger.specialRequirements}
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

											{/* Individual Checklist Section */}
											<div className="border-t pt-4">
												<ChecklistManager passengerIndex={index} />
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{/* Step 4: Group Checklist */}
						{step === 4 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Group Checklist
									</CardTitle>
								</CardHeader>
								<CardContent>
									<GroupChecklistManager />
								</CardContent>
							</Card>
						)}

						{/* Step 5: Payment Details */}
						{step === 5 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Payment Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label>Total Amount</Label>
											<div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
												<DollarSign className="w-4 h-4" />
												<span className="font-bold">
													{BookingService.formatCurrency(formData.totalAmount)}
												</span>
											</div>
										</div>
										<div>
											<Label htmlFor="advanceAmount">
												Advance Payment
											</Label>
											<Input
												id="advanceAmount"
												type="number"
												min="0"
												max={formData.totalAmount}
												value={formData.advanceAmount || ""}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														advanceAmount: Number.parseInt(e.target.value) || 0,
													}))
												}
											/>
										</div>
									</div>

									{formData.advanceAmount > 0 && (
										<>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label htmlFor="paymentMethod">
														Payment Method *
													</Label>
													<Select
														value={formData.paymentMethod}
														onValueChange={(value) =>
															setFormData((prev) => ({
																...prev,
																paymentMethod: value as PaymentMethod,
															}))
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
															<SelectItem value="cash">Cash</SelectItem>
															<SelectItem value="upi">UPI</SelectItem>
															<SelectItem value="other">Other</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label htmlFor="paymentReference">
														Payment Reference
													</Label>
													<Input
														id="paymentReference"
														value={formData.paymentReference}
														onChange={(e) =>
															setFormData((prev) => ({
																...prev,
																paymentReference: e.target.value,
															}))
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
																	? formData.paymentScreenshot.name
																	: "Click to upload payment proof (Max 5MB)"}
															</p>
														</div>
														<input
															type="file"
															className="hidden"
															accept="image/*,.pdf"
															onChange={handleFileUpload}
														/>
													</label>
												</div>
											</div>
										</>
									)}

									<div>
										<Label htmlFor="specialRequests">
											Special Requests
										</Label>
										<Textarea
											id="specialRequests"
											value={formData.specialRequests}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													specialRequests: e.target.value,
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
														{BookingService.formatCurrency(formData.totalAmount)}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Advance Payment:</span>
													<span className="font-medium">
														{BookingService.formatCurrency(formData.advanceAmount)}
													</span>
												</div>
												<div className="flex justify-between border-t pt-2">
													<span className="font-medium">
														Balance Amount:
													</span>
													<span className="font-bold">
														{BookingService.formatCurrency(formData.totalAmount - formData.advanceAmount)}
													</span>
												</div>
											</div>
										</div>
									)}

									{/* Group checklist status on final step */}
									<div className={`p-3 rounded-lg border ${canGroupProceed()
											? 'bg-green-50 border-green-300'
											: 'bg-gray-50 border-gray-300'
										}`}>
										<div className="flex items-center gap-2">
											{canGroupProceed() ? (
												<CheckCircle className="w-5 h-5 text-green-600" />
											) : (
												<AlertCircle className="w-5 h-5 text-gray-600" />
											)}
											<span className={`font-medium ${canGroupProceed() ? 'text-green-700' : 'text-gray-700'
												}`}>
												{canGroupProceed()
													? `Group checklist ready (${groupChecklist.length} items added)`
													: 'Add at least one group checklist item to proceed'
												}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Navigation Buttons */}
						<div className="flex justify-between">
							<div>
								{step > 1 && (
									<Button
										type="button"
										variant="outline"
										onClick={prevStep}
										disabled={loading}
									>
										Previous
									</Button>
								)}
							</div>
							<div className="flex gap-2">
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
								{step < 5 ? (
									<Button
										type="button"
										onClick={nextStep}
										disabled={loading}
									>
										Next
									</Button>
								) : (
									<Button
										type="submit"
										disabled={loading || !canGroupProceed()}
									>
										{loading ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Creating...
											</>
										) : (
											"Create Booking"
										)}
									</Button>
								)}
							</div>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}