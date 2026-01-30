import { createServiceClient } from '@seedfy/shared/server';
import { JourneyForm } from '@/components/journey-form';
import ChapterList from '@/components/chapter-list';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditJourneyPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = createServiceClient();

  const { data: journey, error } = await supabase
    .from('journey_templates')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !journey) {
    notFound();
  }

  const { data: chapters } = await supabase
    .from('journey_chapter_templates')
    .select('*')
    .eq('journey_id', params.id)
    .order('day_index', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Jornada</h1>
        <p className="text-gray-500 mt-1">Gerencie os detalhes e capítulos da jornada.</p>
      </div>

      <JourneyForm initialData={journey} />

      <div className="border-t border-gray-200 pt-8">
          <ChapterList chapters={chapters || []} journeyId={params.id} />
      </div>
    </div>
  );
}
