'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { ChurchPostSchema, ChurchPost } from '@seedfy/shared';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createChurchPost(data: Partial<ChurchPost>) {
  const supabase = createServiceClient();
  
  // Validate data
  const validation = ChurchPostSchema.safeParse(data);
  
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('church_posts')
    .insert([validation.data]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${data.church_id}/posts`);
  redirect(`/dashboard/churches/${data.church_id}/posts`);
}

export async function updateChurchPost(id: string, data: Partial<ChurchPost>) {
  const supabase = createServiceClient();
  
  // Validate data (partial)
  const validation = ChurchPostSchema.partial().safeParse(data);
  
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const updateData = {
    ...validation.data,
    updated_at: new Date().toISOString(),
  };

  // If publishing, set published_at
  if (validation.data.status === 'published' && !data.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('church_posts')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${data.church_id}/posts`);
  redirect(`/dashboard/churches/${data.church_id}/posts`);
}

export async function deleteChurchPost(id: string, churchId: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('church_posts')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${churchId}/posts`);
}

export async function togglePinChurchPost(id: string, churchId: string, currentPinned: boolean) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('church_posts')
    .update({ pinned: !currentPinned })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/churches/${churchId}/posts`);
}
