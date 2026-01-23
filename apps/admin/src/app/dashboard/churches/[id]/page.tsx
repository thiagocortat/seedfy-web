import { ChurchForm } from '@/components/church-form';
import { createServiceClient } from '@seedfy/shared/server';
import { notFound } from 'next/navigation';

export default async function EditChurchPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('churches').select('*').eq('id', params.id).single();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Igreja</h1>
      <ChurchForm initialData={data} />
    </div>
  );
}
