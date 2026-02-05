import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { JourneyCard } from '@/components/journeys/journey-card';
import { JourneyTemplate } from '@seedfy/shared';
import { Search, Compass, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function JourneysCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const tagFilter = params.tag || '';
  
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Fetch active journey templates
  let journeysQuery = supabase
    .from('journey_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (query) {
    journeysQuery = journeysQuery.ilike('title', `%${query}%`);
  }

  if (tagFilter) {
    journeysQuery = journeysQuery.contains('tags', [tagFilter]);
  }

  const { data: journeys } = await journeysQuery;

  // 2. Fetch all tags for filter (optional enhancement)
  // For now we just list what we have

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          href="/app/challenges" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Meus Desafios
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            Explorar Jornadas
          </h1>
          <p className="text-gray-600 mt-1">
            Descubra planos de leitura e meditação guiados para sua caminhada.
          </p>
        </div>
        
        <form className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar jornadas..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
        </form>
      </div>

      {journeys && journeys.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey as unknown as JourneyTemplate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma jornada encontrada</h3>
          <p className="text-gray-500 max-w-sm">
            Tente buscar com outros termos ou verifique mais tarde por novos conteúdos.
          </p>
        </div>
      )}
    </div>
  );
}
