'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContentItemSchema } from '@seedfy/shared';

export async function createContent(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type'),
    cover_url: formData.get('cover_url'),
    media_url: formData.get('media_url'),
    is_live: formData.get('is_live') === 'on',
  };

  const validatedFields = ContentItemSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('content_items').insert(validatedFields.data);

  if (error) {
    return { message: 'Erro ao criar conteúdo: ' + error.message };
  }

  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}

export async function updateContent(id: string, formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type'),
    cover_url: formData.get('cover_url'),
    media_url: formData.get('media_url'),
    is_live: formData.get('is_live') === 'on',
  };

  const validatedFields = ContentItemSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('content_items')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    return { message: 'Erro ao atualizar conteúdo: ' + error.message };
  }

  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}

export async function deleteContent(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('content_items').delete().eq('id', id);

  if (error) {
    return { message: 'Erro ao deletar conteúdo: ' + error.message };
  }

  revalidatePath('/dashboard/content');
}
