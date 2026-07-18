import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { PackageForm } from "./_components/package-form";
import { NormalPackageForm } from "./_components/normal-package-form";

export default function EditPackagePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [packageSetup, setPackageSetup] = useState<"normal" | "advanced" | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getPackageSetup = async () => {
			if (!id) return;
			setIsLoading(true);
			try {
				const res = await axiosInstance.get(`/packages/${id}/basic`);
				setPackageSetup(res.data.packageSetup || "advanced");
			} catch (error) {
				console.error("Failed to load package setup:", error);
				setPackageSetup("advanced"); // fallback
			} finally {
				setIsLoading(false);
			}
		};
		getPackageSetup();
	}, [id]);

	const handleSuccess = () => {
		navigate(`/packages/${id}`, { replace: true });
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
				<Loader2 className="w-12 h-12 animate-spin text-primary" />
				<p className="text-muted-foreground animate-pulse">Checking package configuration...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen ">
			{packageSetup === "normal" ? (
				<NormalPackageForm isEditing={true} onSuccess={handleSuccess} packageId={id} />
			) : (
				<PackageForm isEditing={true} onSuccess={handleSuccess} packageId={id} />
			)}
		</div>
	);
}
