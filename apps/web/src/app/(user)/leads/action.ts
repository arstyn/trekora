import { AxiosRequest } from '@/lib/axios';
import { ILead } from '@repo/api/lead/lead.entity';
import { LeadFormData } from './_components/lead-form';

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

export async function createLead(newLead: LeadFormData) {
  try {
    const lead = await AxiosRequest.post<LeadFormData, ILead>('/lead', newLead);
    return { lead };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while creating lead.';
    return { error: errorMessage };
  }
}
