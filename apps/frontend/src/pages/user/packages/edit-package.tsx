import { useNavigate, useParams } from "react-router-dom";
import { PackageForm } from "./_component/package-form";

export default function EditPackagePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const handleSuccess = () => {
		navigate("/");
	};

	return (
		<div className="min-h-screen ">
			<PackageForm isEditing={true} onSuccess={handleSuccess} packageId={id} />
		</div>
	);
}
