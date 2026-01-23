import { createServiceClient } from '@seedfy/shared/server';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import ContentList from '@/components/content-list';

export const dynamic = 'force-dynamic';

export default async function ContentListPage(props: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = createServiceClient();
  const q = searchParams?.q || '';
  const type = searchParams?.type || 'all';

  let query = supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  const { data: contents } = await query;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Conteúdo</h1>
            <p className="text-gray-500 mt-1">Gerencie os áudios, vídeos e músicas do app.</p>
        </div>
        <Link
          href="/dashboard/content/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Conteúdo
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form>
            <input
              name="q"
              placeholder="Buscar por título..."
              defaultValue={q}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            {type && <input type="hidden" name="type" value={type} />}
          </form>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
           <Link href={`/dashboard/content?q=${q}&type=all`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${type === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todos</Link>
           <Link href={`/dashboard/content?q=${q}&type=podcast`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${type === 'podcast' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Podcasts</Link>
           <Link href={`/dashboard/content?q=${q}&type=video`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${type === 'video' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Vídeos</Link>
           <Link href={`/dashboard/content?q=${q}&type=music`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${type === 'music' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Músicas</Link>
        </div>
      </div>

      <ContentList contents={contents || []} />
    </div>
  );
}
