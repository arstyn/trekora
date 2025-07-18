'use client';

import { useRouter } from 'next/navigation';
import { PackageForm } from '../../_component/package-form';

interface Props {
  params: { id: string };
}

export default function CreatePackagePage({ params }: Props) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen ">
      <PackageForm
        isEditing={true}
        onSuccess={handleSuccess}
        packageId={params.id}
      />
    </div>
  );
}
