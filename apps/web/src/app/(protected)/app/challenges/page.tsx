import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ChallengeList } from '@/components/challenges/challenge-list';
import { Challenge, ChallengeParticipant } from '@seedfy/shared';
import { getCheckinStatusMap } from '@/lib/checkin-helper';
import { Plus, Compass, Target } from 'lucide-react';
import Link from 'next/link';

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === 'completed' ? 'completed' : 'active';
  
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 2. Fetch user challenges based on tab
  // Status filter logic: 
  // - active tab: challenge.status = 'active' AND participant.status = 'active'
  // - completed tab: challenge.status = 'completed' OR participant.status = 'completed'
  
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenges:challenge_id (
        *,
        journey_id
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  // Filter and type cast
  const allItems = participations?.map(p => ({
    participant: p as unknown as ChallengeParticipant,
    challenge: p.challenges as unknown as (Challenge & { journey_id?: string; timezone?: string })
  })).filter(item => item.challenge) || [];

  const items = allItems.filter(item => {
    if (activeTab === 'active') {
      return item.challenge.status === 'active' && item.participant.status === 'active';
    } else {
      return item.challenge.status === 'completed' || item.participant.status === 'completed' || item.participant.status === 'quit';
    }
  });

  // 3. Single Source of Truth for Checkins
  const challenges = items
    .map(i => i.challenge)
    .filter((c): c is (Challenge & { id: string; journey_id?: string; timezone?: string }) => !!c.id);

  const checkinStatusMap = await getCheckinStatusMap(supabase, user.id, challenges);
  const checkinStatusRecord = Object.fromEntries(checkinStatusMap);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Desafios</h1>
          <p className="text-gray-600 mt-1">Acompanhe seu progresso diário</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/journeys"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Explorar Jornadas
          </Link>
          <Link
            href="/app/challenges/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Desafio
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/app/challenges?tab=active"
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Em andamento
          </Link>
          <Link
            href="/app/challenges?tab=completed"
            className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'completed'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Concluídos
          </Link>
        </nav>
      </div>

      {/* Content */}
      {items.length > 0 ? (
        <ChallengeList items={items} checkinStatus={checkinStatusRecord} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'active' ? 'Nenhum desafio ativo' : 'Nenhum desafio concluído'}
          </h3>
          <p className="text-gray-500 max-w-sm mb-6">
            {activeTab === 'active' 
              ? 'Comece uma nova jornada ou crie um desafio personalizado.' 
              : 'Seus desafios concluídos aparecerão aqui.'}
          </p>
          {activeTab === 'active' && (
            <div className="flex gap-3">
              <Link
                href="/app/journeys"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Explorar Jornadas
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
