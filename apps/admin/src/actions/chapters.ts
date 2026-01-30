'use server';

import { createServiceClient } from '@seedfy/shared/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { JourneyChapterTemplateSchema } from '@seedfy/shared';

export async function createChapter(formData: FormData) {
  const rawData = {
    journey_id: formData.get('journey_id'),
    day_index: formData.get('day_index'),
    title: formData.get('title'),
    narrative: formData.get('narrative'),
    focus: formData.get('focus'),
    practice: formData.get('practice'),
    reflection_prompt: formData.get('reflection_prompt'),
    prayer: formData.get('prayer') || null,
    verse_reference: formData.get('verse_reference') || null,
    verse_text: formData.get('verse_text') || null,
    media_url: formData.get('media_url') || null,
    media_type: formData.get('media_type') || null,
  };

  const validatedFields = JourneyChapterTemplateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('journey_chapter_templates').insert(validatedFields.data);

  if (error) {
    return { message: 'Erro ao criar capítulo: ' + error.message };
  }

  const journeyId = rawData.journey_id as string;
  revalidatePath(`/dashboard/journeys/${journeyId}`);
}

export async function updateChapter(id: string, formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    narrative: formData.get('narrative'),
    focus: formData.get('focus'),
    practice: formData.get('practice'),
    reflection_prompt: formData.get('reflection_prompt'),
    prayer: formData.get('prayer') || null,
    verse_reference: formData.get('verse_reference') || null,
    verse_text: formData.get('verse_text') || null,
    day_index: formData.get('day_index'),
    media_url: formData.get('media_url') || null,
    media_type: formData.get('media_type') || null,
  };

  const validatedFields = JourneyChapterTemplateSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('journey_chapter_templates')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    return { message: 'Erro ao atualizar capítulo: ' + error.message };
  }

  const journeyId = formData.get('journey_id') as string;
  if (journeyId) {
      revalidatePath(`/dashboard/journeys/${journeyId}`);
  }
}

export async function deleteChapter(id: string, journeyId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('journey_chapter_templates').delete().eq('id', id);

  if (error) {
    return { message: 'Erro ao deletar capítulo: ' + error.message };
  }

  revalidatePath(`/dashboard/journeys/${journeyId}`);
}

export async function reorderChapters(journeyId: string, orderedIds: string[]) {
    const supabase = createServiceClient();
    
    // We update each chapter's day_index based on its position in the array
    // To avoid unique constraint violations during update (if day_index must be unique immediately),
    // we might need a more complex strategy (e.g. set to negative first), 
    // BUT since we are likely using "DEFERRABLE INITIALLY DEFERRED" constraints or standard updates in a transaction,
    // Supabase JS client doesn't support explicit transactions easily without RPC.
    // However, if the unique constraint is (journey_id, day_index), updating one by one might clash.
    
    // Strategy:
    // 1. Fetch current chapters to verify ownership/existence
    // 2. Update all to a temporary index (e.g. index + 1000)
    // 3. Update to final index
    
    // Or simpler: Upsert with new values.
    
    const updates = orderedIds.map((id, index) => ({
        id,
        journey_id: journeyId,
        day_index: index + 1,
        // We need to provide other required fields if using UPSERT, but for update we can just patch.
        // But bulk update in Supabase is tricky.
    }));

    // Let's try sequential update but with a shift to avoid collision if swapping 1 and 2.
    // Swapping 1->2 fails if 2 exists.
    
    // Safe approach:
    // 1. Shift all to negative day_index
    // 2. Set correct positive day_index
    
    // Step 1: Shift to temporary negative indices
    // We can't easily do this in one batch without a custom RPC or loop.
    // Let's assume we can loop. It's not efficient for huge lists but fine for 21 days.
    
    // BETTER: Use an RPC function if possible, but let's stick to client calls for MVP if we can.
    // Actually, maybe we can just ignore the unique constraint for a moment? No.
    
    // Let's try to update individually but this is risky.
    // Let's create a SQL function for reordering safely? 
    // Or just use the "shift" strategy in JS loop.
    
    // 1. Get all chapters
    const { data: chapters } = await supabase.from('journey_chapter_templates').select('id').eq('journey_id', journeyId);
    if (!chapters) return { message: 'Jornada não encontrada ou sem capítulos' };
    
    // 2. Update all to (index + 1000) to clear the 1..N range
    for (const chapter of chapters) {
        await supabase.from('journey_chapter_templates')
            .update({ day_index: 10000 + Math.floor(Math.random() * 10000) }) // Random to avoid temp collision
            .eq('id', chapter.id);
    }
    
    // 3. Update to final correct indices
    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const { error } = await supabase.from('journey_chapter_templates')
            .update({ day_index: i + 1 })
            .eq('id', id);
            
        if (error) {
            console.error(`Failed to update index for chapter ${id}`, error);
            return { message: `Erro ao reordenar: ${error.message}` };
        }
    }
    
    revalidatePath(`/dashboard/journeys/${journeyId}`);
}
