import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Mail, MapPin, Phone, User } from "lucide-react";

interface CoordinatorModalProps {
	coordinator: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CoordinatorModal({
	coordinator,
	open,
	onOpenChange,
}: CoordinatorModalProps) {
	if (!coordinator) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						Coordinator Details - {coordinator.name}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">Role</h3>
							<Badge variant="outline">{coordinator.type}</Badge>
						</div>

						<div className="grid grid-cols-1 gap-3">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">{coordinator.phone}</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{coordinator.email}</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Award className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Experience
									</p>
									<p className="font-medium">
										{coordinator.experience}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										Specialization
									</p>
									<p className="font-medium">
										{coordinator.specialization}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Information */}
					<div className="p-4 bg-muted/50 rounded-lg">
						<h4 className="font-medium mb-2">Additional Information</h4>
						<p className="text-sm text-muted-foreground">
							Experienced {coordinator.type.toLowerCase()} with expertise in{" "}
							{coordinator.specialization.toLowerCase()}. Available for
							emergency contact during the tour duration.
						</p>
					</div>

					<div className="flex justify-end">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
