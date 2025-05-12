import { TeamTable } from './_component/team-table';
import { getEmployees } from './action';

export default async function Page() {
  const { employees, error } = await getEmployees();

  return (
    <div className="px-6 py-5">
      <TeamTable employees={employees} />
    </div>
  );
}
