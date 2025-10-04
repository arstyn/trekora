import { getFileUrl as getServeFileUrl } from "@/lib/file-upload";
import { getFileUrl } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Badge } from "./ui/badge";

interface ImageGalleryProps {
	images: string[];
	onImageClick: (imageUrl: string, title?: string) => void;
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
	const getImageUrl = (filename: string) => {
		return getFileUrl(getServeFileUrl(filename));
	};

	return (
		<div className="flex flex-wrap gap-2">
			{images.map((image, index) => (
				<div
					key={index}
					className="relative group cursor-pointer"
					onClick={() => onImageClick(getImageUrl(image))}
				>
					<div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
						<img
							src={getImageUrl(image)}
							alt={`Document ${index + 1}`}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-200 rounded-lg flex items-center justify-center">
						<Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>
					<Badge
						variant="secondary"
						className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
					>
						{index + 1}
					</Badge>
				</div>
			))}
		</div>
	);
}
