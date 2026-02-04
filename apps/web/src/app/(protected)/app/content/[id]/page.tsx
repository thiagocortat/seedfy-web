import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ContentItem } from '@seedfy/shared';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MediaPlayer } from '@/components/content/media-player';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContentDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: item } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single();

  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/app/content"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Voltar para biblioteca
      </Link>

      <div className="mb-8">
        <MediaPlayer item={item as ContentItem} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
        {item.description && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
