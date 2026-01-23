'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ChurchSchema } from '@seedfy/shared';

export async function createChurch(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    city: formData.get('city'),
    state: formData.get('state'),
    logo_url: formData.get('logo_url'),
  };

  const validatedFields = ChurchSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('churches').insert(validatedFields.data);

  if (error) {
    return { message: 'Erro ao criar igreja: ' + error.message };
  }

  revalidatePath('/dashboard/churches');
  redirect('/dashboard/churches');
}

export async function updateChurch(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    city: formData.get('city'),
    state: formData.get('state'),
    logo_url: formData.get('logo_url'),
  };

  const validatedFields = ChurchSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('churches')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    return { message: 'Erro ao atualizar igreja: ' + error.message };
  }

  revalidatePath('/dashboard/churches');
  redirect('/dashboard/churches');
}

export async function deleteChurch(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('churches').delete().eq('id', id);

  if (error) {
    return { message: 'Erro ao deletar igreja: ' + error.message };
  }

  revalidatePath('/dashboard/churches');
}
