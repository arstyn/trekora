import { AxiosRequest } from '@/lib/axios';
import { ILead } from '@repo/api/lead/lead.entity';

export async function getLeads() {
  try {
    const leads = await AxiosRequest.get<ILead[]>('/lead');
    return { leads };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching leads.';
    return { error: errorMessage, leads: [] };
  }
}

export async function createLead(newLead: ILead) {
  console.log('🚀 ~ action.ts:16 ~ createLead ~ newLead:', newLead);
  try {
    const lead = await AxiosRequest.post<ILead, ILead>('/lead', newLead);
    return { lead };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while creating lead.';
    return { error: errorMessage };
  }
}
