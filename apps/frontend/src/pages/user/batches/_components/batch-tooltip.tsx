import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IBatches } from "@/types/batches.types";
import { BookingService } from "@/services/booking.service";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BatchTooltipProps {
	batch: IBatches;
	position: { x: number; y: number };
	onClose: () => void;
}

export function BatchTooltip({ batch, position, onClose }: BatchTooltipProps) {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 320, height: 350 });
	const [isMeasured, setIsMeasured] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				tooltipRef.current &&
				!tooltipRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		const handleScroll = () => {
			onClose();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("scroll", handleScroll, true);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("scroll", handleScroll, true);
		};
	}, [onClose]);

	useEffect(() => {
		if (tooltipRef.current) {
			const rect = tooltipRef.current.getBoundingClientRect();
			setDimensions({ width: rect.width, height: rect.height });
			setIsMeasured(true);
		}
	}, [batch]);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "upcoming":
				return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
			case "completed":
				return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const fillPercentage = Math.round((batch.bookedSeats / batch.totalSeats) * 100);

	// Position horizontally: try to put it to the right of the cursor (+10px).
	// If it goes off-screen on the right, put it to the left of the cursor (-width -10px).
	// Otherwise, keep it within the bounds of the viewport.
	let left = position.x + 10;
	if (left + dimensions.width > window.innerWidth) {
		left = Math.max(10, position.x - dimensions.width - 10);
	}

	// Position vertically: if the cursor is in the bottom half of the screen,
	// place the tooltip above the cursor so it doesn't overflow the bottom.
	// Otherwise, place it below the cursor.
	let top = position.y + 10;
	if (position.y > window.innerHeight / 2) {
		top = Math.max(10, position.y - dimensions.height - 10);
	} else {
		// If placing below the cursor, make sure it doesn't exceed the viewport height.
		if (top + dimensions.height > window.innerHeight) {
			top = Math.max(10, window.innerHeight - dimensions.height - 10);
		}
	}

	const tooltipStyle = {
		position: "fixed" as const,
		left: left,
		top: top,
		zIndex: 1000,
		opacity: isMeasured ? 1 : 0,
		pointerEvents: isMeasured ? ("auto" as const) : ("none" as const),
	};

	return createPortal(
		<div
			ref={tooltipRef}
			style={tooltipStyle}
			className="w-80 animate-in fade-in-0 zoom-in-95 duration-200"
		>
			<Card className="shadow-lg border-2">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">{batch.package?.name}</CardTitle>
						{getStatusBadge(batch.status)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{/* Duration */}
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-muted-foreground" />
						<div className="text-sm">
							<span className="font-medium">Duration: </span>
							{new Date(batch.startDate).toLocaleDateString()} -{" "}
							{new Date(batch.endDate).toLocaleDateString()}
						</div>
					</div>

					{/* Capacity */}
					<div className="flex items-center gap-2">
						<Users className="w-4 h-4 text-muted-foreground" />
						<div className="text-sm">
							<span className="font-medium">Capacity: </span>
							{batch.bookedSeats}/{batch.totalSeats} passengers (
							{fillPercentage}% full)
						</div>
					</div>

					{/* Price */}
					<div className="flex items-start gap-2">
						<DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
						<div className="text-sm w-full">
							{batch.package?.packageTiers && batch.package.packageTiers.length > 1 ? (
								<>
									<span className="font-medium">Pricing Tiers: </span>
									<div className="mt-1.5 space-y-1 bg-muted/40 p-2 rounded-md border text-xs">
										{batch.package.packageTiers.map((tier) => (
											<div key={tier.id || tier.name} className="flex justify-between items-center gap-4">
												<span className="font-medium truncate max-w-[120px]">{tier.name}</span>
												<span className="text-muted-foreground font-mono">
													{BookingService.formatCurrency(Number(tier.adultCost) || 0)}
												</span>
											</div>
										))}
									</div>
								</>
							) : (
								<>
									<span className="font-medium">Price: </span>
									<span>
										{batch.package?.packageTiers?.[0]?.adultCost 
											? BookingService.formatCurrency(Number(batch.package.packageTiers[0].adultCost))
											: "No pricing tiers defined"}
									</span>
								</>
							)}
						</div>
					</div>

					{/* Destinations */}
					<div className="flex items-start gap-2">
						<MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
						<div className="text-sm">
							<span className="font-medium">Destinations: </span>

							<Badge variant="outline" className="text-xs">
								{batch.package?.destination}
							</Badge>
						</div>
					</div>

					{/* Coordinators */}
					<div className="text-sm">
						<span className="font-medium">Coordinators: </span>
						<div className="mt-1 space-y-1">
							{batch.coordinators?.map((coordinator, index: number) => (
								<div
									key={index}
									className="text-xs text-muted-foreground"
								>
									• {coordinator.name}
								</div>
							))}
						</div>
					</div>

					{/* Capacity indicator */}
					<div className="pt-2">
						<div className="flex justify-between text-xs text-muted-foreground mb-1">
							<span>Capacity</span>
							<span>{fillPercentage}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${fillPercentage >= 90
										? "bg-red-500"
										: fillPercentage >= 75
											? "bg-yellow-500"
											: "bg-green-500"
									}`}
								style={{ width: `${fillPercentage}%` }}
							></div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>,
		document.body
	);
}
