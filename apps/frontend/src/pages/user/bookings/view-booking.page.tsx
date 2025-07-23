import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft,
	Calendar,
	DollarSign,
	Download,
	Edit,
	Eye,
	FileText,
	Mail,
	Phone,
	Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

// Mock booking data
const bookingData = {
	id: "BK001",
	bookingDate: "2024-01-20",
	status: "confirmed",

	// Customer Information
	customer: {
		name: "John Smith",
		email: "john.smith@email.com",
		phone: "+1-234-567-8900",
		address: "123 Main Street, New York, NY 10001",
	},

	// Package & Batch Information
	package: {
		name: "Himalayan Adventure",
		price: 1200,
		description:
			"Experience the breathtaking beauty of the Himalayas with our comprehensive adventure package.",
		destinations: ["Kathmandu", "Pokhara", "Annapurna Base Camp"],
		inclusions: ["Accommodation", "Meals", "Transportation", "Guide"],
	},

	batch: {
		id: "1",
		startDate: "2024-02-15",
		endDate: "2024-02-25",
		coordinators: ["John Doe (Tour Guide)", "Mike Smith (Driver)"],
	},

	// Passengers
	passengers: [
		{
			id: "p1",
			name: "John Smith",
			age: 35,
			email: "john.smith@email.com",
			phone: "+1-234-567-8900",
			emergencyContact: "Jane Smith (+1-234-567-8901)",
			specialRequirements: "Vegetarian meals",
		},
		{
			id: "p2",
			name: "Jane Smith",
			age: 32,
			email: "jane.smith@email.com",
			phone: "+1-234-567-8901",
			emergencyContact: "John Smith (+1-234-567-8900)",
			specialRequirements: "None",
		},
	],

	// Payment Information
	payment: {
		totalAmount: 2400,
		advancePaid: 1200,
		balanceAmount: 1200,
		paymentMethod: "Bank Transfer",
		paymentReference: "TXN123456789",
		paymentDate: "2024-01-20",
		paymentScreenshot: "payment_receipt.jpg",
	},

	// Additional Information
	specialRequests: "Please arrange for airport pickup and drop-off.",

	// Documents
	documents: [
		{ id: "1", name: "Booking Confirmation", type: "PDF", uploadDate: "2024-01-20" },
		{ id: "2", name: "Payment Receipt", type: "Image", uploadDate: "2024-01-20" },
		{ id: "3", name: "Travel Itinerary", type: "PDF", uploadDate: "2024-01-21" },
	],
};

