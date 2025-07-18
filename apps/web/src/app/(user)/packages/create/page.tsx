'use client';

import { useRouter } from 'next/navigation';
import { PackageForm } from '../_component/package-form';

export default function CreatePackagePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen ">
      <PackageForm isEditing={false} onSuccess={handleSuccess} />
    </div>
  );
}
