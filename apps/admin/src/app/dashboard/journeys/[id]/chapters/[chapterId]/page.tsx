import { createServiceClient } from '@seedfy/shared/server';
import { ChapterForm } from '@/components/chapter-form';
import { notFound } from 'next/navigation';

export default async function EditChapterPage(props: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const params = await props.params;
  const supabase = createServiceClient();

  const { data: chapter, error } = await supabase
    .from('journey_chapter_templates')
    .select('*')
    .eq('id', params.chapterId)
    .single();

  if (error || !chapter) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ChapterForm journeyId={params.id} initialData={chapter} />
    </div>
  );
}
