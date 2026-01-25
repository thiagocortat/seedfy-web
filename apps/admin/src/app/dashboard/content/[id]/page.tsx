import { ContentForm } from '@/components/content-form';
import { createServiceClient } from '@seedfy/shared/server';
import { notFound } from 'next/navigation';

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from('content_items').select('*').eq('id', id).single();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Conteúdo</h1>
      <ContentForm initialData={data} />
    </div>
  );
}
