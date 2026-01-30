import { ChapterForm } from '@/components/chapter-form';

export default async function NewChapterPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return (
    <div className="max-w-5xl mx-auto">
      <ChapterForm journeyId={params.id} />
    </div>
  );
}
