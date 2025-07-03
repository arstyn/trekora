import { TeamTable } from './_component/team-table';
import { getDepartments, getEmployees, getRoles } from './action';

export default async function Page() {
  const { employees, error } = await getEmployees();
  const { departments, error: depError } = await getDepartments();
  const { roles, error: roleError } = await getRoles();

  return (
    <div className="px-6 py-5">
      <TeamTable
        initialEmployees={employees}
        departments={departments}
        roles={roles}
      />
    </div>
  );
}
