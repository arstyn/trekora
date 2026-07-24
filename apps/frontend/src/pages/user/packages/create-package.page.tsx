import { useNavigate, useSearchParams } from "react-router-dom";
import { PackageForm } from "./_components/package-form";
import { NormalPackageForm } from "./_components/normal-package-form";

export default function CreatePackagePage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const type = searchParams.get("type") || "advanced";

	const handleSuccess = () => {
		navigate("/packages", { replace: true });
	};

	return (
		<div className="min-h-screen ">
			{type === "normal" ? (
				<NormalPackageForm isEditing={false} onSuccess={handleSuccess} />
			) : (
				<PackageForm isEditing={false} onSuccess={handleSuccess} />
			)}
		</div>
	);
}
