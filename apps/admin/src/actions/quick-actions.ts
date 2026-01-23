'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { ChurchQuickActionSchema, ChurchQuickAction } from '@seedfy/shared';
import { revalidatePath } from 'next/cache';

export async function getQuickActions(churchId: string) {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('church_quick_actions')
    .select('*')
    .eq('church_id', churchId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as ChurchQuickAction[];
}

export async function createQuickAction(data: Partial<ChurchQuickAction>) {
  const supabase = createServiceClient();
  
  const validation = ChurchQuickActionSchema.safeParse(data);
  
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('church_quick_actions')
    .insert([validation.data]);

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'This action type already exists for this church. Edit the existing one.' };
    }
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${data.church_id}/quick-actions`);
}

export async function updateQuickAction(id: string, churchId: string, data: Partial<ChurchQuickAction>) {
  const supabase = createServiceClient();
  
  const validation = ChurchQuickActionSchema.partial().safeParse(data);
  
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('church_quick_actions')
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'This action type already exists for this church.' };
    }
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${churchId}/quick-actions`);
}

export async function deleteQuickAction(id: string, churchId: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('church_quick_actions')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${churchId}/quick-actions`);
}

export async function toggleQuickActionStatus(id: string, churchId: string, currentStatus: boolean) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('church_quick_actions')
    .update({ is_enabled: !currentStatus })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${churchId}/quick-actions`);
}
