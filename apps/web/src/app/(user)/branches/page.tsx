import { BranchTable } from './_component/branch-table';
import { getBranches } from './action';

export default async function Page() {
  const { branches, error } = await getBranches();
  return (
    <div className="px-6 py-5">
      <BranchTable Initialbranches={branches} />
    </div>
  );
}
