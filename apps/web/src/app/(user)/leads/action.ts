'use server';
import { AxiosRequest } from '@/lib/axios';
import { ILead } from '@repo/api/lead/lead.entity';
import { LeadFormData } from './_components/lead-form';
import {
  ILeadUpdate,
  ILeadUpdateCreateDTO,
} from '@repo/api/lead/lead-update.entity';

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

export async function updateLead(id: string, updateLead: LeadFormData) {
  try {
    const lead = await AxiosRequest.put<LeadFormData, ILead>(
      `/lead/${id}`,
      updateLead,
    );
    return { lead };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while updating lead.';
    return { error: errorMessage };
  }
}

export async function createLeadUpdate(newLeadUpdate: ILeadUpdateCreateDTO) {
  try {
    const leadUpdate = await AxiosRequest.post<
      ILeadUpdateCreateDTO,
      ILeadUpdate
    >('/lead-updates', newLeadUpdate);
    return { leadUpdate };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while creating lead.';
    return { error: errorMessage };
  }
}

export async function getLeadUpdates(leadId: string) {
  try {
    const leadUpdates = await AxiosRequest.get<ILeadUpdate[]>(
      `/lead-updates/lead/${leadId}`,
    );

    return { leadUpdates };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching leadUpdates.';
    return { error: errorMessage, leadUpdates: [] };
  }
}

export async function updateLeadUpdate(
  id: string,
  newLeadUpdate: { text: string },
) {
  try {
    const leadUpdate = await AxiosRequest.patch<{ text: string }, ILeadUpdate>(
      `/lead-updates/${id}`,
      newLeadUpdate,
    );
    return { leadUpdate };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching lead updates.';
    return { error: errorMessage };
  }
}
