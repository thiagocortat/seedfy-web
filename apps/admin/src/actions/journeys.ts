'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { JourneyTemplateSchema } from '@seedfy/shared';
import { JourneyAIOutput } from '@/lib/ai-schemas';

export async function createJourney(formData: FormData) {
  const durationsRaw = formData.get('durations_supported');
  const tagsRaw = formData.get('tags');

  let durations_supported: number[] = [];
  if (typeof durationsRaw === 'string') {
    try {
        // Expecting JSON string for arrays if complex, or comma separated
        durations_supported = JSON.parse(durationsRaw); 
    } catch {
        // Fallback to comma separated
        durations_supported = durationsRaw.split(',').map(Number).filter(n => !isNaN(n));
    }
  }

  let tags: string[] = [];
  if (typeof tagsRaw === 'string') {
      try {
          tags = JSON.parse(tagsRaw);
      } catch {
          tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
      }
  }

  const rawData = {
    title: formData.get('title'),
    description_short: formData.get('description_short'),
    description_long: formData.get('description_long'),
    cover_image_url: formData.get('cover_image_url') || null,
    tags: tags,
    durations_supported: durations_supported,
    is_active: formData.get('is_active') === 'true', // Handle explicit boolean string or checkbox 'on'
  };
  
  // Correction for checkbox if it sends 'on'
  if (formData.get('is_active') === 'on') {
      rawData.is_active = true;
  }

  const validatedFields = JourneyTemplateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('journey_templates').insert(validatedFields.data);

  if (error) {
    return { message: 'Erro ao criar jornada: ' + error.message };
  }

  revalidatePath('/dashboard/journeys');
  redirect('/dashboard/journeys');
}

export async function updateJourney(id: string, formData: FormData) {
  const durationsRaw = formData.get('durations_supported');
  const tagsRaw = formData.get('tags');

  let durations_supported: number[] | undefined = undefined;
  if (durationsRaw !== null) {
      if (typeof durationsRaw === 'string') {
        try {
            durations_supported = JSON.parse(durationsRaw); 
        } catch {
            durations_supported = durationsRaw.split(',').map(Number).filter(n => !isNaN(n));
        }
      }
  }

  let tags: string[] | undefined = undefined;
  if (tagsRaw !== null) {
    if (typeof tagsRaw === 'string') {
        try {
            tags = JSON.parse(tagsRaw);
        } catch {
            tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
        }
    }
  }

  const rawData: any = {
    title: formData.get('title'),
    description_short: formData.get('description_short'),
    description_long: formData.get('description_long'),
    cover_image_url: formData.get('cover_image_url'),
  };
  
  if (tags !== undefined) rawData.tags = tags;
  if (durations_supported !== undefined) rawData.durations_supported = durations_supported;
  
  // Handle is_active only if present, or handle it in a separate action
  if (formData.has('is_active')) {
      const val = formData.get('is_active');
      rawData.is_active = val === 'true' || val === 'on';
  }

  // Filter out nulls/undefined that shouldn't override existing data if not intended
  // But for update, we usually want to replace.
  
  const validatedFields = JourneyTemplateSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('journey_templates')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    return { message: 'Erro ao atualizar jornada: ' + error.message };
  }

  revalidatePath('/dashboard/journeys');
  // revalidatePath(`/dashboard/journeys/${id}`);
  redirect('/dashboard/journeys');
}

export async function deleteJourney(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('journey_templates').delete().eq('id', id);

  if (error) {
    return { message: 'Erro ao deletar jornada: ' + error.message };
  }

  revalidatePath('/dashboard/journeys');
}

export async function toggleJourneyStatus(id: string, isActive: boolean) {
    const supabase = createServiceClient();
    
    // Validations before activating
    if (isActive) {
        const { data: journey } = await supabase.from('journey_templates').select('durations_supported').eq('id', id).single();
        if (!journey || !journey.durations_supported || journey.durations_supported.length === 0) {
             return { message: 'Erro: Jornada deve ter durações suportadas.' };
        }
        
        const maxDuration = Math.max(...journey.durations_supported);
        
        const { count } = await supabase
            .from('journey_chapter_templates')
            .select('*', { count: 'exact', head: true })
            .eq('journey_id', id);
            
        if ((count || 0) < maxDuration) {
            return { message: `Erro: Jornada precisa de ${maxDuration} capítulos (tem ${count}).` };
        }
        
        // Check for day_index duplicates (DB constraint handles this usually, but good to double check or assume DB is consistent)
        // Check for missing days (gaps)
        const { data: chapters } = await supabase
            .from('journey_chapter_templates')
            .select('day_index')
            .eq('journey_id', id)
            .order('day_index');
            
        const indices = chapters?.map(c => c.day_index) || [];
        for (let i = 1; i <= maxDuration; i++) {
            if (!indices.includes(i)) {
                return { message: `Erro: Capítulo do dia ${i} está faltando.` };
            }
        }
    }

    const { error } = await supabase.from('journey_templates').update({ is_active: isActive }).eq('id', id);

    if (error) {
        return { message: 'Erro ao atualizar status: ' + error.message };
    }
    
    revalidatePath('/dashboard/journeys');
}

export async function saveAIJourney(data: JourneyAIOutput, isActive: boolean) {
  const supabase = createServiceClient();
  
  // 1. Create Journey Template
  const { data: journey, error: journeyError } = await supabase
    .from('journey_templates')
    .insert({
      title: data.journey.title,
      description_short: data.journey.description_short,
      description_long: data.journey.description_long,
      cover_image_url: data.journey.cover_image_url,
      tags: data.journey.tags,
      durations_supported: data.journey.durations_supported,
      is_active: isActive,
    })
    .select()
    .single();

  if (journeyError || !journey) {
    return { error: 'Failed to create journey: ' + journeyError?.message };
  }

  // 2. Create Chapters
  const chaptersToInsert = data.chapters.map(c => ({
    journey_id: journey.id,
    day_index: c.day_index,
    title: c.title,
    focus: c.focus,
    narrative: c.narrative,
    practice: c.practice,
    reflection_prompt: c.reflection_prompt,
    prayer: c.prayer,
    verse_reference: c.verse_reference,
    verse_text: c.verse_text,
    media_type: c.media_type,
  }));

  const { error: chaptersError } = await supabase
    .from('journey_chapter_templates')
    .insert(chaptersToInsert);

  if (chaptersError) {
    return { error: 'Journey created but chapters failed: ' + chaptersError.message };
  }

  revalidatePath('/dashboard/journeys');
  return { success: true, id: journey.id };
}