export default function BookingDetailsPage() {
	const { id } = useParams<{ id: string }>();

	const [selectedDocument, setSelectedDocument] = useState<any>(null);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "confirmed":
				return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			case "cancelled":
				return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
			case "completed":
				return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getPaymentStatus = () => {
		const { advancePaid, totalAmount } = bookingData.payment;
		if (advancePaid === 0) {
			return <Badge variant="destructive">No Payment</Badge>;
		} else if (advancePaid < totalAmount) {
			return <Badge variant="secondary">Partial Payment</Badge>;
		} else {
			return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<NavLink to="/bookings">
						<Button variant="outline" size="sm">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Bookings
						</Button>
					</NavLink>
					<div>
						<h1 className="text-3xl font-bold">Booking {bookingData.id}</h1>
						<p className="text-muted-foreground">
							Booked on{" "}
							{new Date(bookingData.bookingDate).toLocaleDateString()}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{getStatusBadge(bookingData.status)}
					<NavLink to={`/bookings/edit/${id}`}>
						<Button>
							<Edit className="w-4 h-4 mr-2" />
							Edit Booking
						</Button>
					</NavLink>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle>Customer Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">Name</p>
							<p className="font-medium">{bookingData.customer.name}</p>
						</div>
						<div className="flex items-center gap-2">
							<Mail className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<p className="font-medium">
									{bookingData.customer.email}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Phone className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Phone</p>
								<p className="font-medium">
									{bookingData.customer.phone}
								</p>
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Address</p>
							<p className="font-medium text-sm">
								{bookingData.customer.address}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Package Information */}
				<Card>
					<CardHeader>
						<CardTitle>Package Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">Package</p>
							<p className="font-medium">{bookingData.package.name}</p>
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Duration</p>
								<p className="font-medium">
									{new Date(
										bookingData.batch.startDate
									).toLocaleDateString()}{" "}
									-{" "}
									{new Date(
										bookingData.batch.endDate
									).toLocaleDateString()}
								</p>
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Destinations</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{bookingData.package.destinations.map((dest, index) => (
									<Badge key={index} variant="outline">
										{dest}
									</Badge>
								))}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<DollarSign className="w-4 h-4 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									Price per person
								</p>
								<p className="font-medium">
									${bookingData.package.price}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Payment Information */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Total Amount:
								</span>
								<span className="font-medium">
									${bookingData.payment.totalAmount}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Advance Paid:
								</span>
								<span className="font-medium">
									${bookingData.payment.advancePaid}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="font-medium">Balance Amount:</span>
								<span className="font-bold">
									${bookingData.payment.balanceAmount}
								</span>
							</div>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground">
								Payment Status
							</p>
							{getPaymentStatus()}
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Payment Method
							</p>
							<p className="font-medium">
								{bookingData.payment.paymentMethod}
							</p>
						</div>
						{bookingData.payment.paymentReference && (
							<div>
								<p className="text-sm text-muted-foreground">Reference</p>
								<p className="font-medium">
									{bookingData.payment.paymentReference}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Passengers */}
			<Card>
				<CardHeader>
					<CardTitle>Passengers ({bookingData.passengers.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Age</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Emergency Contact</TableHead>
								<TableHead>Special Requirements</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bookingData.passengers.map((passenger) => (
								<TableRow key={passenger.id}>
									<TableCell className="font-medium">
										{passenger.name}
									</TableCell>
									<TableCell>{passenger.age}</TableCell>
									<TableCell>
										<div className="space-y-1">
											<div className="flex items-center gap-1 text-sm">
												<Phone className="w-3 h-3" />
												{passenger.phone}
											</div>
											<div className="flex items-center gap-1 text-sm">
												<Mail className="w-3 h-3" />
												{passenger.email}
											</div>
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{passenger.emergencyContact}
									</TableCell>
									<TableCell className="text-sm">
										{passenger.specialRequirements}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Batch Coordinators */}
			<Card>
				<CardHeader>
					<CardTitle>Batch Coordinators</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{bookingData.batch.coordinators.map((coordinator, index) => (
							<div key={index} className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span>{coordinator}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Documents */}
			<Card>
				<CardHeader>
					<CardTitle>Documents & Attachments</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Document Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Upload Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bookingData.documents.map((doc) => (
								<TableRow key={doc.id}>
									<TableCell className="font-medium">
										{doc.name}
									</TableCell>
									<TableCell>
										<Badge variant="outline">{doc.type}</Badge>
									</TableCell>
									<TableCell>
										{new Date(doc.uploadDate).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedDocument(doc)}
											>
												<Eye className="w-4 h-4 mr-1" />
												View
											</Button>
											<Button variant="outline" size="sm">
												<Download className="w-4 h-4 mr-1" />
												Download
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Special Requests */}
			{bookingData.specialRequests && (
				<Card>
					<CardHeader>
						<CardTitle>Special Requests</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">{bookingData.specialRequests}</p>
					</CardContent>
				</Card>
			)}

			{/* Document Viewer Modal */}
			<Dialog
				open={!!selectedDocument}
				onOpenChange={() => setSelectedDocument(null)}
			>
				<DialogContent className="max-w-4xl max-h-[90vh]">
					<DialogHeader>
						<DialogTitle>
							<div className="flex items-center gap-2">
								<FileText className="w-5 h-5" />
								{selectedDocument?.name}
							</div>
						</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
						<div className="text-center">
							<FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">
								Document preview would appear here
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								{selectedDocument?.type} • Uploaded on{" "}
								{selectedDocument &&
									new Date(
										selectedDocument.uploadDate
									).toLocaleDateString()}
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
