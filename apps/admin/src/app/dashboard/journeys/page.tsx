import { createServiceClient } from '@seedfy/shared/server';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import JourneyList from '@/components/journey-list';

import { AiTrigger } from './ai-trigger';

export const dynamic = 'force-dynamic';

export default async function JourneyListPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = createServiceClient();
  const q = searchParams?.q || '';
  const status = searchParams?.status || 'all';

  let query = supabase
    .from('journey_templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  if (status !== 'all') {
    query = query.eq('is_active', status === 'active');
  }

  const { data: journeys } = await query;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Jornadas</h1>
            <p className="text-gray-500 mt-1">Gerencie as jornadas e conteúdos diários.</p>
        </div>
        <div className="flex gap-3">
          <AiTrigger />
          <Link
            href="/dashboard/journeys/new"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Jornada
          </Link>
        </div>
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
            {status && <input type="hidden" name="status" value={status} />}
          </form>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
           <Link href={`/dashboard/journeys?q=${q}&status=all`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${status === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</Link>
           <Link href={`/dashboard/journeys?q=${q}&status=active`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Ativas</Link>
           <Link href={`/dashboard/journeys?q=${q}&status=inactive`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${status === 'inactive' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Rascunhos</Link>
        </div>
      </div>

      <JourneyList journeys={journeys || []} />
    </div>
  );
}
