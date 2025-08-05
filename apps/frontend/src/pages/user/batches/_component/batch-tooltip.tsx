import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, DollarSign } from "lucide-react";
import { createPortal } from "react-dom";
import type { IBatches } from "@/types/batches.types";

interface BatchTooltipProps {
	batch: IBatches;
	position: { x: number; y: number };
	onClose: () => void;
}

export function BatchTooltip({ batch, position, onClose }: BatchTooltipProps) {
	const tooltipRef = useRef<HTMLDivElement>(null);

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

	// Calculate tooltip position to avoid going off-screen
	const tooltipStyle = {
		position: "fixed" as const,
		left: Math.min(position.x + 10, window.innerWidth - 320),
		top: Math.min(position.y + 10, window.innerHeight - 300),
		zIndex: 1000,
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
					<div className="flex items-center gap-2">
						<DollarSign className="w-4 h-4 text-muted-foreground" />
						<div className="text-sm">
							<span className="font-medium">Price: </span>
							{batch.package?.price}
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
								className={`h-2 rounded-full transition-all duration-300 ${
									fillPercentage >= 90
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
