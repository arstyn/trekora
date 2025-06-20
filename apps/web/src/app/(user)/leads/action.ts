'use server';
import { AxiosRequest } from '@/lib/axios';
import { ILead } from '@repo/api/lead/lead.entity';
import { LeadFormData } from './_components/lead-form';
import {
  ILeadUpdate,
  ILeadUpdateCreateDTO,
} from '@repo/api/lead/lead-update.entity';
import { IReminder } from '@repo/api/reminder/reminder.entity';

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

export async function updateLead(
  id: string,
  updateLead: Partial<LeadFormData>,
) {
  try {
    const lead = await AxiosRequest.put<Partial<ILead>, ILead>(
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

// IReminder API
export async function getReminders(leadId: string) {
  try {
    const reminders = await AxiosRequest.get<IReminder[]>(
      `/reminder?entityType=lead&entityId=${leadId}`,
    );
    return { reminders };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching reminders.';
    return { error: errorMessage, reminders: [] };
  }
}

export async function createReminder(
  data: Partial<IReminder> & { entityType: string; entityId: string },
) {
  console.log('🚀 ~ action.ts:109 ~ data:', data);
  try {
    const reminder = await AxiosRequest.post<typeof data, IReminder>(
      '/reminder',
      data,
    );
    return { reminder };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while creating reminder.';
    return { error: errorMessage };
  }
}

export async function updateReminder(id: string, data: Partial<IReminder>) {
  try {
    const reminder = await AxiosRequest.put<Partial<IReminder>, IReminder>(
      `/reminder/${id}`,
      data,
    );
    return { reminder };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while updating reminder.';
    return { error: errorMessage };
  }
}

export async function deleteReminder(id: string) {
  try {
    await AxiosRequest.delete(`/reminder/${id}`);
    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while deleting reminder.';
    return { error: errorMessage };
  }
}
