import { CrmDashboard } from './_components/crm-dashboard';
import { getLeads } from './action';

export default async function Leads() {
  const { leads, error } = await getLeads();

  return <CrmDashboard leadsData={leads} />;
}
