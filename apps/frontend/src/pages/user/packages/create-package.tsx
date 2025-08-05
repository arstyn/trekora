import { useNavigate } from "react-router-dom";
import { PackageForm } from "./_component/package-form";

export default function CreatePackagePage() {
	const navigate = useNavigate();

	const handleSuccess = () => {
		navigate("/packages");
	};

	return (
		<div className="min-h-screen ">
			<PackageForm isEditing={false} onSuccess={handleSuccess} />
		</div>
	);
}
