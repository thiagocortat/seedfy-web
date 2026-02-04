import { cookies } from 'next/headers';
import { createServerClient } from '@seedfy/shared/server';
import { ChallengeList } from '@/components/challenges/challenge-list';
import { Challenge, ChallengeParticipant } from '@seedfy/shared';
import { getCheckinStatusMap } from '@/lib/checkin-helper';

export default async function ChallengesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 2. Fetch user active challenges
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
  const items = participations?.map(p => ({
    participant: p as unknown as ChallengeParticipant,
    challenge: p.challenges as unknown as (Challenge & { journey_id?: string; timezone?: string })
  })).filter(item => item.challenge) || [];

  // 3. Single Source of Truth for Checkins
  const challenges = items
    .map(i => i.challenge)
    .filter((c): c is (Challenge & { id: string; journey_id?: string; timezone?: string }) => !!c.id);

  const checkinStatusMap = await getCheckinStatusMap(supabase, user.id, challenges);
  const checkinStatusRecord = Object.fromEntries(checkinStatusMap);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Desafios</h1>
          <p className="text-gray-600 mt-1">Acompanhe seu progresso diário</p>
        </div>
      </div>

      <ChallengeList items={items} checkinStatus={checkinStatusRecord} />
    </div>
  );
}
