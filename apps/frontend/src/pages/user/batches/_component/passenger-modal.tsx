import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Mail, Phone, Save, User } from "lucide-react";
import { useState } from "react";

interface PassengerModalProps {
	passenger: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PassengerModal({ passenger, open, onOpenChange }: PassengerModalProps) {
	const [checklist, setChecklist] = useState(passenger?.checklist || {});

	if (!passenger) return null;

	const handleChecklistChange = (item: string, checked: boolean) => {
		setChecklist((prev: any) => ({
			...prev,
			[item]: checked,
		}));
	};

	const saveChecklist = () => {
		// Here you would save the checklist to your backend
		console.log("Saving checklist:", checklist);
		// Show success message or handle error
	};

	const checklistItems = [
		{ key: "passport", label: "Passport Copy" },
		{ key: "visa", label: "Visa Documentation" },
		{ key: "insurance", label: "Travel Insurance" },
		{ key: "medicalClearance", label: "Medical Clearance" },
		{ key: "equipment", label: "Required Equipment" },
	];

	const completedItems = Object.values(checklist).filter(Boolean).length;
	const totalItems = checklistItems.length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						Passenger Details - {passenger.name}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Information */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">{passenger.phone}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{passenger.email}</p>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Age</p>
								<p className="font-medium">{passenger.age} years</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Emergency Contact
								</p>
								<p className="font-medium">
									{passenger.emergencyContact}
								</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Checklist Section */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Travel Checklist</h3>
							<Badge
								variant={
									completedItems === totalItems
										? "default"
										: "secondary"
								}
							>
								{completedItems}/{totalItems} Complete
							</Badge>
						</div>

						<div className="space-y-3">
							{checklistItems.map((item) => (
								<div
									key={item.key}
									className="flex items-center space-x-3 p-3 border rounded-lg"
								>
									<Checkbox
										id={item.key}
										checked={checklist[item.key] || false}
										onCheckedChange={(checked) =>
											handleChecklistChange(item.key, !!checked)
										}
									/>
									<label
										htmlFor={item.key}
										className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										{item.label}
									</label>
									{!checklist[item.key] && (
										<AlertCircle className="w-4 h-4 text-amber-500" />
									)}
								</div>
							))}
						</div>

						{completedItems < totalItems && (
							<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
								<div className="flex items-center gap-2">
									<AlertCircle className="w-4 h-4 text-amber-600" />
									<p className="text-sm text-amber-800">
										{totalItems - completedItems} item(s) still
										pending completion
									</p>
								</div>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						<Button onClick={saveChecklist}>
							<Save className="w-4 h-4 mr-2" />
							Save Checklist
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
